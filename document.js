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

        this.size = this.getPSSizeFromScreenSize()
        this.position = {x:0,y:0}
    }

    getPSSizeFromScreenSize(){
        if (this.direction_buffer.pointer.primary_direction == "top to bottom"||this.direction_buffer.pointer.primary_direction == "bottom to top"){
            return {x:this.screen_size.y, y: this.screen_size.x}
        }else{
            return {x:this.screen_size.x, y: this.screen_size.y}
        }
    }

    static getScreenSizeFromPSSize(ps_size, primary_direction){
        if (primary_direction == "top to bottom"||primary_direction == "bottom to top"){
            return {x:ps_size.y, y: ps_size.x}
        }else if (primary_direction == "left to right"||primary_direction == "right to left"){
            return {x:ps_size.x, y: ps_size.y}
        }else{
            console.log('Unexpected primary direction in getScreenSizeFromPSSize')
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
        var return_value = true;
        //If any of the four corners is out of the drawing area, then the tile does not fit on the page
        if (point.x < 0 || point.x > this.size.x){
            return_value = false;
        } else if (point.y < 0 || point.y > this.size.y){
            return_value = false;
        }

        return return_value;
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


    //given an array of numbers, returns the maximum
    static getMaximum(numeric_array){
        if (numeric_array.length == 1){
            return numeric_array[0]
        }
        else if (numeric_array.length == 2){
            return Math.max(numeric_array[0],numeric_array[1])
        }
        else{
            return Math.max(numeric_array[0], Document.getMaximum(numeric_array.slice(1)))
        }
    }
    //Looks at all the tiles, aligns them according to the current document direction, and calculates the offset from the bottom of the lowest point in the alignment
    //to the height at which all the primary glyphs are lined up. Uses PS cordinates. Return value also in PS coordinates.
    getBaselineHeight(tiles){
        var all_baselines = []
        //Get the maximum baseline
        for (var i = 0; i < tiles.length; i++){
            var tile = tiles[i]
            var baseline = tile.getBaselineHeight()
            all_baselines.push(baseline)
        }
        var maximum_baseline = Document.getMaximum(all_baselines)
        return maximum_baseline
    }




    //Given an object, line_bounding_box({size,position}), an existing tile on a line and the tile that will be added, calculate how much the existing line bounding box needs to be increased
    //at the top and bottom in order for the new tile to fit on the line properly
    //using PS coordinates to calculate the increase
    getRequiredLineBoundingBoxIncreases(line_bounding_box, existing_tile, new_tile){
        var bottom_increase = 0
        var top_increase = 0
        var new_tile_position = this.getAlignedPosition(existing_tile,new_tile)
        if (new_tile_position.y < line_bounding_box.position.y){
            bottom_increase = line_bounding_box.position.y - new_tile_position.y
        }

        var top_of_line_bounding_box = line_bounding_box.position.y + line_bounding_box.size.y - 1
        if (new_tile_position.y + new_tile.size.y - 1 > top_of_line_bounding_box){
            top_increase = new_tile.position.y + new_tile.size.y - 1 - top_of_line_bounding_box 
        }

        return {top: top_increase, bottom: bottom_increase}
    }



    //Tiles is an array  of tiles to place on the baseline
    //Baseline is the height above the y value of the position passed in {x,y}(given in ps coordinates)
    putTilesOnBaseline(tiles,baseline,position){
        for (var i = 0; i < tiles.length; i++){
            var tile = tiles[i]
            var height = position.y + baseline - tile.getBaselineHeight()

            tile.move({x:tile.position.x,y:height})
        }
    }


    //If there is space for the new tile on a new line, then add it
    //If the operation is successful, return true, otherwise return false
    addTileToNewLine(previous_line_tile, new_tile){
        if (previous_line_tile == null){
            //check if the tile fits into the page
            if (Document.isCornerSetWithinCornerSet([{x:0, y:0}, {x:new_tile.size.x - 1, y: new_tile.size.y - 1}], [{x:0,y:0},{x: this.size.x -1, y: this.size.y -1}])) {
                new_tile.move({x:0,y:0})
                new_tile.line_number = 0
                return true
            }
            else{
                return false
            }
        }else{

            var previous_line_bounding_box = this.getLineBoundingBox(previous_line_tile.line_number)
            //var previous_line_bounding_box_lt = {x:0, y:previous_line_bounding_box.position.y + previous_line_bounding_box.size.y - 1}
            //var previous_line_bounding_box_rb = {x:, y:previous_line_bounding_box.position.y + previous_line_bounding_box.size.y - 1}
            var test_bounding_box = [{x:0, y:previous_line_bounding_box.position.y + previous_line_bounding_box.size.y + new_tile.size.y - 1},
                {x:previous_line_bounding_box.size.x - 1, y: previous_line_bounding_box.position.y + previous_line_bounding_box.size.y}]
            if (Document.isCornerSetWithinCornerSet(test_bounding_box, [{x:0,y:this.size.y -1},{x: this.size.x -1, y: 0}]))
            {
                var new_tile_location = {x: 0, y: previous_line_tile.position.y + previous_line_tile.size.y}
                new_tile.line_number = previous_line_tile.line_number + 1
                new_tile.move(new_tile_location)
                return true                
            }else{
                return false
            }

        }
    }

    //Takes in an array of sizes and positions and calculates the smallest rectangle and size object that will contain all the the rectangles passed in the array
    //Calculations are done in PS coordinates
    //Returns an object with size and position properties
    areaGlom(tiles_array){
        var return_value = {}
        if (tiles_array.length == 0){
            return undefined
        }else
        if (tiles_array.length == 1){
            return_value.size = {}
            return_value.size.x = tiles_array[0].size.x
            return_value.size.y = tiles_array[0].size.y
            return_value.position = {}
            return_value.position.x = tiles_array[0].position.x
            return_value.position.y = tiles_array[0].position.y
            return return_value
        } else

        if (tiles_array.length == 2){
            var left = Math.min(tiles_array[0].position.x, tiles_array[1].position.x)
            var right = Math.max(tiles_array[0].position.x + tiles_array[0].size.x - 1, tiles_array[1].position.x + tiles_array[1].size.x - 1)
            var bottom = Math.min(tiles_array[0].position.y, tiles_array[1].position.y)
            var top = Math.max(tiles_array[0].position.y + tiles_array[0].size.y - 1, tiles_array[1].position.y + tiles_array[1].size.y - 1)

            return_value.position = {x:left,y:bottom}
            return_value.size = {x: right - left + 1,y: top - bottom + 1}

            return return_value
        }
        else{
            return this.areaGlom([this.areaGlom(tiles_array.slice(0,2))].concat(tiles_array.slice(2)))
        }
    }

    areaGlomScreen(tiles_array){
        var ps_area_glom = this.areaGlom(tiles_array)
        return Document.convertPSBoundingBoxToScreenCoordinatesBoundingBox(ps_area_glom, this.direction_buffer.pointer)
    }

    //Takes in a tile and a size{x,y} representing the size of the new tile t, and determines whether or not the new tile can be added to the same line as the preceding tile
    //When adding a tile, align the primary tiles of the preceding tile and the tile being added. Thus, a tile with a secondary glyph on top and a tile with a secondary glyph on the bottom will
    //have their primary tiles aligned, but the entire preceding tile itself will not be aligned with the tile with the secondary glyph on the bottom
    //Upon success, returns {success:true}. Upon failure, returns
    //Calculations are in primary-secondary space
    //In PS Space, left is x = smaller. right is x is bigger. up is y is bigger. down is y is smaller
    //Lower-left corner of a tile is at the tile's position
    //assumes preceding_tile is not null
    spaceAvailableOnSameLine(preceding_tile, tile_to_be_added){
        var test_tile_position = this.getAlignedPosition(preceding_tile,tile_to_be_added)

        //calculate the new tile's position
        var test_tile_lt = {x: test_tile_position.x,y: test_tile_position.y + tile_to_be_added.size.y - 1}
        var test_tile_rb = {x: test_tile_position.x + tile_to_be_added.size.x - 1,y: test_tile_position.y}
        var test_tile_diagonal_corners = [test_tile_lt,test_tile_rb]

        //calculate the line's bounding box
        var line_bounding_box = this.getLineBoundingBox(preceding_tile.line_number)
        var line_bounding_box_lt = {x:line_bounding_box.position.x,y:line_bounding_box.position.y + line_bounding_box.size.y - 1}
        var line_bounding_box_rb = {x:line_bounding_box.position.x + line_bounding_box.size.x - 1,y:line_bounding_box.position.y}

        var line_bounding_box_diagonal_corners = [line_bounding_box_lt,line_bounding_box_rb]

        if (Document.isCornerSetWithinCornerSet(test_tile_diagonal_corners, line_bounding_box_diagonal_corners)){
            return {success:true}
        }else{
            var not_enough_primary_space = false;
            var not_enough_secondary_space = false;

            if (test_tile_rb.x > line_bounding_box_rb.x){
                not_enough_primary_space = true
            }

            if (test_tile_lt.y > line_bounding_box_lt.y|| test_tile_rb.y < line_bounding_box_rb.y){
                not_enough_secondary_space = true
            }
            return {success:false, failure_reasons:{not_enough_primary_space:not_enough_primary_space, not_enough_secondary_space: not_enough_secondary_space}}
        }
    }

    //Given 2 sets of of 2 diagonal corners [lt, rb], determine if the first is placed within the second without overflow.
    static isCornerSetWithinCornerSet(test_set,bounding_set){
        if (test_set[0].x >= bounding_set[0].x //not before the left boundary
            && test_set[0].y <= bounding_set[0].y //not before the top boundary
            && test_set[1].x <= bounding_set[1].x //not after the right boundary
            && test_set[1].y >= bounding_set[1].y){ //not after the bottom boundary
            return true
        }
        return false
    }

    changeWritingDirection(){
        var old_direction = this.direction_buffer.pointer

        this.direction_buffer.pointer = this.direction_buffer.pointer.next
        this.size = this.getPSSizeFromScreenSize()

        this.retile()
    }

    
    //Takes in a glyph string(a unique string corresponding to each one of the glyphs) and puts a tile with that glyph on the page.
    //This function is executed when the user clicks on a button to add a new primary glyph
    addPrimaryTile(primary_glyph_string){
        //1)First create a new tile with the correct glyph so that it has a calculatable size
        var new_glyph =
        new Glyph(
            this.getImageURLFromPrimaryGlyphString(primary_glyph_string),
            {x:50,y:50} //Primary tile size
        );
        var new_tile = new Tile({primary_glyph:new_glyph, parent: this});

        //this.insertTile(new_tile,this.tiles.last);

        this.retileWithNewTile(new_tile)
    }

    modifyTile(secondary_glyph_string,tile_to_modify){
        if (!tile_to_modify){
            tile_to_modify = this.tiles.last
        }

        //If there is space after the modification, then the modification should be allowed to proceed

        var glyph_image_url = this.getImageURLFromPrimaryGlyphString(secondary_glyph_string);
        if (!tile_to_modify.secondary_glyph){
            tile_to_modify.secondary_glyph = new Glyph(glyph_image_url, {x:25,y:25}, tile_to_modify);
        }else{
            tile_to_modify.secondary_glyph = glyph_image_url
        }
        tile_to_modify.changeSecondaryGlyphLocation(this.getDefaultSecondaryGlyphPosition(secondary_glyph_string));
        var modified_tile = this.removeTileFromEnd(tile_to_modify)
        this.retileWithNewTile(modified_tile)
     }

    getDefaultSecondaryGlyphPosition(secondary_glyph_string){
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
            tile_iterator.draw();
            tile_iterator = tile_iterator.next;
        }
        this.cursor.update();
    }



    retile(){
        var old_tiles = this.tiles
        this.tiles = new LinkedList()

        var tile = old_tiles.head;
        while (tile){
            var temp = tile.next
            tile.next = null
            this.retileWithNewTile(tile);
            tile = temp;
        }
        old_tiles = null
        this.cursor.update()
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

    static dotProduct(v1,v2){
        return v1.x * v2.x + v1.y * v2.y
    }

    //screen coordianates if of the form {x,y}. larger x on right, smaller x on left. Larger y on top, smaller y on bottom.
    //direction_parameters is of a form similar to {primary_direction: "top to bottom", secondary_direction: "left to right"}
    static convertScreenCoordinatesToPSCoordinates(screen_coordinates, direction_parameters){
        var direction_vectors = Document.convertDirectionParametersToScreenVectors(direction_parameters)
        var p = Document.dotProduct(screen_coordinates, direction_vectors[0])
        var s = Document.dotProduct(screen_coordinates, direction_vectors[1])

        return {x:p,y:s}
    }

    //Returns [(x,y),(x,y)] where the first vector is the primary direction vector in screen coordinates
    //and the second vector is the secondary direction vector in screen coordinates
    static convertDirectionParametersToScreenVectors(direction_parameters){
        var sc_pv = {} //screen_coordinates primary vector
        if(!direction_parameters){
            debugger
        }
        if (direction_parameters.primary_direction == "top to bottom"){
            sc_pv = {x:0,y:1}
        }else if (direction_parameters.primary_direction == "right to left"){
            sc_pv = {x:-1,y:0}
        }
        else if (direction_parameters.primary_direction == "bottom to top"){
            sc_pv = {x:0,y:-1}
        }
        else if (direction_parameters.primary_direction == "left to right"){
            sc_pv = {x:1,y:0}
        }

        var sc_sv = {} //screen_coordinates primary vector
        if (direction_parameters.secondary_direction == "top to bottom"){
            sc_sv = {x:0,y:1}
        }else if (direction_parameters.secondary_direction == "right to left"){
            sc_sv = {x:-1,y:0}
        }
        else if (direction_parameters.secondary_direction == "bottom to top"){
            sc_sv = {x:0,y:-1}
        }
        else if (direction_parameters.secondary_direction == "left to right"){
            sc_sv = {x:1,y:0}
        }

        return [sc_pv,sc_sv]
    }


    //Calculations are performed in PS coordinates
    //Current line refers to the position of the last added tile
    enoughPrimarySpaceOnCurrentLine(tile){
        var tile_x_position = 0
        if (this.tiles.size > 0){
            var tile_x_position = this.tiles.last.position.x + this.tiles.last.size.x
        }
        var tile_right_corner_x_position = tile_x_position + tile.size.x - 1

        if (tile_right_corner_x_position < this.size.x){
            return true
        }else{
            return false
        }
    }

    //Returns whether there is enough space on the same line as the last tile added for the new tile to be added.
    //Currently, this function is incomplete

    //Starts with screen coordinates for tile alignment and line box calculations
    //If no tiles exist, find the height of the tile and determine if it fits onto the page
    //If tiles already exist, then
    //  1)calculate the bounding box in screen coordinates for the existing tiles on the same line as the last line
    //  2)align the new tile with the last tile in screen coordinates and calculate the bounding box that contains the new tiles
    //  3)Determine if the new box fits into the previous box
    //  4)If it doesn't fit, it must be because of the secondary space, not the x space, as that has already be checked at this point by the enoughPrimarySpace function
    enoughSecondarySpaceOnCurrentLine(tile){
        if (this.tiles.size == 0){
            if (this.size.y >= tile.size.y){
                return true
            }else{
                return false
            }
        }else{
            var existing_line_bounding_box = this.getLineBoundingBox(this.tiles.last.line_number)

            //Need to find the location that the tile needs to be placed in
            var aligned_position = this.getAlignedPosition(this.tiles.last, tile)
            
            //Is the new tile within bounds, or out of bounds?
            var new_tile_bounding_box = {size: {x: tile.size.x, y:tile.size.y}, position: aligned_position}
            if (Document.isBoundingBoxInBoundingBox(new_tile_bounding_box,existing_line_bounding_box)){
                return true
            }else{
                return false
            }
        }
    }

    //Returns all tile objects on the same line as the last tile added
    getCurrentLineTiles(){
        return this.getAllTilesOnLine(this.tiles.last.line_number)
    }

    //given a line number, retrieves all tiles with that line number
    getAllTilesOnLine(line_number){
        var tiles = []
        var tile_iterator = this.tiles.head
        while (tile_iterator){
            if (tile_iterator.line_number == line_number){
                tiles.push(tile_iterator)
            }
            tile_iterator = tile_iterator.next
        }
        return tiles
    }

    //A line must have at least one tile in it for it to be a line
    //returns an object {position:{x,y}, size:{x,y}} containing the points on the line indicated by line_number
    getLineBoundingBox(line_number){
        var tiles_on_line = []
        var tile_iterator = this.tiles.head
        while (tile_iterator){
            if (tile_iterator.line_number == line_number){
                tiles_on_line.push(tile_iterator)
            }

            tile_iterator = tile_iterator.next
        }

        var tiles_bounding_box = this.areaGlom(tiles_on_line)

        var line_bounding_box = {}
        line_bounding_box.position = {x:0,y:tiles_bounding_box.position.y}
        line_bounding_box.size = {x: this.size.x,y:tiles_bounding_box.size.y}
        return line_bounding_box
    }

    getAlignedPositionScreen(existing_tile, new_tile){
        //Calculate the top left corner of the new tile to be added
        var new_screen_coordinates = {}

        if (this.direction_buffer.pointer.primary_direction == "top to bottom"){
            new_screen_coordinates.y = existing_tile.screen_coordinates.y + existing_tile.screen_size.y
        }
        else if (this.direction_buffer.pointer.primary_direction == "right to left"){
            new_screen_coordinates.x = existing_tile.screen_coordinates.x - existing_tile.screen_size.x
        }
        else if (this.direction_buffer.pointer.primary_direction == "bottom to top"){
            new_screen_coordinates.y = existing_tile.screen_coordinates.y - existing_tile.screen_size.y
        }
        else if (this.direction_buffer.pointer.primary_direction == "left to right"){
            new_screen_coordinates.x = existing_tile.screen_coordinates.x + existing_tile.screen_size.x
        }

        if (this.direction_buffer.pointer.secondary_direction == "top to bottom"){
            new_screen_coordinates.y = existing_tile.screen_coordinates.y + existing_tile.primary_glyph.position.y - new_tile.primary_glyph.position.y
        }
        else if (this.direction_buffer.pointer.secondary_direction == "right to left"){
            new_screen_coordinates.x = existing_tile.screen_coordinates.x + existing_tile.primary_glyph.position.x - new_tile.primary_glyph.position.x
        }
        else if (this.direction_buffer.pointer.secondary_direction == "bottom to top"){
            new_screen_coordinates.y = existing_tile.screen_coordinates.y + existing_tile.primary_glyph.position.y - new_tile.primary_glyph.position.y
        }
        else if (this.direction_buffer.pointer.secondary_direction == "left to right"){
            new_screen_coordinates.x = existing_tile.screen_coordinates.x + existing_tile.primary_glyph.position.x - new_tile.primary_glyph.position.x
        }
        return new_screen_coordinates        
    }

    //Returns the lower-left corner in PS coordinates of new_tile after the primary glyph of new_tile has been aligned with that of existing_tile in screen coordinates
    getAlignedPosition(existing_tile,new_tile){
        var new_screen_coordinates = this.getAlignedPositionScreen(existing_tile,new_tile)
        var ps_bl_coordinates = Document.convertScreenCoordinatesToPSCoordinates(new_screen_coordinates, this.direction_buffer.pointer)

        return {x:ps_bl_coordinates.x,y:ps_bl_coordinates.y}
    }

    //test_area and containing area are of the form: {position: {x,y},size:{x,y}}
    //positions are lower left corners, and ps coordinates are used
    static isBoundingBoxInBoundingBox(test_area, containing_area){
        if (test_area.position.x < containing_area.position.x){
            return false
        }

        if (test_area.position.x + test_area.size.x - 1 > containing_area.position.x + containing_area.size.x - 1){
            return false
        }

        if (test_area.position.y < containing_area.position.y){
            return false
        }

        if (test_area.position.y + test_area.size.y - 1 > containing_area.position.y + containing_area.size.y - 1){
            return false
        }

        return true
    }

    //Determines the height of the line bounding box if tile were added to the current line
    //If there is no current line, use the height of the current tile as the height of the line
    //Calculations are done in PS Space
    getSecondarySpaceRequired(tile){
        if (this.tiles.size == 0){
            return tile.size.y
        }

        var line_bounding_box = this.getLineBoundingBox(this.tiles.last.line_number)

        tile.move(this.getAlignedPosition(this.tiles.last,tile))

        var area_required = this.areaGlom([tile].concat(this.getAllTilesOnLine(this.tiles.last.line_number)))

        return area_required.size.y
    }

    //High level algorithm for tile placement
    //Is there enough primary space on the line?
    //  If yes, then is there enough secondary space on the line?
    //    If there is enough secondary space on the line, then add the tile to the line
    //    If there is not enough secondary space on the line, then check if the line can be expanded to have enough secondary space
    //      If the line can be expanded, then expand the line and add the tile
    //        If the line cannot be expanded then do not add the tile
    //If there is not enough primary on the line, then can another line be added to fit the tile?
    //  If yes, then add the new line, and add the tile
    //  If no, then there is not enough space to put the tile on the page
    retileWithNewTile(new_tile){
        //What is the size in PS coordinates?
        if (this.enoughPrimarySpaceOnCurrentLine(new_tile)){
            console.log('enough primary space')
            if (this.enoughSecondarySpaceOnCurrentLine(new_tile)){
                var aligned_position
                //add the tile to the line
                if (this.tiles.size > 0){                
                    aligned_position = this.getAlignedPosition(this.tiles.last,new_tile)
                }else{
                    aligned_position = {x:0,y:0}
                }
                new_tile.move(aligned_position)
                new_tile.draw()
                this.tiles.append(new_tile)
            }else{
                //Could the line be expanded in order to have enough secondary space?
                //Get the amount of space required for the line expansion
                var line_bounding_box = this.getLineBoundingBox(this.tiles.last.line_number)
                var height_required = this.getSecondarySpaceRequired(new_tile)
                line_bounding_box.size.y = height_required
                if (Document.isBoundingBoxInBoundingBox(line_bounding_box, this)){
                    //Add the new tile to the current line, and retile the current line if necessary.
                    new_tile.line_number = this.tiles.last.line_number
                    this.tiles.append(new_tile)
                    var tiles_on_current_line = this.getAllTilesOnLine(this.tiles.last.line_number)
                    this.retileAsALine(tiles_on_current_line, Document.convertPSBoundingBoxToScreenCoordinatesBoundingBox(line_bounding_box, this.direction_buffer.pointer))
                    this.draw()
                }else{
                    console.log('Not enough secondary space')
                }
            }
        }else{
            console.log('not enough primary space')
            var tile_from_previous_line = this.tiles.last
            if (this.spaceAvailableOnNextLine(new_tile,tile_from_previous_line)){
                //Add
            }
        }
    }

    //Removes a tile from the end of the tiles and returns the removed tile
    removeTileFromEnd(){
        var last_tile = this.tiles.last
        this.tiles.remove(last_tile)
        return last_tile
    }

    //Given a bounding box {size:{x,y}, position:{x,y}} given in ps coordinates, convert the box into screen coordinates
    static convertPSBoundingBoxToScreenCoordinatesBoundingBox(bounding_box, direction_parameters){
        return {size: Document.getScreenSizeFromPSSize(bounding_box.size, direction_parameters.primary_direction),position: Document.convertPSCoordinatesToScreenCoordinates(bounding_box.position, direction_parameters)}
    }

    //given a set of ps coordinates {x,y} and a set of direction parameters(i.e{primary_direction: "top to bottom", secondary_direction: "left to right"}), converts them into screen coordinates
    static convertPSCoordinatesToScreenCoordinates(ps_coordinates, direction_parameters){
        var screen_coordinates = {}
        if (direction_parameters.primary_direction == "top to bottom"){
            screen_coordinates.y = ps_coordinates.x
        }
        else if (direction_parameters.primary_direction == "right to left"){
            screen_coordinates.x = -ps_coordinates.x
        }
        else if (direction_parameters.primary_direction == "bottom to top"){
            screen_coordinates.y = -ps_coordinates.x
        }
        else if (direction_parameters.primary_direction == "left to right"){
            screen_coordinates.x = -ps_coordinates.x
        }

        if (direction_parameters.secondary_direction == "top to bottom"){
            screen_coordinates.y = ps_coordinates.y
        }
        else if (direction_parameters.secondary_direction == "right to left"){
            screen_coordinates.x = -ps_coordinates.y
        }
        else if (direction_parameters.secondary_direction == "bottom to top"){
            screen_coordinates.y = -ps_coordinates.y
        }
        else if (direction_parameters.secondary_direction == "left to right"){
            screen_coordinates.x = -ps_coordinates.y
        }

        return screen_coordinates
    }

    //Takes in a bounding box in screen coordinates to place the tiles that will be lined up
    //given a set of tiles and a bounding box, puts the tiles on the same line, aligning the primary glyphs
    //bounding_box is of the form {size:{x,y}, position:{x,y} given in screen coordinates
    //position of the bounding box refers to the top left corner
    retileAsALine(tiles, bounding_box){
        if (tiles.length == 0) return

        //Align all the tiles at the origin, then, after alignment has been completed, translate the tiles so that they are inside the bounding box
        var alignment_type = this.getAlignmentType()
        if (alignment_type == "lefts"){
            var next_tile_position = Document.convertPSCoordinatesToScreenCoordinates({x:0,y:0}, this.direction_buffer.pointer)
            tiles[0].move(next_tile_position)
            for (var i = 1; i < tiles.length; i++){
                var next_tile_position = this.getAlignedPositionScreen(tiles[i - 1], tiles[i])
                tiles[i].moveScreen(next_tile_position)
            }

            //Shift the tiles right, if necessary to align the primary glyphs
            var tiles_bounding_box = this.areaGlomScreen(tiles)
            if (tiles_bounding_box.position.y < 0){
                for (var i = 0; i < tiles.length; i++){
                    tiles[i].screen_coordinates = {x:tiles[i].screen_coordinates.x - tiles_bounding_box.position.x, y:tiles[i].screen_coordinates.y }
                }
            }

            for (var i = 0; i < tiles.length; i++){
                tiles[i].screen_coordinates = {x:tiles[i].screen_coordinates.x + bounding_box.position.y,y:tiles[i].screen_coordinates.y}
            }
        }
        else if (alignment_type == "tops"){
            //Place all the tiles first, aligning top of the the primary glyphs with the top.
            //If there are any issues, move the tiles down by the amount that it protrudes above the top

            var next_tile_x_position
            if (this.direction_buffer.pointer.primary_direction == "left to right"){
                next_tile_x_position = 0
            }else if (this.direction_buffer.pointer.primary_direction == "right to left"){
                next_tile_x_position = this.size.x - tiles[0].size.x + 1
            }

            tiles[0].moveScreen({x: next_tile_x_position,y:0})
            for (var i = 1; i < tiles.length; i++){
                var next_tile_position = this.getAlignedPositionScreen(tiles[i - 1], tiles[i])
                tiles[i].moveScreen(next_tile_position)
            }

            //Shifts the tiles down, if necessary
            var tiles_bounding_box = this.areaGlomScreen(tiles)
            if (tiles_bounding_box.position.y < 0){
                for (var i = 0; i < tiles.length; i++){
                    tiles[i].screen_coordinates = {
                        x:tiles[i].screen_coordinates.x, 
                        y:tiles[i].screen_coordinates.y - tiles_bounding_box.position.y
                    }
                    console.log(JSON.stringify(tiles[i].screen_coordinates))

                }
            }

            for (var i = 0; i < tiles.length; i++){
                tiles[i].screen_coordinates = {x:tiles[i].screen_coordinates.x,y:tiles[i].screen_coordinates.y + bounding_box.position.y}
            }
        }
    }

    //If the secondary direction is in the vertical direction, then align the primary tile tops
    //otherwise, align the primary glyph left sides
    //Horizontal alignment
    getAlignmentType(){
        if (this.direction_buffer.pointer.secondary_direction.includes("top")){
            return "tops"
        }
        else{
            return "lefts"
        }
    }
}