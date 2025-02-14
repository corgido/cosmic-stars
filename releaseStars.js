// cosmic-stars/releaseStars.js
/*
Release Stars - Instance Mode
Author: corgido
Created: 2025-01-10
Description: This script spawns stars gradually within the CSS-defined circular container
(#container) and allows them to float freely with dynamic, randomized movement.
License: MIT
*/

function ReleaseStarsSketch(p) {
  const maxStars = 100; // Set your desired maximum number of stars
  let particles = [];
  let containerX, containerY, containerRadius;
  let gravityCenter;
  let attractionStrength = 0.25; // Strength of attraction toward the center (set to 0 to disable)

  p.setup = function () {
    p.createCanvas(p.windowWidth, p.windowHeight);

    p.initializeContainer();

    gravityCenter = p.createVector(containerX, containerY); // Optional gravity center

    // Delay the start of the animation
    p.noLoop(); // Pause the draw loop initially
    setTimeout(() => {
      // Corrected: Removed 'p.' prefix
      p.loop(); // Start the draw loop
      p.createNewStar(); // Emit the first star
    }, 555);
  };

  p.windowResized = function () {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.initializeContainer();
    gravityCenter = p.createVector(containerX, containerY);
  };

  p.initializeContainer = function () {
    // Get the position and size of the CSS-defined #container
    const container = document.getElementById("container");
    const rect = container.getBoundingClientRect();
    containerX = rect.left + rect.width / 2; // Center X of the container
    containerY = rect.top + rect.height / 2; // Center Y of the container
    containerRadius = rect.width / 2; // Radius based on container width
  };

  p.draw = function () {
    p.background(0, 50); // Create a faint trail effect

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].show();

      if (particles[i].isDead()) {
        particles.splice(i, 1); // Remove expired stars
      }
    }

    // Gradual star generation (one star every 20 frames)
    if (p.frameCount % 20 === 0) {
      p.createNewStar();
    }
  };

  class Particle {
    constructor(x, y, maxLife) {
      this.pos = p.createVector(x, y); // Current position
      this.prev = this.pos.copy(); // Previous position for trail
      this.vel = p5.Vector.random2D().mult(p.random(0.5, 5)); // Random initial velocity
      this.color = p.color(
        p.random(100, 255),
        p.random(100, 255),
        p.random(100, 255),
        200,
      );
      this.lifespan = maxLife; // Maximum lifespan in frames
      this.life = 0; // Current life
      this.noiseOffset = p.random(1000); // Unique Perlin noise offset
      this.size = p.random(1, 7); // Star size
    }

    update() {
      // Apply random noise to velocity
      let noiseForce = p.createVector(
        p.map(p.noise(this.noiseOffset + p.frameCount * 0.01), 0, 1, -0.5, 0.5),
        p.map(
          p.noise(this.noiseOffset + p.frameCount * 0.01 + 1000),
          0,
          1,
          -0.5,
          0.5,
        ),
      );
      this.vel.add(noiseForce);

      // Optional: Add attraction to gravity center
      let gravityDir = p5.Vector.sub(gravityCenter, this.pos).normalize();
      this.vel.add(gravityDir.mult(attractionStrength));

      // Update position
      this.pos.add(this.vel);

      // Increment lifespan
      this.life++;

      // Dynamic fading
      let fadeAmount = p.map(this.life, 0, this.lifespan, 255, 0);
      this.color.setAlpha(fadeAmount);
    }

    show() {
      // Draw the star
      p.noStroke();
      p.fill(this.color);
      p.ellipse(this.pos.x, this.pos.y, this.size);

      // Draw the trail
      p.stroke(this.color);
      p.strokeWeight(4.5);
      p.line(this.pos.x, this.pos.y, this.prev.x, this.prev.y);

      // Update trail position
      this.prev = this.pos.copy();
    }

    isDead() {
      return this.life > this.lifespan;
    }
  }

  p.createNewStar = function () {
    // Prevent adding new stars if we've reached the maxStars limit
    if (particles.length >= maxStars) return;

    // Spawn a star within the bounds of the CSS-defined circular container
    let angle = p.random(p.TWO_PI);
    let radius = p.random(containerRadius); // Random distance within the circle
    let x = containerX + radius * p.cos(angle);
    let y = containerY + radius * p.sin(angle);

    const maxLife = p.random(300, 800); // Lifespan of 5-13 seconds
    particles.push(new Particle(x, y, maxLife));
  };
}
