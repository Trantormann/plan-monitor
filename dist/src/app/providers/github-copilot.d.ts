import type { ProviderAdapter, ProviderConfig, ProviderSnapshot } from '../../shared/model.js';
export declare class GitHubCopilotAdapter implements ProviderAdapter {
    private readonly config;
    readonly id: "github-copilot";
    readonly name = "GitHub Copilot";
    constructor(config: ProviderConfig);
    fetchSnapshot(): Promise<ProviderSnapshot>;
}
