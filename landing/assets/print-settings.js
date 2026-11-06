const cyberpopDefaultLabels = {
  en: {eyebrow:"START HERE · RECOMMENDED",title:"CyberPOP Default Print Settings",description:"The Cyberpop starting profile for 0.20 mm PLA prints. Organic tree supports, 35° threshold and easy-to-remove interfaces.",download:"DOWNLOAD PROFILE",hint:"Current downloadable JSON is based on Bambu X1C (0.4 mm); other printer models need their own process preset. Import with File → Import → Import Configs."},
  tr: {eyebrow:"BURADAN BAŞLA · ÖNERİLEN",title:"CyberPOP Default Print Settings",description:"0,20 mm PLA baskılar için Cyberpop başlangıç profili. Organic tree support, 35° threshold ve kolay sökülebilen ara yüzeyler.",download:"PROFİLİ İNDİR",hint:"Mevcut JSON, Bambu X1C (0,4 mm) tabanlıdır. Diğer yazıcılarda aynı profilin görünmesi garanti değildir."},
  pt: {eyebrow:"COMECE AQUI · RECOMENDADO",title:"CyberPOP Default Print Settings",description:"Perfil Cyberpop para PLA em 0,20 mm, com suportes orgânicos em árvore e ângulo de 35°.",download:"BAIXAR PERFIL",hint:"Selecione uma impressora Bambu Lab com bico de 0,4 mm. Importe em File → Import → Import Configs."},
  es: {eyebrow:"EMPIEZA AQUÍ · RECOMENDADO",title:"CyberPOP Default Print Settings",description:"Perfil Cyberpop para PLA de 0,20 mm, con soportes orgánicos en árbol y un umbral de 35°.",download:"DESCARGAR PERFIL",hint:"Selecciona una impresora Bambu Lab compatible con boquilla de 0,4 mm. Importa en File → Import → Import Configs."},
  de: {eyebrow:"HIER STARTEN · EMPFOHLEN",title:"CyberPOP Default Print Settings",description:"Cyberpop-Startprofil für PLA-Drucke mit 0,20 mm. Organische Baumstützen und 35° Schwelle.",download:"PROFIL LADEN",hint:"Wähle einen Bambu-Lab-Drucker mit 0,4-mm-Düse. Import über File → Import → Import Configs."},
  fr: {eyebrow:"COMMENCEZ ICI · RECOMMANDÉ",title:"CyberPOP Default Print Settings",description:"Profil Cyberpop pour PLA en 0,20 mm, avec supports arborescents organiques et seuil de 35°.",download:"TÉLÉCHARGER",hint:"Choisissez une imprimante Bambu Lab avec une buse de 0,4 mm. Importez via File → Import → Import Configs."},
  it: {eyebrow:"INIZIA QUI · CONSIGLIATO",title:"CyberPOP Default Print Settings",description:"Profilo Cyberpop per PLA da 0,20 mm, con supporti organici ad albero e soglia di 35°.",download:"SCARICA PROFILO",hint:"Seleziona una stampante Bambu Lab con ugello da 0,4 mm. Importa da File → Import → Import Configs."},
  pl: {eyebrow:"ZACZNIJ TUTAJ · POLECANE",title:"CyberPOP Default Print Settings",description:"Profil Cyberpop do druku PLA 0,20 mm. Organiczne podpory drzewiaste i próg 35°.",download:"POBIERZ PROFIL",hint:"Wybierz drukarkę Bambu Lab z dyszą 0,4 mm. Importuj przez File → Import → Import Configs."},
  ja: {eyebrow:"まずはこちら · 推奨",title:"CyberPOP Default Print Settings",description:"0.20 mm PLA向けCyberpop基本プロファイル。オーガニック・ツリーサポート、35°しきい値。",download:"プロファイルを取得",hint:"Bambu Labの0.4 mmノズル機を選び、File → Import → Import Configsから読み込んでください。"}
};

function currentLanguage() {
  const selected = document.querySelector(".language-select select")?.value;
  const stored = window.localStorage.getItem("cyberpop-language");
  const current = document.documentElement.lang;
  return [selected, stored, current, "en"].find(code => cyberpopDefaultLabels[code]) || "en";
}

