// Inject the script into the main world
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
(document.head || document.documentElement).appendChild(script);
script.onload = () => {
  script.remove();
};

// Relay messages from background to injected script
chrome.runtime.onMessage.addListener(message => {
  window.postMessage(
    {
      source: 'origo-devtools-content-script',
      payload: message,
    },
    '*'
  );
  // Return true to indicate we will respond asynchronously, though in this architecture
  // we actually just send messages back to the background script rather than using the callback
  return true;
});

// Relay messages from injected script to background
window.addEventListener('message', event => {
  if (event.source !== window || !event.data || event.data.source !== 'origo-devtools-injected') {
    return;
  }

  chrome.runtime.sendMessage(event.data);
});
