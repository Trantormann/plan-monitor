export type ProviderId = 'github-copilot' | 'cursor' | 'claude-code' | 'codex';

export type ProviderStatus = 'healthy' | 'warning' | 'critical' | 'error';

export interface ProviderSnapshot {
  id: ProviderId;
  name: string;
  remaining: number;
  resetAt: string | null;
  status: ProviderStatus;
  updatedAt: string;
  available: boolean;
  message?: string;
}

export interface ProviderConfig {
  enabled: boolean;
  apiKey?: string;
}

export interface AppSettings {
  intervalMinutes: number;
  disabledProviders: ProviderId[];
  providers: Record<ProviderId, ProviderConfig>;
}

export interface ProviderAdapter {
  readonly id: ProviderId;
  readonly name: string;
  fetchSnapshot(): Promise<ProviderSnapshot>;
}

export interface RefreshResult {
  provider: ProviderId;
  refreshed: boolean;
  status: ProviderStatus;
  remaining: number | null;
  resetAt: string | null;
}

export interface ProviderRegistry {
  list(): ProviderAdapter[];
  get(id: ProviderId): ProviderAdapter | undefined;
}
