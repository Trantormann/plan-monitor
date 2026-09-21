import { describe, expect, it } from 'vitest';
import { parseCliArgs } from '../../src/app/runtime/launcher.js';

import { resolveRuntimeConfig } from '../../src/app/runtime/config.js';

describe('parseCliArgs', () => {
    it('defaults to the start command in foreground mode', () => {
        expect(parseCliArgs([])).toMatchObject({
            command: 'start',
            background: false,
            debug: false
        });
    });

    it('accepts daemon and debug flags', () => {
        expect(parseCliArgs(['start', '--background', '--debug'])).toMatchObject({
            command: 'start',
            background: true,
            debug: true
        });
    });

    it('supports status, install, and restart commands', () => {
        expect(parseCliArgs(['status'])).toMatchObject({ command: 'status' });
        expect(parseCliArgs(['install'])).toMatchObject({ command: 'install' });
        expect(parseCliArgs(['restart', '--background'])).toMatchObject({
            command: 'restart',
            background: true,
            debug: false
        });
    });
});

describe('resolveRuntimeConfig', () => {
    it('applies environment/runtime overrides on top of persisted values while keeping defaults', () => {
        const merged = resolveRuntimeConfig(
            {
                intervalMinutes: 15,
                disabledProviders: ['cursor'],
                providers: {
                    'github-copilot': { enabled: true },
                    cursor: { enabled: false },
                    'claude-code': { enabled: true },
                    codex: { enabled: true }
                },
                retryAttempts: 3,
                retryDelayMs: 1500,
                logMaxBytes: 1048576,
                autoRestart: true
            },
            {
                retryAttempts: 5,
                autoRestart: false
            }
        );

        expect(merged.intervalMinutes).toBe(15);
        expect(merged.retryAttempts).toBe(5);
        expect(merged.autoRestart).toBe(false);
        expect(merged.providers['github-copilot'].enabled).toBe(true);
    });
});
