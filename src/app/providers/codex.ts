import type { ProviderAdapter, ProviderConfig, ProviderSnapshot } from '../../shared/model.js';

export class CodexAdapter implements ProviderAdapter {
  readonly id = 'codex' as const;
  readonly name = 'Codex';

  constructor(private readonly config: ProviderConfig) {}

  async fetchSnapshot(): Promise<ProviderSnapshot> {
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

function normalizeSnapshot(input: Omit<ProviderSnapshot, 'updatedAt'> & { status?: string }): ProviderSnapshot {
  const status = input.status === 'warning' || input.status === 'critical' || input.status === 'error' ? input.status : 'healthy';

  return {
    ...input,
    status,
    updatedAt: new Date().toISOString()
  };
}
