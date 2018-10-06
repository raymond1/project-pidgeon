var image_directory = 'assets/cantobet-svg-files/';
var secondary_glyphs_top = ["38", "39", "40", "41"];
var secondary_glyphs_bottom = ["42","43", "44"];
class Document{
    //size.x and size.y are the size of the page in pixels
    //The only required parameter is size
    constructor(size, primary_direction, secondary_direction){
        this.size = {x:size.x, y: size.y}
        if (!primary_direction){
            primary_direction = 'top to bottom';
        }
        this.primary_direction = primary_direction;

        if (!secondary_direction){
            secondary_direction = 'right to left';
        }
        this.secondary_direction = secondary_direction;

        this.tiles = new LinkedList();
        this.pages = new LinkedList();
        this.pages.append(new Page());
        this.cursor = new Cursor(this, this.getDefaultCursorPosition());
    }

    getDefaultCursorPosition(){
        var default_position = {x:0, y:0}
        if (this.primary_direction == "top to bottom"){
            default_position.y = 0;
        }else if (this.primary_direction == "left to right"){
            default_position.x = 0;
        }else if (this.primary_direction == "right to left"){
            default_position.x = this.size.x;
        }else if (this.primary_direction == "bottom to top"){
            default_position.y = this.size.y;
        }

        if (this.secondary_direction == "top to bottom"){
            default_position.y = 0;
        }else if (this.secondary_direction == "left to right"){
            default_position.x = 0;
        }else if (this.secondary_direction == "right to left"){
            default_position.x = this.size.x;
        }else if (this.secondary_direction == "bottom to top"){
            default_position.y = this.size.y;
        }
        return default_position;
    }

    //A new line is started using the size of a newly added tile
    moveCursorToNextLine(new_tile){
        var new_position = {x: this.cursor.position.x, y: this.cursor.position.y};
        if (this.secondary_direction == "top to bottom"){
            new_position.y = this.cursor.position.y + new_tile.size.y;
        }else if (this.secondary_direction == "right to left"){
            new_position.x = this.cursor.position.x - new_tile.size.x;
        }else if (this.secondary_direction == "bottom to top"){
            new_position.y = this.cursor.position.y - new_tile.size.y;
        }else if (this.secondary_direction == "left to right"){            
            new_position.x = this.cursor.position.x + new_tile.size.x;
        }

        if (this.primary_direction == "top to bottom"){
            new_position.y = 0;
        }
        else if (this.primary_direction == "right to left"){
            new_position.x = this.size.x - new_tile.size.x;
        }
        else if (this.primary_direction == "bottom to top"){
            new_position.y = this.size.y - new_tile.size.y;
        }
        else if (this.primary_direction == "left to right"){
            new_position.x = 0;
        }
        this.cursor.position.x = new_position.x;
        this.cursor.position.y = new_position.y;
    }


    getImageURLFromPrimaryGlyphString(primary_glyph_string){
        return image_directory + primary_glyph_string + '.svg';
    }

    //Takes in a glyph string(a unique string corresponding to each one of the glyphs) and puts a tile with that glyph on the page.
    addTile(primary_glyph_string){
        var new_glyph =
        new Glyph(
            this.getImageURLFromPrimaryGlyphString(primary_glyph_string),
            {x:50,y:50} //Content size
        );
        var new_tile = new Tile(this, new_glyph, {x:this.cursor.position.x, y:this.cursor.position.y});
        new_glyph.parent_tile = new_tile;

        var success = false;
        if (this.checkFit(new_tile)){
            //fit strategy 1--space is immediately available
            success = true;
        }else{
            //fit strategy 2--space is available on new line
            this.moveCursorToNextLine(new_tile);
            //Move the cursor and the tile
            new_tile.position.x = this.cursor.position.x;
            new_tile.position.y = this.cursor.position.y;
            if (this.checkFit(new_tile)){
                success = true;
            }
        }

        if (success){
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
        }
    }

    modifyTile(secondary_glyph_string){
        var last_tile = this.tiles.last;
        var glyph_image_url = this.getImageURLFromPrimaryGlyphString(secondary_glyph_string);
        if (last_tile != null){
            if (!last_tile.secondary_glyph){
                last_tile.secondary_glyph = new Glyph(glyph_image_url, {x:25,y:25}, last_tile);
            }
            last_tile.secondary_glyph.image_url = glyph_image_url;
            last_tile.changeSecondaryGlyphLocation(this.getDefaultSecondaryGlyphPosition(secondary_glyph_string));

            //update the cursor
            this.updateCursorPosition(last_tile);
        }
    }

    //Updates the cursor to end of tile
    updateCursorPosition(tile){
        var new_cursor_location = {x:this.cursor.position.x, y: this.cursor.position.y}

        if (this.primary_direction == "top to bottom"){
            new_cursor_location.y = tile.position.y + tile.size.y;
        }
        else if (this.primary_direction == "right to left"){
            new_cursor_location.x = tile.position.x - tile.size.x;
        }
        else if (this.primary_direction == "bottom to top"){
            new_cursor_location.y = tile.position.y - tile.size.y;
        }
        else if (this.primary_direction == "left to right"){
            new_cursor_location.x = tile.position.x + tile.size.x;
        }

        this.cursor.move(new_cursor_location);
    }

    getDefaultSecondaryGlyphPosition(secondary_glyph_string){
        console.log('secondary_glyph_string' + secondary_glyph_string);
        if (Document.arrayContains(secondary_glyph_string, secondary_glyphs_top)){
            return "top";
        }else if (Document.arrayContains(secondary_glyph_string, secondary_glyphs_bottom)){
            return "bottom";
        }
        console.log("Error, getDefaultSecondaryGlyphPosition returns no value");
    }

