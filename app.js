(() => {
  const installBtn = document.getElementById('install-btn');
  const modal = document.getElementById('install-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalIntro = document.getElementById('modal-intro');
  const modalSteps = document.getElementById('modal-steps');
  const modalClose = document.getElementById('modal-close');
  const toast = document.getElementById('toast');
  const tabs = document.querySelectorAll('.tab-btn');
  const pages = document.querySelectorAll('.page');

  let deferredPrompt = null;

  const ua = window.navigator.userAgent;

  const detectPlatform = () => {
    const isIos = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
    if (isIos) return 'ios';
    if (/SamsungBrowser/i.test(ua)) return 'samsung';
    if (/Firefox/i.test(ua)) return 'firefox';
    if (/Android/i.test(ua)) return 'android';
    return 'desktop';
  };

  const INSTRUCTIONS = {
    ios: {
      title: 'Install on iPhone / iPad',
      intro: 'iOS Safari can\'t install via a button — use the Share menu:',
      steps: [
        'Tap the <strong>Share</strong> button in the Safari toolbar.',
        'Scroll and tap <strong>Add to Home Screen</strong>.',
        'Tap <strong>Add</strong> in the top-right corner.',
      ],
    },
    samsung: {
      title: 'Install on Samsung Internet',
      intro: 'The browser didn\'t offer a one-tap install (already installed, or not yet eligible). Use the menu:',
      steps: [
        'Tap the menu button (<strong>≡</strong>) at the bottom-right.',
        'Tap <strong>Add page to</strong>.',
        'Tap <strong>Home screen</strong>, then <strong>Add</strong>.',
      ],
    },
    android: {
      title: 'Install on Android',
      intro: 'The browser didn\'t offer a one-tap install. Use the menu:',
      steps: [
        'Tap the menu (<strong>⋮</strong>) at the top-right.',
        'Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.',
        'Confirm <strong>Install</strong>.',
      ],
    },
    firefox: {
      title: 'Install from Firefox',
      intro: 'Firefox doesn\'t support installable PWAs on desktop. On Android Firefox, use the menu:',
      steps: [
        'Tap the menu (<strong>⋮</strong>).',
        'Tap <strong>Install</strong> or <strong>Add to Home screen</strong>.',
      ],
    },
    desktop: {
      title: 'Install this app',
      intro: 'Use your browser\'s install option:',
      steps: [
        'Look for the install icon (<strong>⊕</strong> or a small monitor icon) in the address bar.',
        'Or open the browser menu and choose <strong>Install …</strong> / <strong>Apps → Install this site as an app</strong>.',
      ],
    },
  };

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const showButton = () => { installBtn.hidden = false; };
  const hideButton = () => { installBtn.hidden = true; };

  const openModal = () => {
    const data = INSTRUCTIONS[detectPlatform()] || INSTRUCTIONS.desktop;
    modalTitle.textContent = data.title;
    modalIntro.innerHTML = data.intro;
    modalSteps.innerHTML = data.steps.map((s) => `<li>${s}</li>`).join('');
    modal.hidden = false;
  };

  const closeModal = () => { modal.hidden = true; };

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.hidden = false;
    setTimeout(() => { toast.hidden = true; }, 2400);
  };

  const switchTab = (name) => {
    tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.tab === name));
    pages.forEach((p) => p.classList.toggle('is-active', p.dataset.page === name));
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('service-worker.js')
        .catch((err) => console.error('SW registration failed:', err));
    });
  }

  console.info('[PWA] platform =', detectPlatform(), '| standalone =', isStandalone());

  if (isStandalone()) {
    hideButton();
  } else {
    showButton();
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    console.info('[PWA] beforeinstallprompt fired — native install available');
    e.preventDefault();
    deferredPrompt = e;
    showButton();
  });

  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      console.info('[PWA] install choice:', choice.outcome);
      deferredPrompt = null;
      if (choice.outcome !== 'accepted') showButton();
      return;
    }
    openModal();
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('appinstalled', () => {
    console.info('[PWA] appinstalled');
    deferredPrompt = null;
    hideButton();
    showToast('Installed!');
  });
})();
