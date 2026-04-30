import type { SkillData } from "./skills.types";

export const grillMe: SkillData = {
  name: "grill-me",
  problem: {
    title: "The problem",
    description:
      "You open your editor, ask the AI to create a feature, and start coding immediately. Without understanding the real requirements, edge cases, or system constraints. The result? Endless rework, PRs that come back with dozens of comments, and features that don't address what the user actually needs.",
  },
  skill: {
    title: "The skill",
    description:
      "The /grill-me is a technical interview conducted by AI before any line of code. It asks tough questions about the feature — scope, limitations, dependencies, edge cases — forcing you to think about the problem before thinking about the solution. It's like having a tech lead reviewing your idea before you invest hours in it.",
  },
  howItWorks: {
    title: "How it works",
    steps: [
      "You describe the feature you want to build in plain language",
      "The AI asks incisive technical questions about requirements, constraints, and scenarios",
      "You answer, and the AI digs deeper into the weakest areas of your reasoning",
      "In the end, you have total clarity on what needs to be built",
    ],
  },
  scenarios: [
    {
      id: "react",
      label: "React Project",
      lines: [
        {
          type: "prompt",
          text: "I want to create an authentication system with social login",
        },
        {
          type: "response",
          text: "Which social login providers do you need to support? (Google, GitHub, Apple, etc.)",
        },
        { type: "prompt", text: "Google and GitHub to start" },
        {
          type: "response",
          text: "How will you handle the case where a user already has an email/password account and tries to social login with the same email? Automatic merge or error?",
        },
        {
          type: "prompt",
          text: "Hadn't thought about that... automatic merge makes sense",
        },
        {
          type: "response",
          text: "What if the social provider's email is different from the registered one? Does the user lose access to the old account? Do you need an account linking flow?",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "Before coding, define: account merge strategy, refresh tokens, and what happens when a provider goes offline. These are the biggest risks of this feature.",
        },
      ],
    },
    {
      id: "api",
      label: "Backend API",
      lines: [
        {
          type: "prompt",
          text: "I need to create a file upload endpoint for our SaaS",
        },
        {
          type: "response",
          text: "What's the maximum file size you plan to support? And which formats?",
        },
        {
          type: "prompt",
          text: "PDFs and images, up to 10MB",
        },
        {
          type: "response",
          text: "How will you handle simultaneous uploads from the same user? And if the upload fails midway — does the client retry the entire file or do you support resumable uploads?",
        },
        {
          type: "prompt",
          text: "Simple upload for now, no resumable",
        },
        {
          type: "response",
          text: "Where will files be stored? S3? And processing — synchronous in the request or asynchronous via queue? If synchronous, what's the endpoint timeout?",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "Critical points: server-side MIME type validation (don't trust the client's Content-Type), malware scanning, and per-user rate limiting. Define these before implementing.",
        },
      ],
    },
  ],
};

