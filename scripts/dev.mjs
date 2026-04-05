import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, spawnSync } from 'node:child_process'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
let isCleaningUp = false
let activeSignal = null

function runOrExit(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
  })

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      console.error(`Missing required command: ${command}`)
    } else {
      console.error(result.error.message)
    }

    process.exit(1)
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
  })

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      console.error(`Missing required command: ${command}`)
    } else {
      console.error(result.error.message)
    }

    return false
  }

  return result.status === 0
}

function isPostgresRunning() {
  const result = spawnSync(
    'docker',
    ['compose', 'ps', '--status', 'running', '--services'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    },
  )

  if (result.error) {
    if (result.error.code === 'ENOENT') {
      console.error('Missing required command: docker')
    } else {
      console.error(result.error.message)
    }

    process.exit(1)
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }

  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .includes('postgres')
}

function cleanupPostgres() {
  if (isCleaningUp || postgresWasRunningBeforeStart) {
    return
  }

  isCleaningUp = true
  run('docker', ['compose', 'stop', 'postgres'])
}

const postgresWasRunningBeforeStart = isPostgresRunning()

runOrExit('docker', ['compose', 'version'])
runOrExit('docker', ['compose', 'up', '-d', '--wait', 'postgres'])
runOrExit('pnpm', ['db:migrate'])

const appProcess = spawn('pnpm', ['exec', 'vite', 'dev', '--port', '3000'], {
  cwd: repoRoot,
  stdio: 'inherit',
})

appProcess.on('exit', (code, signal) => {
  cleanupPostgres()

  if (activeSignal) {
    process.exit(0)
    return
  }

  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    activeSignal = signal
    cleanupPostgres()

    if (!appProcess.killed) {
      appProcess.kill(signal)
    }

    process.exit(0)
  })
}