import {initChrome} from '/site.js';

const plans = {
  'monthly-drop': {
    name: 'Monthly Drop',
    price: '$20',
    message: "Hi CyberPop3D, I'd like to purchase the Monthly Drop ($20) for the current month. Could you please share the payment details?"
  },
  'past-collections': {
    name: 'Past Collection',
    price: '$30 / month',
    message: "Hi CyberPop3D, I'd like to purchase a Past Collection ($30 per archive month). Could you help me choose the month and arrange payment?"
  },
  'six-month': {
    name: '6 Month Access',
    price: '$100',
    message: "Hi CyberPop3D, I'd like to purchase 6 Month Access ($100) for six upcoming monthly collections. Could you please share the payment details?"
  },
  'annual-plus-3': {
    name: 'Annual Access',
    price: '$200',
    message: "Hi CyberPop3D, I'd like to purchase Annual Access ($200), including twelve upcoming monthly collections and three selected past collections. Could you please share the payment details?"
  }
};

const optionButtons = [...document.querySelectorAll('[data-package]')];
const preview = document.querySelector('#dmMessagePreview');
const summary = document.querySelector('#dmSelectedPackage');
const status = document.querySelector('#dmCopyStatus');
const copyOnly = document.querySelector('#copyDmOnly');
const copyAndOpen = document.querySelector('#copyOpenInstagram');
const manualLink = document.querySelector('.dm-manual-link');
let selected = null;

// Meta's ig.me links are intended for mobile Instagram; on desktop, open the
// studio profile so the customer can choose Message after signing in.
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const instagramUrl = isMobile
  ? 'https://ig.me/m/cyberpop3d'
  : 'https://www.instagram.com/cyberpop3d/';

if (manualLink) {
  manualLink.href = instagramUrl;
  if (!isMobile) manualLink.textContent = 'Open Instagram profile without copying ↗';
}

function choosePackage(slug) {
  if (!Object.hasOwn(plans, slug) || slug === selected) return;
  selected = slug;
  const plan = plans[slug];
  optionButtons.forEach(button => {
    const active = button.dataset.package === slug;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  });
  summary.textContent = plan.name + ' — ' + plan.price;
  preview.value = plan.message;
  status.textContent = '';

  // Keep the selected package if the customer returns from Instagram.
  const url = new URL(window.location.href);
  url.searchParams.set('package', slug);
  history.replaceState(null, '', url.pathname + url.search + url.hash);
}

function selectAndCopyLegacy() {
  preview.focus();
  preview.select();
  preview.setSelectionRange(0, preview.value.length);
  try {
    return Boolean(document.execCommand('copy'));
  } catch (_) {
    return false;
  }
}

async function copyMessage() {
  if (!preview.value.trim()) {
    status.textContent = 'Enter a message before continuing.';
    preview.focus();
    return false;
  }
  let copied = false;
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(preview.value);
      copied = true;
    } catch (_) {}
  }
  if (!copied) copied = selectAndCopyLegacy();
  if (!copied) {
    status.textContent = 'Automatic copying is unavailable. Select and copy the message above, then open Instagram using the link below.';
    preview.focus();
    preview.select();
    return false;
  }
  status.textContent = 'Message copied. Paste it into the Instagram chat; only you can send it.';
  return true;
}

optionButtons.forEach(button => button.addEventListener('click', () => choosePackage(button.dataset.package)));
copyOnly.addEventListener('click', async () => {
  if (await copyMessage()) copyOnly.textContent = 'COPIED';
});
copyAndOpen.addEventListener('click', async () => {
  if (!(await copyMessage())) return;
  // Never send a DM automatically. Instagram does not support pre-filled
  // ig.me text parameters: the visitor pastes and presses Send themselves.
  window.location.assign(instagramUrl);
});

const requested = new URLSearchParams(window.location.search).get('package');
choosePackage(Object.hasOwn(plans, requested) ? requested : 'monthly-drop');
initChrome().catch(console.error);
