import { describe, expect, it, vi } from 'vitest';
import { createPoller } from '../../src/app/scheduler/poller.js';
import type { AppSettings, ProviderAdapter, ProviderRegistry, ProviderSnapshot } from '../../src/shared/model.js';

const snapshot: ProviderSnapshot = {
  id: 'github-copilot',
  name: 'GitHub Copilot',
  remaining: 10,
  resetAt: '2026-09-22T00:00:00.000Z',
  status: 'healthy',
  updatedAt: '2026-09-21T12:00:00.000Z',
  available: true
};

const provider: ProviderAdapter = {
  id: 'github-copilot',
  name: 'GitHub Copilot',
  fetchSnapshot: async () => snapshot
};

const registry: ProviderRegistry = {
  list: () => [provider],
  get: (id) => (id === provider.id ? provider : undefined)
};

const settings: AppSettings = {
  intervalMinutes: 30,
  disabledProviders: [],
  providers: {
    'github-copilot': { enabled: true },
    cursor: { enabled: false },
    'claude-code': { enabled: false },
    codex: { enabled: false }
  }
};

describe('createPoller', () => {
  it('refreshes a snapshot and returns it', async () => {
    const callback = vi.fn();
    const poller = createPoller(registry, settings, callback);

    const result = await poller.refreshOnce();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'github-copilot', remaining: 10 });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('returns a failed refresh result when adapter is missing', async () => {
    const callback = vi.fn();
    const poller = createPoller(registry, settings, callback);

    const result = await poller.refreshSingle('cursor');

    expect(result).toMatchObject({ refreshed: false, status: 'error' });
  });
});
