// add-main.js
console.log('This is from the extension!');

// position:fixed;となっているすべての要素のpaddingを増やす
// 親要素が position: relative, absolute, fixed, sticky かどうかを再帰的に確認する関数
function hasPositionedAncestor(element) {
    if (element.parentNode instanceof Element) {
        let parentStyle = window.getComputedStyle(element.parentNode);
        if (parentStyle.position === "relative" || parentStyle.position === "absolute" || parentStyle.position === "fixed" || parentStyle.position === "sticky") {
            return true;
        } else {
            return hasPositionedAncestor(element.parentNode);
        }
    }
    return false;
}

document.querySelectorAll("*").forEach(function(element) {
    let style = window.getComputedStyle(element);
    let left = style.getPropertyValue('left');
    if((style.position === "fixed" || style.position === "sticky") && left !== 'auto'
    || (style.position === "absolute" && !hasPositionedAncestor(element))) {
        let currentPaddingLeft = parseInt(style.paddingLeft, 10);
        if (isNaN(currentPaddingLeft)) {
            currentPaddingLeft = 0;
        }
        let newPaddingLeft = currentPaddingLeft + 60;

        element.style.paddingLeft = newPaddingLeft + "px";
        element.classList.add('newPaddingLeft');  // class名を追加
    }
});

var styleElement = document.createElement('style');
styleElement.id = 'customStyle';  // 一意なidを設定

styleElement.innerHTML = `
    body {
        width: calc(100vw - 60px - 10px) !important;
        min-width: calc(100vw - 60px - 10px) !important;
        box-sizing: border-box !important;
        margin-left: 60px !important;
        background-position-x: calc(50% + 60px) !important;
    }
`;
document.head.appendChild(styleElement);