$(".canto-letter-button").click(function () {
    $("#message-area").append("<img class='canto-letter-svg-small' src='./assets/cantobet-svg-files/bolong.svg' alt='bolong' value='[1]'>");
});

$("#backspace-button").click(function () {
    $("#message-area img:last-child").remove();
});

$("#space-button").click(function () {
    $("#message-area").append("&nbsp;");
});

$("#encode-button").click(function () {
    $("#message-area img").each(function (index) {
        $("#encode-output").append(($(this).attr("value")));
    });
});

$("#decode-button").click(function () {
    var encodedText = $("#encode-output").val();
    $("#decoded-message-area").append(encodedText);
});

// Create JavaScript object. The Key is equal to the encode string, and the value is the associated SVG file.
// Add 45 placeholder values to the JS object.
// Add SVG characters on a rolling basis.

// var cantobet = {
//     "[1]": "bolong.svg",
//     "[..]": "xxxxxx.svg",
//     "[46]": "xxxxxx.svg",
// };