import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_SETTINGS } from '../settings/config.js';

export interface RuntimeConfig {
    intervalMinutes: number;
    disabledProviders: string[];
    providers: typeof DEFAULT_SETTINGS.providers;
    retryAttempts: number;
    retryDelayMs: number;
    logMaxBytes: number;
    autoRestart: boolean;
}

export const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
    intervalMinutes: DEFAULT_SETTINGS.intervalMinutes,
    disabledProviders: DEFAULT_SETTINGS.disabledProviders,
    providers: DEFAULT_SETTINGS.providers,
    retryAttempts: 3,
    retryDelayMs: 2000,
    logMaxBytes: 1024 * 1024,
    autoRestart: true
};

export function resolveRuntimeConfig(base: Partial<RuntimeConfig> = {}, overrides: Partial<RuntimeConfig> = {}): RuntimeConfig {
    const mergedProviders = {
        ...DEFAULT_RUNTIME_CONFIG.providers,
        ...base.providers,
        ...overrides.providers
    };

    return {
        ...DEFAULT_RUNTIME_CONFIG,
        ...base,
        ...overrides,
        providers: mergedProviders
    };
}

export function getRuntimeConfigPath(): string {
    return path.join(process.cwd(), '.plan-monitor', 'runtime-config.json');
}

export function loadPersistedRuntimeConfig(): Partial<RuntimeConfig> {
    const configPath = getRuntimeConfigPath();
    if (!fs.existsSync(configPath)) {
        return {};
    }

    try {
        const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8')) as Partial<RuntimeConfig>;
        return parsed;
    } catch {
        return {};
    }
}

export function savePersistedRuntimeConfig(config: Partial<RuntimeConfig>): void {
    const runtimeDir = path.dirname(getRuntimeConfigPath());
    fs.mkdirSync(runtimeDir, { recursive: true });
    fs.writeFileSync(getRuntimeConfigPath(), JSON.stringify(config, null, 2), 'utf8');
}
