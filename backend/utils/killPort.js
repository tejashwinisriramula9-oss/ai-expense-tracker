import { execSync } from 'node:child_process'

const port = Number(process.argv[2])
if (!Number.isFinite(port) || port <= 0) {
  console.error('Usage: node utils/killPort.js <port>')
  process.exit(1)
}

try {
  // Windows-only: kill whatever process is currently listening on the port.
  // This prevents EADDRINUSE when nodemon/dev is started multiple times.
  const cmd = `powershell -NoProfile -Command \"` +
    `Get-NetTCPConnection -LocalPort ${port} -ErrorAction SilentlyContinue | ` +
    `Select-Object -ExpandProperty OwningProcess -Unique | ` +
    `ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }\"`

  execSync(cmd, { stdio: 'inherit' })
} catch {
  // No process listening or powershell not available: ignore.
}

