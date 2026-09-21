import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { DEFAULT_SETTINGS, loadSettings } from '../settings/config.js';
import { createProviderRegistry } from '../providers/registry.js';
import { createPoller } from '../scheduler/poller.js';
import { createTray } from '../tray/tray.js';
import { loadPersistedRuntimeConfig, resolveRuntimeConfig, savePersistedRuntimeConfig } from './config.js';

export type RuntimeCommand = 'start' | 'install' | 'status' | 'debug' | 'stop' | 'restart';

export interface ParsedCliArgs {
    command: RuntimeCommand;
    background: boolean;
    debug: boolean;
}

export interface RuntimeState {
    pid: number | null;
    startedAt: string | null;
    logPath: string;
    projectRoot: string;
    status: 'running' | 'stopped';
}

export interface RuntimeServiceConfig {
    retryAttempts: number;
    retryDelayMs: number;
    logMaxBytes: number;
    autoRestart: boolean;
}

const VALID_COMMANDS: RuntimeCommand[] = ['start', 'install', 'status', 'debug', 'stop', 'restart'];

export function parseCliArgs(argv: readonly string[]): ParsedCliArgs {
    const [rawCommand, ...rest] = argv;
    const command = rawCommand && VALID_COMMANDS.includes(rawCommand as RuntimeCommand)
        ? (rawCommand as RuntimeCommand)
        : 'start';

    const isBackground = rest.includes('--background') || rest.includes('-b') || rest.includes('--daemon') || rest.includes('--daemon-run');
    const isDebug = rest.includes('--debug') || rest.includes('-d');

    return {
        command,
        background: isBackground,
        debug: isDebug
    };
}

function getRuntimeDir(): string {
    return path.join(process.cwd(), '.plan-monitor');
}

function getStateFilePath(): string {
    return path.join(getRuntimeDir(), 'runtime-state.json');
}

function getLogFilePath(): string {
    return path.join(getRuntimeDir(), 'plan-monitor.log');
}

function ensureRuntimeDir(): string {
    const runtimeDir = getRuntimeDir();
    fs.mkdirSync(runtimeDir, { recursive: true });
    return runtimeDir;
}

function rotateLogIfNeeded(logPath: string, maxBytes: number): void {
    if (!fs.existsSync(logPath)) {
        return;
    }

    const stat = fs.statSync(logPath);
    if (stat.size <= maxBytes) {
        return;
    }

    const backupPath = `${logPath}.${Date.now()}.bak`;
    fs.renameSync(logPath, backupPath);
    fs.writeFileSync(logPath, '', 'utf8');
}

function appendRuntimeLog(message: string, logPath: string): void {
    const runtimeDir = ensureRuntimeDir();
    const target = logPath || path.join(runtimeDir, 'plan-monitor.log');
    rotateLogIfNeeded(target, 1024 * 1024);
    fs.appendFileSync(target, `${new Date().toISOString()} ${message}\n`, 'utf8');
}

function writeRuntimeState(state: RuntimeState): void {
    ensureRuntimeDir();
    fs.writeFileSync(getStateFilePath(), JSON.stringify(state, null, 2), 'utf8');
}

function readRuntimeState(): RuntimeState | null {
    const statePath = getStateFilePath();
    if (!fs.existsSync(statePath)) {
        return null;
    }

    try {
        const raw = fs.readFileSync(statePath, 'utf8');
        const parsed = JSON.parse(raw) as Partial<RuntimeState>;
        return {
            pid: typeof parsed.pid === 'number' ? parsed.pid : null,
            startedAt: typeof parsed.startedAt === 'string' ? parsed.startedAt : null,
            logPath: typeof parsed.logPath === 'string' ? parsed.logPath : getLogFilePath(),
            projectRoot: typeof parsed.projectRoot === 'string' ? parsed.projectRoot : process.cwd(),
            status: parsed.status === 'running' ? 'running' : 'stopped'
        };
    } catch {
        return null;
    }
}

