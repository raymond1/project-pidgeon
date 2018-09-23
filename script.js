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
        this.padding = 5;//padding is in pixels
    }

    draw(cursor){
        var new_letter = document.createElement('img');
        new_letter.src = 'assets/cantobet-svg-files/' + this.primary_glyph.image_id + '.svg';
        new_letter.setAttribute('class', 'letter');
        new_letter.style.left = cursor.x + 'px';
        new_letter.style.top = cursor.y + 'px';
        new_letter.style.width = this.primary_glyph.width;
        new_letter.style.height = this.primary_glyph.height;
        new_letter.style.padding = this.padding + "px";

        $('#message-area').append(new_letter);
        this.needs_drawing = false;

        //return some information as to what size of glyph was drawn
        var size_drawn = {width: this.primary_glyph.width + 2 * this.padding, height: this.primary_glyph.height + 2 * this.padding};
        var draw_information = {
            size: size_drawn
        };
        return draw_information;
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
        this.tiles.append(new Tile(new Glyph(50,50,0,0,glyph_number), null, null));
    }

    render(){
        var tile_iterator = this.tiles.head;
        while (tile_iterator != null){
            if (tile_iterator.needs_drawing){
                var draw_information = tile_iterator.draw(this.cursor);
                //Update the cursor
                this.cursor.x = this.cursor.x + draw_information.size.width;
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

    updateCursor(){}
}

var document1 = new Document("top to bottom", "right to left", 500, 500);

$('.canto-letter-button').click(
    function(){
        var letter_value = $(this).attr('value');
        document1.add_glyph(letter_value);
        document1.render();
    }
);


/*
    //1-37 = letters
    //38-44 = tonal symbols
    //45 - short indicator
    //46 - saliva symbol

// [04] Get rid of manual button pushes. Encoding and decoding should happen automatically as you type.
*/