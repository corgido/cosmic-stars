// cosmic-stars/cosmicStars.js
/*
Cosmic Stars - Instance Mode
Author: corgido
Created: 2025-01-10
Description: This JavaScript file contains the logic for a p5.js animation of stars orbiting dynamically.
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
    p.initializeContainer();

    // Delay animation start by 555ms
    p.noLoop(); // Ensure draw() doesn't run until manually triggered
    setTimeout(() => {
      // Corrected: Removed 'p.' prefix
      p.loop(); // Start the animation
      p.createNewStar(); // Optionally create the first star immediately
    }, 555);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.initializeContainer();
  };

  p.initializeContainer = function () {
    const container = document.getElementById("container");
    const rect = container.getBoundingClientRect();
    containerX = rect.left + rect.width / 2;
    containerY = rect.top + rect.height / 2;
    containerRadius = rect.width / 2;
  };

  p.draw = function () {
    p.background(0, 25); // Trails

    // Draw the circular container
    p.noFill();
    p.stroke(255, 50);
    p.strokeWeight(2);
    p.ellipse(containerX, containerY, containerRadius * 2);

    // Gradual star generation (one at a time)
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
      this.origin = p.createVector(x, y); // Emission point (center of circle)
      this.pos = this.origin.copy(); // Current position
      this.prev = this.pos.copy(); // Previous position
      this.angle = p.random(p.TWO_PI); // Random initial direction
      this.radius = p.random(containerRadius * 1.05, containerRadius * 1.15); // Orbit radius
      this.color = p.color(
        p.random(100, 255), // Vibrant random colors
        p.random(100, 255),
        p.random(100, 255),
        200,
      );
      this.lifespan = maxLife; // Maximum lifespan in frames
      this.life = 0; // Current life in frames
      this.size = p.random(1, 3); // Tiny stars
      this.rotation = p.random(p.TWO_PI); // Rotation of the star
      this.rotationSpeed = p.random(-0.25, 0.25); // Speed of rotation
      this.direction = p.random() > 0.5 ? 1 : -1; // Random clockwise or counterclockwise
      this.noiseOffset = p.random(1000); // Unique noise offset for wobble
      this.burnStrength = p.random(0.2, 0.5); // Strength of "radial out" motion
    }

    update() {
      // Increment angle for orbit motion
      this.angle += this.direction * 0.02;

      // Simulate "burn radial out" using a noise-based wobble
      let radialBurn = p.map(
        p.noise(this.noiseOffset + p.frameCount * 0.01),
        0,
        1,
        -this.burnStrength,
        this.burnStrength,
      );
      let radialOffset = this.radius + radialBurn * this.radius;

      // Update position based on angle and radial wobble
      this.pos.x = containerX + radialOffset * p.cos(this.angle);
      this.pos.y = containerY + radialOffset * p.sin(this.angle);

      // Increment lifespan
      this.life++;
    }

    show() {
      p.push();
      p.translate(this.pos.x, this.pos.y);
      p.rotate(this.rotation); // Rotate the star

      // Draw the star
      p.fill(this.color);
      p.noStroke();
      this.drawStar(0, 0, this.size, this.size / 2, 5);

      p.pop();

      // Dynamic trail color
      let trailColor = p.color(
        p.map(p.sin(p.frameCount * 0.01), -1, 1, 100, 255), // Dynamic red channel
        p.map(p.cos(p.frameCount * 0.01), -1, 1, 100, 255), // Dynamic green channel
        p.map(p.sin(p.frameCount * 0.02), -1, 1, 100, 255), // Dynamic blue channel
        25,
      );

      // Draw trail
      p.stroke(trailColor);
      p.strokeWeight(2.5); // Perfect trail thickness
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
    const maxLife = p.random(300, 900); // Random lifespan (5 to 15 seconds)
    particles.push(new Particle(containerX, containerY, maxLife));
  };
}
