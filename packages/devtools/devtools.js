chrome.devtools.panels.create('Origo', '', 'panel.html', function (panel) {
  if (!panel) {
    console.error(
      'Origo panel creation failed. chrome.runtime.lastError:',
      chrome.runtime.lastError
    );
    return;
  }
  console.log('Origo panel created');
});
