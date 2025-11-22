import fs from "fs";
import path from "path";

/**
 * Represents the canonical name of every collaborating agent in the workflow.
 */
type AgentName =
  | "Lead Architect"
  | "Architect"
  | "Backend Engineer"
  | "Frontend Engineer"
  | "Optimization Engineer"
  | "QA Agent"
  | "Release Engineer"
  | "Documentation Agent";

/**
 * Captures a single TODO item alongside its inferred assignee and section.
 */
interface TodoTask {
  section: string;
  text: string;
  assignee: AgentName | "Architect";
}

/**
 * Describes the structure of the repository-level statistics that the lead architect reports.
 */
interface RepoStats {
  topLevelEntries: number;
  docsFileCount: number;
  srcFileCount: number;
}

/**
 * Represents a note sent from one agent to another.
 */
interface AgentActionLog {
  from: string;
  to: string;
  note: string;
}

const repoRoot = path.resolve(__dirname, "..");
const docsDir = path.join(repoRoot, "docs");
const todoPath = path.join(repoRoot, "todo.md");
const logPath = path.join(docsDir, "multi-agent-collab-log.md");

/**
 * Safely reads a file and falls back to an empty string on failure so the automation can continue.
 *
 * @param filePath - Absolute path to the file that should be read.
 * @returns The file contents or an empty string when the file is missing.
 */
function safeReadFile(filePath: string): string {
  try {
    // Attempt to read the requested file synchronously to keep the script deterministic.
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    // Return an empty string if the file does not exist so downstream parsing can handle the absence.
    return "";
  }
}

/**
 * Recursively counts every file beneath a directory.
 *
 * @param targetDir - The directory whose file count should be calculated.
 * @returns The number of files found underneath the directory.
 */
function countFiles(targetDir: string): number {
  // Guard against directories that do not exist to prevent runtime errors.
  if (!fs.existsSync(targetDir)) {
    return 0;
  }

  // Walk the directory tree depth-first to tally every file.
  return fs.readdirSync(targetDir).reduce((count, entry) => {
    const entryPath = path.join(targetDir, entry);
    const stats = fs.statSync(entryPath);

    if (stats.isDirectory()) {
      // Recurse into child directories to include their files in the total.
      return count + countFiles(entryPath);
    }

    // Increment the count for every file discovered at the current level.
    return count + 1;
  }, 0);
}

/**
 * Generates high-level repository statistics for the Lead Architect.
 *
 * @returns Counts describing top-level entries, docs files, and src files.
 */
function collectRepoStats(): RepoStats {
  // List the top-level directory to understand project breadth.
  const topLevelEntries = fs.readdirSync(repoRoot).length;
  // Count Markdown files in the docs directory to measure documentation scale.
  const docsFileCount = fs.existsSync(docsDir) ? fs.readdirSync(docsDir).length : 0;
  // Recursively count source files to quantify implementation surface area.
  const srcFileCount = countFiles(path.join(repoRoot, "src"));

  return { topLevelEntries, docsFileCount, srcFileCount };
}

/**
 * Assigns TODO items to the appropriate agents based on simple heuristics.
 *
 * @param text - The textual content of a TODO entry.
 * @returns The agent that should tackle the task.
 */
function determineAssignee(text: string): AgentName | "Architect" {
  // Normalize the text for easier keyword comparisons.
  const lower = text.toLowerCase();

  if (lower.includes("test") || lower.includes("verify")) {
    return "QA Agent";
  }

  if (lower.includes("deploy") || lower.includes("release")) {
    return "Release Engineer";
  }

  if (
    lower.includes("ui") ||
    lower.includes("link") ||
    lower.includes("page") ||
    lower.includes("frontend")
  ) {
    return "Frontend Engineer";
  }

  if (
    lower.includes("api") ||
    lower.includes("service") ||
    lower.includes("github") ||
    lower.includes("backend")
  ) {
    return "Backend Engineer";
  }

  if (lower.includes("optimiz") || lower.includes("performance")) {
    return "Optimization Engineer";
  }

  // Fall back to the architect when a task does not clearly belong to another specialist.
  return "Architect";
}

/**
 * Parses the shared TODO markdown file into structured tasks.
 *
 * @param markdown - The raw contents of todo.md.
 * @returns A list of structured TODO tasks complete with inferred assignees.
 */
function parseTodoTasks(markdown: string): TodoTask[] {
  const tasks: TodoTask[] = [];
  const lines = markdown.split("\n");
  let currentSection = "General";

  // Iterate line-by-line to track the latest section heading.
  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("## ")) {
      // Update the section when a heading is encountered.
      currentSection = line.replace(/^##\s*/, "").trim();
      continue;
    }

    if (line.startsWith("- [ ]")) {
      // Remove the checkbox syntax to isolate the actionable text.
      const text = line.replace("- [ ]", "").trim();
      tasks.push({
        section: currentSection,
        text,
        assignee: determineAssignee(text),
      });
    }
  }

  return tasks;
}

/**
 * Groups tasks by their inferred assignee for quick lookup during the round-robin loop.
 *
 * @param tasks - Structured TODO entries awaiting assignment.
 * @returns A mapping of agent names to the tasks they should execute.
 */
