const fallbackUrl = "https://github.com/mateusflorez/lumen-studio/releases/latest";

const downloadLink = document.querySelector("#download-link");
const releaseInfo = document.querySelector("#release-info");

function formatVersion(version) {
  if (!version) {
    return "versão mais recente";
  }

  return version.startsWith("v") ? version : `v${version}`;
}

function getSetupUrl(version) {
  if (!version) {
    return null;
  }

  const cleanVersion = version.replace(/^v/i, "");
  return `https://github.com/mateusflorez/lumen-studio/releases/latest/download/Lumen.Studio_${cleanVersion}_x64-setup.exe`;
}

async function hydrateDownloadLink() {
  try {
    const response = await fetch("./latest.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Manifest indisponível: ${response.status}`);
    }

    const manifest = await response.json();
    const installerUrl = getSetupUrl(manifest.version);

    if (!installerUrl) {
      throw new Error("Versão não encontrada no manifest");
    }

    const version = formatVersion(manifest.version);
    downloadLink.href = installerUrl;
    downloadLink.textContent = `Baixar ${version} para Windows`;
    releaseInfo.textContent = `Download direto do instalador mais recente: ${version}`;
  } catch (error) {
    downloadLink.href = fallbackUrl;
    releaseInfo.textContent = "Não foi possível ler o manifest agora. O botão abre a página da última release.";
    console.warn(error);
  }
}

hydrateDownloadLink();
