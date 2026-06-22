import { runExtensionTask } from "../shared/extension-lifecycle";

chrome.action.onClicked.addListener((tab) => {
  if (tab.id == null) {
    return;
  }

  runExtensionTask(() => chrome.tabs.sendMessage(tab.id as number, { type: "rk:translate-page" }));
});
