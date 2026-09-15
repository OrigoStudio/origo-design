// Inject the script into the main world
const root = document.head || document.documentElement;
if (root) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  root.appendChild(script);
  script.onload = () => {
    script.remove();
  };
}

// Relay messages from background to injected script
chrome.runtime.onMessage.addListener(message => {
  window.postMessage(
    {
      source: 'origo-devtools-content-script',
      payload: message,
    },
    window.location.origin
  );
  // We do not return true here because we are not using sendResponse for async replies;
  // instead we rely on injected.ts sending a separate postMessage back.
});

// Relay messages from injected script to background
window.addEventListener('message', event => {
  if (
    event.source !== window ||
    event.origin !== window.location.origin ||
    !event.data ||
    event.data.source !== 'origo-devtools-injected'
  ) {
    return;
  }

  try {
    if (chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage(event.data);
    }
  } catch (e) {
    console.warn('Origo DevTools Extension context invalidated:', e);
  }
});
