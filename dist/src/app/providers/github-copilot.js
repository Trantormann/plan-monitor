export class GitHubCopilotAdapter {
    config;
    id = 'github-copilot';
    name = 'GitHub Copilot';
    constructor(config) {
        this.config = config;
    }
    async fetchSnapshot() {
        const payload = process.env.GITHUB_COPILOT_PAYLOAD ? JSON.parse(process.env.GITHUB_COPILOT_PAYLOAD) : {
            remaining: 12,
            resetAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
            status: 'healthy'
        };
        return normalizeSnapshot({
            id: this.id,
            name: this.name,
            remaining: payload.remaining ?? 0,
            resetAt: payload.resetAt ?? null,
            status: payload.status ?? 'healthy',
            available: Boolean(this.config.apiKey) || Boolean(process.env.GITHUB_COPILOT_PAYLOAD),
            message: this.config.apiKey ? undefined : 'No token configured'
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
//# sourceMappingURL=github-copilot.js.map