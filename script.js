primary_direction = "top to bottom"; //can be bottom to top, left to right, right to left
secondary_direction = "right to left";

canvas_width = 0; //Not sure what these values should be
canvas_height = 0;


$('.canto-letter-button').click(
    function(){
        var letter_value = $(this).attr('value');
        render(letter_value);
    }
);

function render(letter_value){
    //1-37 = letters
    //38-44 = tonal symbols
    //45 - short indicator
    //46 - saliva symbol

    var new_letter = document.createElement('img');
    new_letter.src = 'assets/cantobet-svg-files/' + letter_value + '.svg';
    new_letter.setAttribute('class', 'letter');

    document.getElementById("message-area").offsetWidth;

    $('#message-area').append(new_letter);
    console.log($('#message-area').width());
    console.log($('#message-area').height());
    cursor_location= {}
}


// [04] Get rid of manual button pushes. Encoding and decoding should happen automatically as you type.

// var cantobet = {
//     "[1]": "bolong.svg",
//     "[..]": "xxxxxx.svg",
//     "[46]": "xxxxxx.svg",
// };