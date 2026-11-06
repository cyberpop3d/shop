// CyberPOP print parameters stay constant; machine-specific parameters are inherited
// from the matching official Bambu Studio 0.20mm Standard system preset.
const cyberpopBambuProfiles = [
  {
    "id": "X1C_X1_X1E_P1S",
    "label": "X1C / X1 / X1E / P1S",
    "parent": "0.20mm Standard @BBL X1C",
    "printers": [
      "Bambu Lab X1 Carbon 0.4 nozzle",
      "Bambu Lab X1 0.4 nozzle",
      "Bambu Lab P1S 0.4 nozzle",
      "Bambu Lab X1E 0.4 nozzle"
    ]
  },
  {
    "id": "P1P",
    "label": "P1P",
    "parent": "0.20mm Standard @BBL P1P",
    "printers": [
      "Bambu Lab P1P 0.4 nozzle"
    ]
  },
  {
    "id": "A1",
    "label": "A1",
    "parent": "0.20mm Standard @BBL A1",
    "printers": [
      "Bambu Lab A1 0.4 nozzle"
    ]
  },
  {
    "id": "A1_mini",
    "label": "A1 mini",
    "parent": "0.20mm Standard @BBL A1M",
    "printers": [
      "Bambu Lab A1 mini 0.4 nozzle"
    ]
  },
  {
    "id": "P2S",
    "label": "P2S",
    "parent": "0.20mm Standard @BBL P2S",
    "printers": [
      "Bambu Lab P2S 0.4 nozzle"
    ]
  },
  {
    "id": "H2S",
    "label": "H2S",
    "parent": "0.20mm Standard @BBL H2S",
    "printers": [
      "Bambu Lab H2S 0.4 nozzle"
    ]
  },
  {
    "id": "H2D",
    "label": "H2D",
    "parent": "0.20mm Standard @BBL H2D",
    "printers": [
      "Bambu Lab H2D 0.4 nozzle"
    ]
  },
  {
    "id": "H2D_Pro",
    "label": "H2D Pro",
    "parent": "0.20mm Standard @BBL H2DP",
    "printers": [
      "Bambu Lab H2D Pro 0.4 nozzle"
    ]
  },
  {
    "id": "H2C",
    "label": "H2C",
    "parent": "0.20mm Standard @BBL H2C",
    "printers": [
      "Bambu Lab H2C 0.4 nozzle"
    ]
  },
  {
    "id": "X2D",
    "label": "X2D",
    "parent": "0.20mm Standard @BBL X2D",
    "printers": [
      "Bambu Lab X2D 0.4 nozzle"
    ]
  },
  {
    "id": "A2L",
    "label": "A2L",
    "parent": "0.20mm Standard @BBL A2L",
    "printers": [
      "Bambu Lab A2L 0.4 nozzle"
    ]
  },
  {
    "id": "H3C",
    "label": "H3C",
    "parent": "0.20mm Standard @BBL H3C",
    "printers": [
      "Bambu Lab H3C 0.4 nozzle"
    ]
  }
];
const cyberpopBambuOverrides = {
  "from": "User",
  "version": "2.7.0.8",
  "layer_height": "0.2",
  "enable_support": "1",
  "support_type": "tree(auto)",
  "support_style": "tree_organic",
  "support_threshold_angle": "35",
  "support_top_z_distance": "0.24",
  "support_base_pattern_spacing": "3",
  "support_interface_top_layers": "4",
  "support_interface_spacing": "0.2"
};

