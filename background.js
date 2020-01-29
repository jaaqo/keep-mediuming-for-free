/**
 * Set initial icon state and start listening based on storage.
 */
chrome.runtime.onInstalled.addListener(function() {
  chrome.storage.sync.get(["kmff"], function(result) {
    setIcon(result.kmff)

    if (result.kmff) {
      listenToRequests()
    }
  });
});

/**
 * Set initial icon state and start listening based on storage.
 */
chrome.runtime.onStartup.addListener(function() {
  chrome.storage.sync.get(["kmff"], function(result) {
    setIcon(result.kmff)

    if (result.kmff) {
      listenToRequests()
    }
  });
});

/**
 * Cleanup on suspend
 */
chrome.runtime.onSuspend.addListener(function() {
  chrome.storage.sync.get(["kmff"], function(result) {
    stopListeningToRequests()
  });
});

/**
 * Change icon on click to indicate if the extension is on or not.
 */
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.storage.sync.get(["kmff"], function(result) {
    console.log("Extension icon clicked")
    const isActive = result.kmff
    const nextState = !isActive

    console.log("Currently: ", result.kmff ? "active": "inactive")
    console.log("Next state: ", nextState ? "active": "inactive")

    chrome.storage.sync.set({ kmff: nextState }, function() {
      setIcon(nextState)
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
      if (changes[key].newValue && !changes[key].oldValue) {
        listenToRequests()
      } else if (!changes[key].newValue && changes[key].oldValue) {
        stopListeningToRequests()
      }
    }
  }
});

function setIcon(isActive) {
  const icon = isActive ? "icons/m.png" : "icons/m2.png"
  chrome.browserAction.setIcon({
    path: icon
  });
}

function listenToRequests() {
  console.log("Adding listener");
  chrome.webRequest.onBeforeSendHeaders.addListener(
    removeUidFromCookies,
    { urls: ["*://medium.com/*", "*://*.medium.com/*"] },
    ["blocking", "requestHeaders", "extraHeaders"]
  );
}

function stopListeningToRequests() {
  console.log("Removing listener")
  chrome.webRequest.onBeforeSendHeaders.removeListener(
    removeUidFromCookies
  );
}

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
