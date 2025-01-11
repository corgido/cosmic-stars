// cosmic-stars/cosmicStars.js
/*
Cosmic Stars - Instance Mode
Author: corgido
Created: 2025-01-10
Description: This JavaScript file contains the logic for a p5.js animation
of stars orbiting dynamically.

Features include:
- Radial wobble with Perlin noise
- Colorful, evolving trails
- Automatic star generation and expiration
- Brief delay before autostarts and continues perpetually.

License: MIT
*/

function CosmicStarsSketch(p) {
  let particles = [];
  let containerX, containerY, containerRadius;

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);

    // Delay container init to ensure DOM is ready
    setTimeout(() => {
      p.initializeContainer();
      // Delay animation start by 555ms
      p.noLoop();
      setTimeout(() => {
        p.loop(); // Start the animation
        p.createNewStar();
      }, 555);
    }, 100); // small delay for bounding box
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.initializeContainer();
  };

  p.initializeContainer = function () {
    const container = document.getElementById("container");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let w = rect.width;
    let h = rect.height;

    // Fallback if bounding box is zero
    if (w === 0 || h === 0) {
      w = p.width / 2;
      h = p.height / 2;
    }

    containerX = rect.left + w / 2 + window.scrollX;
    containerY = rect.top + h / 2 + window.scrollY;
    containerRadius = w / 2;
  };

  p.draw = function () {
    p.background(0, 25); // Trails effect

    // Generate a new star every 20 frames
    if (p.frameCount % 20 === 0) {
      p.createNewStar();
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].show();

      if (particles[i].isDead()) {
        particles.splice(i, 1); // Remove expired stars
      }
    }
  };

  class Particle {
    constructor(x, y, maxLife) {
      this.origin = p.createVector(x, y);
      this.pos = this.origin.copy();
      this.prev = this.pos.copy();
      this.angle = p.random(p.TWO_PI);
      this.radius = p.random(containerRadius * 1.05, containerRadius * 1.15);
      this.color = p.color(
        p.random(100, 255),
        p.random(100, 255),
        p.random(100, 255),
        200,
      );
      this.lifespan = maxLife;
      this.life = 0;
      this.size = p.random(1, 3);
      this.rotation = p.random(p.TWO_PI);
      this.rotationSpeed = p.random(-0.25, 0.25);
      this.direction = p.random() > 0.5 ? 1 : -1;
      this.noiseOffset = p.random(1000);
      this.burnStrength = p.random(0.2, 0.5);
    }

    update() {
      // Increment angle for orbit motion
      this.angle += this.direction * 0.02;

      // "Burn radial out" with Perlin noise
      let radialBurn = p.map(
        p.noise(this.noiseOffset + p.frameCount * 0.01),
        0,
        1,
        -this.burnStrength,
        this.burnStrength,
      );
      let radialOffset = this.radius + radialBurn * this.radius;

      // Update position
      this.pos.x = containerX + radialOffset * p.cos(this.angle);
      this.pos.y = containerY + radialOffset * p.sin(this.angle);

      // Increment lifespan
      this.life++;
    }

    show() {
      // Draw star shape
      p.push();
      p.translate(this.pos.x, this.pos.y);
      p.rotate(this.rotation);
      p.fill(this.color);
      p.noStroke();
      this.drawStar(0, 0, this.size, this.size / 2, 5);
      p.pop();

      // Dynamic trail color
      let trailColor = p.color(
        p.map(p.sin(p.frameCount * 0.01), -1, 1, 100, 255),
        p.map(p.cos(p.frameCount * 0.01), -1, 1, 100, 255),
        p.map(p.sin(p.frameCount * 0.02), -1, 1, 100, 255),
        25,
      );

      // Draw trail
      p.stroke(trailColor);
      p.strokeWeight(2.5);
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
    const maxLife = p.random(300, 900); // 5 to 15 seconds
    particles.push(new Particle(containerX, containerY, maxLife));
  };
}
