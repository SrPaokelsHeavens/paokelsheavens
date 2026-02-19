import fs from 'fs';
import path from 'path';

function patchSnippet(filePath, original, replacement, label) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[postinstall-fixes] ${label}: file not found, skipping`);
    return;
  }
  const current = fs.readFileSync(filePath, 'utf-8');
  if (current.includes(replacement)) {
    console.log(`[postinstall-fixes] ${label}: already patched`);
    return;
  }
  if (!current.includes(original)) {
    console.warn(`[postinstall-fixes] ${label}: target snippet not found.`);
    return;
  }
  fs.writeFileSync(filePath, current.replace(original, replacement), 'utf-8');
  console.log(`[postinstall-fixes] ${label}: patch applied`);
}

const vitePath = path.join(process.cwd(), 'node_modules', 'vite', 'dist', 'node', 'chunks', 'dep-D4NMHUTW.js');
const viteOriginal = `  exec("net use", (error, stdout) => {\n    if (error) return;\n    const lines = stdout.split("\\n");\n    for (const line of lines) {\n      const m = parseNetUseRE.exec(line);\n      if (m) windowsNetworkMap.set(m[2], m[1]);\n    }\n    if (windowsNetworkMap.size === 0) {\n      safeRealpathSync = fs__default.realpathSync.native;\n    } else {\n      safeRealpathSync = windowsMappedRealpathSync;\n    }\n  });`;
const viteReplacement = `  try {\n    exec("net use", (error, stdout) => {\n      if (error) return;\n      const lines = stdout.split("\\n");\n      for (const line of lines) {\n        const m = parseNetUseRE.exec(line);\n        if (m) windowsNetworkMap.set(m[2], m[1]);\n      }\n      if (windowsNetworkMap.size === 0) {\n        safeRealpathSync = fs__default.realpathSync.native;\n      } else {\n        safeRealpathSync = windowsMappedRealpathSync;\n      }\n    });\n  } catch (error) {\n    safeRealpathSync = fs__default.realpathSync.native;\n  }`;
patchSnippet(vitePath, viteOriginal, viteReplacement, 'Vite safe realpath');

const esbuildPath = path.join(process.cwd(), 'node_modules', 'esbuild', 'lib', 'main.js');
const esbuildOriginal = '    windowsHide: true,';
const esbuildReplacement = '    windowsHide: false,';
patchSnippet(esbuildPath, esbuildOriginal, esbuildReplacement, 'esbuild spawn visibility');
