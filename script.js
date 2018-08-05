$(".canto-letter-button").click(function () {
    $("#message-area").append("<img class='canto-letter-svg-small' src='./assets/cantobet-svg-files/bolong.svg' alt='bolong'>");
});

$("#backspace-button").click(function () {
    $("#message-area img:last-child").remove();
});