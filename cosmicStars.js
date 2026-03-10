// cosmic-stars/cosmicStars.js
/*
Cosmic Stars - Instance Mode
Author: corgido
Created: 2025-01-10
Description: This JavaScript file contains the logic for a p5.js animation
of stars orbiting dynamically.

Features include:
- Radial wobble with Perlin noise
- Colorful, evolving trails with cosmic color palette
- Glow effects and star twinkle
- Automatic star generation and expiration

License: MIT
*/

function CosmicStarsSketch(p) {
  const CONFIG = {
    MAX_PARTICLES: 80,
    SPAWN_INTERVAL: 20,
    START_DELAY: 600,
    MIN_LIFE: 300,
    MAX_LIFE: 900,
    ORBIT_SPEED: 0.02,
    ORBIT_RADIUS_MIN: 1.05,
    ORBIT_RADIUS_MAX: 1.15,
    STAR_SIZE_MIN: 2,
    STAR_SIZE_MAX: 5,
    BURN_MIN: 0.2,
    BURN_MAX: 0.5,
    BG_FADE: 22,
    TRAIL_WEIGHT_MAX: 2.5,
    TRAIL_WEIGHT_MIN: 0.5,
    TRAIL_ALPHA_MAX: 30,
    TRAIL_ALPHA_MIN: 5,
    GLOW_OUTER_SIZE: 6,
    GLOW_INNER_SIZE: 3,
    GLOW_OUTER_ALPHA: 8,
    GLOW_INNER_ALPHA: 15,
    RESIZE_DEBOUNCE: 150,
  };

  // Cosmic hue ranges: blues, purples, golds, warm reds
  const HUE_RANGES = [[200, 260], [270, 310], [20, 50], [0, 15]];

  let particles = [];
  let containerX, containerY, containerRadius;
  let resizeTimer;
  let bgBuffer;

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    p.initializeContainer();
    createBgBuffer();

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
    }, CONFIG.RESIZE_DEBOUNCE);
  };

  p.initializeContainer = function () {
    const container = document.getElementById("container");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let w = rect.width;
    let h = rect.height;

    if (w === 0 || h === 0) {
      w = p.width / 2;
      h = p.height / 2;
    }

    containerX = rect.left + w / 2;
    containerY = rect.top + h / 2;
    containerRadius = w / 2;
  };

  p.draw = function () {
    p.tint(0, 0, 100, CONFIG.BG_FADE);
    p.image(bgBuffer, 0, 0);
    p.noTint();

    if (p.frameCount % CONFIG.SPAWN_INTERVAL === 0) {
      p.createNewStar();
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].show();

      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }
  };

  class Particle {
    constructor(x, y, maxLife) {
      this.origin = p.createVector(x, y);
      this.pos = this.origin.copy();
      this.prev = this.pos.copy();
      this.angle = p.random(p.TWO_PI);
      this.radius = p.random(
        containerRadius * CONFIG.ORBIT_RADIUS_MIN,
        containerRadius * CONFIG.ORBIT_RADIUS_MAX,
      );

      // Cosmic color palette
      const range = HUE_RANGES[Math.floor(Math.random() * HUE_RANGES.length)];
      this.hue = p.random(range[0], range[1]);
      this.sat = p.random(60, 90);
      this.bri = p.random(80, 100);
      this.color = p.color(this.hue, this.sat, this.bri, 80);

      this.lifespan = maxLife;
      this.life = 0;
      this.size = p.random(CONFIG.STAR_SIZE_MIN, CONFIG.STAR_SIZE_MAX);
      this.rotation = p.random(p.TWO_PI);
      this.rotationSpeed = p.random(-0.25, 0.25);
      this.direction = p.random() > 0.5 ? 1 : -1;
      this.noiseOffset = p.random(1000);
      this.burnStrength = p.random(CONFIG.BURN_MIN, CONFIG.BURN_MAX);
      this.twinkleOffset = p.random(1000);
      this.twinkleSpeed = p.random(0.03, 0.08);
    }

    update() {
      this.angle += this.direction * CONFIG.ORBIT_SPEED;

      let radialBurn = p.map(
        p.noise(this.noiseOffset + p.frameCount * 0.01),
        0,
        1,
        -this.burnStrength,
        this.burnStrength,
      );
      let radialOffset = this.radius + radialBurn * this.radius;

      this.pos.x = containerX + radialOffset * p.cos(this.angle);
      this.pos.y = containerY + radialOffset * p.sin(this.angle);

      this.rotation += this.rotationSpeed * 0.1;
      this.life++;
    }

    show() {
      let twinkle = p.map(
        p.sin(p.frameCount * this.twinkleSpeed + this.twinkleOffset),
        -1, 1, 0.6, 1.0,
      );

      // Glow layers
      p.noStroke();
      p.fill(this.hue, this.sat, this.bri * twinkle, CONFIG.GLOW_OUTER_ALPHA);
      p.ellipse(this.pos.x, this.pos.y, this.size * CONFIG.GLOW_OUTER_SIZE);
      p.fill(this.hue, this.sat, this.bri * twinkle, CONFIG.GLOW_INNER_ALPHA);
      p.ellipse(this.pos.x, this.pos.y, this.size * CONFIG.GLOW_INNER_SIZE);

      // Star shape
      p.push();
      p.translate(this.pos.x, this.pos.y);
      p.rotate(this.rotation);
      p.fill(this.hue, this.sat, this.bri * twinkle, 80);
      p.noStroke();
      this.drawStar(0, 0, this.size, this.size / 2, 5);
      p.pop();

      // Trail (color-matched, tapered)
      let trailAlpha = p.map(
        this.life, 0, this.lifespan,
        CONFIG.TRAIL_ALPHA_MAX, CONFIG.TRAIL_ALPHA_MIN,
      );
      let trailWeight = p.map(
        this.life, 0, this.lifespan,
        CONFIG.TRAIL_WEIGHT_MAX, CONFIG.TRAIL_WEIGHT_MIN,
      );
      p.stroke(this.hue, this.sat, this.bri, trailAlpha);
      p.strokeWeight(trailWeight);
      p.line(this.pos.x, this.pos.y, this.prev.x, this.prev.y);
      this.prev = this.pos.copy();
    }

    drawStar(x, y, radius1, radius2, npoints) {
      let angle = p.TWO_PI / npoints;
      let halfAngle = angle / 2.0;
      p.beginShape();
      for (let a = 0; a < p.TWO_PI; a += angle) {
        let sx = x + p.cos(a) * radius1;
        let sy = y + p.sin(a) * radius1;
        p.vertex(sx, sy);
        sx = x + p.cos(a + halfAngle) * radius2;
        sy = y + p.sin(a + halfAngle) * radius2;
        p.vertex(sx, sy);
      }
      p.endShape(p.CLOSE);
    }

    isDead() {
      return this.life > this.lifespan;
    }
  }

  p.createNewStar = function () {
    if (particles.length >= CONFIG.MAX_PARTICLES) return;
    const maxLife = p.random(CONFIG.MIN_LIFE, CONFIG.MAX_LIFE);
    particles.push(new Particle(containerX, containerY, maxLife));
  };
}
