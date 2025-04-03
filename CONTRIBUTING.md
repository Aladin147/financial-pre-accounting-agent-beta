# Contributing to Financial Pre-Accounting Agent

Thank you for your interest in contributing to the Financial Pre-Accounting Agent! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Beta Development Process](#beta-development-process)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Beta Development Process

We are currently transitioning from alpha (3.4.0-alpha) to beta (3.4.0-beta). The beta development is organized into four phases:

1. **Foundation Completion**: Service architecture migration and core form components
2. **Advanced UI Development**: Remaining form components and critical UI components
3. **Layout and Secondary Features**: Layout framework and service enhancements
4. **Testing and Polishing**: Comprehensive testing and final components

Please review the detailed plan in `docs/beta-transition-plan.md` before contributing.

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Aladin147/financial-pre-accounting-agent-beta.git
   cd financial-pre-accounting-agent-beta
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the beta development branch**:
   ```bash
   scripts/setup-beta-branch.bat
   ```

## Development Workflow

1. Choose a task from the beta roadmap in `CHANGELOG.md` or `docs/beta-roadmap.md`
2. Create a feature branch from `beta-dev`
3. Implement your changes with proper tests and documentation
4. Submit a pull request against the `beta-dev` branch

## Branching Strategy

- `main` - Stable production code (current alpha release)
- `beta-dev` - Development branch for beta work
- Feature branches - Created from `beta-dev` for individual components or features

For feature development:
```bash
git checkout beta-dev
git pull
git checkout -b feature/component-name
```

## Pull Request Process

1. Create a pull request against the `beta-dev` branch
2. Use the PR template provided
3. Ensure your PR includes:
   - Component implementation with proper theming
   - Comprehensive tests (≥90% coverage for critical components)
   - Documentation updates
   - Demo examples
4. Request review from at least one maintainer
5. Address review feedback

## Coding Standards

### General Guidelines

- Use meaningful variable and function names
- Keep functions small and focused
- Add comments for complex logic
- Follow the DRY (Don't Repeat Yourself) principle

### JavaScript/React Standards

- Use ES6+ features
- Use functional components with hooks
- Implement proper prop validation
- Follow React best practices for performance

### CSS/Styling Standards

- Use the Purple Theme system for all UI components
- Follow the design tokens defined in `src/renderer/styles/tokens.js`
- Implement responsive design principles
- Ensure accessibility compliance

## Commit Message Guidelines

We follow semantic commit messages:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to the build process or auxiliary tools

Example:
```
feat(checkbox): implement Checkbox and CheckboxGroup components

- Add Checkbox component with indeterminate state support
- Create CheckboxGroup for managing multiple selections
- Implement proper keyboard navigation and accessibility

Closes #42
```

## Testing Guidelines

- All components must have unit tests
- Critical components must have ≥90% test coverage
- Include visual tests for UI components
- Add accessibility tests where applicable
- Test all state changes and event handlers

## Documentation

- Add JSDoc comments to all public functions and components
- Update relevant documentation files in `/docs`
- Include usage examples for components
- Document any breaking changes
- Create or update demos for visual components

Thank you for contributing to the Financial Pre-Accounting Agent!
