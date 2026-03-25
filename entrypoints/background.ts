export default defineBackground(() => {
  // Mở sidebar khi click icon extension
  browser.action.onClicked.addListener((tab) => {
    browser.sidePanel.open({ windowId: tab.windowId });
  });
});
