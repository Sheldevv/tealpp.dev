// shared/preprocess.js
// Teal++ → Teal pre-processor.
// Handles `import … as …` and `data class Name(params) end`.
// Everything else is passed through unchanged.

function tppPreprocess(src) {
  const lines = src.split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    const importMatch = trimmed.match(
      /^import\s+([A-Za-z_][\w.]*)\s+as\s+([A-Za-z_]\w*)\s*$/
    );
    if (importMatch) {
      const [, module, alias] = importMatch;
      out.push(`local ${alias} = require("${module}")`);
      i++;
      continue;
    }

    const dataMatch = trimmed.match(
      /^data\s+class\s+([A-Za-z_]\w*)\s*\((.*)\)\s*$/
    );
    if (dataMatch) {
      const [, name, paramsText] = dataMatch;
      const params = paramsText
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => {
          const [n, t] = p.split(":").map((s) => s.trim());
          return { name: n, type: t };
        });

      out.push(`local record ${name}`);
      for (const p of params) {
        out.push(`    ${p.name}: ${p.type}`);
      }
      out.push(`end`);
      out.push(``);
      out.push(
        `function ${name}.new(${params
          .map((p) => `${p.name}: ${p.type}`)
          .join(", ")}): ${name}`
      );
      out.push(
        `    local self: ${name} = { ${params
          .map((p) => `${p.name} = ${p.name}`)
          .join(", ")} }`
      );
      out.push(`    return self`);
      out.push(`end`);
      out.push(``);

      if (i + 1 < lines.length && lines[i + 1].trim() === "end") {
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    out.push(raw);
    i++;
  }

  return out.join("\n");
}

if (typeof module !== "undefined") {
  module.exports = { tppPreprocess };
}
