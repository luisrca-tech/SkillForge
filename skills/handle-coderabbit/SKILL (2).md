---
name: handle-coderabbit
description: Fetch and address CodeRabbit review comments on a pull request. Use when CodeRabbit has reviewed a PR and left comments to resolve, when the user says "handle coderabbit", "address review comments", or "fix coderabbit feedback".
---

# Handle CodeRabbit

Read all CodeRabbit review comments on the current PR, address each one with code changes, validate, and push.

## Workflow

### 1. Identify the PR

If no PR number is given, derive it from the current branch:

```bash
gh pr view --json number,url,headRefName
```

### 2. Fetch CodeRabbit comments

Pull all review comments left by the CodeRabbit bot:

```bash
gh pr view <number> --json reviews,comments
gh api repos/{owner}/{repo}/pulls/<number>/comments --jq '.[] | select(.user.login | startswith("coderabbitai")) | {id, path, line, body}'
gh api repos/{owner}/{repo}/pulls/<number>/reviews --jq '.[] | select(.user.login | startswith("coderabbitai")) | {id, body, state}'
```

Also check the general PR review body (CodeRabbit posts a summary review with actionable items):

```bash
gh api repos/{owner}/{repo}/pulls/<number>/reviews --jq '.[] | select(.user.login | startswith("coderabbitai")) | .body'
```

### 3. Triage comments

Group comments by category:

- **Actionable** — code changes needed (bugs, style, logic issues, missing tests)
- **Nitpicks** — optional, address only if quick
- **Questions/clarifications** — may need a reply instead of a code change

Skip comments marked `[LGTM]` or already resolved.

### 4. Address each actionable comment

For each comment:

1. Read the referenced file at the referenced line
2. Understand what CodeRabbit is asking
3. Make the minimal change that resolves the issue
4. Do not refactor surrounding code or gold-plate the fix

### 5. Validate

```bash
bun run typecheck
bun run test
```

Fix any regressions before continuing.

### 6. Commit and push

```bash
git add <changed files>
git commit -m "fix(review): fix explanation"
git push
```

### 7. Reply to addressed comments (optional)

If the user wants to close the loop, reply to each resolved comment:

```bash
gh api repos/{owner}/{repo}/pulls/<number>/comments/<comment_id>/replies \
  -f body="Addressed in latest commit."
```
