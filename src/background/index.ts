chrome.action.onClicked.addListener((tab) => {
  if (tab.id == null) {
    return;
  }

  void chrome.tabs.sendMessage(tab.id, { type: "rk:translate-page" });
});
