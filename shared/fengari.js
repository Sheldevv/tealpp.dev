// shared/fengari.js
// Assumes fengari-web is already loaded via <script>.

const FengariRunner = (() => {
  let ready = false;

  async function init() {
    if (ready) return;
    const res = await fetch("../shared/compiler.lua");
    if (!res.ok) throw new Error("compiler.lua fetch failed: " + res.status);
    const src = await res.text();
    // Preload into the Lua state so compile calls are fast.
    fengari.load(`
      __tpp_compiler_source = [==[
${src}
]==]
    `)();
    ready = true;
  }

  function escapeLua(src) {
    return src.replace(/\]==\]/g, "] = = ]");
  }

  function run(tealSource) {
    const safe = escapeLua(tealSource);

    const program = `
      local captured = {}
      local real_print = print
      print = function(...)
        local parts = {}
        for i = 1, select("#", ...) do
          parts[#parts + 1] = tostring((select(i, ...)))
        end
        captured[#captured + 1] = table.concat(parts, "\\t")
      end

      local ok, err = pcall(function()
        local chunk = assert(load([==[
${safe}
]==], "=main.tpp", "t"))
        chunk()
      end)

      print = real_print

      if #captured > 0 then
        io.write("OUT:" .. table.concat(captured, "\\n") .. "\\n")
      end
      if not ok then
        io.write("ERR:" .. tostring(err) .. "\\n")
      end
    `;

    let buf = "";
    const oldWrite = window.io_write;
    window.io_write = (s) => {
      buf += s;
      if (oldWrite) oldWrite(s);
    };

    try {
      fengari.load(program)();
    } finally {
      window.io_write = oldWrite;
    }

    const outLine = buf.match(/OUT:([\s\S]*?)(?=\nERR:|\n?$)/);
    const errLine = buf.match(/ERR:([\s\S]*)/);

    if (errLine) return { ok: false, error: errLine[1].trim() };
    return { ok: true, output: (outLine ? outLine[1] : "") || "(no output)" };
  }

  return { init, run };
})();
