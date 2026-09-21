import {
  parseCliArgs,
  restartBackgroundProcess,
  runDebugCommand,
  runInstallCommand,
  runStatusCommand,
  startRuntime,
  stopBackgroundProcess
} from './app/runtime/launcher.js';

async function main() {
  const parsed = parseCliArgs(process.argv.slice(2));

  switch (parsed.command) {
    case 'install':
      process.exitCode = runInstallCommand();
      return;
    case 'status':
      process.exitCode = runStatusCommand();
      return;
    case 'debug':
      process.exitCode = runDebugCommand();
      return;
    case 'stop':
      process.exitCode = stopBackgroundProcess();
      return;
    case 'restart':
      process.exitCode = restartBackgroundProcess();
      return;
    case 'start':
      process.exitCode = await startRuntime({ background: parsed.background, debug: parsed.debug });
      return;
    default:
      process.exitCode = await startRuntime({ background: false, debug: false });
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('plan-monitor failed to execute:', message);
  process.exitCode = 1;
});
