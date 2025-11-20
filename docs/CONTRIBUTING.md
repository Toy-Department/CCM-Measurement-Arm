# Contributing to CCM Digitizing Arm

> **Document Control:** v1.0.0 | Last Updated: 2025-01-20

Thank you for your interest in contributing to the CCM Digitizing Arm project! This document provides guidelines for contributing code, reporting bugs, and suggesting features.

---

## 🤝 How to Contribute

### Reporting Bugs
1. Check [existing issues](https://github.com/Toy-Department/ccm-digitizing-arm/issues) to avoid duplicates
2. Create a new issue with the `bug` label
3. Include:
   - **OS and version** (Windows 10, macOS 12, Ubuntu 22.04, etc.)
   - **Node.js version** (`node --version`)
   - **Steps to reproduce** the bug
   - **Expected vs. actual behavior**
   - **Screenshots or logs** (if applicable)

### Suggesting Features
1. Open an issue with the `enhancement` label
2. Describe:
   - **Use case**: Why is this feature needed?
   - **Proposed solution**: How should it work?
   - **Alternatives considered**: Other approaches you've thought about

### Submitting Pull Requests
1. **Fork** the repository
2. **Create a branch** for your feature: `git checkout -b feature/my-new-feature`
3. **Make your changes** following the code style guidelines below
4. **Test thoroughly** (see Testing section)
5. **Commit** with clear messages: `git commit -m "Add circle fit algorithm optimization"`
6. **Push** to your fork: `git push origin feature/my-new-feature`
7. **Open a Pull Request** with a detailed description

---

## 📝 Code Style Guidelines

### JavaScript
- Use **ES6+** syntax (arrow functions, const/let, template literals)
- **Indent** with 4 spaces (not tabs)
- **Semicolons** are required
- **Naming conventions**:
  - Variables/functions: `camelCase`
  - Classes: `PascalCase`
  - Constants: `UPPER_SNAKE_CASE`
- **Comments**: Use JSDoc for functions

**Example:**
```javascript
/**
 * Calculate the best-fit circle from a set of 3D points
 * @param {Array<{x: number, y: number, z: number}>} points - Array of point objects
 * @returns {{diameter: number, center: {x: number, y: number, z: number}}}
 */
function calculateCircle(points) {
    const center = { x: 0, y: 0, z: 0 };
    // Implementation...
    return { diameter, center };
}
```

### HTML
- Use **semantic tags** (`<section>`, `<nav>`, `<article>`)
- **Indent** with 4 spaces
- **Attributes**: Use double quotes

### CSS
- Use **class selectors** over IDs for styling
- **Indent** with 4 spaces
- **Naming**: Use `kebab-case` for class names
- **Organization**: Group related styles together

---

## 🧪 Testing

### Manual Testing Checklist
Before submitting a PR, verify:
- [ ] Application starts without errors
- [ ] Simulator mode works (connect, record, export)
- [ ] Serial connection works (if hardware available)
- [ ] All geometry modes function correctly (Circle, Plane, Line)
- [ ] Undo/Redo works as expected
- [ ] CSV export produces valid files
- [ ] 3D viewer renders correctly
- [ ] No console errors in DevTools

### Running Tests
```bash
# (Future) Automated tests will be added in v1.1.0
npm test
```

---

## 🏗️ Project Structure

Key files to know:
- **`renderer.js`**: Core application logic (start here for most features)
- **`src/geometry-calculator.js`**: Geometry algorithms (circle, plane, line fitting)
- **`src/three-viewer.js`**: 3D visualization
- **`src/serial-handler.js`**: Hardware communication
- **`styles.css`**: All UI styling

---

## 🎯 Good First Issues

Look for issues labeled `good first issue` - these are beginner-friendly tasks like:
- Documentation improvements
- UI polish (button styling, layout tweaks)
- Adding keyboard shortcuts
- Improving error messages

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the **MIT License**.

---

## 💬 Questions?

- **GitHub Discussions**: [Ask the community](https://github.com/Toy-Department/ccm-digitizing-arm/discussions)
- **Email**: toydepartment2025@gmail.com

---

**Thank you for helping make CCM Digitizing Arm better!** 🎉