    //Takes in a value and an array of values and checks if needle_value is one of the values of haystack_array
    static arrayContains(needle_value,haystack_array){
        for (var i = 0; i < haystack_array.length; i++){
            if (haystack_array[i] == needle_value){
                return true;
            }
        }
        return false;
    }
    //Design notes: drawing is done hierarchically, so drawing a component will redraw subcomponents
    draw(){
        var tile_iterator = this.tiles.head;
        while (tile_iterator != null){
            if (tile_iterator.needs_drawing){
                tile_iterator.draw();
            }
            tile_iterator = tile_iterator.next;
        }
        this.cursor.draw();
    }

    //Returns true if the tile fits onto the page
    checkFit(tile){
        var return_value = true;

        var corners = tile.getCorners();
        for (var i = 0; i < 4; i++){
            if (!this.pointWithinBounds(corners[i])){
                return_value = false;
                break;
            }
        }
        return return_value;
    }

    //point is of the form (x,y)
    pointWithinBounds(point){
        var return_value = true;
        //If any of the four corners is out of the drawing area, then the tile does not fit on the page
        if (point.x < 0 || point.x > this.size.x){
            return_value = false;
        } else if (point.y < 0 || point.y > this.size.y){
            return_value = false;
        }

        return return_value;
    }

    retile(){
        this.cursor.move(this.getDefaultCursorPosition());

        var tile = this.tiles.head;
        while (tile){
            this.tile(tile);
            tile = tile.next;
        }
        this.draw();
    }

    //if there is space at the cursor to put a tile, put a tile at the cursor and increment the cursor
    //if there is no space, no tile is added, and the cursor is not incremented
    tile(tile){
        if (this.spaceAvailable(tile.size, this.cursor.position)){
            tile.move(this.cursor.position);
            this.cursor.moveToNextPositionOnCurrentLine(tile.size);
        }else{
            var startOfNextLine = this.cursor.getStartOfNextLine(tile.size);
            if (this.spaceAvailable(tile.size, startOfNextLine)){
                tile.move(startOfNextLine);
                this.cursor.move(startOfNextLine);
                this.cursor.moveToNextPositionOnCurrentLine(tile.size);
            }else{
                console.log('out of space while tiling the document');
            }
        }
    }

    //Calculatetes whether or not an item with the given rectangular size would stay within the bounds of the document
    //at a given position
    spaceAvailable(size,position){
        var corners = this.calculateRectangleCorners(size, position);
        for (var i = 0; i < 4; i++){
            if (!this.pointWithinBounds(corners[i])){
                return false;
            }
        }
        return true;
    }

    //Given a size (a width and a height) and a position,
    //calculate the 4 corner positions
    calculateRectangleCorners(size, position){
        //Order for corners is left top, left bottom, right bottom, right top
        var lt = {x:position.x,y:position.y};
        var lb = {x:position.x,y:position.y};
        var rb = {x:position.x,y:position.y};
        var rt = {x:position.x,y:position.y};

        if (this.primary_direction == "top to bottom"){
            lb.y = position.y + size.y;
            rb.y = position.y + size.y;
        }
        else if (this.primary_direction == "right to left"){
            lt.x = position.x - size.x;
            lb.x = position.x - size.x;
        }
        else if (this.primary_direction == "bottom to top"){
            lt.y = position.y - size.y;
            rt.y = position.y - size.y;
        }
        else if (this.primary_direction == "left to right"){
            rb.x = position.x + size.x;
            rt.x = position.x + size.x;
        }

        if (this.secondary_direction == "top to bottom"){
            lb.y = position.y + size.y;
            rb.y = position.y + size.y;
        }
        else if (this.secondary_direction == "right to left"){
            lt.x = position.x - size.x;
            lb.x = position.x - size.x;
        }
        else if (this.secondary_direction == "bottom to top"){
            lt.y = position.y - size.y;
            rt.y = position.y - size.y;
        }
        else if (this.secondary_direction == "left to right"){
            rb.x = position.x + size.x;
            rt.x = position.x + size.x;
        }

        var return_value = [lt,lb,rb,rt];
console.log('calculateRectangleCorners' + JSON.stringify(return_value));
        return return_value;
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
        var document1_size = {x:$('#message_area').width(), y:300}
        var document1 = new Document(document1_size);
        document1.draw();
        $('.options').click(
            function(){
                var command = $(this).attr('value');
                if (command == "change writing direction"){

                }else if (command.substring(0, 24) == "place secondary glyph on"){ //Move the location of the secondary glyph around
                    if (document1.tiles.last){
                        newSecondaryGlyphLocation = command.substring(25);

                        document1.tiles.last.changeSecondaryGlyphLocation(newSecondaryGlyphLocation);
                        document1.updateCursorPosition(document1.tiles.last);
                    }
                }
            }
        );
        
        $('.canto-letter-button').click(
            function(){
                var glyph_value = $(this).attr('value');
                if (primary_glyphs.indexOf(glyph_value) > -1){//If this is a primary glyph button, add a new tile
                    document1.addTile(glyph_value);
                }else if (secondary_glyphs.indexOf(glyph_value) > -1){//If this is a secondary glyph button, modify the last tile
                    document1.modifyTile(glyph_value);
                }
                document1.draw();
            }
        );

        $(window).resize(function() {
            document1.size = {x:$('#message_area').width(), y: $('#message_area').height()};
            document1.retile();
        });
    }
)


/*
    //1-37 = letters
    //38-44 = tonal symbols
    //45 - short indicator
    //46 - saliva symbol

// [04] Get rid of manual button pushes. Encoding and decoding should happen automatically as you type.
*/