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

    last(){
        var last = this.head;
        if (last == null){
            return null;
        }

        while(last.next != null){
            last = last.next;
        }
        return last;
    }
}

class Glyph{
    constructor(image_id){
        this.size = {x: 50,y:50}
        this.position = {x:0,y:0}
        this.image_id = image_id; //Tells if it is cantobet symbol 1, or symbol 2, symbol 3, etc...
        this.next = null;
    }
}

class Tile{
    //primary_glyph is the only required parameter
    constructor(primary_glyph, position, secondary_glyph, secondary_glyph_location){
        if (typeof position === 'undefined'){
            this.position = {x:0,y:0}
        }else{
            this.position = {x: position.x,y:position.y};
        }
        this.primary_glyph = primary_glyph;
        this.secondary_glyph = secondary_glyph;
        this.secondary_glyph_location = secondary_glyph_location; //top, right, bottom, left
        this.needs_drawing = true;
        this.padding = 5;//padding is in pixels
    }

    draw(){
        var new_letter = document.createElement('img');
        new_letter.src = 'assets/cantobet-svg-files/' + this.primary_glyph.image_id + '.svg';
        new_letter.setAttribute('class', 'letter');
        new_letter.style.left = this.position.x + 'px';
        new_letter.style.top = this.position.y + 'px';
        new_letter.style.width = this.primary_glyph.width;
        new_letter.style.height = this.primary_glyph.height;
        new_letter.style.padding = this.padding + "px";

        $('#message_area').append(new_letter);
        this.needs_drawing = false;
    }

    get size() {
        var size = this.calculateTileSize();
        return size;
    }

    get width(){
        var size = this.calculateTileSize();
        return size.x;
    }

    get height(){
        var size = this.calculateTileSize();
        return size.y;
    }

    calculateTileSize(){
        return {
            x:this.primary_glyph.size.x + 2 * this.padding,
            y:this.primary_glyph.size.y + 2 * this.padding
        }
    }
}

class Page{
    constructor(width, height){
        this.width = width;
        this.height = height;
    }
}

class Cursor{
    constructor(){
        this.x = 0;
        this.y = 0;
    }
}

class Document{
    //size_x and size_y are the size of the page in pixels
    //The only required parameter is size
    constructor(size, primary_direction, secondary_direction){
        this.primary_direction = primary_direction;
        this.secondary_direction = secondary_direction;
        this.size = {x: size.x, y: size.y}

        this.tiles = new LinkedList();
        this.cursor = new Cursor();
    }

    //Takes in a number and puts a tile with that glyph on the page.
    addTile(primary_glyph_number){
        var new_tile = new Tile(new Glyph(primary_glyph_number), this.cursor);
        if (this.checkFit(new_tile)){
            this.cursor.x = this.cursor.x + new_tile.size.x;
            this.tiles.append(new_tile);
        }else{
            this.cursor.x = 0;
            this.cursor.y = this.cursor.y + new_tile.size.y;
            if (this.checkFit(new_tile)){
                this.tiles.append(new_tile);
            }
        }
    }

    modifyTile(secondary_glyph_number){
        var last_tile = this.tiles.head;
        if (last_tile == null){
            return;
        }

        while(last_tile.next != null){
            last_tile = last_tile.next;
        }

        last_tile.secondary_glyph = new Glyph(secondary_glyph_number);
    }

    render(){
        var tile_iterator = this.tiles.head;
        while (tile_iterator != null){
            if (tile_iterator.needs_drawing){
                tile_iterator.draw(this.cursor);
                
                
                //If drawing failed, update the cursor and then then create a new line

                //If drawing fails again, then create a new page

                //Update the cursor
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

    //Returns true if the tile fits onto the page
    checkFit(tile){
        var return_value = true;
        if (tile.position.x < 0){
            return_value = false;
        } else if (tile.position.x + tile.size.x >= this.size.x){
            return_value = false;
        } else if (tile.position.y < 0){
            return_value = false;
        } else if (tile.position.y + tile.size.y >= this.size.y){
            return_value = false;
        }
        return return_value;
    }

    displayCursor(){

    }
}

var primary_glyphs = [];
for (var i = 1; i <= 37; i++){
    primary_glyphs[i] = `${i}`;
}

var secondary_glyphs = [];
for (var i = 38; i <= 46; i++){
    secondary_glyphs[i] = `${i}`;
}

$(document).ready(
    function(){
        console.log('location A');
        console.log($('#message_area').width())
        var document1_size = {x:$('#message_area').width(), y:500}
        var document1 = new Document(document1_size);
        
        $('.canto-letter-button').click(
            function(){
                var glyph_value = $(this).attr('value');
                if (primary_glyphs.indexOf(glyph_value) > -1){
                    document1.addTile(glyph_value);
                }else if (secondary_glyphs.indexOf(glyph_value) > -1){
                    document1.modifyTile(glyph_value);
                }
                document1.render();
            }
        );

        document1.display_cursor();
    }
)


/*
    //1-37 = letters
    //38-44 = tonal symbols
    //45 - short indicator
    //46 - saliva symbol

// [04] Get rid of manual button pushes. Encoding and decoding should happen automatically as you type.
*/