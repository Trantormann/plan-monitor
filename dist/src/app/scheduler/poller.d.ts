import type { AppSettings, ProviderRegistry, ProviderSnapshot, RefreshResult } from '../../shared/model.js';
export interface PollerCallbacks {
    onRefresh: (snapshots: ProviderSnapshot[]) => void;
}
export declare function createPoller(registry: ProviderRegistry, settings: AppSettings, onRefresh: PollerCallbacks['onRefresh']): {
    start: () => void;
    stop: () => void;
    refreshOnce: () => Promise<ProviderSnapshot[]>;
    refreshSingle: (providerId: string) => Promise<RefreshResult>;
};
