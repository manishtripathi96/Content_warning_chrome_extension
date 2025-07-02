document.getElementById("toggleFilter").addEventListener("click", () => {
  chrome.storage.sync.get("filterEnabled", (data) => {
    const isOn = !data.filterEnabled;
    chrome.storage.sync.set({ filterEnabled: isOn }, () => {
      alert("Filter turned " + (isOn ? "ON" : "OFF") + ". Reload the page to see changes.");
    });
  });
});
