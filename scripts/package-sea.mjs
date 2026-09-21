import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const outputPath = path.resolve(projectRoot, process.argv[2] ?? 'dist/plan-monitor.exe');
const blobPath = path.resolve(projectRoot, 'dist/plan-monitor.blob');
const seaConfigPath = path.resolve(projectRoot, 'sea-config.json');
const postjectPath = path.resolve(projectRoot, 'node_modules/postject/dist/cli.js');
const sentinelFuse = 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2';

if (process.version.split('.')[0] !== 'v20') {
    throw new Error(`Node 20 is required for SEA packaging; received ${process.version}`);
}

execFileSync(process.execPath, ['--experimental-sea-config', seaConfigPath], {
    cwd: projectRoot,
    stdio: 'inherit'
});

if (!fs.existsSync(blobPath)) {
    throw new Error(`SEA blob was not generated: ${blobPath}`);
}

fs.copyFileSync(process.execPath, outputPath);
execFileSync(process.execPath, [
    postjectPath,
    outputPath,
    'NODE_SEA_BLOB',
    blobPath,
    '--sentinel-fuse',
    sentinelFuse
], {
    cwd: projectRoot,
    stdio: 'inherit'
});

console.log(`Created ${path.relative(projectRoot, outputPath)} with ${process.version}.`);