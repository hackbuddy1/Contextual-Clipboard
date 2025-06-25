chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SAVE_CLIPBOARD') {
    chrome.storage.local.get({clipboard: []}, (result) => {
      const clipboard = result.clipboard;
      clipboard.unshift(msg.data); // Add new item at the start
      chrome.storage.local.set({clipboard: clipboard.slice(0, 100)}); // Max 100 items
    });
  }
});
