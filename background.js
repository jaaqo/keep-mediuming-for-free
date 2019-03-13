/**
 * Set initial icon state based on storage.
 */
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get(["kmff"], function(result) {
    const icon = result.kmff ? "icons/m2.png" : "icons/m.png";
    chrome.browserAction.setIcon({
      path: icon
    });
  });
});

/**
 * Change icon on click to indicate if the extension is on or not.
 */
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.storage.sync.get(["kmff"], function(result) {
    const isActive = result.kmff;
    const nextState = !isActive;
    const nextIcon = nextState ? "icons/m2.png" : "icons/m.png";

    chrome.storage.sync.set({ kmff: nextState }, function() {
      chrome.browserAction.setIcon({
        path: nextIcon
      });
    });
  });
});

/**
 * Listen to the storage change event and add or remove listeners for webRequests just before headers are sent.
 * If it's a medium url, remove a specific cookie 'uid' from the cookies string.
 */
chrome.storage.onChanged.addListener(function(changes, namespace) {
  for (key in changes) {
    if (key === "kmff") {
      if (changes[key].newValue) {
        chrome.webRequest.onBeforeSendHeaders.addListener(
          removeUidFromCookies,
          { urls: ["*://medium.com/*", "*://*.medium.com/*"] },
          ["blocking", "requestHeaders", "extraHeaders"]
        );
      } else {
        chrome.webRequest.onBeforeSendHeaders.removeListener(
          removeUidFromCookies
        );
      }
    }
  }
});

function removeUidFromCookies(details) {
  for (var i = 0; i < details.requestHeaders.length; ++i) {
    if (details.requestHeaders[i].name === "Cookie") {
      details.requestHeaders[i].value = details.requestHeaders[i].value.replace(
        / uid=.+;/,
        ""
      );
      break;
    }
  }
  return { requestHeaders: details.requestHeaders };
}
