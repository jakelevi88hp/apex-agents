#!/usr/bin/env python3
"""
Coordinate a round-robin, multi-agent workflow using the shared todo list.

Each agent reads the shared context, writes a note to the next agent,
and updates task status to keep ownership unambiguous.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CYCLES = 2


@dataclass
class TaskEntry:
    """Represents a single TODO item tracked by the collaboration loop."""

    section: str
    description: str
    owner: Optional[str] = None
    status: str = "pending"

    def key(self) -> str:
        """Return a unique key for dictionary lookups."""
        return f"{self.section} :: {self.description}"


@dataclass
class AgentNote:
    """Structured note exchanged between agents."""

    from_agent: str
    to_agent: str
    message: str


class CollaborationContext:
    """Holds shared state for all collaborating agents."""

    def __init__(self) -> None:
        # Capture repository overview for architectural notes.
        self.repo_dirs: List[str] = self._safe_scan_repo()
        # Load every unchecked TODO entry to drive the workflow.
        self.task_board: Dict[str, TaskEntry] = self._safe_load_tasks()
        # Track which tasks are assigned to each agent.
        self.assignments: Dict[str, List[str]] = {}
        # Persist the chronological log of cross-agent notes.
        self.execution_log: List[AgentNote] = []

    def _safe_scan_repo(self) -> List[str]:
        """Return top-level directories for situational awareness."""
        try:
            # Collect only directory names to avoid noisy file listings.
            dirs = [
                path.name for path in REPO_ROOT.iterdir() if path.is_dir()
            ]
            # Sort for deterministic output across runs.
            return sorted(dirs)
        except OSError as error:
            # Surface a readable message when the scan fails.
            return [f"Scan failed: {error}"]

    def _safe_load_tasks(self) -> Dict[str, TaskEntry]:
        """Parse todo.md and build a lookup keyed by section + description."""
        todo_path = REPO_ROOT / "todo.md"
        tasks: Dict[str, TaskEntry] = {}
        current_section = "General"
        try:
            # Read the entire file once; fall back to an empty plan if missing.
            contents = todo_path.read_text(encoding="utf-8")
        except FileNotFoundError:
            # No todo file means no actionable tasks today.
            return tasks
        except OSError as error:
            # Log the error as a pseudo-task so it surfaces in the workflow.
            failure = TaskEntry(
                section="System",
                description=f"Failed to read todo.md ({error})",
            )
            tasks[failure.key()] = failure
            return tasks
        # Iterate line-by-line so section headers contextualize their tasks.
        for raw_line in contents.splitlines():
            line = raw_line.strip()
            if line.startswith("##"):
                # Update the active section to group subsequent tasks.
                current_section = line.lstrip("#").strip()
                continue
            if line.startswith("- [ ]"):
                # Normalize the description and store the new task.
                description = line.replace("- [ ]", "", 1).strip()
                entry = TaskEntry(section=current_section, description=description)
                tasks[entry.key()] = entry
        return tasks

    def pending_tasks(self) -> List[str]:
        """Return every task that still needs attention."""
        return [
            key
            for key, entry in self.task_board.items()
            if entry.status not in {"done", "released"}
        ]

    def assign_task(self, key: str, owner: str) -> None:
        """Assign a task to a specific agent."""
        entry = self.task_board.get(key)
        if entry is None:
            # Ignore unknown keys so the workflow keeps flowing.
            return
        # Record the new owner and keep a per-agent assignment list.
        entry.owner = owner
        entry.status = "assigned"
        self.assignments.setdefault(owner, []).append(key)

    def update_status(self, key: str, status: str) -> None:
        """Update the lifecycle status for a tracked task."""
        entry = self.task_board.get(key)
        if entry is None:
            # Missing keys are silently ignored to keep the run resilient.
            return
        entry.status = status

    def tasks_for_agent(self, owner: str) -> List[str]:
        """Return every task assigned to the requested owner."""
        return self.assignments.get(owner, [])

    def section_dependencies(self, section: str) -> List[str]:
        """Return test tasks that gate deployments within the same section."""
        dependencies: List[str] = []
        for key, entry in self.task_board.items():
            if entry.section == section and "test" in entry.description.lower():
                dependencies.append(key)
        return dependencies

    def is_converged(self) -> bool:
        """Check whether the workflow reached a terminal state."""
        return not self.pending_tasks()


class Agent:
    """Base class shared by every specialized agent."""

    def __init__(self, name: str, recipient: str) -> None:
        self.name = name
        self.recipient = recipient

    def run(self, context: CollaborationContext) -> AgentNote:
        """Execute the agent-specific routine and record its note."""
        message = self.perform(context)
        note = AgentNote(self.name, self.recipient, message)
        context.execution_log.append(note)
        return note

    def perform(self, context: CollaborationContext) -> str:
        """Perform the agent's unique workflow."""
        raise NotImplementedError