export const writeAPrd: SkillData = {
  name: "write-a-prd",
  problem: {
    title: "The problem",
    description:
      "Features start as vague ideas in the developer's head and go straight to code. No requirements documentation, no scope definition, no acceptance criteria. Three sprints later, nobody remembers what was supposed to be built, scope has tripled, and the PM asks 'but was this a priority?'.",
  },
  skill: {
    title: "The skill",
    description:
      "The /write-a-prd generates a complete Product Requirements Document from the answers you gave in /grill-me (or from your own description). The PRD includes: problem statement, proposed solution, user stories, implementation decisions, and what's out of scope. It's the contract between what you promised and what you'll deliver.",
  },
  howItWorks: {
    title: "How it works",
    steps: [
      "The AI uses the context collected in /grill-me as the main input",
      "Generates a structured PRD with standardized sections (Problem, Solution, User Stories, etc.)",
      "You review, adjust, and validate each section before proceeding",
      "The PRD serves as a reference throughout the entire implementation",
    ],
  },
  scenarios: [
    {
      id: "saas",
      label: "SaaS Feature",
      lines: [
        { type: "prompt", text: "Generate PRD for the notification system" },
        {
          type: "response",
          text: "## Problem Statement",
        },
        {
          type: "response",
          text: "SaaS users lack visibility into important events (payments, invitations, usage alerts). Critical actions are missed because they depend on the user manually checking the dashboard.",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "## Solution",
        },
        {
          type: "response",
          text: "Multi-channel notification system (in-app, email, push) with per-user preferences and smart grouping to prevent notification fatigue.",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "## User Stories",
        },
        {
          type: "response",
          text: "1. As a user, I want to be notified when my payment fails, so I can fix it before losing access",
        },
        {
          type: "response",
          text: "2. As a user, I want to configure which notifications I receive by email vs. in-app, so I'm not bombarded",
        },
        {
          type: "response",
          text: "3. As an admin, I want to see the notification delivery rate, to ensure the system is working",
        },
      ],
    },
    {
      id: "cli",
      label: "CLI Tool",
      lines: [
        {
          type: "prompt",
          text: "Generate PRD for an automated deploy CLI",
        },
        {
          type: "response",
          text: "## Problem Statement",
        },
        {
          type: "response",
          text: "Deploys are done manually via SSH or ad-hoc scripts. Each developer has their own process, resulting in inconsistent deploys with no rollback and no audit trail.",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "## Solution",
        },
        {
          type: "response",
          text: "Declarative CLI that reads a deploy.yaml, runs builds, health checks, and automatic rollback on failure. Integrates with existing CI/CD via hooks.",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "## Out of Scope",
        },
        {
          type: "response",
          text: "- Multi-service orchestration (use Kubernetes for that)",
        },
        {
          type: "response",
          text: "- Web dashboard (MVP is CLI-only)",
        },
        {
          type: "response",
          text: "- Windows support (Linux and macOS only for MVP)",
        },
      ],
    },
  ],
};

export const prdToPlan: SkillData = {
  name: "prd-to-plan",
  problem: {
    title: "The problem",
    description:
      "You have a complete PRD, but it's a business document — not an execution plan. Trying to implement directly from the PRD results in massive commits, vague stories like 'implement authentication', and zero traceability between what was planned and what was delivered. The developer jumps from section to section of the PRD with no clear order.",
  },
  skill: {
    title: "The skill",
    description:
      "The /prd-to-plan transforms the PRD into a technical plan with sequential phases, each containing short, specific stories with acceptance criteria. The plan is optimized to be consumed by AI during implementation — each story references exactly what to build, without ambiguity.",
  },
  howItWorks: {
    title: "How it works",
    steps: [
      "The AI reads the PRD and identifies dependencies between components",
      "Groups work into phases with a logical implementation order",
      "Each phase contains short technical stories with clear acceptance criteria",
      "The plan serves as direct input for /do-work to execute phase by phase",
    ],
  },
  scenarios: [
    {
      id: "fullstack",
      label: "Fullstack App",
      lines: [
        {
          type: "prompt",
          text: "Generate technical plan from the notification system PRD",
        },
        {
          type: "response",
          text: "## Phase 1: Data model and base API",
        },
        {
          type: "response",
          text: "Story 1.1: Create notifications table with fields user_id, type, channel, payload, read_at, created_at",
        },
        {
          type: "response",
          text: "Story 1.2: POST /notifications endpoint — create notification and enqueue for delivery",
        },
        {
          type: "response",
          text: "Story 1.3: GET /notifications endpoint — list with pagination and read/unread filter",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "## Phase 2: Multi-channel delivery",
        },
        {
          type: "response",
          text: "Story 2.1: Worker that consumes the queue and dispatches via email (SendGrid) or push (FCM)",
        },
        {
          type: "response",
          text: "Story 2.2: user_notification_preferences table with per-channel and per-type configuration",
        },
      ],
    },
    {
      id: "mobile",
      label: "Mobile App",
      lines: [
        {
          type: "prompt",
          text: "Generate technical plan for the delivery app",
        },
        {
          type: "response",
          text: "## Phase 1: Setup and navigation",
        },
        {
          type: "response",
          text: "Story 1.1: Scaffold React Native with Expo Router, configure bottom tabs navigation",
        },
        {
          type: "response",
          text: "Story 1.2: Login screen with authentication via existing API",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "## Phase 2: Order flow",
        },
        {
          type: "response",
          text: "Story 2.1: Restaurant listing screen with search and filters",
        },
        {
          type: "response",
          text: "Story 2.2: Menu screen with cart addition and item variations",
        },
        {
          type: "response",
          text: "Story 2.3: Checkout with address, payment method, and confirmation",
        },
      ],
    },
  ],
};

