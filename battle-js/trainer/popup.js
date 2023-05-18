const iframe = document.getElementById("iframe");

document.getElementById("signin").onclick = () => {
  chrome.identity.getAuthToken({ interactive: true }, token => {
    console.log(token);
    if (token != null) {
      iframe.contentWindow.postMessage(token, "*");
    }
  });
}

// window.addEventListener('message', (event) => {
//   console.log('Received message:', event.data);
//   chrome.tabs.create({url: event.data.url});
// });