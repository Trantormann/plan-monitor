import { GitHubCopilotAdapter } from './github-copilot.js';
import { CursorAdapter } from './cursor.js';
import { ClaudeCodeAdapter } from './claude-code.js';
import { CodexAdapter } from './codex.js';
export function createProviderRegistry(settings) {
    const adapters = [
        new GitHubCopilotAdapter(settings.providers['github-copilot']),
        new CursorAdapter(settings.providers.cursor),
        new ClaudeCodeAdapter(settings.providers['claude-code']),
        new CodexAdapter(settings.providers.codex)
    ].filter((adapter) => settings.providers[adapter.id].enabled);
    return {
        list: () => adapters,
        get: (id) => adapters.find((adapter) => adapter.id === id)
    };
}
//# sourceMappingURL=registry.js.map