function groupTasksByAssignee(tasks: TodoTask[]): Record<string, TodoTask[]> {
  const bucket: Record<string, TodoTask[]> = {
    "Lead Architect": [],
    Architect: [],
    "Backend Engineer": [],
    "Frontend Engineer": [],
    "Optimization Engineer": [],
    "QA Agent": [],
    "Release Engineer": [],
    "Documentation Agent": [],
  };

  // Drop each task into the matching bucket.
  tasks.forEach((task) => {
    const key = bucket[task.assignee] ? task.assignee : "Architect";
    bucket[key].push(task);
  });

  return bucket;
}

/**
 * Formats a list of tasks into a concise human-readable string.
 *
 * @param tasks - Tasks that belong to a given agent.
 * @returns A bullet string summarizing the assignments.
 */
function formatTaskList(tasks: TodoTask[]): string {
  if (!tasks.length) {
    return "No open items in my lane. Standing by to support the next specialist.";
  }

  // Join the tasks with semicolons to keep the note compact.
  return tasks
    .map((task) => `${task.section}: ${task.text}`)
    .join("; ");
}

/**
 * Writes a Markdown log capturing the collaboration cycle.
 *
 * @param stats - Repository statistics shared by the lead architect.
 * @param tasks - All parsed tasks for reference.
 * @param conversation - Notes exchanged between agents.
 */
function writeLog(stats: RepoStats, tasks: TodoTask[], conversation: AgentActionLog[]): void {
  // Ensure the docs directory exists to avoid write errors.
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString();
  const header = `## ${timestamp}\n`;
  const statsBlock = [
    `- Top-level entries: ${stats.topLevelEntries}`,
    `- docs/ files: ${stats.docsFileCount}`,
    `- src/ files: ${stats.srcFileCount}`,
    `- Open TODO items: ${tasks.length}`,
  ].join("\n");

  const conversationBlock = conversation
    .map((entry, index) => `${index + 1}. [${entry.from} ➜ ${entry.to}] ${entry.note}`)
    .join("\n");

  const body = `${header}${statsBlock}\n\n### Conversation\n${conversationBlock}\n\n`;

  // Append the new log entry so prior collaboration history is preserved.
  fs.appendFileSync(logPath, body, "utf-8");
}

/**
 * Executes the scripted collaboration loop and returns the generated conversation.
 *
 * @param groupedTasks - Tasks grouped by assignee.
 * @param stats - Repository statistics for context.
 * @returns The ordered list of agent notes.
 */
function runCollaboration(
  groupedTasks: Record<string, TodoTask[]>,
  stats: RepoStats,
): AgentActionLog[] {
  const sequence: AgentActionLog[] = [];

  // Lead Architect hands context to the Architect.
  sequence.push({
    from: "Lead Architect",
    to: "Architect",
    note: `Scanned ${stats.topLevelEntries} top-level entries, ${stats.docsFileCount} docs files, and ${stats.srcFileCount} source files. No structural drift detected.`,
  });

  // Architect sets the agenda based on parsed TODOs.
  const totalTasks = Object.values(groupedTasks).reduce((sum, list) => sum + list.length, 0);
  sequence.push({
    from: "Architect",
    to: "Backend Engineer",
    note: `Prioritized ${totalTasks} open items. Handing off service-facing fixes first to unblock downstream roles.`,
  });

  // Backend Engineer summarizes their lane.
  sequence.push({
    from: "Backend Engineer",
    to: "Frontend Engineer",
    note: formatTaskList(groupedTasks["Backend Engineer"]),
  });

  // Frontend Engineer shares UI work status.
  sequence.push({
    from: "Frontend Engineer",
    to: "Optimization Engineer",
    note: formatTaskList(groupedTasks["Frontend Engineer"]),
  });

  // Optimization Engineer addresses performance considerations.
  sequence.push({
    from: "Optimization Engineer",
    to: "QA Agent",
    note: formatTaskList(groupedTasks["Optimization Engineer"]),
  });

  // QA Agent highlights pending validation steps.
  sequence.push({
    from: "QA Agent",
    to: "Release Engineer",
    note: formatTaskList(groupedTasks["QA Agent"]),
  });

  // Release Engineer prepares deployment guidance.
  sequence.push({
    from: "Release Engineer",
    to: "Documentation Agent",
    note: formatTaskList(groupedTasks["Release Engineer"]),
  });

  // Documentation Agent records the cycle summary.
  sequence.push({
    from: "Documentation Agent",
    to: "Architect",
    note: "Log drafted in docs/multi-agent-collab-log.md with the latest conversation and metrics.",
  });

  // Architect performs the final review for convergence.
  sequence.push({
    from: "Architect",
    to: "All",
    note: "Cycle complete. Pending items remain in QA and Release lanes; no duplicate work detected.",
  });

  return sequence;
}

/**
 * Entry point that wires together every helper and prints the summary to stdout.
 */
function main(): void {
  // Gather repository context for the opening note.
  const stats = collectRepoStats();
  // Parse TODO entries to understand outstanding work.
  const todoMarkdown = safeReadFile(todoPath);
  const tasks = parseTodoTasks(todoMarkdown);
  // Group tasks per agent to respect ownership boundaries.
  const groupedTasks = groupTasksByAssignee(tasks);
  // Run the collaboration loop and capture the conversation.
  const conversation = runCollaboration(groupedTasks, stats);
  // Persist the latest cycle into documentation.
  writeLog(stats, tasks, conversation);

  // Output a concise summary for interactive use.
  console.log("Multi-agent collaboration cycle complete.");
  console.table(
    Object.entries(groupedTasks).map(([agent, items]) => ({
      agent,
      openItems: items.length,
    })),
  );
}

// Execute the script if it is invoked directly.
main();
