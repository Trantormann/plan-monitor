export const DEFAULT_SETTINGS = {
    intervalMinutes: 30,
    disabledProviders: [],
    providers: {
        'github-copilot': { enabled: true },
        cursor: { enabled: true },
        'claude-code': { enabled: true },
        codex: { enabled: true }
    }
};
export function loadSettings(base) {
    const intervalMinutes = Number(process.env.MONITOR_INTERVAL_MINUTES ?? base.intervalMinutes);
    const disabledProviders = parseDisabledProviders(process.env.DISABLED_PROVIDERS);
    return {
        ...base,
        intervalMinutes: Number.isFinite(intervalMinutes) && intervalMinutes > 0 ? intervalMinutes : base.intervalMinutes,
        disabledProviders,
        providers: {
            ...base.providers,
            'github-copilot': {
                ...base.providers['github-copilot'],
                apiKey: process.env.GITHUB_COPILOT_TOKEN,
                enabled: !disabledProviders.includes('github-copilot')
            },
            cursor: {
                ...base.providers.cursor,
                apiKey: process.env.CURSOR_API_KEY,
                enabled: !disabledProviders.includes('cursor')
            },
            'claude-code': {
                ...base.providers['claude-code'],
                apiKey: process.env.CLAUDE_CODE_API_KEY,
                enabled: !disabledProviders.includes('claude-code')
            },
            codex: {
                ...base.providers.codex,
                apiKey: process.env.CODEX_API_KEY,
                enabled: !disabledProviders.includes('codex')
            }
        }
    };
}
function parseDisabledProviders(raw) {
    if (!raw)
        return [];
    const values = raw
        .split(',')
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean);
    return values.filter((value) => {
        return value === 'github-copilot' || value === 'cursor' || value === 'claude-code' || value === 'codex';
    });
}
//# sourceMappingURL=config.js.map