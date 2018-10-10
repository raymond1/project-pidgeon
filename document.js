class Document extends DrawingArea{
    //screen_size is in screen coordinates
    //The only required parameter is size
    constructor(screen_size){
        super()
        this.screen_size = {x:screen_size.x,y:screen_size.y}

        this.tiles = new LinkedList();
        this.pages = new LinkedList();
        this.pages.append(new Page());
        this.cursor = new Cursor(this, this.getDefaultCursorPosition());
        this.direction_buffer = new CircularLinkedList();

        var writing_directions = 
        [
            {primary_direction: "left to right", secondary_direction: "top to bottom"}, //Initial direction
            {primary_direction: "top to bottom", secondary_direction: "right to left"},
/*            {primary_direction: "right to left", secondary_direction: "bottom to top"},
            {primary_direction: "bottom to top", secondary_direction: "left to right"},
            {primary_direction: "left to right", secondary_direction: "bottom to top"},
            {primary_direction: "top to bottom", secondary_direction: "left to right"},
            {primary_direction: "right to left", secondary_direction: "top to bottom"},
            {primary_direction: "bottom to top", secondary_direction: "right to left"},*/
        ]

        for (var i = 0; i < writing_directions.length; i++){
            this.direction_buffer.add(writing_directions[i]);
        }

        this.size = this.getPSSizeFromScreenSize()
    }

    getPSSizeFromScreenSize(){
        if (this.direction_buffer.pointer.primary_direction == "top to bottom"||this.direction_buffer.pointer.primary_direction == "bottom to top"){
            return {x:this.screen_size.y, y: this.screen_size.x}
        }else{
            return {x:this.screen_size.x, y: this.screen_size.y}
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
        if (this.direction_buffer.pointer.primary_direction == "top to bottom"){
            //Each pixel in primary direction is +y in screen coordinates
            screenCoordinates.y = PSCoordinates.x
        }
        else if (this.direction_buffer.pointer.primary_direction == "left to right"){
            screenCoordinates.x = PSCoordinates.x
        }
        else if (this.direction_buffer.pointer.primary_direction == "bottom to top"){
            screenCoordinates.y = this.screen_size.y - 1 - PSCoordinates.x
        }
        else if (this.direction_buffer.pointer.primary_direction == "right to left"){
            screenCoordinates.x = this.screen_size.x - 1 - PSCoordinates.x
        }

        if (this.direction_buffer.pointer.secondary_direction == "top to bottom"){
            //Each pixel in primary direction is +y in screen coordinates
            screenCoordinates.y = PSCoordinates.y
        }
        else if (this.direction_buffer.pointer.secondary_direction == "left to right"){
            screenCoordinates.x = PSCoordinates.y
        }
        else if (this.direction_buffer.pointer.secondary_direction == "bottom to top"){
            screenCoordinates.y = this.screen_size.y - 1 - PSCoordinates.y
        }
        else if (this.direction_buffer.pointer.secondary_direction == "right to left"){
            screenCoordinates.x = this.screen_size.x - 1 - PSCoordinates.y
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
        if (this.spaceAvailable(tile.size, tile.position)){
            //There is enough space, so draw the tile at the origin
            tile.draw();
            return {success:true}
        }else{
            return {success:false}
        }
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

    //Calculatetes whether or not an item with the given rectangular size would stay within the bounds of the document
    //at a given position
    //size and position are given in PS coordinates
    spaceAvailable(size,position){
console.log('spaceAvailable')
        var corners = this.calculateRectangleCorners(size, position);
        for (var i = 0; i < 4; i++){
            if (!this.pointWithinBounds(corners[i])){
                return false;
            }
        }
        return true;
    }

    //point is of the form (x,y). It is given in PS coordinates
    pointWithinBounds(point){
console.log('pointWithinBounds' + JSON.stringify(point))
//        var transformed_point = this.getScreenCoordinatesFromPSCoordinates(point)
        var return_value = true;
        //If any of the four corners is out of the drawing area, then the tile does not fit on the page
        if (point.x < 0 || point.x > this.size.x){
            return_value = false;
        } else if (point.y < 0 || point.y > this.size.y){
            return_value = false;
        }

        return return_value;
    }
    //Attempts to place tile onto the document. If successful, returns a results object with property success equal to true. If unsuccessful, a results object with success equal to false is returned.
    appendTile(tile){
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
            tile.draw()
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
        if (preceding_tile){
            new_location_lt.x = preceding_tile.position.x + preceding_tile.size.x
            new_location_lt.y = preceding_tile.position.y + preceding_tile.primary_glyph.position.y - tile_to_be_added.primary_glyph.y            
        }
        else{//In case this is the fist tile being added, add it at the origin
            new_location_lt.x = 0
            new_location_lt.y = 0
        }

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

    changeWritingDirection(){
        this.direction_buffer.pointer = this.direction_buffer.pointer.next
        this.size = this.getPSSizeFromScreenSize()
        console.log(JSON.stringify(this.size))
        this.retile()
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


        rb.y = tile.position.y + tile.size.y
        rt.y = tile.position.y

        rb.x = this.size.x
        rt.x = this.size.x

        return [lt,lb,rb,rt]
    }

    //Takes in a glyph string(a unique string corresponding to each one of the glyphs) and puts a tile with that glyph on the page.
    //This function is executed when the user clicks on a button to add a new primary glyph
    addTile(primary_glyph_string){
        //1)First create a new tile with the correct glyph so that it has a calculatable size
        var new_glyph =
        new Glyph(
            this.getImageURLFromPrimaryGlyphString(primary_glyph_string),
            {x:50,y:50} //Primary tile size
        );

        var new_tile = new Tile({document:this, primary_glyph:new_glyph, parent_document: this});
        new_glyph.parent_tile = new_tile;

        var results = this.appendTile(new_tile);
        if (!results.success){
            console.log('Error placing tile');
        }
        this.cursor.update()
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



    retile(){
        var old_tiles = this.tiles
        this.tiles = new LinkedList()

        var tile = old_tiles.head;
        while (tile){
            var temp = tile.next
            tile.next = null
            this.appendTile(tile);
            tile = temp;
        }
        old_tiles = null
    }



    //Given a size (a width and a height) and a position,
    //calculate the 4 corner positions
    //Uses PS coordinates
    calculateRectangleCorners(size, position){
        //Order for corners is left top, left bottom, right bottom, right top
        var lt = {x:position.x,y:position.y};
        var lb = {x:position.x,y:position.y + size.y - 1};
        var rb = {x:position.x + size.x - 1,y:position.y + size.y - 1};
        var rt = {x:position.x + size.x - 1,y:position.y};
/*
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
*/
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