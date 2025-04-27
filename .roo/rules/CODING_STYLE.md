# Coding Style Guide

This document outlines specific coding style rules for this project to maintain code clarity and consistency.

## Imports

- **Strictly Remove Unused Imports**: Ensure that all imported modules, classes, functions, or variables are actually used within the file. **Remove any imports that are no longer necessary.** Commenting out unused imports is not sufficient; they must be completely deleted.
- **Use `deps.ts` for Dependency Management**: Manage all external dependencies within the `denops/PLUGIN_NAME/deps.ts` file. Re-export modules from this file.
- **Import from `deps.ts`**: In the main plugin code (`denops/PLUGIN_NAME/main.ts` and other modules), import dependencies exclusively from the `./deps.ts` file using relative paths. Do not import directly from URLs or other external sources in the main code files.

## Comments

- **Strictly Avoid Obvious Comments**: Do **not** add comments that merely restate what the code clearly expresses. Code that is easy to understand does not need comments explaining *what* it does. Comments should **only** be used to explain *why* something is done a certain way or to clarify genuinely complex logic.

Example of an obvious comment to avoid:
```typescript
// Increment count by one
count++;
```

Focus on writing self-documenting code and reserve comments for non-obvious aspects.
- **Remove Temporary Comments**: Ensure that any temporary comments added during development (e.g., debugging `console.log` statements, TODOs for immediate fixes, or temporary notes) are removed before committing the code.
## Error Handling

- **Prefer `.catch()` over `try...catch` for Promises**: When handling errors in asynchronous operations that return Promises, prefer using the `.catch()` method over a `try...catch` block where possible. This often leads to more concise and readable asynchronous code.

Example:
```typescript
// Prefer this:
someAsyncOperation()
  .then(result => {
    // handle success
  })
  .catch(error => {
    // handle error
  });

// Over this, when dealing with a single promise chain:
try {
  const result = await someAsyncOperation();
  // handle success
} catch (error) {
  // handle error
}
```