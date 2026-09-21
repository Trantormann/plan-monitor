import type { ProviderAdapter, ProviderConfig, ProviderSnapshot } from '../../shared/model.js';
export declare class CodexAdapter implements ProviderAdapter {
    private readonly config;
    readonly id: "codex";
    readonly name = "Codex";
    constructor(config: ProviderConfig);
    fetchSnapshot(): Promise<ProviderSnapshot>;
}
