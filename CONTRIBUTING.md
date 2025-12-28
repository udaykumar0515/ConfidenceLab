# Contributing to ConfidenceLab

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to ConfidenceLab. These are just guidelines, not rules. Use your best judgment and feel free to propose changes to this document in a pull request.

## 🛠️ How to Contribute

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the steps to reproduce the problem** in as much detail as possible.
- **Describe what you expected to happen** and what actually happened.
- **Include screenshots and animated GIFs** which show you following the steps and demonstrate the problem.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

- **Use a clear and descriptive title** for the issue.
- **Provide a step-by-step description of the suggested enhancement** in as much detail as possible.
- **Explain why this enhancement would be useful** to most users.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## 👩‍💻 Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/udaykumar0515/ConfidenceLab.git
   cd ConfidenceLab
   ```

2. **Install Frontend Dependencies**

   ```bash
   npm install
   ```

3. **Setup Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   pip install -r requirements.txt
   ```

## 🎨 Styleguides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### JavaScript/TypeScript Style

- We use ESLint and Prettier.
- Prefer functional components with hooks for React.
- Use TypeScript interfaces for prop definitions.

### Python Style

- Follow PEP 8 guidelines.
- Use type hints where possible.
- Document functions and classes with docstrings.

## 📄 License

By contributing, you agree that your contributions will be licensed under its MIT License.
