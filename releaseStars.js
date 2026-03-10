// cosmic-stars/releaseStars.js
/*
Release Stars - Instance Mode
Author: corgido
Created: 2025-01-10
Description: This script spawns stars gradually within the CSS-defined circular container
(#container) and allows them to float freely with dynamic, randomized movement.

Features include:
- Cosmic color palette with glow effects
- Perlin noise-driven movement with gravity attraction
- Dynamic fading and star twinkle
- Color-matched tapered trails

License: MIT
*/

function ReleaseStarsSketch(p) {
  const CONFIG = {
    MAX_PARTICLES: 100,
    SPAWN_INTERVAL: 20,
    START_DELAY: 600,
    MIN_LIFE: 300,
    MAX_LIFE: 800,
    ATTRACTION_STRENGTH: 0.25,
    VELOCITY_MIN: 0.5,
    VELOCITY_MAX: 5,
    STAR_SIZE_MIN: 2,
    STAR_SIZE_MAX: 6,
    BG_FADE: 40,
    TRAIL_WEIGHT_MAX: 4,
    TRAIL_WEIGHT_MIN: 0.5,
    GLOW_OUTER_SIZE: 6,
    GLOW_INNER_SIZE: 3,
    GLOW_OUTER_ALPHA: 8,
    GLOW_INNER_ALPHA: 15,
    NOISE_SCALE: 0.01,
    NOISE_FORCE: 0.5,
    RESIZE_DEBOUNCE: 150,
  };

  // Cosmic hue ranges: blues, purples, golds, warm reds
  const HUE_RANGES = [[200, 260], [270, 310], [20, 50], [0, 15]];

  let particles = [];
  let containerX, containerY, containerRadius;
  let gravityCenter;
  let resizeTimer;
  let bgBuffer;

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.initializeContainer();
    createBgBuffer();

    gravityCenter = p.createVector(containerX, containerY);

    p.noLoop();
    setTimeout(() => {
      p.loop();
      p.createNewStar();
    }, CONFIG.START_DELAY);
  };

  function createBgBuffer() {
    bgBuffer = p.createGraphics(p.width, p.height);
    bgBuffer.colorMode(bgBuffer.HSB, 360, 100, 100, 100);
    bgBuffer.background(0, 0, 0);
    let maxDim = Math.max(p.width, p.height);
    for (let r = maxDim; r > 0; r -= 4) {
      bgBuffer.noStroke();
      let alpha = p.map(r, 0, maxDim, 1.5, 0);
      bgBuffer.fill(260, 40, 8, alpha);
      bgBuffer.ellipse(p.width / 2, p.height / 2, r, r);
    }
  }

  p.windowResized = function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      p.initializeContainer();
      createBgBuffer();
      gravityCenter = p.createVector(containerX, containerY);
    }, CONFIG.RESIZE_DEBOUNCE);
  };

  p.initializeContainer = function () {
    const container = document.getElementById("container");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    containerX = rect.left + rect.width / 2;
    containerY = rect.top + rect.height / 2;
    containerRadius = rect.width / 2;
  };

  p.draw = function () {
    p.tint(0, 0, 100, CONFIG.BG_FADE);
    p.image(bgBuffer, 0, 0);
    p.noTint();

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].show();

      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }

    if (p.frameCount % CONFIG.SPAWN_INTERVAL === 0) {
      p.createNewStar();
    }
  };

  class Particle {
    constructor(x, y, maxLife) {
      this.pos = p.createVector(x, y);
      this.prev = this.pos.copy();
      this.vel = p5.Vector.random2D().mult(
        p.random(CONFIG.VELOCITY_MIN, CONFIG.VELOCITY_MAX),
      );

      // Cosmic color palette
      const range = HUE_RANGES[Math.floor(Math.random() * HUE_RANGES.length)];
      this.hue = p.random(range[0], range[1]);
      this.sat = p.random(60, 90);
      this.bri = p.random(80, 100);

      this.lifespan = maxLife;
      this.life = 0;
      this.noiseOffset = p.random(1000);
      this.size = p.random(CONFIG.STAR_SIZE_MIN, CONFIG.STAR_SIZE_MAX);
      this.twinkleOffset = p.random(1000);
      this.twinkleSpeed = p.random(0.03, 0.08);
    }

    update() {
      let noiseForce = p.createVector(
        p.map(
          p.noise(this.noiseOffset + p.frameCount * CONFIG.NOISE_SCALE),
          0, 1, -CONFIG.NOISE_FORCE, CONFIG.NOISE_FORCE,
        ),
        p.map(
          p.noise(this.noiseOffset + p.frameCount * CONFIG.NOISE_SCALE + 1000),
          0, 1, -CONFIG.NOISE_FORCE, CONFIG.NOISE_FORCE,
        ),
      );
      this.vel.add(noiseForce);

      let gravityDir = p5.Vector.sub(gravityCenter, this.pos).normalize();
      this.vel.add(gravityDir.mult(CONFIG.ATTRACTION_STRENGTH));

      this.pos.add(this.vel);
      this.life++;
    }

    show() {
      let lifeRatio = this.life / this.lifespan;
      let fadeAlpha = p.map(this.life, 0, this.lifespan, 80, 0);
      let twinkle = p.map(
        p.sin(p.frameCount * this.twinkleSpeed + this.twinkleOffset),
        -1, 1, 0.6, 1.0,
      );

      // Glow layers
      p.noStroke();
      p.fill(this.hue, this.sat, this.bri * twinkle, CONFIG.GLOW_OUTER_ALPHA * (1 - lifeRatio));
      p.ellipse(this.pos.x, this.pos.y, this.size * CONFIG.GLOW_OUTER_SIZE);
      p.fill(this.hue, this.sat, this.bri * twinkle, CONFIG.GLOW_INNER_ALPHA * (1 - lifeRatio));
      p.ellipse(this.pos.x, this.pos.y, this.size * CONFIG.GLOW_INNER_SIZE);

      // Star circle
      p.noStroke();
      p.fill(this.hue, this.sat, this.bri * twinkle, fadeAlpha);
      p.ellipse(this.pos.x, this.pos.y, this.size);

      // Trail (color-matched, tapered)
      let trailWeight = p.map(
        this.life, 0, this.lifespan,
        CONFIG.TRAIL_WEIGHT_MAX, CONFIG.TRAIL_WEIGHT_MIN,
      );
      p.stroke(this.hue, this.sat, this.bri, fadeAlpha * 0.4);
      p.strokeWeight(trailWeight);
      p.line(this.pos.x, this.pos.y, this.prev.x, this.prev.y);

      this.prev = this.pos.copy();
    }

    isDead() {
      return this.life > this.lifespan;
    }
  }

  p.createNewStar = function () {
    if (particles.length >= CONFIG.MAX_PARTICLES) return;

    let angle = p.random(p.TWO_PI);
    let radius = p.random(containerRadius);
    let x = containerX + radius * p.cos(angle);
    let y = containerY + radius * p.sin(angle);

    const maxLife = p.random(CONFIG.MIN_LIFE, CONFIG.MAX_LIFE);
    particles.push(new Particle(x, y, maxLife));
  };
}
