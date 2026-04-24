---
name: plan-to-tracker
description: Push epics or user stories from a Markdown plan into any task-management tracker (ClickUp, Jira, Linear, Asana, Notion, GitHub/GitLab Issues, Azure DevOps, Shortcut, Monday, Trello, YouTrack, Basecamp, Height, or any other), creating one task per story with summary, deliverables, and non-negotiables. Use when the user wants to sync a plan file into a tracker, pass stories to a task-management tool, or create tickets from an epics document.
---

# Plan to Tracker

Turn a Markdown plan's epics / stories into tasks inside whichever task-management system the user names. One story becomes one task. The parsing, preview, description shape, and reporting are identical across tools — the only thing that changes is which create-task tool you call at the end.

This skill is tool-agnostic by design. It is NOT limited to ClickUp, Jira, or Linear — treat those as three worked examples of a general pattern that applies equally to Asana, Notion, GitHub / GitLab Issues, Azure DevOps, Shortcut, Monday, Trello, YouTrack, Basecamp, Height, or any other system the user has access to.

## Inputs

The user must provide:

- **Plan file** — a Markdown file whose H2 sections are the stories (e.g. `## Epic 1 — …`, `## Phase 2: …`, `## Story: …`).
- **Tracker** — the name of the task-management tool to push into. Any tool is valid; do not reject unfamiliar names.
- **Destination** — the container the tasks should land in (list / project / team / board / database / repo). This can be an ID, a URL, or a human-readable name the tool can resolve.

If any of the three is missing, ask one targeted question before doing anything else. Do not guess a destination.

## Workflow

### 1. Read and parse the plan

Read the plan file. Identify the story sections:

- Default rule: every H2 that looks like an epic / phase / story is a story. Typical patterns: `## Epic N — Title`, `## Phase N: Title`, `## Story N — Title`.
- Skip page-level sections that are clearly not stories: `## Context`, `## Out of Scope`, `## Definition of Done`, `## Non-Negotiables`, `## Goals`, `## Architectural Decisions`, or anything in the plan header before the first story.
- If the document does not follow the H2-per-story pattern, list the H2 headings to the user and confirm which ones are stories before continuing.

For each story, extract:

- **Title** — the heading text. Keep the `Epic N` / `Phase N` prefix; it helps reviewers keep order in the tracker.
- **Summary** — the prose paragraphs that come after the heading and before the first `**Deliverables**`, `### Deliverables`, `**Acceptance Criteria**`, or similar checklist block.
- **Deliverables** — the checklist items under `Deliverables` / `Acceptance Criteria`. Preserve `- [ ]` syntax so the tracker renders native checkboxes when it can.
- **Non-Negotiables** *(optional)* — any per-story constraints section. Keep it as its own block.

### 2. Resolve the tracker path

Before doing anything destructive, decide **how** you will create tasks in the named tracker. Try these avenues in order:

