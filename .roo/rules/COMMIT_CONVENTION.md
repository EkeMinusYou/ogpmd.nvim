# Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## Format

Each commit message consists of a **header**, a **body** and a **footer**.
The header has a special format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

- **type**: Must be one of the following:
    - `feat`: A new feature
    - `fix`: A bug fix
    - `docs`: Documentation only changes
    - `style`: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
    - `refactor`: A code change that neither fixes a bug nor adds a feature
    - `perf`: A code change that improves performance
    - `test`: Adding missing tests or correcting existing tests
    - `build`: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
    - `ci`: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
    - `chore`: Other changes that don't modify src or test files
    - `revert`: Reverts a previous commit
- **scope** (optional): A noun specifying the place of the commit change. Use `core` for general plugin core changes.
- **subject**: A short, imperative mood description of the change (e.g., `add login feature`, not `added login feature` or `adds login feature`). Use lowercase and no period at the end. **The subject must be a single line.**
- **Project Specific Rule**: While the Conventional Commits specification allows for optional body and footer sections, this project **requires** commits to consist **only** of the header line (`&lt;type&gt;(&lt;scope&gt;): &lt;subject&gt;`). Do not include a blank line, body, or footer in your commit messages.

## Example

```
feat(core): add Ogpmd command with argument handling

Implement the :Ogpmd <text> command that echoes the provided text argument.
Update README with usage instructions.
```

```
fix(config): correct default value for timeout option

The default timeout was too short, causing issues on slower connections.
Increased the default value to 5000ms.
## Commit Granularity

- **Separate Commits by Scope**: Changes related to different scopes (e.g., `core`, `deps`, `docs`) should generally be separated into distinct commits.
- **Atomic Commits**: Aim for atomic commits where each commit represents a single logical change within its scope. This helps in understanding the history and reverting changes if necessary.

## コミットの完全性 (Commit Completeness)

- **全変更の確認**: コミットを確定する前に `git status` を実行し、意図したすべての変更（新規ファイルを含む）がステージングされていることを確認してください。意図的に関連のない変更を分割する場合を除き、部分的なコミットは避けてください。
- **ステージングされた変更のレビュー**: `git diff --staged` を使用して、コミットされる正確な変更内容を確認してください。これにより、意図しない変更や漏れを発見できます。
- **AIによるコミット**: AI (Roo) がコミットを実行する際は、まず `git status` を実行してステージングされていない変更がないかを確認し、すべての関連ファイルがステージングされていることを確認した上で `git commit` を実行してください。コミット後に再度 `git status` を実行し、意図しない差分が残っていないか確認することも推奨されます。