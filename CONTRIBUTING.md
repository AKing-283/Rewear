# Contributing Guidelines

Thank you for showing interest in contributing to **ReWear**! ✨  
This project is all about making sustainable fashion accessible and fun. We welcome contributions that help improve features, fix bugs, enhance UI/UX, or add meaningful documentation.

---

## 🛠 How to Contribute

### 1. Fork the repository
Click the **Fork** button on the top-right corner of this repository.

### 2. Clone your fork
Clone the forked repository to your local machine:

```bash
git clone https://github.com/<your-username>/ReWear.git
cd ReWear
```

### 3. Add the upstream remote (one-time setup)
This keeps your fork in sync with the original repository:

```bash
git remote add upstream https://github.com/<original-owner>/ReWear.git
```

### 4. Create a new branch
Always create a separate branch for your changes:

```bash
git checkout -b feature-name
```

### 5. Make your changes
- Follow the **project structure** (backend and frontend separation).
- Test your changes locally.
- For backend changes: ensure the Flask server runs without errors.
- For frontend changes: open `index.html` or run your local server to verify UI/UX.

### 6. Commit your changes
Write meaningful commit messages:

```bash
git add .
git commit -m "Add: brief description of your changes"
```

### 7. Keep your fork updated
Before pushing your branch:

```bash
git fetch upstream
git rebase upstream/main
```

Resolve any conflicts if they appear.

### 8. Push and open a Pull Request
Push your branch:

```bash
git push origin feature-name
```

Then open a Pull Request from your fork to the main repository.

---

## 💡 Contribution Tips

- Keep PRs small and focused.
- Test everything thoroughly.
- Update documentation when necessary.
- Check that your code is clean and readable.

---

## 📜 Code of Conduct

This project follows a strict [Code of Conduct](CODE_OF_CONDUCT.md). By contributing, you agree to maintain a respectful and inclusive environment for everyone.

---

## 🤝 Need Help?

If you are new to open source, feel free to ask questions in the issues/discussions section. Mentors and maintainers are here to guide you.

---

Happy Coding & Keep it Sustainable! 🌱
