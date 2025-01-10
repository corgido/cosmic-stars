/*
Cosmic Stars
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

let particles = [];
let isActive = false;
let containerX, containerY, containerRadius;
let starEmissionRate = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);

  const container = document.getElementById("container");
  const rect = container.getBoundingClientRect();
  containerX = rect.left + rect.width / 2;
  containerY = rect.top + rect.height / 2;
  containerRadius = rect.width / 2;

  // Delay animation start by 555ms
  setTimeout(() => {
    loop(); // Start the animation
    createNewStar(); // Optionally create the first star immediately
  }, 555);

  noLoop(); // Ensure draw() doesn't run until manually triggered
}

function draw() {
  background(0, 25); // Trails

  // Draw the circular container
  noFill();
  stroke(255, 50);
  strokeWeight(2);
  ellipse(containerX, containerY, containerRadius * 2);

  // Gradual star generation (one at a time)
  if (frameCount % 20 === 0) {
    createNewStar();
  }

  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();

    if (particles[i].isDead()) {
      particles.splice(i, 1); // Remove expired stars
    }
  }
}

class Particle {
  constructor(x, y, maxLife) {
    this.origin = createVector(x, y); // Emission point (center of circle)
    this.pos = this.origin.copy(); // Current position
    this.prev = this.pos.copy(); // Previous position
    this.angle = random(TWO_PI); // Random initial direction
    this.radius = random(containerRadius * 1.05, containerRadius * 1.15); // Orbit radius
    this.color = color(
      random(100, 255), // Vibrant random colors
      random(100, 255),
      random(100, 255),
      200,
    );
    this.lifespan = maxLife; // Maximum lifespan in frames
    this.life = 0; // Current life in frames
    this.size = random(1, 3); // Tiny stars
    this.rotation = random(TWO_PI); // Rotation of the star
    this.rotationSpeed = random(-0.25, 0.25); // Speed of rotation
    this.direction = random() > 0.5 ? 1 : -1; // Random clockwise or counterclockwise
    this.noiseOffset = random(1000); // Unique noise offset for wobble
    this.burnStrength = random(0.2, 0.5); // Strength of "radial out" motion
  }

  update() {
    // Increment angle for orbit motion
    this.angle += this.direction * 0.02;

    // Simulate "burn radial out" using a noise-based wobble
    let radialBurn = map(
      noise(this.noiseOffset + frameCount * 0.01),
      0,
      1,
      -this.burnStrength,
      this.burnStrength,
    );
    let radialOffset = this.radius + radialBurn * this.radius;

    // Update position based on angle and radial wobble
    this.pos.x = containerX + radialOffset * cos(this.angle);
    this.pos.y = containerY + radialOffset * sin(this.angle);

    // Increment lifespan
    this.life++;
  }

  show() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation); // Rotate the star

    // Draw the star
    fill(this.color);
    noStroke();
    this.drawStar(0, 0, this.size, this.size / 2, 5);

    pop();

    // Dynamic trail color
    let trailColor = color(
      map(sin(frameCount * 0.01), -1, 1, 100, 255), // Dynamic red channel
      map(cos(frameCount * 0.01), -1, 1, 100, 255), // Dynamic green channel
      map(sin(frameCount * 0.02), -1, 1, 100, 255), // Dynamic blue channel
      25,
    );

    // Draw trail
    stroke(trailColor);
    strokeWeight(2.5); // Perfect trail thickness
    line(this.pos.x, this.pos.y, this.prev.x, this.prev.y);
    this.prev = this.pos.copy();
  }

  drawStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius1;
      let sy = y + sin(a) * radius1;
      vertex(sx, sy);
      sx = x + cos(a + halfAngle) * radius2;
      sy = y + sin(a + halfAngle) * radius2;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }

  isDead() {
    return this.life > this.lifespan;
  }
}

function createNewStar() {
  const maxLife = random(300, 900); // Random lifespan (5 to 15 seconds)
  particles.push(new Particle(containerX, containerY, maxLife));
}
