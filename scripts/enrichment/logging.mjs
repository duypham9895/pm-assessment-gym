import fs from "node:fs";
import path from "node:path";

export function createRunId(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\..+$/, "Z");
}

export function writeRunLog({ projectRoot, runId, lines }) {
  const logsDir = path.join(projectRoot, "docs", "enrichment", "logs");
  fs.mkdirSync(logsDir, { recursive: true });
  const filepath = path.join(logsDir, `${runId}.md`);
  fs.writeFileSync(filepath, `# Enrichment Run ${runId}\n\n${lines.join("\n")}\n`, "utf8");
  return filepath;
}

export function appendPipelineLog({ projectRoot, row }) {
  const logFile = path.join(projectRoot, "docs", "enrichment", "pipeline_log.md");
  const header =
    "| Date | Run ID | Action | Websites Touched | Candidates Crawled | Candidates Staged | Approved | Rejected | Imported | Total Questions | Notes |";
  const separator = "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |";
  const line = `| ${row.date} | ${row.runId} | ${row.action} | ${row.websitesTouched} | ${row.candidatesCrawled} | ${row.candidatesStaged} | ${row.approved} | ${row.rejected} | ${row.imported} | ${row.totalQuestions} | ${sanitizeCell(row.notes)} |`;

  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(
      logFile,
      `# PM Assessment Dataset Enrichment Pipeline Log\n\nThis log tracks all executions of the question enrichment pipeline. Every run of the crawler, verification, or import script updates this file.\n\n## Execution Statistics\n\n${header}\n${separator}\n${line}\n`,
      "utf8"
    );
    return;
  }

  const lines = fs.readFileSync(logFile, "utf8").split("\n");
  const headerIndex = lines.findIndex((existingLine) => existingLine.trim() === header);
  if (headerIndex === -1) {
    fs.appendFileSync(logFile, `\n${header}\n${separator}\n${line}\n`, "utf8");
    return;
  }

  lines.splice(headerIndex + 2, 0, line);
  fs.writeFileSync(logFile, lines.join("\n"), "utf8");
}

function sanitizeCell(value) {
  return String(value ?? "").replace(/\|/g, "/").replace(/\s+/g, " ").trim();
}
