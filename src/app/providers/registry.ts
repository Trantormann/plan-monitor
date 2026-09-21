import type { AppSettings, ProviderAdapter, ProviderId, ProviderRegistry } from '../../shared/model.js';
import { GitHubCopilotAdapter } from './github-copilot.js';
import { CursorAdapter } from './cursor.js';
import { ClaudeCodeAdapter } from './claude-code.js';
import { CodexAdapter } from './codex.js';

export function createProviderRegistry(settings: AppSettings): ProviderRegistry {
  const adapters: ProviderAdapter[] = [
    new GitHubCopilotAdapter(settings.providers['github-copilot']),
    new CursorAdapter(settings.providers.cursor),
    new ClaudeCodeAdapter(settings.providers['claude-code']),
    new CodexAdapter(settings.providers.codex)
  ].filter((adapter) => settings.providers[adapter.id].enabled);

  return {
    list: () => adapters,
    get: (id: ProviderId) => adapters.find((adapter) => adapter.id === id)
  };
}
