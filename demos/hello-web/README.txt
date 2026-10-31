Web build of hello — serve these files over HTTP.

Quick test:
  python3 -m http.server 8080
  # open http://localhost:8080

Cannot be opened from file:// — browsers block WebAssembly
loading for security reasons.

Deploy: upload every file in this directory to any static host.
The game itself is game.data. Replace it to swap games.

If you swap in a non-compatibility love.js build, your server
must send these headers:
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Embedder-Policy: require-corp
The bundled love.js.zip uses compatibility mode, so it works
on itch.io and GitHub Pages without extra headers.
