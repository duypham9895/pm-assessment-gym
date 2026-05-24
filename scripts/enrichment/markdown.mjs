export const CHOICE_IDS = ["A", "B", "C", "D", "E"];

export function parseFrontmatter(raw) {
  const result = {};
  const lines = raw.split("\n");
  let currentListKey = "";

  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^\s+-\s+/.test(line) && currentListKey) {
      result[currentListKey].push(unquote(line.replace(/^\s+-\s+/, "").trim()));
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;

    const [, key, value] = match;
    if (value === "") {
      result[key] = [];
      currentListKey = key;
    } else {
      result[key] = normalizeValue(unquote(value.trim()));
      currentListKey = "";
    }
  }

  return result;
}

export function parseCandidateMarkdown(content, filepath = "") {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`${filepath || "candidate"} is missing frontmatter`);
  }

  const frontmatter = parseFrontmatter(match[1]);
  const body = match[2];
  const prompt = section(body, "# Prompt", "## Choice A");
  const choices = Object.fromEntries(
    CHOICE_IDS.map((id, index) => [
      id,
      section(
        body,
        `## Choice ${id}`,
        index < CHOICE_IDS.length - 1 ? `## Choice ${CHOICE_IDS[index + 1]}` : "# Explanation"
      ),
    ])
  );

  return {
    filepath,
    frontmatter,
    prompt,
    choices,
    explanation: section(body, "# Explanation", "# Verification Notes"),
    verificationNotes: section(body, "# Verification Notes", null),
  };
}

export function serializeCandidateMarkdown(candidate) {
  const fm = candidate.frontmatter;
  const tags = Array.isArray(fm.conceptTags) ? fm.conceptTags : [];
  return `---
${Object.entries(fm)
  .filter(([key]) => key !== "conceptTags")
  .map(([key, value]) => `${key}: ${quoteIfNeeded(value)}`)
  .join("\n")}
conceptTags:
${tags.map((tag) => `  - ${tag}`).join("\n")}
---

# Prompt
${candidate.prompt}

## Choice A
${candidate.choices.A}

## Choice B
${candidate.choices.B}

## Choice C
${candidate.choices.C}

## Choice D
${candidate.choices.D}

## Choice E
${candidate.choices.E}

# Explanation
${candidate.explanation}

# Verification Notes
${candidate.verificationNotes}
`;
}

function section(body, startHeading, endHeading) {
  const start = body.indexOf(startHeading);
  if (start === -1) return "";
  const contentStart = start + startHeading.length;
  const end = endHeading ? body.indexOf(endHeading, contentStart) : -1;
  return body.slice(contentStart, end === -1 ? body.length : end).trim();
}

function unquote(value) {
  return value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}

function normalizeValue(value) {
  if (/^\d+$/.test(value)) return Number(value);
  return value;
}

function quoteIfNeeded(value) {
  if (value === "") return '""';
  if (typeof value === "number") return String(value);
  if (/[:#\n]/.test(String(value))) return JSON.stringify(String(value));
  return String(value);
}
