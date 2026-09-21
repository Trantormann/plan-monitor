import type { ProviderAdapter, ProviderConfig, ProviderSnapshot } from '../../shared/model.js';

export class ClaudeCodeAdapter implements ProviderAdapter {
  readonly id = 'claude-code' as const;
  readonly name = 'Claude Code';

  constructor(private readonly config: ProviderConfig) {}

  async fetchSnapshot(): Promise<ProviderSnapshot> {
    const payload = process.env.CLAUDE_CODE_PAYLOAD ? JSON.parse(process.env.CLAUDE_CODE_PAYLOAD) : {
      remaining: 10,
      resetAt: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
      status: 'warning'
    };

    return normalizeSnapshot({
      id: this.id,
      name: this.name,
      remaining: payload.remaining ?? 0,
      resetAt: payload.resetAt ?? null,
      status: payload.status ?? 'warning',
      available: Boolean(this.config.apiKey) || Boolean(process.env.CLAUDE_CODE_PAYLOAD),
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
