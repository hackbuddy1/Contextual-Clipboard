document.addEventListener('copy', async (e) => {
  let copiedText = '';
  if (window.getSelection) {
    copiedText = window.getSelection().toString();
  }
  if (copiedText.trim().length > 0) {
    const pageTitle = document.title;
    const pageUrl = window.location.href;
    const time = new Date().toLocaleString();

    // Type detection
    let type = 'text';
    if (/^https?:\/\//.test(copiedText.trim())) type = 'url';
    else if (/function\s|\=\>|\{|\}/.test(copiedText.trim())) type = 'code';

    chrome.runtime.sendMessage({
      type: 'SAVE_CLIPBOARD',
      data: {
        text: copiedText,
        title: pageTitle,
        url: pageUrl,
        time: time,
        note: "",
        pinned: false,
        type: type
      }
    });
  }
});
document.addEventListener('paste', function(e) {
  const items = (e.clipboardData || window.clipboardData).items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      const blob = items[i].getAsFile();
      const reader = new FileReader();
      reader.onload = function(event) {
        const pageTitle = document.title;
        const pageUrl = window.location.href;
        const time = new Date().toLocaleString();
        chrome.runtime.sendMessage({
          type: 'SAVE_CLIPBOARD',
          data: {
            text: "[Screenshot]",
            title: pageTitle,
            url: pageUrl,
            time: time,
            note: "",
            pinned: false,
            type: "image",
            image: event.target.result // base64 image
          }
        });
      };
      reader.readAsDataURL(blob);
      e.preventDefault();
      break;
    }
  }
});