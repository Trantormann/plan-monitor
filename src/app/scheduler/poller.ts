import type { AppSettings, ProviderRegistry, ProviderSnapshot, RefreshResult } from '../../shared/model.js';

export interface PollerCallbacks {
  onRefresh: (snapshots: ProviderSnapshot[]) => void;
}

export function createPoller(registry: ProviderRegistry, settings: AppSettings, onRefresh: PollerCallbacks['onRefresh']) {
  let timer: NodeJS.Timeout | null = null;

  async function refreshOnce(): Promise<ProviderSnapshot[]> {
    const snapshots = await Promise.all(
      registry.list().map(async (adapter) => {
        try {
          return await adapter.fetchSnapshot();
        } catch {
          return {
            id: adapter.id,
            name: adapter.name,
            remaining: 0,
            resetAt: null,
            status: 'error',
            updatedAt: new Date().toISOString(),
            available: false,
            message: 'Refresh failed'
          } satisfies ProviderSnapshot;
        }
      })
    );

    onRefresh(snapshots);
    return snapshots;
  }

  async function refreshSingle(providerId: string): Promise<RefreshResult> {
    const adapter = registry.get(providerId as never);
    if (!adapter) {
      return { provider: providerId as never, refreshed: false, status: 'error', remaining: null, resetAt: null };
    }

    try {
      const snapshot = await adapter.fetchSnapshot();
      return {
        provider: snapshot.id,
        refreshed: true,
        status: snapshot.status,
        remaining: snapshot.remaining,
        resetAt: snapshot.resetAt
      };
    } catch {
      return { provider: providerId as never, refreshed: false, status: 'error', remaining: null, resetAt: null };
    }
  }

  return {
    start: () => {
      if (timer) return;
      timer = setInterval(() => {
        void refreshOnce();
      }, settings.intervalMinutes * 60 * 1000);
    },
    stop: () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    },
    refreshOnce,
    refreshSingle
  };
}