1. **MCP tool for that tracker** — list the available MCP tools and look for a create-task / create-issue tool that names the tracker (e.g. any tool matching `*<tracker>*create*task*` or `*<tracker>*create*issue*`). Prefer MCP tools when present: they handle auth, pagination, and payload shape.
2. **Generic tracker MCP** — some tools sit behind a shared gateway (e.g. Atlassian MCP covers Jira, Confluence). Use it when available.
3. **Official REST / GraphQL API** — if no MCP tool exists, use the tracker's public API via `curl` or `fetch`. Look up the current endpoint, auth mode, and task-creation payload shape in the tracker's docs (use `context7` or `WebFetch` if you're not sure). Confirm the user has credentials configured (`<TRACKER>_TOKEN`, `<TRACKER>_API_KEY`, OAuth cookie, etc.) **before** the preview step — don't discover missing auth mid-loop.
4. **CLI** — some tools ship a CLI (e.g. `gh`, `glab`). Acceptable when no API path is convenient.

If none of the above is viable, stop and tell the user: "I can't reach `<tracker>` from here. Options: install an MCP, provide an API token, or use a different tool." Do not invent a path.

Resolve the destination to a concrete identifier while you're here:

- URL-based IDs — parse the last meaningful segment (e.g. ClickUp `…/v/li/<listId>`, Linear `…/team/<teamKey>/…`, GitHub `…/<owner>/<repo>`).
- Name-based — ask the tracker to list candidates and pick the unambiguous match; if ambiguous, ask the user.

### 3. Preview the mapping

Before touching any write API, show the user:

- The tracker and resolved destination (`ClickUp list 901326962936`, `Linear team ENG`, `GitHub repo acme/platform`, `Notion database "Roadmap"`, etc.).
- The chosen tool path (MCP name, REST endpoint, or CLI command).
- A numbered list: `N. <story title> → <task title to be created>`.
- Any H2 sections you are skipping, with a one-line reason each.

Ask for confirmation. This is a one-way operation — tasks created in a tracker are not easily rolled back.

### 4. Build each task's description

Use one consistent shape for every tracker. Markdown is the default — most modern trackers render it natively or via a pass-through field.

```
**Source:** <plan file path>

## Summary
<prose paragraphs from the story>

## Deliverables
- [ ] Item 1
- [ ] Item 2
...

## Non-Negotiables
<story-specific non-negotiables, if present — omit the whole section otherwise>
```

If the tracker does not render Markdown in its description field (rare — e.g. Jira Cloud ADF, some older tools), convert to the tracker's native format at the last possible moment. Never downgrade to plain text as a default.

Do not inflate the description with metadata the plan does not contain. No owners, no dates, no priority, no labels unless the user specified them.

### 5. Create the tasks

Create tasks **in parallel** — each creation is independent. For every tracker the shape is the same:

```
create_task({
  destination:  <resolved id>,
  title:        <story title>,
  description:  <markdown body from step 4>,
})
```

What changes is the name and signature of `create_task` per tool. Fill in whichever required fields the chosen tool enforces (issue type, status, team, etc.) using sensible defaults — usually "Task" / "Epic" / "Story" depending on the story's granularity.

For each creation, capture the returned task ID and URL.

### 6. Report back

Output a table the user can scan:

| # | Story | Task |
|---|-------|------|
| 1 | Epic 1 — … | [task-id](url) |
| … | … | … |

Flag failures clearly with the story title and the error message. Do not retry silently — surface the failure so the user can decide.

## Conventions

- **One story → one top-level task.** Do not break deliverables into subtasks unless the user explicitly asks. Keeps the list readable and matches the plan's granularity.
- **Do not assign owners, dates, priorities, labels, or statuses** unless the user specified them. A created task should reflect only what's in the plan.
- **Do not re-create tasks that already exist.** If the user re-runs the skill against the same destination and tasks with matching titles are already there, stop and ask before proceeding — duplicates are worse than no-ops.
- **Preview before publishing, always.** Even when the user says "just do it", show the mapping first. One extra line of confirmation is cheap; an unwanted batch of tickets is not.
- **Preserve Markdown.** Convert away from it only when the target field truly doesn't accept it.
- **No hidden fallbacks.** If the named tracker isn't reachable, say so — don't quietly push to a different tool.
- **English only**, per the repo-wide rule — titles, descriptions, and commit messages.

## Reference — known tracker shapes

Non-exhaustive. Treat these as examples of the general pattern; apply the same shape to any tracker not listed.

- **ClickUp** — MCP tool `mcp__clickup__clickup_create_task`. Required: `list_id`, `name`, `markdown_description`. List URL: `…/v/li/<listId>`.
- **Linear** — Linear MCP's `save_issue`. Required: `teamId`, `title`, `description` (Markdown). Resolve `teamId` from team key/URL.
- **Jira** — Atlassian MCP create-issue tool, or `POST /rest/api/3/issue`. Required: `project.key`, `summary`, `description`, `issuetype.name` (`Epic` / `Story` / `Task`). Cloud Jira expects ADF for the description field — convert at the boundary.
- **GitHub Issues** — `gh issue create --repo <owner>/<repo> --title … --body …`, or `POST /repos/<owner>/<repo>/issues`. Map non-negotiables to labels only if the user opted in.
- **GitLab Issues** — `glab issue create`, or `POST /projects/:id/issues`. `description` accepts Markdown natively.
- **Asana** — `POST /tasks` with `workspace`, `projects[]`, `name`, `notes` (Markdown via `html_notes` when rich formatting is needed).
- **Notion** — `POST /pages` with `parent.database_id`, a `title` property, and the story body as `children` blocks. Notion rejects raw Markdown — build the block tree from the parsed sections.
- **Azure DevOps** — `POST /_apis/wit/workitems/$<type>` with JSON Patch ops for `System.Title` and `System.Description` (HTML; convert Markdown to HTML).
- **Shortcut** — `POST /api/v3/stories` with `name`, `description` (Markdown), `project_id` or `group_id`.
- **Monday** — GraphQL `create_item` with `board_id`, `item_name`, and column values.
- **Trello** — `POST /1/cards` with `idList`, `name`, `desc` (Markdown-lite).
- **YouTrack** — `POST /api/issues` with `project.id`, `summary`, `description` (Markdown-lite).

When the user names a tracker not in this list, follow the workflow above unchanged — discover the tool, resolve the destination, preview, create, report.
