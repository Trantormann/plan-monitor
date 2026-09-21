import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const requiredNodeMajor = 18;
const requiredNodeModules = ['typescript', '@types/node', 'vitest'];
const providerEnvNames = [
    'GITHUB_COPILOT_TOKEN',
    'CURSOR_API_KEY',
    'CLAUDE_CODE_API_KEY',
    'CODEX_API_KEY'
];

function logStep(message) {
    console.log(`\n[plan-monitor] ${message}`);
}

function fail(message) {
    console.error(`\n[plan-monitor] ERROR: ${message}`);
    process.exit(1);
}

function checkNodeVersion() {
    const currentMajor = Number.parseInt(process.versions.node.split('.')[0], 10);
    if (!Number.isFinite(currentMajor)) {
        fail('Unable to determine the installed Node.js version.');
    }

    if (currentMajor < requiredNodeMajor) {
        fail(`Node.js ${requiredNodeMajor}+ is required. Current version: ${process.version}`);
    }

    logStep(`Node.js version OK (${process.version})`);
}

function checkDependencies() {
    const nodeModulesPath = path.join(projectRoot, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        fail('Dependencies are not installed. Run: npm install');
    }

    const missing = requiredNodeModules.filter((name) => {
        const pkgPath = path.join(nodeModulesPath, name, 'package.json');
        return !fs.existsSync(pkgPath);
    });

    if (missing.length > 0) {
        fail(`Missing required packages: ${missing.join(', ')}. Run: npm install`);
    }

    logStep('Dependencies detected in node_modules');
}

function checkPlatform() {
    const supported = ['win32', 'linux', 'darwin'];
    if (!supported.includes(process.platform)) {
        console.warn(`[plan-monitor] Warning: platform ${process.platform} is not listed as a tested target.`);
        return;
    }

    logStep(`Platform OK (${process.platform})`);
}

function checkEnvHints() {
    const missing = providerEnvNames.filter((name) => !process.env[name]);

    if (missing.length === 0) {
        logStep('All provider environment variables are configured.');
        return;
    }

    console.warn(`\n[plan-monitor] Warning: missing optional runtime settings: ${missing.join(', ')}`);
    console.warn('Set them before running the monitor, for example:');
    missing.forEach((name) => console.warn(`  $env:${name} = "your-value"`));
}

function main() {
    logStep('Running plan-monitor preflight check');
    checkNodeVersion();
    checkPlatform();
    checkDependencies();
    checkEnvHints();
    logStep('Preflight check passed. You can now run: npm run build, npm test, or npm run dev');
}

main();
