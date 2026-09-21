import type { ProviderAdapter, ProviderConfig, ProviderSnapshot } from '../../shared/model.js';
export declare class CursorAdapter implements ProviderAdapter {
    private readonly config;
    readonly id: "cursor";
    readonly name = "Cursor";
    constructor(config: ProviderConfig);
    fetchSnapshot(): Promise<ProviderSnapshot>;
}
