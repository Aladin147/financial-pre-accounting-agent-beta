# Code Review Guide

**Version:** 1.0.0  
**Last Updated:** April 4, 2025  
**Status:** Approved  
**Owner:** Development Team  

## Overview

This document provides a comprehensive guide for conducting effective code reviews in the Financial Pre-Accounting Agent Beta project. Code reviews are a critical quality assurance practice that helps maintain code quality, share knowledge, and ensure adherence to project standards.

## Code Review Principles

1. **Respectful Communication**: Always be respectful and constructive in feedback
2. **Focus on the Code**: Review the code, not the developer
3. **Understand Context**: Consider the purpose and constraints of the changes
4. **Be Thorough**: Give the review the time and attention it deserves
5. **Suggest, Don't Command**: Phrase feedback as suggestions rather than commands
6. **Educational Opportunity**: Use reviews as opportunities to mentor and learn
7. **Technical Merit**: Focus on technical correctness, not stylistic preferences
8. **Balance**: Balance thoroughness with development velocity

## Pre-Review Checklist (For Authors)

Before submitting code for review, the author should verify:

1. **Self-Review**: Has thoroughly reviewed their own code
2. **Tests Passing**: All automated tests pass
3. **Definition of Done**: Meets all applicable criteria from Definition of Done
4. **Scope**: Changes are focused on the intended purpose
5. **Documentation**: Associated documentation updated
6. **Clean Code**: No debug code, commented-out code, or TODOs without tickets
7. **PR Description**: Pull request includes clear description of changes
8. **Related Issues**: Links to related issues or tickets are included

## Code Review Process

### 1. Assignment

- Reviews should be assigned within 1 business day of submission
- Developers should prioritize reviews over new development
- At least one reviewer with knowledge of the affected area should be assigned

### 2. Review Timing

- Small reviews (under 200 lines) should be completed within 1 business day
- Medium reviews (200-500 lines) should be completed within 2 business days
- Large reviews (over 500 lines) should be split into smaller chunks when possible

### 3. Review Depth

- **Level 1**: Quick review for trivial changes or documentation
- **Level 2**: Standard review for normal feature development
- **Level 3**: Deep review for critical infrastructure or security-sensitive code

### 4. Response Protocol

- Authors should respond to review comments within 1 business day
- Reviewers should re-review changes within 1 business day
- Unresolved disagreements should be discussed in a synchronous conversation

## What to Look For

Different types of code changes require different review focus areas:

### UI Component Reviews

1. **Visual Consistency**: Adheres to purple theme styling
2. **Accessibility**: ARIA attributes, keyboard navigation, screen reader support
3. **Error Handling**: Graceful handling of edge cases
4. **Prop Validation**: All props have proper validation
5. **Memoization**: Performance optimization as appropriate
6. **Responsiveness**: Works across different viewport sizes
7. **Code Duplication**: No unnecessary component duplication
8. **Testing**: Adequate unit test coverage
9. **Browser Compatibility**: Works in all supported browsers
10. **Documentation**: Component API documented clearly

### Service Implementation Reviews

1. **Interface Adherence**: Implements the defined interface
2. **Error Handling**: Comprehensive error handling and reporting
3. **Logging**: Appropriate logging for diagnostics
4. **Performance**: Efficient implementation without unnecessary operations
5. **Testing**: Thorough unit and integration tests
6. **Security**: No security vulnerabilities in implementation
7. **Registration**: Properly registered with ServiceRegistry
8. **Configuration**: Appropriate use of configuration parameters
9. **Documentation**: Service usage documented clearly
10. **Dependency Management**: Clear dependency structure with no cycles

### Data Model Reviews

1. **Schema Design**: Efficient and logical data structure
2. **Validation**: Input validation for all data
3. **Error Handling**: Graceful handling of invalid data
4. **Query Efficiency**: Efficient data access patterns
5. **Security**: No exposure of sensitive data
6. **Testing**: Comprehensive tests for data operations
7. **Documentation**: Clear documentation of data structure and relationships
8. **Migration**: Safe data migration paths if applicable
9. **Consistency**: Consistent naming conventions
10. **Storage Efficiency**: Appropriate types and structures for efficient storage

### Bug Fix Reviews

1. **Root Cause**: Addresses the actual root cause, not just symptoms
2. **Regression Tests**: Includes tests to prevent regression
3. **Scope**: Minimal scope focusing only on the fix
4. **Side Effects**: No unintended side effects
5. **Documentation**: Documentation updated if bug was due to unclear docs
6. **Known Issues**: Related entry in KNOWN_ISSUES.md removed/updated
7. **Similar Issues**: Consider similar code that might have the same issue

## Providing Effective Feedback

### Comment Structure

1. **What**: Clearly identify what the issue is
2. **Why**: Explain why it's an issue
3. **How**: Suggest how to address it
4. **Severity**: Indicate if this is a blocking issue or just a suggestion

### Comment Categories

Use these prefixes to categorize comments:

- **[MUST]**: Critical issues that must be addressed before approval
- **[SHOULD]**: Recommended changes that aren't blocking
- **[CONSIDER]**: Suggestions that the author should consider but can decide
- **[QUESTION]**: Clarification requests about the implementation
- **[NITPICK]**: Minor stylistic suggestions that aren't important
- **[PRAISE]**: Positive feedback on well-written code (important!)

### Examples

```
[MUST] This method doesn't handle null input, which could cause a NullReferenceException in production. Consider adding a null check at the beginning of the method.

[SHOULD] This computation is being done repeatedly in the render method. Consider memoizing the result to improve performance.

[CONSIDER] This utility function might be useful in other components too. Consider moving it to a shared utilities file.

[QUESTION] Why was this approach chosen over using the existing ConfigBridge pattern?

[NITPICK] The indentation here is a bit off from our standard.

[PRAISE] This error handling is very comprehensive and well thought out!
```

## Approving Changes

A reviewer should approve changes when:

1. All [MUST] issues have been addressed
2. Most [SHOULD] issues have been addressed or have reasonable explanations
3. [CONSIDER] and [NITPICK] issues have been considered by the author
4. [QUESTION] items have been answered satisfactorily
5. The code meets all applicable Definition of Done criteria

## Handling Disagreements

When reviewers and authors disagree:

1. Both parties should explain their reasoning clearly
2. Consider pros and cons of each approach objectively
3. Reference documentation or best practices when applicable
4. If consensus can't be reached, escalate to the tech lead
5. Document the final decision and rationale

## Special Review Types

### Security Reviews

For security-sensitive code, additional review should focus on:

1. Input validation and sanitization
2. Authentication and authorization
3. Sensitive data handling
4. Protection against common vulnerabilities (XSS, CSRF, SQL injection, etc.)
5. Secure configuration

### Performance Reviews

For performance-critical code, additional review should focus on:

1. Algorithmic efficiency
2. Resource utilization
3. Caching strategies
4. Network request optimization
5. Rendering performance for UI code

## Code Review Metrics

To maintain effective code review practices, we track:

1. Review turnaround time
2. Issues found per review
3. Review sizes
4. Review depth
5. Review participation across the team

---

*This Code Review Guide is a living document and will be updated as our processes evolve.*
