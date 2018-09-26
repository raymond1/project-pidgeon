var image_directory = 'assets/cantobet-svg-files/';

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
    //image_url and content_size are required parameters
    //Content_size is the size of the glyph before padding is added around it.
    constructor(image_url, content_size){
        this.content_size = {x: content_size.x,y:content_size.y}
        this.position = {x:0,y:0} //relative to top left corner of a tile
        this.next = null;
        this.padding = 5;
        this.image_url = image_url;
    }

    get size(){
        return {x: this.content_size.x + 2 * this.padding, y: this.content_size.y + 2 * this.padding}
    }
}

//A tile has its own position, independent of the glyphs that it contains.
class Tile{
    //primary_glyph is the only required parameter
    constructor(primary_glyph, position, secondary_glyph, secondary_glyph_location){
        this.primary_glyph = primary_glyph;

        if (typeof secondary_glyph == 'undefined'){
            secondary_glyph = null;
        }
        this.secondary_glyph = secondary_glyph;
        this.secondary_glyph_location = secondary_glyph_location; //"top", right, bottom, left. Refers to location of secondary glyph relative to primary glyph
        this.needs_drawing = true;
        if (typeof position !== 'undefined'){
            this.position = position; //position is of the form {x:0, y:0}
        }else{
            this.position = {x:0,y:0}
        }
    }

    draw(){
        if (this.secondary_glyph != null){
            var secondary_glyph = document.createElement('img');
            secondary_glyph.src = this.secondary_glyph.image_url;
            secondary_glyph.style.left = this.position.x + this.secondary_glyph.position.x;
            secondary_glyph.style.top = this.position.y + this.secondary_glyph.position.y;
            secondary_glyph.style.width = this.secondary_glyph.width;
            secondary_glyph.style.height = this.secondary_glyph.height;
            secondary_glyph.style.padding = this.secondary_glyph.padding + 'px';
            $('#message_area').append(secondary_glyph);
        }

        var primary_glyph = document.createElement('img');
        primary_glyph.src = this.primary_glyph.image_url;
        primary_glyph.setAttribute('class', 'letter');
        primary_glyph.style.left = this.position.x + this.primary_glyph.position.x + 'px';
        primary_glyph.style.top = this.position.y + this.primary_glyph.position.y + 'px';
        primary_glyph.style.width = this.primary_glyph.width;
        primary_glyph.style.height = this.primary_glyph.height;
        primary_glyph.style.padding = this.primary_glyph.padding + 'px';

        $('#message_area').append(primary_glyph);
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
        if (this.secondary_glyph == null){
            var new_size = {
                x:this.primary_glyph.size.x,
                y:this.primary_glyph.size.y
            };
            return new_size;    
        }
        var return_size = {x:0, y:0}
        if (this.secondary_glyph_location == "top"){
            return_size = {
                x: Math.max(this.primary_glyph.size.x,this.secondary_glyph.size.x),
                y: this.primary_glyph.size.y + this.secondary_glyph.size.y
            }
        }
        else if (this.primary_direction == "right"){
            return_size = {
                x: this.primary_glyph.size.x + this.secondary_glyph.size.x,
                y: Math.max(this.primary_glyph.size.y, this.secondary_glyph.size.y)
            }
        }
        else if (this.primary_direction == "bottom"){
            return_size = {
                x: Math.max(this.primary_glyph.size.x,this.secondary_glyph.size.x),
                y: this.primary_glyph.size.y + this.secondary_glyph.size.y
            }
        }
        else if (this.primary_direction == "left"){
            return_size = {
                x: this.primary_glyph.size.x + this.secondary_glyph.size.x,
                y: Math.max(this.primary_glyph.size.y, this.secondary_glyph.size.y)
            }
        }
        return return_size;
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
        this.position = {x : 0, y : 0}
        this.image_url = 'assets/ui/cursor.svg';
        this.element = null;
    }

    draw(){
        if (this.element == null){
            this.element = document.createElement('img');
            $('#message_area').append(this.element);
            this.element.src = this.image_url;
            this.element.style.position = 'absolute';
            this.element.style.zIndex = 1;
        }
        this.element.style.left = (this.position.x - 12) + 'px';
        this.element.style.top = (this.position.y - 12) + 'px';
        this.element.style.width = '25px';
        this.element.style.height = '25px';
    }

    move(new_position){
        this.position.x = new_position.x;
        this.position.y = new_position.y;
        this.element.style.left = this.position.x + 'px';
        this.element.style.top = this.position.y + 'px';
    }
}

class Document{
    //size_x and size_y are the size of the page in pixels
    //The only required parameter is size
    constructor(size, primary_direction, secondary_direction){

        if (typeof primary_direction === 'undefined'){
            primary_direction = 'top to bottom';
        }
        this.primary_direction = primary_direction;
        this.secondary_direction = secondary_direction;
        this.size = {x: size.x, y: size.y}

        this.tiles = new LinkedList();
        this.cursor = new Cursor();
        this.render();
    }

    getImageURLFromPrimaryGlyphString(primary_glyph_string){
        return image_directory + primary_glyph_string + '.svg';
    }

    //Takes in a number and puts a tile with that glyph on the page.
    addTile(primary_glyph_string){
        var new_tile = new Tile(new Glyph(this.getImageURLFromPrimaryGlyphString(primary_glyph_string), {x:500, y:50}), {x:this.cursor.position.x, y:this.cursor.position.y});
        if (this.checkFit(new_tile)){
            this.tiles.append(new_tile);
            if (this.primary_direction == "top to bottom"){
                this.cursor.move({x: this.cursor.position.x, y: this.cursor.position.y + new_tile.height});
            }else if (this.primary_direction == "right to left"){
                this.cursor.move({x: this.cursor.position.x - new_tile.width, y: this.cursor.position.y});
            }
            else if (this.primary_direction == "bottom to top"){
                this.cursor.move({x: this.cursor.position.x, y: this.cursor.position.y - this.cursor.position.y});
            }
            else if (this.primary_direction == "left to right"){
                this.cursor.move({x: this.cursor.position.x + new_tile.width, y: this.cursor.position.y});
            }
        }else{
console.log('no fit');
            /*
            this.cursor.x = 0;
            this.cursor.y = this.cursor.y + new_tile.size.y;
            if (this.checkFit(new_tile)){
                this.tiles.append(new_tile);
            }*/
        }
    }

    modifyTile(secondary_glyph_number){
        /*
        var last_tile = this.tiles.last;
        if (last_tile != null){
            last_tile.secondary_glyph = new Glyph(this.getImageURLFromPrimaryGlyphString(secondary_glyph_string));
            last_tile.secondary_glyph_location = "top";
        }
        last_tile.needs_drawing = true;
        */
        console.log('modifyTile');
    }

    render(){
        var tile_iterator = this.tiles.head;
        while (tile_iterator != null){
            if (tile_iterator.needs_drawing){
                tile_iterator.draw();
                
                
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

        this.cursor.draw();
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
primary_glyphs[0] = 'space';

var secondary_glyphs = [];
for (var i = 38; i <= 46; i++){
    secondary_glyphs[i] = `${i}`;
}

$(document).ready(
    function(){
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
    }
)


/*
    //1-37 = letters
    //38-44 = tonal symbols
    //45 - short indicator
    //46 - saliva symbol

// [04] Get rid of manual button pushes. Encoding and decoding should happen automatically as you type.
*/