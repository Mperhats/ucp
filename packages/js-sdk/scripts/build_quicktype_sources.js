const fs = require('node:fs');
const path = require('node:path');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(entryPath, files);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(entryPath);
    }
  }
  return files;
}

function collectDefs(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);
    const defs = json && json.$defs && typeof json.$defs === 'object' ? json.$defs : null;
    if (!defs) return [];
    return Object.keys(defs).map((key) => `${filePath}#/$defs/${key}`);
  } catch {
    return [];
  }
}

function main() {
  const specDir = process.argv[2];
  if (!specDir) {
    console.error('Usage: node build_quicktype_sources.js <spec_dir>');
    process.exit(1);
  }

  const resolvedSpec = path.resolve(specDir);
  const sources = new Set();

  const discoveryDir = path.join(resolvedSpec, 'discovery');
  if (fs.existsSync(discoveryDir)) {
    for (const file of fs.readdirSync(discoveryDir)) {
      if (file.endsWith('.json')) {
        sources.add(path.join(discoveryDir, file));
      }
    }
  }

  const schemasDir = path.join(resolvedSpec, 'schemas');
  if (fs.existsSync(schemasDir)) {
    for (const filePath of walk(schemasDir)) {
      sources.add(filePath);
      for (const defRef of collectDefs(filePath)) {
        sources.add(defRef);
      }
    }
  }

  for (const src of Array.from(sources).sort()) {
    console.log(src);
  }
}

main();
