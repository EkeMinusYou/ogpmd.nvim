# Coding Style Guide

This document outlines specific coding style rules for this project to maintain code clarity and consistency.

## Imports

- **Remove Unused Imports**: Ensure that all imported modules, classes, functions, or variables are actually used within the file. Remove any imports that are no longer necessary. Commenting out unused imports is not sufficient; they should be completely deleted.

## Comments

- **Avoid Obvious Comments**: Do not add comments that merely restate what the code clearly expresses. Comments should explain *why* something is done a certain way or clarify complex logic, not *what* the code is doing if it's straightforward.

Example of an obvious comment to avoid:
```typescript
// Increment count by one
count++;
```

Focus on writing self-documenting code and reserve comments for non-obvious aspects.
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