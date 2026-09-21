export class CodexAdapter {
    config;
    id = 'codex';
    name = 'Codex';
    constructor(config) {
        this.config = config;
    }
    async fetchSnapshot() {
        const payload = process.env.CODEX_PAYLOAD ? JSON.parse(process.env.CODEX_PAYLOAD) : {
            remaining: 8,
            resetAt: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
            status: 'healthy'
        };
        return normalizeSnapshot({
            id: this.id,
            name: this.name,
            remaining: payload.remaining ?? 0,
            resetAt: payload.resetAt ?? null,
            status: payload.status ?? 'healthy',
            available: Boolean(this.config.apiKey) || Boolean(process.env.CODEX_PAYLOAD),
            message: this.config.apiKey ? undefined : 'No key configured'
        });
    }
}
function normalizeSnapshot(input) {
    const status = input.status === 'warning' || input.status === 'critical' || input.status === 'error' ? input.status : 'healthy';
    return {
        ...input,
        status,
        updatedAt: new Date().toISOString()
    };
}
//# sourceMappingURL=codex.js.map