import type { ProviderAdapter, ProviderConfig, ProviderSnapshot } from '../../shared/model.js';

export class GitHubCopilotAdapter implements ProviderAdapter {
  readonly id = 'github-copilot' as const;
  readonly name = 'GitHub Copilot';

  constructor(private readonly config: ProviderConfig) {}

  async fetchSnapshot(): Promise<ProviderSnapshot> {
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

function normalizeSnapshot(input: Omit<ProviderSnapshot, 'updatedAt'> & { status?: string }): ProviderSnapshot {
  const status = input.status === 'warning' || input.status === 'critical' || input.status === 'error' ? input.status : 'healthy';

  return {
    ...input,
    status,
    updatedAt: new Date().toISOString()
  };
}