export const planToTracker: SkillData = {
  name: "plan-to-tracker",
  variant: "optional",
  problem: {
    title: "The problem",
    description:
      "The technical plan exists, but the stories are stuck in a Markdown file that nobody checks after the first week. The PM asks for status in ClickUp, the team updates Jira manually, and the source of truth fragments between the plan, the tracker, and the dev's head. Stories are copied with errors, lose context, and the tracker becomes a graveyard of outdated tickets.",
  },
  skill: {
    title: "The skill",
    description:
      "The /plan-to-tracker is an optional step that syncs stories from the plan directly to your project tracker (ClickUp, Jira, Linear) via MCP. Each story becomes a ticket with the correct title, description, acceptance criteria, and labels — no manual copy-paste. The plan and tracker stay in sync from the start.",
  },
  howItWorks: {
    title: "How it works",
    steps: [
      "The AI reads the plan generated by /prd-to-plan and identifies each story",
      "Connects to your tracker via MCP server (ClickUp, Jira, Linear)",
      "Creates tickets with title, formatted description, and acceptance criteria",
      "Organizes tickets into sprints or phases according to the original plan",
    ],
  },
  scenarios: [
    {
      id: "clickup",
      label: "ClickUp",
      lines: [
        {
          type: "prompt",
          text: "Sync plan with ClickUp in the 'Backend v2' space",
        },
        {
          type: "response",
          text: "Connecting to ClickUp via MCP server...",
        },
        {
          type: "response",
          text: "Space 'Backend v2' found. Creating list 'Phase 1: Data model and base API'...",
        },
        {
          type: "response",
          text: "✓ Ticket created: 'Create notifications table' — priority: high, tags: [database, backend]",
        },
        {
          type: "response",
          text: "✓ Ticket created: 'POST /notifications endpoint' — priority: high, tags: [api, backend]",
        },
        {
          type: "response",
          text: "✓ Ticket created: 'GET /notifications endpoint' — priority: medium, tags: [api, backend]",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "6 tickets created in 2 lists. Dependencies configured. Board link: clickup.com/...",
        },
      ],
    },
    {
      id: "linear",
      label: "Linear",
      lines: [
        {
          type: "prompt",
          text: "Export stories to Linear in the 'Mobile App' project",
        },
        {
          type: "response",
          text: "Connecting to Linear via MCP server...",
        },
        {
          type: "response",
          text: "Project 'Mobile App' found. Creating cycle 'Phase 1: Setup and navigation'...",
        },
        {
          type: "response",
          text: "✓ MOB-42: 'Scaffold React Native with Expo Router' — estimate: 3pts, label: setup",
        },
        {
          type: "response",
          text: "✓ MOB-43: 'Login screen with authentication' — estimate: 5pts, label: auth",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "8 issues created in 3 cycles. Project updated: linear.app/team/mobile-app",
        },
      ],
    },
  ],
};

