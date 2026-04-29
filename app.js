(() => {
  const installBtn = document.getElementById('install-btn');
  const statusEl = document.getElementById('status');
  const iosModal = document.getElementById('ios-modal');
  const modalClose = document.getElementById('modal-close');
  const toast = document.getElementById('toast');

  let deferredPrompt = null;

  const isIos = () => {
    const ua = window.navigator.userAgent;
    const iOSDevice = /iPad|iPhone|iPod/.test(ua);
    const iPadOSDesktopMode =
      ua.includes('Mac') && 'ontouchend' in document;
    return iOSDevice || iPadOSDesktopMode;
  };

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const showButton = () => {
    installBtn.hidden = false;
  };

  const hideButton = () => {
    installBtn.hidden = true;
  };

  const setStatus = (text, ok = false) => {
    statusEl.textContent = text;
    statusEl.classList.toggle('ok', ok);
  };

  const openModal = () => {
    iosModal.hidden = false;
  };

  const closeModal = () => {
    iosModal.hidden = true;
  };

  const showToast = (msg) => {
    toast.textContent = msg;
    toast.hidden = false;
    setTimeout(() => {
      toast.hidden = true;
    }, 2400);
  };

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('service-worker.js')
        .catch((err) => console.error('SW registration failed:', err));
    });
  }

  if (isStandalone()) {
    setStatus('Running as installed app', true);
    hideButton();
  } else if (isIos()) {
    setStatus('iOS detected — tap the button for install steps');
    showButton();
  } else {
    setStatus('Waiting for install prompt…');
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    setStatus('Ready to install', true);
    showButton();
  });

  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (choice.outcome !== 'accepted') {
        setStatus('Install dismissed — tap the button to try again');
        showButton();
      }
      return;
    }

    if (isIos()) {
      openModal();
      return;
    }

    setStatus('Use your browser menu → Install app');
    openModal();
  });

  modalClose.addEventListener('click', closeModal);
  iosModal.addEventListener('click', (e) => {
    if (e.target === iosModal) closeModal();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideButton();
    setStatus('Installed — open from your home screen', true);
    showToast('Installed!');
  });
})();
