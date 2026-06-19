# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 02-admin-workflow.spec.js >> Admin Workflow >> 2.5 - Admin full order lifecycle: approve → allocate → dispatch → deliver → complete
- Location: e2e/02-admin-workflow.spec.js:78:3

# Error details

```
Error: page.evaluate: SecurityError: Failed to read the 'localStorage' property from 'Window': Access is denied for this document.
    at UtilityScript.evaluate (<anonymous>:305:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```