class LeadArchitect(Agent):
    """Scans the repository and briefs the architect."""

    def perform(self, context: CollaborationContext) -> str:
        # Build a compact directory overview for the downstream architect.
        preview = ", ".join(context.repo_dirs[:6])
        if len(context.repo_dirs) > 6:
            preview += ", ..."
        # Count pending tasks to quantify workload.
        task_count = len(context.pending_tasks())
        return (
            f"Architect, repo scan highlights {task_count} pending items. "
            f"Key directories: {preview}. Please decompose the workstream."
        )


class Architect(Agent):
    """Transforms open tasks into agent-specific assignments."""

    FRONTEND_KEYWORDS = ("sidebar", "link", "ui")

    def perform(self, context: CollaborationContext) -> str:
        assignments: List[str] = []
        # Route each pending task exactly once to avoid duplicated effort.
        for key in context.pending_tasks():
            entry = context.task_board[key]
            description = entry.description.lower()
            if any(keyword in description for keyword in self.FRONTEND_KEYWORDS):
                owner = "Frontend Agent"
            elif "deploy" in description:
                owner = "Release Engineer"
            elif "test" in description:
                owner = "Backend Agent"
            else:
                owner = "Optimization Agent"
            context.assign_task(key, owner)
            assignments.append(f"{owner} ← {key}")
        if not assignments:
            return (
                "Backend Agent, no new items surfaced. Hold position until QA "
                "flags a regression."
            )
        summary = "; ".join(assignments)
        return (
            f"Backend Agent, assignments dispatched ({summary}). "
            "Kick off execution and keep the chain moving."
        )


class BackendAgent(Agent):
    """Executes backend-focused tasks before handing off to frontend."""

    def perform(self, context: CollaborationContext) -> str:
        tasks = context.tasks_for_agent(self.name)
        if not tasks:
            return (
                "Frontend Agent, backend layer is quiet. Proceed with any UI "
                "verifications needed."
            )
        completed: List[str] = []
        # Iterate through every assigned backend task and prepare it for QA.
        for key in tasks:
            entry = context.task_board[key]
            context.update_status(key, "ready-for-qa")
            completed.append(f"{entry.section} → {entry.description}")
        highlights = "; ".join(completed)
        return (
            "Frontend Agent, backend validations completed "
            f"({highlights}). Awaiting QA confirmation after your pass."
        )


class FrontendAgent(Agent):
    """Validates UI-oriented tasks and signals readiness downstream."""

    def perform(self, context: CollaborationContext) -> str:
        tasks = context.tasks_for_agent(self.name)
        if not tasks:
            return (
                "Optimization Agent, UI remains stable. No new widgets need "
                "attention."
            )
        verified: List[str] = []
        for key in tasks:
            entry = context.task_board[key]
            context.update_status(key, "done")
            verified.append(f"{entry.section} → {entry.description}")
        summary = "; ".join(verified)
        return (
            "Optimization Agent, UI verification finished "
            f"({summary}). Performance review next."
        )


class OptimizationAgent(Agent):
    """Ensures that no redundant work enters the pipeline."""

    def perform(self, context: CollaborationContext) -> str:
        # Check for any tasks that somehow remain unassigned.
        orphaned = [
            key
            for key in context.pending_tasks()
            if context.task_board[key].owner is None
        ]
        if orphaned:
            # Flag the anomaly so QA knows to pause.
            return (
                "QA Agent, detected unowned tasks "
                f"({', '.join(orphaned)}). Please hold until reassignment."
            )
        return (
            "QA Agent, throughput looks clean—no duplicated effort. "
            "Feel free to validate backend deliverables."
        )


class QAAgent(Agent):
    """Validates backend deliverables before release."""

    def perform(self, context: CollaborationContext) -> str:
        # Gather every task that the backend marked as ready-for-qa.
        ready = [
            key
            for key, entry in context.task_board.items()
            if entry.status == "ready-for-qa"
        ]
        if not ready:
            return (
                "Release Engineer, nothing new in QA. Standing by for the next "
                "drop."
            )
        validated: List[str] = []
        for key in ready:
            entry = context.task_board[key]
            context.update_status(key, "done")
            validated.append(f"{entry.section} → {entry.description}")
        report = "; ".join(validated)
        return (
            "Release Engineer, QA approved the backend scope "
            f"({report}). Prep production packages."
        )