export const doWork: SkillData = {
  name: "do-work",
  problem: {
    title: "The problem",
    description:
      "You ask the AI to implement a feature and it generates 500 lines of code at once. No tests, no incremental commits, no branches. If something breaks midway, you don't know where. The Git history is a single 'implement feature' commit mixing model, API, frontend, and migrations. Code review? Impossible.",
  },
  skill: {
    title: "The skill",
    description:
      "The /do-work is the executor. It takes a story from the plan and implements it following strict TDD: creates the branch, writes the test first (red), implements the minimum to pass (green), refactors, and commits. One story at a time, one test at a time. The result is tested code, atomic commits, and full traceability between the story and the code.",
  },
  howItWorks: {
    title: "How it works",
    steps: [
      "Reads the story from the plan and creates a specific branch for it",
      "Writes the first test (red) — the test must fail",
      "Implements the minimum code to make the test pass (green)",
      "Refactors while keeping tests green, commits, and repeats",
      "When the story is done, opens a PR with a description linked to the plan",
    ],
  },
  scenarios: [
    {
      id: "backend",
      label: "Backend Story",
      lines: [
        {
          type: "prompt",
          text: "Execute Story 1.1: Create notifications table",
        },
        {
          type: "response",
          text: "Branch created: feat/story-1.1-notifications-table",
        },
        {
          type: "response",
          text: "Writing test: 'should create notification with required fields'...",
        },
        {
          type: "response",
          text: "✗ Test failed (red) — table doesn't exist yet. Correct.",
        },
        {
          type: "response",
          text: "Creating migration: add_notifications_table with fields user_id, type, channel, payload, read_at, created_at...",
        },
        {
          type: "response",
          text: "✓ Test passed (green). Commit: 'feat: add notifications table with base schema'",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "Writing test: 'should enforce NOT NULL on user_id and type'...",
        },
        {
          type: "response",
          text: "✓ Test passed. Commit: 'feat: add NOT NULL constraints to notifications'",
        },
      ],
    },
    {
      id: "frontend",
      label: "Frontend Story",
      lines: [
        {
          type: "prompt",
          text: "Execute Story 2.3: Checkout screen",
        },
        {
          type: "response",
          text: "Branch created: feat/story-2.3-checkout-screen",
        },
        {
          type: "response",
          text: "Implementing CheckoutScreen component with address form...",
        },
        {
          type: "response",
          text: "✓ Component renders with fields: address, payment method, order summary",
        },
        {
          type: "response",
          text: "Adding form validation with Zod schema...",
        },
        {
          type: "response",
          text: "✓ Validation working. Commit: 'feat: add checkout screen with address form'",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "Integrating with payment API — loading state, error handling, confirmation...",
        },
        {
          type: "response",
          text: "✓ Complete flow. Commit: 'feat: integrate checkout with payment API'",
        },
      ],
    },
  ],
};

export const improveCodebaseArchitecture: SkillData = {
  name: "improve-codebase-architecture",
  problem: {
    title: "The problem",
    description:
      "The code works, tests pass, the PR is open — but nobody did a structural review. Patterns were broken, responsibilities are mixed, unnecessary abstractions were created, and the architecture was compromised without anyone noticing. Human code review focuses on implementation details and misses systemic issues.",
  },
  skill: {
    title: "The skill",
    description:
      "The /improve-codebase-architecture works as an automated architectural code review. The AI analyzes the implemented code looking for gaps: violations of project patterns, excessive coupling, premature abstractions, inconsistencies with the rest of the codebase. It's not a linter — it's a review that understands the project context and suggests structural improvements.",
  },
  howItWorks: {
    title: "How it works",
    steps: [
      "The AI reads the recently implemented code and compares it with codebase patterns",
      "Identifies architecture violations, code smells, and inconsistencies",
      "Suggests specific refactorings with technical justification",
      "You apply the changes and run tests to ensure nothing broke",
    ],
  },
  scenarios: [
    {
      id: "patterns",
      label: "Violated patterns",
      lines: [
        {
          type: "prompt",
          text: "Review the notification module implementation",
        },
        {
          type: "response",
          text: "Analyzing src/notifications/ against codebase patterns...",
        },
        {
          type: "response",
          text: "⚠ NotificationService mixes business logic with database access. The rest of the codebase uses Repository pattern — extract NotificationRepository.",
        },
        {
          type: "response",
          text: "⚠ The NotificationType enum is defined inline in the service. Other modules define enums in src/types/ — move it to maintain consistency.",
        },
        {
          type: "response",
          text: "✓ Tests follow the project pattern (describe/it, separate fixtures).",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "2 issues found. Neither is critical, but both generate debt if not fixed now. Suggestion: fix before merging.",
        },
      ],
    },
    {
      id: "coupling",
      label: "Coupling",
      lines: [
        {
          type: "prompt",
          text: "Check coupling in the checkout module",
        },
        {
          type: "response",
          text: "Analyzing dependencies of src/checkout/...",
        },
        {
          type: "response",
          text: "⚠ CheckoutService directly imports UserRepository, PaymentGateway, and EmailService. 3 external dependencies — high coupling.",
        },
        {
          type: "response",
          text: "The rest of the codebase uses dependency injection via constructor. CheckoutService instantiates dependencies internally.",
        },
        {
          type: "response",
          text: "Suggestion: receive dependencies via constructor and create CheckoutServiceFactory for composition.",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "This will also make testing easier — currently the test file mocks 3 modules with jest.mock(). With DI, just pass mocks in the constructor.",
        },
      ],
    },
  ],
};

