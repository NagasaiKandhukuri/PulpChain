# Contributing to PulpChain

## Branch Naming
- `feature/description`
- `fix/description`
- `docs/description`

## Pull Request Requirements
Before submitting a PR, you must verify that your code compiles and passes all linting rules.
Run the following commands:
```bash
npm run lint
npm run build
```
Your PR will not be accepted if it introduces linting errors or build failures.

## Coding Conventions
- Use functional React components and Hooks.
- Follow the existing project structure (e.g., placing API calls in `src/services/`).
- Use `lucide-react` for iconography.
- Avoid introducing unnecessary third-party dependencies.
