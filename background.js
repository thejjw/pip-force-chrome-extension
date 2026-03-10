/*
 * PiP Force - background.js
 * SPDX-License-Identifier: zlib-acknowledgement
 * Copyright (c) 2026 @thejjw
*/

const ICON_DEFAULT = {
  16: "icons/icon16.png",
  48: "icons/icon48.png",
  128: "icons/icon128.png",
};

const ICON_ACTIVE = {
  16: "icons-active/icon16.png",
  48: "icons-active/icon48.png",
  128: "icons-active/icon128.png",
};

// Toggle PiP: exit in MAIN world if active, otherwise inject pip.js to enable
async function injectPiP(tabId) {
  // Step A — Try to exit PiP in MAIN world (allFrames for iframe videos)
  const exitResults = await chrome.scripting.executeScript({
    target: { tabId, allFrames: true },
    world: "MAIN",
    func: () => {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
        return true;
      }
      return false;
    },
  });
  const wasInPiP = exitResults.some((r) => r.result === true);

  // Step B — PiP was active: stop the watcher and reset icon
  if (wasInPiP) {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: () => { window.__pipForceWatching = false; },
    });
    chrome.action.setIcon({ tabId, path: ICON_DEFAULT });
    return;
  }

  // Step C — PiP was not active: inject pip.js to enable it
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    files: ["pip.js"],
  });

  const isActive = results?.[0]?.result;
  chrome.action.setIcon({
    tabId,
    path: isActive ? ICON_ACTIVE : ICON_DEFAULT,
  });
}

// Handle icon updates from the watcher (auto-resume notifications)
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (sender.tab && msg.pipActive !== undefined) {
    chrome.action.setIcon({
      tabId: sender.tab.id,
      path: msg.pipActive ? ICON_ACTIVE : ICON_DEFAULT,
    });
  }
});

// Activate PiP when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => injectPiP(tab.id));

// Activate PiP from the right-click context menu
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "pip-force") injectPiP(tab.id);
});

// Register context menu entry on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "pip-force",
    title: "PiP Force",
    contexts: ["page", "video"],
  });
});
