const connections: { [tabId: number]: chrome.runtime.Port } = {};

chrome.runtime.onConnect.addListener(port => {
  if (port.name !== 'origo-devtools-panel') return;

  const extensionListener = (message: any) => {
    // The original connection event doesn't include the tab ID of the
    // DevTools page, so we need to send it explicitly.
    if (message.name === 'init') {
      const tabId = message.tabId;
      if (tabId != null) {
        if (connections[tabId]) {
          connections[tabId].disconnect();
        }
        connections[tabId] = port;
      }
      return;
    }

    // Relay message to content script
    if (message.tabId != null && message.data !== undefined) {
      chrome.tabs.sendMessage(message.tabId, message.data).catch(err => {
        console.warn(`Could not send message to tab ${message.tabId}:`, err);
      });
    }
  };

  // Listen to messages sent from the DevTools page
  port.onMessage.addListener(extensionListener);

  port.onDisconnect.addListener(port => {
    port.onMessage.removeListener(extensionListener);

    const tabs = Object.keys(connections);
    for (let i = 0, len = tabs.length; i < len; i++) {
      if (connections[parseInt(tabs[i])] === port) {
        delete connections[parseInt(tabs[i])];
        break;
      }
    }
  });
});

// Receive message from content script and relay to the devTools page for the current tab
chrome.runtime.onMessage.addListener((request, sender) => {
  // Messages from content scripts should have sender.tab set
  if (sender.tab && sender.tab.id != null) {
    const tabId = sender.tab.id;
    if (tabId in connections) {
      connections[tabId].postMessage(request);
    } else {
      console.log('Tab not found in connection list.');
    }
  } else {
    console.log('sender.tab not defined.');
  }
});
