const icons = {
  text: "📄",
  url: "🔗",
  code: "💻",
  image: "🖼️"
};

function renderClipboard(items, searchQuery = "") {
  const listDiv = document.getElementById('clipboard-list');
  listDiv.innerHTML = '';

  // Search filter
  let filtered = items.filter(item =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.note && item.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.url && item.url.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pinned items on top
  filtered.sort((a, b) => (b.pinned === true) - (a.pinned === true));

  if (filtered.length === 0) {
    listDiv.innerHTML = '<p class="no-items">No items found!</p>';
    return;
  }

  filtered.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'clip-item';
      // Agar item.image hai toh image tag banao
  let imageHTML = '';
  if (item.image) {
    imageHTML = `<img src="${item.image}" alt="Screenshot" class="clip-image">`;
  }

      div.innerHTML = `
    ${item.image ? `<img src="${item.image}" alt="Screenshot" class="clip-image" style="max-width:100%;margin-bottom:8px;border-radius:8px;box-shadow:0 2px 8px #0004;">` : ""}${icons[item.type] || "📄"}</span>
      <span class="clip-main-text">${item.text}</span>
    </div>
    <div class="clip-meta">
      <span>${item.title}</span> |
      <a href="${item.url}" target="_blank">Source</a> |
      <span>${item.time}</span>
    </div>
    <input class="note-input" type="text" placeholder="Add note..." value="${item.note || ""}" data-index="${index}" />
    <div class="buttons-container">
      <button class="copy-btn">Copy</button>
      <button class="pin-btn${item.pinned ? ' pinned' : ''}">${item.pinned ? "★" : "☆"} Pin</button>
      <button class="delete-btn">Delete</button>
    </div>
  `;


    // Copy button
    div.querySelector('.copy-btn').onclick = () => {
      navigator.clipboard.writeText(item.text);
    };

    // Pin/Unpin button
    div.querySelector('.pin-btn').onclick = () => {
      chrome.storage.local.get({clipboard: []}, (result) => {
        let arr = result.clipboard;
        // Find the correct item (by text and time, to avoid index mismatch after search/filter)
        let idx = arr.findIndex(x => x.text === item.text && x.time === item.time);
        if (idx > -1) {
          arr[idx].pinned = !arr[idx].pinned;
          chrome.storage.local.set({clipboard: arr}, () => renderClipboard(arr, document.getElementById('search-bar').value));
        }
      });
    };

    // Delete button
    div.querySelector('.delete-btn').onclick = () => {
      chrome.storage.local.get({clipboard: []}, (result) => {
        let arr = result.clipboard;
        // Find the correct item (by text and time)
        let idx = arr.findIndex(x => x.text === item.text && x.time === item.time);
        if (idx > -1) {
          arr.splice(idx, 1);
          chrome.storage.local.set({clipboard: arr}, () => renderClipboard(arr, document.getElementById('search-bar').value));
        }
      });
    };

    // Note input
    div.querySelector('.note-input').onpaste = function(e) {
  const items = (e.clipboardData || window.clipboardData).items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      const blob = items[i].getAsFile();
      const reader = new FileReader();
      reader.onload = function(event) {
        // Save image as base64 in clipboard item
        chrome.storage.local.get({clipboard: []}, (result) => {
          let arr = result.clipboard;
          let idx = arr.findIndex(x => x.text === item.text && x.time === item.time);
          if (idx > -1) {
            arr[idx].image = event.target.result; // base64 image
            chrome.storage.local.set({clipboard: arr}, () => renderClipboard(arr, document.getElementById('search-bar').value));
          }
        });
      };
      reader.readAsDataURL(blob);
      e.preventDefault();
      break;
    }
  }
};

    listDiv.appendChild(div);
  });
}

// Initial render
chrome.storage.local.get({clipboard: []}, (result) => {
  renderClipboard(result.clipboard);
});

// Search event
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('paste-catcher').focus();
});

document.getElementById('paste-catcher').addEventListener('paste', function(e) {
  const items = (e.clipboardData || window.clipboardData).items;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf("image") !== -1) {
      const blob = items[i].getAsFile();
      const reader = new FileReader();
      reader.onload = function(event) {
        const pageTitle = "Screenshot";
        const pageUrl = "";
        const time = new Date().toLocaleString();
        chrome.storage.local.get({clipboard: []}, (result) => {
          const clipboard = result.clipboard;
          clipboard.unshift({
            text: "[Screenshot]",
            title: pageTitle,
            url: pageUrl,
            time: time,
            note: "",
            pinned: false,
            type: "image",
            image: event.target.result
          });
          chrome.storage.local.set({clipboard: clipboard.slice(0, 100)}, () => {
            renderClipboard(clipboard, document.getElementById('search-bar').value);
          });
        });
      };
      reader.readAsDataURL(blob);
      e.preventDefault();
      break;
    }
  }
});
