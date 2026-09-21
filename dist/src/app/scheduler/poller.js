export function createPoller(registry, settings, onRefresh) {
    let timer = null;
    async function refreshOnce() {
        const snapshots = await Promise.all(registry.list().map(async (adapter) => {
            try {
                return await adapter.fetchSnapshot();
            }
            catch {
                return {
                    id: adapter.id,
                    name: adapter.name,
                    remaining: 0,
                    resetAt: null,
                    status: 'error',
                    updatedAt: new Date().toISOString(),
                    available: false,
                    message: 'Refresh failed'
                };
            }
        }));
        onRefresh(snapshots);
        return snapshots;
    }
    async function refreshSingle(providerId) {
        const adapter = registry.get(providerId);
        if (!adapter) {
            return { provider: providerId, refreshed: false, status: 'error', remaining: null, resetAt: null };
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
        }
        catch {
            return { provider: providerId, refreshed: false, status: 'error', remaining: null, resetAt: null };
        }
    }
    return {
        start: () => {
            if (timer)
                return;
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
//# sourceMappingURL=poller.js.map