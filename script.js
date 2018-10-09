//Terminology: primary axis: the direction in which new characters are added on a line
//secondary axis: the direction in which new lines are added

var image_directory = 'assets/cantobet-svg-files/';
var secondary_glyphs_top = ["38", "39", "40", "41"]; //secondary glyphs typically placed on top
var secondary_glyphs_bottom = ["42","43", "44"]; //secondary glyphs typically placed on bottom
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
        this.direction_buffer = new CircularLinkedList();

        var writing_directions = 
        [
        {primary_direction: "left to right", secondary_direction: "top to bottom"},
        {primary_direction: "top to bottom", secondary_direction: "right to left"},
        {primary_direction: "right to left", secondary_direction: "bottom to top"},
        {primary_direction: "bottom to top", secondary_direction: "left to right"},
        {primary_direction: "left to right", secondary_direction: "bottom to top"},
        {primary_direction: "top to bottom", secondary_direction: "left to right"},
        {primary_direction: "right to left", secondary_direction: "top to bottom"},
        {primary_direction: "bottom to top", secondary_direction: "right to left"},
        ]

        for (var i = 0; i < writing_directions.length; i++){
            this.direction_buffer.add(writing_directions[i]);
        }
    }

    //Returns whether or not tiles have already been added to the document
    get isEmpty(){
        if (this.tiles.size > 0) return false;
        return true;
    }

    //Screen coordinates are like this:(0,0)......(10,0)
    //                                   .           .
    //                                   .           .
    //                                   .           .
    //                                 (10,0).....(10,10)
    //Given a set of PSCoordinates{x,y}, calculates the corresponding screen coordinates
    getScreenCoordinatesFromPSCoordinates(PSCoordinates){
        var screenCoordinates = {}
        if (this.primary_direction == "top to bottom"){
            //Each pixel in primary direction is +y in screen coordinates
            screenCoordinates.y = PSCoordinates.x
        }
        else if (this.primary_direction == "left to right"){
            screenCoordinates.x = PSCoordinates.x
        }
        else if (this.primary_direction == "bottom to top"){
            screenCoordinates.y = this.size.x - 1 - PSCoordinates.x
        }
        else if (this.primary_direction == "right to left"){
            screenCoordinates.x = this.size.x - 1 - PSCoordinates.x
        }

        if (this.secondary_direction == "top to bottom"){
            //Each pixel in primary direction is +y in screen coordinates
            screenCoordinates.y = PSCoordinates.y
        }
        else if (this.secondary_direction == "left to right"){
            screenCoordinates.x = PSCoordinates.y
        }
        else if (this.secondary_direction == "bottom to top"){
            screenCoordinates.y = this.size.y - 1 - PSCoordinates.y
        }
        else if (this.secondary_direction == "right to left"){
            screenCoordinates.x = this.size.y - 1 - PSCoordinates.y
        }
        return screenCoordinates;
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

    //Depending on primary_direction and secondary_direction, determine the location of the first tile
    //Returns an object results{success:true|false} indicating whether the first tile was placed successfully or not. 
    //Takes in a tile object that has a size, sets its position, and draws it if there is sufficient space.
    placeTileAtOrigin(tile){
        //Tile needs to be placed at {primary_axis: 0, secondary_axis: 0}
        tile.position = {x:0,y:0};

        //
        //Is there sufficient space?
        if (Document.sufficientSpace(tile, this.size)){
            //There is enough space, so draw the tile at the origin
            tile.draw();
            return {success:true}
        }else{
            return {success:false}
        }
    }

    //Uses primary and secondary axis coordinate system rather than screen coordinates
    //Takes in a tile object with properties size{x,y} and position{x,y}, and container_size{x,y} object. Returns true if the tile fits within the container.
    //The container is assumed to be located at location (0,0)
    static sufficientSpace(tile, container_size){
        if (tile.position.x < 0) return false;
        if (tile.position.y < 0) return false;
        if (tile.position.x + tile.size.x > container_size.x) return false;
        if (tile.position.y + tile.size.y > container_size.y) return false;
        return true;
    }

    //Attempts to place tile onto the document. If successful, returns a results object with property success equal to true. If unsuccessful, a results object with success equal to false is returned.
    placeTile(tile){
        var results = {success: false}

        if (this.isEmpty){
            //The first tile goes into the correct corner
            var place_tile_results = this.placeTileAtOrigin(tile);
            if (place_tile_results.success){
                results.success = true;
            }
        }else{
            //Attempt to place tile after the last added tile
            //Tile will be located on the same secondary axis value, but different primary access value if it is to be added on the same line

            //Try the same line. If space is not available, try the next line.
            var space_available_results = this.spaceAvailableOnSameLine(this.tiles.last, tile);
            if (space_available_results.success){
                //add tile on same line, aligning the primary tiles and expanding line length if necessary
                var new_position = {x:this.tiles.last.position.x + this.tiles.last.size.x, y: this.tiles.last.position.y}
                tile.move(new_position)
                results.success = true
            }else{
                if (space_available_results.failure_reasons.not_enough_primary_space){
                    //Try a new line
                    results.success = this.addTileToNewLine(this.tiles.last,tile)
                }else if (result.failure_reasons.not_enough_secondary_space){
                    //Check whether expanding the secondary space of the line to fit the new tile would be possible
                    //If possible, add the new tile
                    //If not possible, return an error
                }
            }
        }

        if (results.success){
            this.tiles.append(tile)
        }
        return results;
    }

    //If there is space for the new tile on a new line, then add it
    //If the operation is successful, return true, otherwise return false
    addTileToNewLine(previous_line_tile, new_tile){
        if (previous_line_tile == null){
            //check if the tile fits into the page
            if (this.isCornerSetWithinCornerSet([{x:0, y:0}, {x:new_tile.size.x - 1, y: new_tile.size.y - 1}], [{x:0,y:0},{x: this.size.x -1, y: this.size.y -1}])) {
                new_tile.move({x:0,y:0})
                return true
            }
            else{
                return false
            }
        }else{
            if (this.isCornerSetWithinCornerSet([{x:0, y:0}, {x:new_tile.size.x - 1, y: new_tile.size.y - 1}], [{x:0,y:0},{x: this.size.x -1, y: this.size.y -1}]))
            var new_tile_location = {x: 0, y: previous_line_tile.position.y + previous_line_tile.size.y}
            new_tile.move(new_tile_location)
            return true
        }

    }

    //Takes in a tile and a size{x,y} representing the size of the new tile t, and determines whether or not the new tile can be added to the same line as the preceding tile
    //When adding a tile align the primary tiles of the preceding tile and the tile being added
    //Upon success, returns {success:true}. Upon failure, returns
    //Calculations are in primary-secondary space
    spaceAvailableOnSameLine(preceding_tile, tile_to_be_added){
        //Pretend we are using screen coordinates.

        //align the new tile's primary glyph with the preceding tile's primary glyph
        var new_location_lt = {}
        new_location_lt.x = preceding_tile.position.x + preceding_tile.size.x
        new_location_lt.y = preceding_tile.position.y + preceding_tile.primary_glyph.position.y - tile_to_be_added.primary_glyph.y

        var new_location_rb = {}
        new_location_rb.x = new_location_lt.x + tile_to_be_added.size.x
        new_location_rb.y = new_location_lt.y + tile_to_be_added.size.y

        //Get current line bounding box
        var bounding_box = this.getCurrentLineBoundingBox(preceding_tile)
        if (this.isCornerSetWithinCornerSet([new_location_lt,new_location_rb], [bounding_box[0],bounding_box[2]])){
            return {success:true}
        }else{
            var not_enough_primary_space = false;
            var not_enough_secondary_space = false;

            if (new_location_rb.x > bounding_box[2].x){
                not_enough_primary_space = true
            }

            if (new_location_rb.y > bounding_box[2].y|| new_location_rb.y < bounding_box[0].y){
                not_enough_secondary_space = true
            }
            return {success:false, failure_reasons:{not_enough_primary_space:not_enough_primary_space, not_enough_secondary_space: not_enough_secondary_space}}
        }
    }

    //Given 2 sets of of 2 diagonal corners [lt, rb], determine if the first is placed within the second without overflow.
    isCornerSetWithinCornerSet(test_set,bounding_set){
        if (test_set[0].x < bounding_set[0].x||test_set[0].y < bounding_set[0].y|| test_set[1].x > bounding_set[1].x||test_set[1].y > bounding_set[1].y){
            return false
        }
        return true
    }

    //Tiles are on the same line if the lt corner of the tiles have the same y coordinates
    //Returns the bounding box for the line that the tile is currently placed in
    getCurrentLineBoundingBox(tile){
        var lt = {}
        var lb = {}
        var rb = {}
        var rt = {}

        lt.x = 0
        lt.y = tile.position.y

        lb.x = 0
        lb.y = tile.position.y + tile.size.y

        rb.x = this.size.x
        rb.y = tile.position.y + tile.size.y

        rt.x = this.size.x
        rt.y = tile.position.y

        return [lt,lb,rb,rt]
    }

    //Takes in a glyph string(a unique string corresponding to each one of the glyphs) and puts a tile with that glyph on the page.
    addTile(primary_glyph_string){
        //1)First create a new tile with the correct glyph so that it has a calculatable size
        var new_glyph =
        new Glyph(
            this.getImageURLFromPrimaryGlyphString(primary_glyph_string),
            {x:50,y:50} //Primary tile size
        );

        var new_tile = new Tile({document:this, primary_glyph:new_glyph, parent_document: this});
        new_glyph.parent_tile = new_tile;

        var results = this.placeTile(new_tile);
        if (results.success){
            //update the cursor
            this.cursor.move({x:new_tile.position.x + new_tile.size.x, y: new_tile.position.y} );
        }else{
            console.log('Error placing tile');
        }

        /*
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
        }*/
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
        return return_value;
    }

    //size is given in screen pixels
    //This function returns the size in terms of primary_direction and secondary_direction units (PS units)
    //In the returned coordinate system, x is in the direction of the primary direction, and y is in the direction of the secondary direction
    static convertScreenSizeToPSSize(size, primary_direction, secondary_direction){

        var return_size = {}
        if (primary_direction == "top to bottom"||primary_direction == "bottom to top"){
            return_size.x = size.y;
            return_size.y = size.x;
        }
        else{
            return_size.x = size.x;
            return_size.y = size.y;
        }
        return return_size;
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
        var primary_direction = "left to right";
        var secondary_direction = "top to bottom";
        var document1_size = Document.convertScreenSizeToPSSize({x:$('#message_area').width(), y:300}, primary_direction, secondary_direction);
        //Need to convert pixel sizes into primary and secondary axes coordinate system
        var document1 = new Document(document1_size, primary_direction, secondary_direction);
        document1.draw();

        $('.options').click(
            function(){
                var command = $(this).attr('value');
                if (command == "change writing direction"){
                    console.log(document1.direction_buffer.pointer.primary_direction + '|' + document1.direction_buffer.pointer.secondary_direction)
                    document1.direction_buffer.pointer = document1.direction_buffer.pointer.next
                    document1.primary_direction = document1.direction_buffer.pointer.primary_direction
                    document1.secondary_direction = document1.direction_buffer.pointer.secondary_direction
                    document1.retile()
                    document1.draw()
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