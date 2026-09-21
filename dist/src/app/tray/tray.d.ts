import type { ProviderSnapshot } from '../../shared/model.js';
export declare function createTray(): {
    update: (snapshots: ProviderSnapshot[]) => void;
};