export const handleCoderabbit: SkillData = {
  name: "handle-coderabbit",
  problem: {
    title: "The problem",
    description:
      "You open a PR and CodeRabbit (or another review bot) leaves 15 comments. Some are relevant, others are false positives. You need to read each one, decide what's valid, implement the fixes, respond to the comments, and re-request review. It's a manual and tedious process that turns a 5-minute merge into 30 minutes of bureaucratic work.",
  },
  skill: {
    title: "The skill",
    description:
      "The /handle-coderabbit automates the automated code review feedback cycle. The AI reads CodeRabbit (or GitHub Copilot review) comments, classifies each as valid or false positive, implements the necessary fixes, and responds to comments directly on the PR — all via CLI, without leaving the terminal.",
  },
  howItWorks: {
    title: "How it works",
    steps: [
      "The AI reads all review bot comments on the open PR",
      "Classifies each comment: necessary fix, valid suggestion, or false positive",
      "Implements the accepted fixes and improvements automatically",
      "Responds to each comment on the PR explaining the action taken",
      "Commits the fixes and requests re-review",
    ],
  },
  scenarios: [
    {
      id: "coderabbit",
      label: "CodeRabbit",
      lines: [
        {
          type: "prompt",
          text: "Process CodeRabbit review on PR #47",
        },
        {
          type: "response",
          text: "Reading 8 CodeRabbit comments on PR #47...",
        },
        {
          type: "response",
          text: "✓ Comment 1: 'Missing error handling in fetchUser' — VALID. Adding try/catch with error boundary.",
        },
        {
          type: "response",
          text: "✗ Comment 2: 'Consider using optional chaining' — FALSE POSITIVE. The value is never null here (guaranteed by Zod schema).",
        },
        {
          type: "response",
          text: "✓ Comment 3: 'SQL injection risk in query builder' — VALID. Replacing concatenation with parameterized query.",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "5/8 comments fixed, 3 marked as false positive with justification. Commit: 'fix: address CodeRabbit review feedback'. Re-review requested.",
        },
      ],
    },
    {
      id: "copilot",
      label: "GitHub Copilot",
      lines: [
        {
          type: "prompt",
          text: "Process Copilot review on PR #52",
        },
        {
          type: "response",
          text: "Reading 5 GitHub Copilot suggestions on PR #52...",
        },
        {
          type: "response",
          text: "✓ Suggestion 1: 'Extract magic number 86400 to named constant' — VALID. Creating SECONDS_PER_DAY.",
        },
        {
          type: "response",
          text: "✓ Suggestion 2: 'This async function never awaits' — VALID. Removing unnecessary async.",
        },
        {
          type: "response",
          text: "✗ Suggestion 3: 'Consider memoizing this computation' — FALSE POSITIVE. Function is called once at startup, memoization adds no benefit.",
        },
        { type: "divider", text: "" },
        {
          type: "response",
          text: "3/5 suggestions applied, 2 rejected with justification. Commit: 'fix: apply Copilot review suggestions'.",
        },
      ],
    },
  ],
};
