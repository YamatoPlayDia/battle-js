document.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        console.log("Sending message", {url: event.currentTarget.href});
        window.parent.postMessage({url: event.currentTarget.href}, '*');
    });
});

document.getElementById('yourButtonId').addEventListener('click', function(event) {
    event.preventDefault(); // 適切にイベントを処理するために、ブラウザのデフォルトのアクションを防ぎます
    const message = { type: 'FROM_PAGE', action: 'setAlarm' };
    console.log('Sending message from button:', message);
    window.parent.postMessage(message, '*');
    console.log('Sending message from button2:', message);
});

window.addEventListener('message', function(event) {
    if (typeof event.data === 'object' && event.data.type === 'FROM_PAGE' && event.data.action === 'updateAlarmTime') {
        console.log('Received message', event.data);
        let currentTime = Date.now();
        let remainingTime = event.data.alarmTime - currentTime;
        remainingTime = Math.floor(remainingTime / (60 * 1000));  // convert to minutes
        document.getElementById('remainingTime').textContent = remainingTime + "m";
    }
}, false);