export interface EnvTemplateEntry {
  comments: string[];
  key: string;
  value: string;
}

function isCommentLine(line: string): boolean {
  return line.trimStart().startsWith("#");
}

function stripInlineComment(value: string): string {
  const hashIndex = value.indexOf(" #");
  if (hashIndex === -1) return value;
  return value.slice(0, hashIndex).trimEnd();
}

function unquoteValue(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function parseEnvTemplate(contents: string): EnvTemplateEntry[] {
  const entries: EnvTemplateEntry[] = [];
  const lines = contents.split(/\r?\n/);
  let pendingComments: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      pendingComments = [];
      continue;
    }
    if (isCommentLine(trimmed)) {
      pendingComments.push(trimmed.replace(/^#+\s?/, ""));
      continue;
    }

    const match = trimmed.match(
      /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/,
    );
    if (!match) {
      pendingComments = [];
      continue;
    }

    const key = match[1];
    const rawValue = stripInlineComment(match[2]);
    const value = unquoteValue(rawValue);

    entries.push({
      comments: pendingComments,
      key,
      value,
    });
    pendingComments = [];
  }

  return entries;
}

export function parseEnvFile(contents: string): Record<string, string> {
  const entries: Record<string, string> = {};
  const lines = contents.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || isCommentLine(trimmed)) continue;

    const match = trimmed.match(
      /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/,
    );
    if (!match) continue;

    const key = match[1];
    const rawValue = stripInlineComment(match[2]);
    entries[key] = unquoteValue(rawValue);
  }

  return entries;
}
