# Cosmic Stars

**Author**: corgido
**Created**: 2025-01-10
**License**: MIT

Cosmic Stars is a mesmerizing JavaScript animation powered by **p5.js**. It dynamically simulates a constellation of stars orbiting within a circular container, creating a vibrant, ever-changing visual experience.
If, watching them go round in circles isn't your thing, adjust the html file to use 'releaseStars.js' instead.
---

## 🌟 Features

- **Radial Wobble**: Stars orbit dynamically with Perlin noise for a natural, flowing motion.
- **Colorful Trails**: Stars leave evolving, colorful trails as they move.
- **Dynamic Lifecycle**: Stars are automatically generated and fade out naturally after their lifespan.
- **User-Friendly Behavior**: Animation starts after a brief delay and runs perpetually without intervention.
- **Circular Container**: Visual boundaries defined by a circular container for seamless organization.

---

## 🚀 Getting Started

### Prerequisites
1. **p5.js** library (available via [p5js.org](https://p5js.org/)).
2. A basic web development environment.

### Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/your-username/cosmic-stars.git
   ```
2. Include the `p5.js` library in your project:
   ```html
   <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.js"></script>
   ```

3. Add `cosmicStars.js` to your HTML file:
   ```html
   <script src="cosmicStars.js"></script>
   ```

4. Create a container element for the animation:
   ```html
   <div id="container"></div>
   ```

5. Run your project in a local or online environment.

---

## 🎮 How It Works

1. **Setup**: A circular container is dynamically calculated based on the `#container` element's position and size.
2. **Star Animation**:
   - Each star orbits around the center with a slight radial wobble.
   - Stars emit trails that change colors dynamically over time.
   - Stars are removed once their lifespan expires, maintaining smooth visuals.

3. **Customizable Attributes**:
   - Star lifespan, size, and orbit radius are randomly generated for variety.
   - Orbit speed and direction are unique for each star.

4. **Performance**:
   - The script optimizes performance by removing expired stars and using lightweight visuals.

---

## 🎨 Example Code

Here's a minimal example to include Cosmic Stars in your project:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cosmic Stars</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.6.0/p5.js"></script>
    <script src="cosmicStars.js"></script>
</head>
<body>
    <div id="container"></div>
</body>
</html>
```

---

## 🛠 Customization

- **Container Shape**: Modify the circular container logic for custom shapes or sizes.
- **Star Behavior**: Adjust `maxLife`, `burnStrength`, and `rotationSpeed` in the `Particle` class.
- **Emission Rate**: Change the `frameCount % 20` condition in the `draw` function.

---

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 🎆 Preview

Run the code and witness a dazzling starfield with unique, dynamic behaviors!