function createPrintSettingsSection(language = currentLanguage()) {
  const d = cyberpopDefaultLabels[language] || cyberpopDefaultLabels.en;
  const installNote = {
    en: "Download the JSON for your slicer and import using File → Import → Import Configs. These files currently inherit from the X1C preset; they are not verified as universal for other Bambu printers.",
    tr: "Kullandığın dilimleyici için JSON dosyasını File → Import → Import Configs ile içe aktar. Mevcut dosya X1C sistem profilini temel alır; diğer yazıcılarda görünmesi garanti değildir.",
    pt: "Baixe o JSON do seu slicer e importe em File → Import → Import Configs. Escolha uma impressora Bambu Lab com bico de 0,4 mm e selecione CyberPOP Default Settings em Process.",
    es: "Descarga el JSON de tu laminador e impórtalo desde File → Import → Import Configs. Selecciona una impresora Bambu Lab con boquilla de 0,4 mm y el perfil CyberPOP Default Settings en Process.",
    de: "Lade die JSON-Datei für deinen Slicer herunter und importiere sie über File → Import → Import Configs. Wähle einen kompatiblen Bambu Lab Drucker mit 0,4-mm-Düse und CyberPOP Default Settings unter Process.",
    fr: "Téléchargez le JSON de votre slicer et importez-le via File → Import → Import Configs. Sélectionnez une imprimante Bambu Lab compatible avec buse de 0,4 mm, puis CyberPOP Default Settings dans Process.",
    it: "Scarica il JSON per il tuo slicer e importalo da File → Import → Import Configs. Seleziona una stampante Bambu Lab compatibile con ugello da 0,4 mm e CyberPOP Default Settings in Process.",
    pl: "Pobierz plik JSON dla swojego slicera i zaimportuj przez File → Import → Import Configs. Wybierz drukarkę Bambu Lab z dyszą 0,4 mm i profil CyberPOP Default Settings w Process.",
    ja: "使用するスライサー向けのJSONをダウンロードし、File → Import → Import Configsから読み込みます。0.4 mmノズルの対応Bambu Labプリンターを選択し、ProcessでCyberPOP Default Settingsを選びます。"
  };
  const section = document.createElement("section");
  section.id = "print-settings";
  section.className = "print-settings section";
  section.dataset.language = language;
  section.innerHTML = `
    <div class="print-settings-hero">
      <div class="print-settings-intro">
        <p class="eyebrow">CYBERPOP / BAMBU STUDIO + ORCASLICER</p>
        <h2>CYBERPOP DEFAULT<br>PRINT SETTINGS.</h2>
        <p class="print-settings-lede">${d.description} One set of CyberPOP support parameters for both slicers. The downloadable preset currently inherits from the X1C system profile and is not universal across printers.</p>
      </div>
      <div class="cyberpop-default-downloads" aria-label="CyberPOP default profile downloads">
        <span class="download-note">0.20 MM · PLA · 0.4 MM NOZZLE</span>
        <a class="cyberpop-default-link" href="/downloads/Cyberpop_Default_Settings_Bambu.json" download="Cyberpop_Default_Settings_Bambu.json"><strong>BAMBU STUDIO</strong><span>${d.download} ↓</span></a>
        <a class="cyberpop-default-link" href="/downloads/Cyberpop_Default_Settings_Orca.json" download="Cyberpop_Default_Settings_Orca.json"><strong>ORCASLICER</strong><span>${d.download} ↓</span></a>
      </div>
    </div>
    <div class="cyberpop-default">
      <div class="cyberpop-default-heading">
        <p class="eyebrow">${d.eyebrow}</p>
        <h3>ONE PROFILE. TWO SLICERS.</h3>
        <p>${installNote[language] || installNote.en}</p>
      </div>
      <div class="cyberpop-default-specs">
        <span>0.20 MM LAYER</span>
        <span>TREE ORGANIC</span>
        <span>35° SUPPORT THRESHOLD</span>
        <span>0.24 MM TOP Z</span>
        <span>3 MM BASE PATTERN SPACING</span>
        <span>4 TOP INTERFACE LAYERS</span>
        <span>0.20 MM INTERFACE SPACING</span>
      </div>
    </div>
    <aside class="print-notice">
      <h3>BEFORE YOU PRINT</h3>
      <p>Always check the sliced Preview before printing. Supports are enabled in this profile; disable them on parts that do not need supports. Keep the correct filament preset for your material.</p>
    </aside>
  `;
  return section;
}

function syncPrintSettingsLanguage(language = currentLanguage()) {
  const link = document.querySelector('.hero .actions [data-print-settings-nav="true"]');
  if (link && link.dataset.language !== language) {
    link.dataset.language = language;
    link.textContent = "PRINT SETTINGS ↓";
  }
  const section = document.getElementById("print-settings");
  if (section && section.dataset.language !== language) section.replaceWith(createPrintSettingsSection(language));
}

function installPrintSettings() {
  const actions = document.querySelector(".hero .actions");
  if (!actions) return false;
  const language = currentLanguage();
  if (!actions.querySelector('[data-print-settings-nav="true"]')) {
    const link = document.createElement("a");
    link.className = "button print-settings-nav";
    link.href = "#print-settings";
    link.dataset.printSettingsNav = "true";
    link.dataset.language = language;
    link.textContent = "PRINT SETTINGS ↓";
    actions.appendChild(link);
  }
  if (!document.getElementById("print-settings")) {
    const anchor = document.querySelector(".quick-links") || document.querySelector("footer");
    if (anchor) anchor.insertAdjacentElement("beforebegin", createPrintSettingsSection(language));
  }
  const select = document.querySelector(".language-select select");
  if (select && !select.dataset.printSettingsBound) {
    select.dataset.printSettingsBound = "true";
    select.addEventListener("change", event => requestAnimationFrame(() => syncPrintSettingsLanguage(event.target.value)));
  }
  syncPrintSettingsLanguage(language);
  if (location.hash === "#print-settings") requestAnimationFrame(() => document.getElementById("print-settings")?.scrollIntoView());
  return true;
}

let installQueued = false;
const observer = new MutationObserver(() => {
  if (installQueued) return;
  installQueued = true;
  requestAnimationFrame(() => {
    installQueued = false;
    installPrintSettings();
  });
});
observer.observe(document.documentElement, { childList: true, subtree: true });
installPrintSettings();
