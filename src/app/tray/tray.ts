import type { ProviderSnapshot } from '../../shared/model.js';

export function createTray() {
  return {
    update: (snapshots: ProviderSnapshot[]) => {
      const lines = snapshots.map((snapshot) => {
        const status = snapshot.status === 'healthy' ? 'OK' : snapshot.status.toUpperCase();
        return `${snapshot.name}: ${snapshot.remaining} remaining (${status})`;
      });

      console.log('Tray snapshot');
      for (const line of lines) {
        console.log(line);
      }
    }
  };
}
