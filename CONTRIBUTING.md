# Contributing to Financial Pre-Accounting Agent

Thank you for your interest in contributing to the Financial Pre-Accounting Agent! This document provides guidelines and instructions for contributing to this open-source project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Versioning Guidelines](#versioning-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Tax Rules Contributions](#tax-rules-contributions)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)
- [Community](#community)

## Code of Conduct

This project adheres to a Code of Conduct that sets expectations for participation in our community. By participating, you are expected to uphold this code. Please report unacceptable behavior.

## Getting Started

To get started with development:

1. Fork the repository
2. Clone your fork locally
3. Install dependencies with `npm install`
4. Create a new branch for your work
5. Run the application locally with `npm run dev`

## Development Workflow

1. Choose an issue to work on or create a new one for discussion
2. Create a branch with a descriptive name (e.g., `feature/add-report-export`, `fix/tax-calculation-error`)
3. Make your changes, following our coding standards
4. Write or update tests as necessary
5. Update documentation to reflect your changes
6. Commit your changes with clear, descriptive commit messages
7. Push your branch and submit a pull request

## Versioning Guidelines

We follow [Semantic Versioning](https://semver.org/) with our custom labels:

```
MAJOR.MINOR.PATCH-LABEL
```

- **MAJOR**: Increments for incompatible API changes
- **MINOR**: Increments for backward-compatible new features
- **PATCH**: Increments for backward-compatible bug fixes
- **LABEL**: Additional context (mvp, alpha, beta, rc)

Our development roadmap follows this pattern:
- v1.0.0-mvp: Initial MVP
- v2.0.0-beta: Enhanced features
- v3.0.0-beta: Full-featured version
- v4.0.0: Production release

## Pull Request Process

1. Ensure your code follows our coding standards
2. Update documentation with details of changes
3. Add tests that verify your changes
4. Ensure all tests pass locally before submitting
5. Update the README.md with details of changes if needed
6. The PR should focus on a single feature or fix
7. The PR will be merged once it receives approval from maintainers

## Coding Standards

- Use consistent indentation (2 spaces)
- Follow the existing code style
- Use meaningful variable and function names
- Write comments for complex logic
- Keep functions small and focused
- Include JSDoc comments for public APIs
- Avoid commented-out code
- Use ES6 features appropriately

## Tax Rules Contributions

Because this application deals with Moroccan tax regulations, contributions to tax rules require:

1. Clear reference to the specific Finance Law article
2. Documentation of the rule's implementation details
3. Test cases demonstrating the rule's application
4. Peer review by maintainers or tax experts

### Tax Rule Structure

When updating tax rules, maintain the structure in `resources/tax-rules/finance-law-YYYY.json`:

```
{
  "version": "x.y.z",
  "description": "Brief description",
  "effectiveDate": "YYYY-MM-DD",
  "expiryDate": "YYYY-MM-DD",
  ... rule details ...
}
```

## Reporting Bugs

When reporting bugs:

1. Use the GitHub issue tracker
2. Describe the bug in detail
3. Include steps to reproduce
4. Add information about your environment (OS, Node version, etc.)
5. Include screenshots if applicable

## Feature Requests

For feature requests:

1. First check existing issues to avoid duplicates
2. Clearly describe the feature and its benefits
3. Provide examples of how the feature would work
4. Consider implementation complexity
5. Indicate if you're willing to implement it yourself

## Community

- Join our discussions in the GitHub issues
- Follow the project's progress through releases
- Share your implementations and extensions with the community

Thank you for contributing to making financial accounting more accessible for Moroccan businesses!
