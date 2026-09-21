import { DEFAULT_SETTINGS, loadSettings } from './app/settings/config.js';
import { createProviderRegistry } from './app/providers/registry.js';
import { createPoller } from './app/scheduler/poller.js';
import { createTray } from './app/tray/tray.js';

async function start() {
  const settings = loadSettings(DEFAULT_SETTINGS);
  const registry = createProviderRegistry(settings);
  const tray = createTray();
  const poller = createPoller(registry, settings, (snapshots) => {
    tray.update(snapshots);
  });

  tray.update(await poller.refreshOnce());
  poller.start();

  console.log('plan-monitor started');
}

start().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('plan-monitor failed to start:', message);
  process.exitCode = 1;
});
