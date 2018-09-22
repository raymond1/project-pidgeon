class LinkedList{
    constructor(){
        this.head = null;
    }
    append(new_item){
        if (this.head == null){
            this.head = new_item;
        }else{
            var last_item = this.head;
            while (last_item.next != null){
                last_item = last_item.next;
            }
            last_item.next = new_item;
        }
    }
}

class Glyph{
    constructor(width,height,x,y, image_id){
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.image_id = image_id; //Tells if it is cantobet symbol 1, or symbol 2, symbol 3, etc...
        this.next = null;
    }
}

class Tile{
    constructor(primary_glyph, secondary_glyph, secondary_glyph_location){
        this.primary_glyph = primary_glyph;
        this.secondary_glyph = secondary_glyph;
        this.secondary_glyph_location = secondary_glyph_location; //top, right, bottom, left
        this.needs_drawing = true;
    }
    draw(){
        var new_letter = document.createElement('img');
        new_letter.src = 'assets/cantobet-svg-files/' + this.primary_glyph.image_id + '.svg';
        new_letter.setAttribute('class', 'letter');
        new_letter.style.left = this.primary_glyph.x + 'px';
        new_letter.style.top = this.primary_glyph.y + 'px';

        $('#message-area').append(new_letter);
        this.needs_drawing = false;
    }

}

class Page{
    constructor(width, height){
        this.width = width;
        this.height = height;
    }
}
/*
class TypeSetter{
    constructor(page_size_x, page_size_y){
        this.page_size_x = page_size_x;
        this.page_size_y = page_size_y;
    }

    //Takes in an array of tiles, and uses the page size to calculate the locations of the tiles
    typeset(tiles_list){

    }
}*/

class Cursor{
    constructor(){
        this.x = 0;
        this.y = 0;
    }
}
class Document{
    constructor(primary_direction, secondary_direction, size_x, size_y){
        this.primary_direction = primary_direction;
        this.secondary_direction = secondary_direction;
        this.size_x = size_x; //size_x and size_y are the size of the page in pixels
        this.size_y = size_y;
        this.tiles = new LinkedList();
        this.cursor = new Cursor();
    }

    add_glyph(glyph_number){
        this.tiles.append(new Tile(new Glyph(100,100,0,0,glyph_number), null, null));
    }

    render(){
        var tile_iterator = this.tiles.head;
        while (tile_iterator != null){
            if (tile_iterator.needs_drawing){
                tile_iterator.draw();
            }
            // //At the cursor, check if the requested tile size fits onto the drawing area.
            // //If yes then draw tet. If no, do not draw it and exit the loop with an error.

            // if (fits(tile_iterator, cursor, )){

            // }
            // var render_location = get_render_location(tile_iterator);
            // tile_iterator.render();
            tile_iterator = tile_iterator.next;
        }
    }



    //Ask a page if it has room for another character
    // get_render_location(){
    //     //Find first free page
    //     //Find first free line.
    //     //If no free space, then add a page.
    //     //if ()

    //     //How do I know if a page is free?
    //     //Is there an unfilled slot?

    //     //Request a page, line, and slot
    //     get_free_page()
    // }

    // find_beginning(){

    // }
}

var document1 = new Document("top to bottom", "right to left", 500, 500);
//var glyphs = [];

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
        document1.add_glyph(letter_value);
        document1.render();
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