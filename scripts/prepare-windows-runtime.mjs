import { createWriteStream, existsSync, readdirSync, rmSync, statSync } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const runtimeRoot = path.join(repoRoot, "src-tauri", "resources", "windows-runtime");
const nodeRoot = path.join(runtimeRoot, "node");
const chromiumRoot = path.join(runtimeRoot, "chromium");
const runtimePackageJsonPath = path.join(runtimeRoot, "package.json");
const runtimePackageLockPath = path.join(runtimeRoot, "package-lock.json");
const tempRoot = path.join(repoRoot, ".tmp", "windows-runtime");

async function main() {
  if (process.platform !== "win32") {
    throw new Error("A preparação do runtime Windows precisa ser executada em um ambiente Windows.");
  }

  await mkdir(runtimeRoot, { recursive: true });
  await mkdir(tempRoot, { recursive: true });

  await ensureRuntimePackageJson();
  installRuntimeDependencies();

  const nodeDownload = await resolveLatestNode20Download();
  const nodeArchive = path.join(tempRoot, path.basename(nodeDownload.url));
  await downloadFile(nodeDownload.url, nodeArchive);
  await extractZip(nodeArchive, tempRoot);
  await installExtractedFolder(tempRoot, "node-v", nodeRoot);

  const browserDownload = await resolveStableChromeHeadlessShell();
  const browserArchive = path.join(tempRoot, path.basename(browserDownload.url));
  await downloadFile(browserDownload.url, browserArchive);
  await extractZip(browserArchive, tempRoot);
  await installExtractedFolder(tempRoot, "chrome-headless-shell-", chromiumRoot);

  const manifest = {
    preparedAt: new Date().toISOString(),
    nodeVersion: nodeDownload.version,
    browserVersion: browserDownload.version,
  };

  await writeFile(
    path.join(runtimeRoot, "runtime-manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );
}

async function ensureRuntimePackageJson() {
  const packageJson = {
    name: "lumen-studio-windows-runtime",
    private: true,
    version: "1.0.0",
    description: "Runtime embarcado de geração para o Lumen Studio no Windows",
    dependencies: {
      "@marp-team/marp-cli": "^4.2.3",
      "markdown-it": "^14.1.0",
    },
  };

  if (!existsSync(runtimePackageJsonPath)) {
    await writeFile(runtimePackageJsonPath, JSON.stringify(packageJson, null, 2), "utf8");
    return;
  }

  const current = JSON.parse(await readFile(runtimePackageJsonPath, "utf8"));
  const merged = {
    ...current,
    private: true,
    dependencies: {
      ...packageJson.dependencies,
      ...(current.dependencies ?? {}),
    },
  };

  await writeFile(runtimePackageJsonPath, JSON.stringify(merged, null, 2), "utf8");
}

function installRuntimeDependencies() {
  const npmArgs = [
    "install",
    "--omit=dev",
    "--no-audit",
    "--no-fund",
    "--cache",
    path.join(tempRoot, "npm-cache"),
  ];

  if (process.platform === "win32") {
    execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", `npm ${npmArgs.join(" ")}`], {
      cwd: runtimeRoot,
      stdio: "inherit",
    });
    return;
  }

  execFileSync("npm", npmArgs, {
    cwd: runtimeRoot,
    stdio: "inherit",
  });
}

async function resolveLatestNode20Download() {
  const response = await fetch("https://nodejs.org/dist/index.json");
  if (!response.ok) {
    throw new Error(`Falha ao consultar versões do Node.js: ${response.status} ${response.statusText}`);
  }

  const releases = await response.json();
  const latest20 = releases.find((entry) => typeof entry.version === "string" && entry.version.startsWith("v20."));
  if (!latest20) {
    throw new Error("Não encontrei uma versão estável da linha 20.x do Node.js.");
  }

  return {
    version: latest20.version,
    url: `https://nodejs.org/dist/${latest20.version}/node-${latest20.version}-win-x64.zip`,
  };
}

async function resolveStableChromeHeadlessShell() {
  const response = await fetch("https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json");
  if (!response.ok) {
    throw new Error(`Falha ao consultar versões do Chrome for Testing: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const stable = payload?.channels?.Stable;
  const downloads = stable?.downloads?.["chrome-headless-shell"];
  const win64 = Array.isArray(downloads)
    ? downloads.find((entry) => entry.platform === "win64")
    : null;

  if (!stable?.version || !win64?.url) {
    throw new Error("Não encontrei o download estável de chrome-headless-shell para win64.");
  }

  return {
    version: stable.version,
    url: win64.url,
  };
}

async function downloadFile(url, destination) {
  console.log(`Baixando ${url}`);
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Falha ao baixar ${url}: ${response.status} ${response.statusText}`);
  }

  await mkdir(path.dirname(destination), { recursive: true });
  const fileStream = createWriteStream(destination);
  await pipeline(response.body, fileStream);
}

async function extractZip(archivePath, destinationDir) {
  execFileSync("tar", ["-xf", archivePath, "-C", destinationDir], {
    stdio: "inherit",
  });
}

async function installExtractedFolder(searchRoot, folderPrefix, targetDir) {
  const extracted = findNewestDirectoryByPrefix(searchRoot, folderPrefix);
  if (!extracted) {
    throw new Error(`Não encontrei a pasta extraída com prefixo ${folderPrefix}.`);
  }

  await rm(targetDir, { recursive: true, force: true });
  await mkdir(path.dirname(targetDir), { recursive: true });
  await rename(extracted, targetDir);
  cleanupExtractedDirectories(searchRoot, folderPrefix, targetDir);
}

function findNewestDirectoryByPrefix(searchRoot, folderPrefix) {
  const entries = readdirSync(searchRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith(folderPrefix))
    .map((entry) => path.join(searchRoot, entry.name));

  if (entries.length === 0) {
    return null;
  }

  return entries.sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs)[0];
}

function cleanupExtractedDirectories(searchRoot, folderPrefix, keepDir) {
  for (const entry of readdirSync(searchRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith(folderPrefix)) {
      continue;
    }

    const fullPath = path.join(searchRoot, entry.name);
    if (path.resolve(fullPath) === path.resolve(keepDir)) {
      continue;
    }

    rmSync(fullPath, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