function isProcessAlive(pid: number | null): boolean {
    if (pid === null) {
        return false;
    }

    try {
        process.kill(pid, 0);
        return true;
    } catch {
        return false;
    }
}

function getNpmExecutable(): string {
    return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

export function runInstallCommand(): number {
    ensureRuntimeDir();
    const install = spawnSync(getNpmExecutable(), ['install'], {
        stdio: 'inherit',
        shell: false,
        cwd: process.cwd(),
        env: process.env
    });

    if (install.error) {
        console.error('Install failed:', install.error.message);
        return 1;
    }

    return install.status ?? 0;
}

export function runStatusCommand(): number {
    const state = readRuntimeState();

    if (!state) {
        console.log('plan-monitor is not running in the current project directory.');
        return 0;
    }

    const pid = state.pid ?? 'unknown';
    const logPath = state.logPath;
    const alive = isProcessAlive(state.pid);
    const effectiveStatus = alive ? 'running' : 'stopped';

    console.log(`plan-monitor status`);
    console.log(`  pid: ${pid}`);
    console.log(`  status: ${effectiveStatus}`);
    console.log(`  startedAt: ${state.startedAt ?? 'unknown'}`);
    console.log(`  log: ${logPath}`);
    console.log(`  projectRoot: ${state.projectRoot}`);

    if (alive && fs.existsSync(logPath)) {
        const tail = fs.readFileSync(logPath, 'utf8').trim();
        if (tail) {
            console.log('--- recent log ---');
            console.log(tail.split('\n').slice(-10).join('\n'));
        }
    }

    if (!alive) {
        writeRuntimeState({
            ...state,
            pid: null,
            status: 'stopped'
        });
    }

    return 0;
}

export function runDebugCommand(): number {
    const lines = [
        'plan-monitor debug info',
        `node: ${process.version}`,
        `platform: ${process.platform}`,
        `cwd: ${process.cwd()}`,
        `execPath: ${process.execPath}`,
        `argv: ${process.argv.join(' ')}`,
        `env: ${JSON.stringify({
            GITHUB_COPILOT_TOKEN: !!process.env.GITHUB_COPILOT_TOKEN,
            CURSOR_API_KEY: !!process.env.CURSOR_API_KEY,
            CLAUDE_CODE_API_KEY: !!process.env.CLAUDE_CODE_API_KEY,
            CODEX_API_KEY: !!process.env.CODEX_API_KEY,
            DISABLED_PROVIDERS: process.env.DISABLED_PROVIDERS ?? 'unset',
            MONITOR_INTERVAL_MINUTES: process.env.MONITOR_INTERVAL_MINUTES ?? 'unset'
        }, null, 2)}`
    ];

    console.log(lines.join('\n'));
    return 0;
}

export function stopBackgroundProcess(): number {
    const state = readRuntimeState();
    if (!state || state.pid === null) {
        console.log('No background process is currently registered for this project.');
        return 0;
    }

    try {
        process.kill(state.pid, 'SIGTERM');
        console.log(`Stopped plan-monitor background process (pid=${state.pid}).`);
        writeRuntimeState({
            ...state,
            pid: null,
            startedAt: null,
            status: 'stopped'
        });
        return 0;
    } catch {
        console.error(`Unable to stop pid ${state.pid}. It may already be terminated.`);
        return 1;
    }
}

export function restartBackgroundProcess(): number {
    const state = readRuntimeState();
    const previousPid = state?.pid ?? null;

    if (previousPid !== null && isProcessAlive(previousPid)) {
        process.kill(previousPid, 'SIGTERM');
    }

    const runtimeDir = ensureRuntimeDir();
    const logPath = path.join(runtimeDir, 'plan-monitor.log');
    const child = spawn(process.execPath, ['start', '--daemon-run'], {
        cwd: process.cwd(),
        detached: true,
        stdio: ['ignore', fs.openSync(logPath, 'a'), fs.openSync(logPath, 'a')],
        env: {
            ...process.env,
            PLAN_MONITOR_DAEMON: '1'
        }
    });

    child.unref();
    writeRuntimeState({
        pid: child.pid ?? null,
        startedAt: new Date().toISOString(),
        logPath,
        projectRoot: process.cwd(),
        status: 'running'
    });

    console.log(`plan-monitor restarted in background mode (pid=${child.pid ?? 'unknown'}).`);
    console.log(`log: ${logPath}`);
    return 0;
}

export async function startRuntime({ background, debug }: { background: boolean; debug: boolean }): Promise<number> {
    const persistedConfig = loadPersistedRuntimeConfig();
    const runtimeConfig = resolveRuntimeConfig(persistedConfig, {
        retryAttempts: Number(process.env.PLAN_MONITOR_RETRY_ATTEMPTS ?? persistedConfig.retryAttempts ?? 3),
        retryDelayMs: Number(process.env.PLAN_MONITOR_RETRY_DELAY_MS ?? persistedConfig.retryDelayMs ?? 2000),
        logMaxBytes: Number(process.env.PLAN_MONITOR_LOG_MAX_BYTES ?? persistedConfig.logMaxBytes ?? 1024 * 1024),
        autoRestart: (process.env.PLAN_MONITOR_AUTO_RESTART ?? String(persistedConfig.autoRestart ?? true)) !== 'false'
    });

    savePersistedRuntimeConfig(runtimeConfig);

    const isDaemon = process.env.PLAN_MONITOR_DAEMON === '1';

    if (background && !isDaemon) {
        const runtimeDir = ensureRuntimeDir();
        const logPath = path.join(runtimeDir, 'plan-monitor.log');
        appendRuntimeLog('launching background process', logPath);
        const child = spawn(process.execPath, ['start', '--daemon-run'], {
            cwd: process.cwd(),
            detached: true,
            stdio: ['ignore', fs.openSync(logPath, 'a'), fs.openSync(logPath, 'a')],
            env: {
                ...process.env,
                PLAN_MONITOR_DAEMON: '1'
            }
        });

        child.unref();
        writeRuntimeState({
            pid: child.pid ?? null,
            startedAt: new Date().toISOString(),
            logPath,
            projectRoot: process.cwd(),
            status: 'running'
        });

        console.log(`plan-monitor started in background mode (pid=${child.pid ?? 'unknown'}).`);
        console.log(`log: ${logPath}`);
        appendRuntimeLog(`background process started with pid ${child.pid ?? 'unknown'}`, logPath);
        return 0;
    }

    if (isDaemon) {
        const logPath = getLogFilePath();
        appendRuntimeLog('daemon process active', logPath);
        writeRuntimeState({
            pid: process.pid,
            startedAt: new Date().toISOString(),
            logPath,
            projectRoot: process.cwd(),
            status: 'running'
        });
    }

    if (debug) {
        runDebugCommand();
    }

    const settings = loadSettings({
        ...DEFAULT_SETTINGS,
        intervalMinutes: runtimeConfig.intervalMinutes,
        disabledProviders: runtimeConfig.disabledProviders as never,
        providers: {
            ...DEFAULT_SETTINGS.providers,
            ...runtimeConfig.providers
        }
    });
    const registry = createProviderRegistry(settings);
    const tray = createTray();
    const poller = createPoller(registry, settings, (snapshots) => {
        tray.update(snapshots);
    });

    let attempts = 0;
    while (attempts < runtimeConfig.retryAttempts) {
        try {
            const initialSnapshots = await poller.refreshOnce();
            tray.update(initialSnapshots);
            poller.start();
            console.log('plan-monitor started');
            console.log(`process id: ${process.pid}`);
            if (background || isDaemon) {
                console.log('running in background mode');
            }
            return 0;
        } catch (error) {
            attempts += 1;
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`Refresh attempt ${attempts}/${runtimeConfig.retryAttempts} failed: ${message}`);
            if (attempts >= runtimeConfig.retryAttempts) {
                throw error;
            }
            await new Promise((resolve) => setTimeout(resolve, runtimeConfig.retryDelayMs));
        }
    }

    return 1;
}