function downloadCyberpopBambuProfile(profileId, slicer = 'Bambu') {
  const selected = cyberpopBambuProfiles.find(profile => profile.id === profileId);
  if (!selected) return;
  if (slicer === 'Orca' && selected.id === 'H3C') {
    window.alert('An H3C process preset is not included in the checked OrcaSlicer profile registry. Please choose Bambu Studio or check for an OrcaSlicer update.');
    return;
  }
  const name = 'CyberPOP Default Settings - ' + selected.id.replaceAll('_', ' ');
  const data = { ...cyberpopBambuOverrides, version: slicer === 'Orca' ? '2.3.0.0' : cyberpopBambuOverrides.version, inherits: selected.parent, name, print_settings_id: name, compatible_printers: selected.printers };
  const content = JSON.stringify(data, null, 2) + '\n';
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'CyberPOP_Default_Settings_' + (slicer === 'Orca' ? 'Orca_' : '') + selected.id + '_0.4mm.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.addEventListener('click', event => {
  const bambuButton = event.target.closest?.('[data-cyberpop-bambu-download]');
  const orcaButton = event.target.closest?.('[data-cyberpop-orca-download]');
  if (!bambuButton && !orcaButton) return;
  downloadCyberpopBambuProfile(document.getElementById('cyberpop-bambu-printer')?.value || 'X1C_X1_X1E_P1S', orcaButton ? 'Orca' : 'Bambu');
});
const cyberpopDefaultLabels = {
  en: {eyebrow:"START HERE · RECOMMENDED",title:"CyberPOP Default Print Settings",description:"The Cyberpop starting profile for 0.20 mm PLA prints. Organic tree supports, 35° threshold and easy-to-remove interfaces.",download:"DOWNLOAD PROFILE",hint:"Choose a compatible Bambu Lab 0.4 mm nozzle printer. Import with File → Import → Import Configs."},
  tr: {eyebrow:"BURADAN BAŞLA · ÖNERİLEN",title:"CyberPOP Default Print Settings",description:"0,20 mm PLA baskılar için Cyberpop başlangıç profili. Organic tree support, 35° threshold ve kolay sökülebilen ara yüzeyler.",download:"PROFİLİ İNDİR",hint:"0,4 mm nozullu uyumlu Bambu Lab yazıcısı seç. File → Import → Import Configs ile içe aktar."},
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
    en: "Download the JSON for your slicer, then use File → Import → Import Configs. Select a compatible Bambu Lab printer with a 0.4 mm nozzle and choose CyberPOP Default Settings under Process.",
    tr: "Kullandığın dilimleyici için JSON dosyasını indir ve File → Import → Import Configs üzerinden içe aktar. 0,4 mm nozullu uyumlu Bambu Lab yazıcı seçip Process bölümünde CyberPOP Default Settings profilini kullan.",
    pt: "Baixe o JSON do seu slicer e importe em File → Import → Import Configs. Escolha uma impressora Bambu Lab com bico de 0,4 mm e selecione CyberPOP Default Settings em Process.",
    es: "Descarga el JSON de tu laminador e impórtalo desde File → Import → Import Configs. Selecciona una impresora Bambu Lab con boquilla de 0,4 mm y el perfil CyberPOP Default Settings en Process.",
    de: "Lade die JSON-Datei für deinen Slicer herunter und importiere sie über File → Import → Import Configs. Wähle einen kompatiblen Bambu Lab Drucker mit 0,4-mm-Düse und CyberPOP Default Settings unter Process.",
    fr: "Téléchargez le JSON de votre slicer et importez-le via File → Import → Import Configs. Sélectionnez une imprimante Bambu Lab compatible avec buse de 0,4 mm, puis CyberPOP Default Settings dans Process.",
    it: "Scarica il JSON per il tuo slicer e importalo da File → Import → Import Configs. Seleziona una stampante Bambu Lab compatibile con ugello da 0,4 mm e CyberPOP Default Settings in Process.",
    pl: "Pobierz plik JSON dla swojego slicera i zaimportuj przez File → Import → Import Configs. Wybierz drukarkę Bambu Lab z dyszą 0,4 mm i profil CyberPOP Default Settings w Process.",
    ja: "使用するスライサー向けのJSONをダウンロードし、File → Import → Import Configsから読み込みます。0.4 mmノズルの対応Bambu Labプリンターを選択し、ProcessでCyberPOP Default Settingsを選びます。"
  };
  const bambuOptionsHtml = cyberpopBambuProfiles.map(profile => `<option value="${profile.id}">${profile.label}</option>`).join("");
  const section = document.createElement("section");
  section.id = "print-settings";
  section.className = "print-settings section";
  section.dataset.language = language;
  section.innerHTML = `
    <div class="print-settings-hero">
      <div class="print-settings-intro">
        <p class="eyebrow">CYBERPOP / BAMBU STUDIO + ORCASLICER</p>
        <h2>CYBERPOP DEFAULT<br>PRINT SETTINGS.</h2>
        <p class="print-settings-lede">${d.description} The same support settings, adapted to each Bambu printer. Choose your printer below before downloading.</p>
      </div>
      <div class="cyberpop-default-downloads" aria-label="CyberPOP default profile downloads">
        <span class="download-note">0.20 MM · PLA · 0.4 MM NOZZLE</span>
        <label for="cyberpop-bambu-printer" class="download-note" style="margin-top:8px">BAMBU LAB PRINTER · 0.4 MM NOZZLE</label>
        <select id="cyberpop-bambu-printer" style="width:100%;padding:14px 16px;border:1px solid var(--line);background:var(--paper);color:var(--carbon);font-family:inherit;font-size:14px;font-weight:700;cursor:pointer" aria-label="Choose Bambu printer">${bambuOptionsHtml}</select>
        <button type="button" data-cyberpop-bambu-download="true" class="cyberpop-default-link" style="width:100%;border:0;text-align:left;font-family:inherit;cursor:pointer"><strong>BAMBU STUDIO</strong><span>${d.download} ↓</span></button>
        <button type="button" data-cyberpop-orca-download="true" class="cyberpop-default-link" style="width:100%;border:0;text-align:left;font-family:inherit;cursor:pointer"><strong>ORCASLICER</strong><span>${d.download} ↓</span></button>
      </div>
    </div>
    <div class="cyberpop-default">
      <div class="cyberpop-default-heading">
        <p class="eyebrow">${d.eyebrow}</p>
        <h3>ONE STANDARD. MULTIPLE PRINTERS.</h3>
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
  if (section && section.dataset.language !== language) {
    const printer = document.getElementById("cyberpop-bambu-printer")?.value;
    section.replaceWith(createPrintSettingsSection(language));
    if (printer && document.getElementById("cyberpop-bambu-printer")) document.getElementById("cyberpop-bambu-printer").value = printer;
  }
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
