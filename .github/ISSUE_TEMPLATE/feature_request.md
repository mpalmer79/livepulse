---
name: Feature Request
about: Suggest a feature
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Description
<!-- Clear description of the feature -->

## Use Case
<!-- Why is this needed? -->

## Proposed Solution
<!-- How should it work? -->

## Alternatives Considered
<!-- Other approaches you've thought of -->

## Additional Context
<!-- Any other info -->
```

---

## **Folder Structure for CI/CD**
```
.github/
├── workflows/
│   ├── ci.yml              # Quick checks on all pushes
│   ├── backend.yml         # Full backend CI/CD
│   └── frontend.yml        # Full frontend CI/CD
├── dependabot.yml          # Auto dependency updates
├── pull_request_template.md
└── ISSUE_TEMPLATE/
    ├── bug_report.md
    └── feature_request.md
