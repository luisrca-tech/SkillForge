---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---

# Grill Me

Interview the user relentlessly about every aspect of a plan or design until a shared understanding is reached.

Walk down each branch of the design tree and resolve dependencies one-by-one. For each question, provide your recommended answer.

Ask one question at a time.

If a question can be answered by exploring the codebase, explore the codebase instead of asking.

## Workflow

### 1. Build the decision tree

Map the plan into concrete decision branches:
- Problem framing and goals
- Scope and non-goals
- Architecture and design choices
- Data contracts and edge cases
- Operational constraints (performance, security, rollout, observability)
- Testing and validation

### 2. Identify dependencies

Find which decisions block other decisions. Always ask or resolve prerequisite decisions first.

### 3. Interrogate one decision at a time

For each unresolved branch:
1. Ask exactly one focused question
2. Include your recommended answer
3. Wait for the user's response before moving to the next question

Keep questions specific, high-signal, and tied to trade-offs.

### 4. Prefer evidence over questions

Before asking, check whether the answer already exists in:
- Codebase structure and conventions
- Existing implementation patterns
- Tests, docs, or configuration

If the codebase answers it, state the finding and proceed to the next unresolved decision.

### 5. Close each branch explicitly

After each answer:
- Confirm the decision in one sentence
- Note what it enables or constrains next
- Move to the next highest-priority unresolved dependency

### 6. Finish with shared understanding

When all branches are resolved, provide:
- Final decision summary
- Open risks and assumptions
- Any follow-up validation needed before implementation
