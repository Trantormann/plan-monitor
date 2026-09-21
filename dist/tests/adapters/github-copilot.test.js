import { describe, expect, it } from 'vitest';
import { GitHubCopilotAdapter } from '../../src/app/providers/github-copilot.js';
describe('GitHubCopilotAdapter', () => {
    it('returns normalized snapshot data', async () => {
        const adapter = new GitHubCopilotAdapter({ enabled: true, apiKey: 'token' });
        const snapshot = await adapter.fetchSnapshot();
        expect(snapshot.id).toBe('github-copilot');
        expect(snapshot.name).toBe('GitHub Copilot');
        expect(snapshot.remaining).toBeGreaterThanOrEqual(0);
        expect(snapshot.status).toMatch(/healthy|warning|critical|error/);
    });
});
//# sourceMappingURL=github-copilot.test.js.map