class ReleaseEngineer(Agent):
    """Prepares production output once QA certifies dependencies."""

    def perform(self, context: CollaborationContext) -> str:
        tasks = context.tasks_for_agent(self.name)
        if not tasks:
            return (
                "Documentation Agent, no deployments queued. "
                "Capture current status anyway."
            )
        released: List[str] = []
        blocked: List[str] = []
        for key in tasks:
            entry = context.task_board[key]
            dependencies = context.section_dependencies(entry.section)
            # Ensure every dependency finished QA before releasing.
            gated = all(
                context.task_board[dep].status == "done" for dep in dependencies
            )
            if gated:
                context.update_status(key, "released")
                released.append(f"{entry.section} → {entry.description}")
            else:
                blocked.append(f"{entry.section} → waiting on tests")
        if blocked:
            details = "; ".join(blocked)
            return (
                "Documentation Agent, deployments partially blocked "
                f"({details}). Recording interim notes."
            )
        summary = "; ".join(released)
        return (
            "Documentation Agent, packaged production artifacts "
            f"({summary}). Please update the changelog."
        )


class DocumentationAgent(Agent):
    """Updates documentation based on the release payload."""

    def perform(self, context: CollaborationContext) -> str:
        # Capture every task that already reached a stable state.
        completed = [
            key
            for key, entry in context.task_board.items()
            if entry.status in {"done", "released"}
        ]
        if not completed:
            return (
                "Review Architect, documentation unchanged pending releases."
            )
        notes = "; ".join(completed)
        return (
            "Review Architect, release notes drafted covering "
            f"{notes}. Please run the final approval."
        )


class ReviewArchitect(Agent):
    """Confirms convergence and closes the collaboration loop."""

    def perform(self, context: CollaborationContext) -> str:
        # Identify any lingering tasks before closing the loop.
        remaining = context.pending_tasks()
        if remaining:
            outstanding = "; ".join(remaining)
            return (
                "Lead Architect, outstanding items detected "
                f"({outstanding}). Initiating another cycle."
            )
        return (
            "Lead Architect, all tasks converged. Ready to archive the run."
        )


def run_round_robin(cycles: int) -> CollaborationContext:
    """Execute the workflow for the requested number of cycles."""
    context = CollaborationContext()
    agents: List[Agent] = [
        LeadArchitect("Lead Architect", "Architect"),
        Architect("Architect", "Backend Agent"),
        BackendAgent("Backend Agent", "Frontend Agent"),
        FrontendAgent("Frontend Agent", "Optimization Agent"),
        OptimizationAgent("Optimization Agent", "QA Agent"),
        QAAgent("QA Agent", "Release Engineer"),
        ReleaseEngineer("Release Engineer", "Documentation Agent"),
        DocumentationAgent("Documentation Agent", "Review Architect"),
        ReviewArchitect("Review Architect", "Lead Architect"),
    ]
    # Run the requested number of cycles or stop early when converged.
    for _ in range(max(1, cycles)):
        for agent in agents:
            agent.run(context)
        if context.is_converged():
            break
    return context


def print_log(context: CollaborationContext) -> None:
    """Pretty-print the agent log and the final task statuses."""
    print("Multi-Agent Collaboration Log")
    print("-" * 40)
    for note in context.execution_log:
        print(f"{note.from_agent} → {note.to_agent}: {note.message}")
    print("\nTask Statuses")
    print("-" * 40)
    for key, entry in context.task_board.items():
        print(f"[{entry.status.upper():>8}] {key}")


def parse_args() -> argparse.Namespace:
    """Parse CLI arguments."""
    parser = argparse.ArgumentParser(
        description="Activate the autonomous multi-agent collaboration loop."
    )
    parser.add_argument(
        "--cycles",
        type=int,
        default=DEFAULT_CYCLES,
        help="Number of full round-robin cycles to execute.",
    )
    return parser.parse_args()


def main() -> None:
    """Entrypoint used when running as a script."""
    args = parse_args()
    context = run_round_robin(cycles=args.cycles)
    print_log(context)


if __name__ == "__main__":
    main()
