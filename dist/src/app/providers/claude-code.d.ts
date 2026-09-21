import type { ProviderAdapter, ProviderConfig, ProviderSnapshot } from '../../shared/model.js';
export declare class ClaudeCodeAdapter implements ProviderAdapter {
    private readonly config;
    readonly id: "claude-code";
    readonly name = "Claude Code";
    constructor(config: ProviderConfig);
    fetchSnapshot(): Promise<ProviderSnapshot>;
}
