(() => {
  const installBtn = document.getElementById('install-btn');
  const iosModal = document.getElementById('ios-modal');
  const modalClose = document.getElementById('modal-close');
  const toast = document.getElementById('toast');
  const tabs = document.querySelectorAll('.tab-btn');
  const pages = document.querySelectorAll('.page');

  let deferredPrompt = null;

  const isIos = () => {
    const ua = window.navigator.userAgent;
    const iOSDevice = /iPad|iPhone|iPod/.test(ua);
    const iPadOSDesktopMode = ua.includes('Mac') && 'ontouchend' in document;
    return iOSDevice || iPadOSDesktopMode;
  };

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const showButton = () => { installBtn.hidden = false; };
  const hideButton = () => { installBtn.hidden = true; };
  const openModal = () => { iosModal.hidden = false; };
  const closeModal = () => { iosModal.hidden = true; };

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

  if (isStandalone()) {
    hideButton();
  } else {
    showButton();
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showButton();
  });

  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (choice.outcome !== 'accepted') showButton();
      return;
    }
    openModal();
  });

  modalClose.addEventListener('click', closeModal);
  iosModal.addEventListener('click', (e) => {
    if (e.target === iosModal) closeModal();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideButton();
    showToast('Installed!');
  });
})();
