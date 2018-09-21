class LinkedList{
    static append(list, new_item){
        if (list == null){
            list = new_item;
        }else{
            var last_item = list;
            while (last_item.next != null){
                last_item = last_item.next;
            }
        }
    }
}

class Glyph{
    constructor(width,height,x,y, image_id){
        this.width = width;
        this.height = height;
        this.x = x;
        this.y - y;
        this.image_id = image_id; //Tells if it is cantobet symbol 1, or symbol 2, symbol 3, etc...
        this.next = null;
    }
}

class Page{
    constructor(width, height){
        this.width = width;
        this.height = height;
    }
}

class Document{
    constructor(primary_direction, secondary_direction, size_x, size_y){
        this.primary_direction = primary_direction;
        this.secondary_direction = secondary_direction;
        this.size_x = size_x; //size_x and size_y are the size of the page in pixels
        this.size_y = size_y;
        this.text = null;
    }

    add_glyph(glyph_number){
        LinkedList.append(this.text, new Glyph(100,100,0,0,glyph_number));
    }

    render(){

    }
}

var doc = new Document("top to bottom", "right to left", 500, 500);
var glyphs = [];

/*
for (var i = 0; i < )


for (var i = 1; i < 46; i++){
    if (i >= 1 && i <= 37){
        symbol_sizes[i] = {
            name: i + "",
            size:{
                width: 100,
                height: 100
            }
        }    
    }else if (i >= 38 && i <= 46){
        symbol_sizes[i] = {
            name: i + "",
            size:{
                width: 50,
                height: 50
            }
        }    
    }
}*/

$('.canto-letter-button').click(
    function(){
        var letter_value = $(this).attr('value');
        doc.add_letter(letter_value);
        doc.render();
    }
);

/*
//This uses the direction of writing, the size of the canvas, and the locations of existing letters to generate the locations of the symbols on the page.
function determine_location_of_next_letter(letter_value){
  if (primary_direction == "top to bottom"){
      if (secondary_direction = "right to left"){
          var object_size = {}
          //What is the size of the object you are trying to input?
          //What is the size of the canvas?


          //Find highest open spot
          //start at lower-right corner.
          //Is there space on the line?
          //If no space, go to next line
          //If no space on next line, go to next page.
      }
  }
}
*/

/*
function render(letter_value){
    //1-37 = letters
    //38-44 = tonal symbols
    //45 - short indicator
    //46 - saliva symbol

    var new_letter = document.createElement('img');
    new_letter.src = 'assets/cantobet-svg-files/' + letter_value + '.svg';
    new_letter.setAttribute('class', 'letter');

    var location_of_next_letter = determine_location_of_next_letter(letter_value);
//    new_letter.style.left = '15px';
//    new_letter.style.top = '25px';
//    document.getElementById("message-area").offsetWidth;

    $('#message-area').append(new_letter);
    console.log($('#message-area').width());
    console.log($('#message-area').height());
    cursor_location= {}
}


function draw_cursor(){
    //given the direction
}*/


// [04] Get rid of manual button pushes. Encoding and decoding should happen automatically as you type.

// var cantobet = {
//     "[1]": "bolong.svg",
//     "[..]": "xxxxxx.svg",
//     "[46]": "xxxxxx.svg",
// };