// add-header.js
console.log('That is from the extension!');

var elementToRemove = document.getElementById('tr-sidebar');
if(elementToRemove) {
    elementToRemove.parentNode.removeChild(elementToRemove);
}
var styleElement = document.getElementById('customStyle');  // idを使って要素を選択
if (styleElement) {
    styleElement.remove();  // 要素を削除
}
document.querySelectorAll(".newPaddingLeft").forEach(function(element) {  // '.newPaddingLeft' のクラス名を持つ要素を全て選択
    let currentPaddingLeft = parseInt(window.getComputedStyle(element).paddingLeft, 10);
    if (!isNaN(currentPaddingLeft)) {  // パディングが設定されている場合
        let newPaddingLeft = currentPaddingLeft - 60;  // パディングを30px減らす

        // 新しいパディングを適用
        element.style.paddingLeft = newPaddingLeft + "px";
    }
    element.classList.remove('newPaddingLeft');  // class名を削除
});


$('*').each(function() {
    let $element = $(this);

    // 条件に一致するか確認
    if ($element.css('position') === 'fixed' || $element.css('position') === 'sticky') {
        let hiddenLeft = $element.css('left');
        // スタイルを設定
        $element.css('left', hiddenLeft);
    }
});