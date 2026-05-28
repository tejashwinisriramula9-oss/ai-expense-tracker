import { spawn } from 'node:child_process'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backendDir = path.resolve(__dirname, '..')
const repoRoot = path.resolve(backendDir, '..')
const frontendEnvPath = path.join(repoRoot, 'frontend', '.env')

function isPortListening(port) {
  try {
    const cmd =
      `powershell -NoProfile -Command \"` +
      `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | ` +
      `Measure-Object | Select-Object -ExpandProperty Count\"`
    const out = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim()
    const n = Number(out)
    return Number.isFinite(n) && n > 0
  } catch {
    return false
  }
}

function killPort(port) {
  // Kills all processes that are listening on `port` (Windows/PowerShell).
  const cmd =
    `powershell -NoProfile -Command \"` +
    `Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | ` +
    `Select-Object -ExpandProperty OwningProcess -Unique | ` +
    `ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }\"`

  execSync(cmd, { stdio: 'inherit' })
}

function killAnyBackendServerProcesses() {
  // Extra safety: kill stray node processes that started backend/server.js directly.
  const cmd =
    `powershell -NoProfile -Command \"` +
    `Get-CimInstance Win32_Process | ` +
    `Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match 'backend[\\\\/](server\\.js|server\\\\.js)' } | ` +
    `Select-Object -ExpandProperty ProcessId -Unique | ` +
    `ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }\"`

  try {
    execSync(cmd, { stdio: 'inherit' })
  } catch {
    // Ignore if powershell fails.
  }
}

function updateFrontendEnvUrl(apiUrl) {
  const line = `VITE_API_URL=${apiUrl}`

  try {
    const existing = fs.existsSync(frontendEnvPath) ? fs.readFileSync(frontendEnvPath, 'utf8') : ''
    const lines = existing.split(/\r?\n/).filter(Boolean)

    let replaced = false
    const nextLines = lines.map((l) => {
      if (l.startsWith('VITE_API_URL=')) {
        replaced = true
        return line
      }
      return l
    })

    if (!replaced) nextLines.push(line)
    fs.writeFileSync(frontendEnvPath, `${nextLines.join('\n')}\n`, 'utf8')
  } catch (e) {
    console.warn('Could not update frontend .env:', e?.message || e)
  }
}

async function main() {
  const basePort = Number(process.env.PORT || 5000)
  const candidatePorts = [basePort, basePort + 1]

  // Kill likely duplicate servers first.
  killAnyBackendServerProcesses()

  let chosenPort = null
  for (const p of candidatePorts) {
    if (isPortListening(p)) {
      console.log(`Port ${p} in use; attempting to free it...`)
      try {
        killPort(p)
      } catch (e) {
        console.warn(`Failed to kill port ${p} listeners:`, e?.message || e)
      }
    }

    // give OS a moment to release
    await new Promise((r) => setTimeout(r, 400))

    if (!isPortListening(p)) {
      chosenPort = p
      break
    }
  }

  if (!chosenPort) {
    throw new Error(`Could not free ports ${candidatePorts.join(' or ')}`)
  }

  if (chosenPort !== basePort) {
    const apiUrl = `http://localhost:${chosenPort}`
    console.log(`Switching backend to ${chosenPort} and updating frontend VITE_API_URL...`)
    updateFrontendEnvUrl(apiUrl)
  }

  const nodemonBin = path.join(backendDir, 'node_modules', 'nodemon', 'bin', 'nodemon.js')
  const serverEntry = path.join(backendDir, 'server.js')

  console.log(`Starting backend on http://localhost:${chosenPort}`)

  const child = spawn(process.execPath, [nodemonBin, serverEntry], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(chosenPort), // ensures dotenv doesn't overwrite it
    },
  })

  child.on('exit', (code) => process.exit(code ?? 0))
}

main().catch((e) => {
  console.error('devStart failed:', e?.message || e)
  process.exit(1)
})

