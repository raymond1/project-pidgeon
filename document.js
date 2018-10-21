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

    //Assume that an existing tile belongs to a line with sufficient space to hold it
    //Assume all previous tiles on a line have already been aligned
    //Align the tile' to be added's primary glyph to the existing tile's primary glyph
    //Determine how much more room on a line is needed for the new tile to be added.
    //If no space needs to be added, the return value is {x:0,y:0}, where x represents space that needs to be added to the primary direction, and y represents the space that needs to be added in the secondary direction
    //Calculations are done in PS Space
    getSecondarySpaceRequired(new_tile, previous_tile){
        //1)Align the primary glyphs of new_tile and previous_tile
        var x = new_tile.size.x
//        var y = s

        var previous_tile_bottom = 0
        var previous_tile_top = previous_tile.size.y - 1

        var previous_tile_primary_glyph_offset = Document.convertScreenCoordinatesToPSCoordinates(previous_tile.primary_glyph.position, this.direction_buffer.pointer)

        var new_tile_primary_glyph_offset = Document.convertScreenCoordinatesToPSCoordinates(new_tile.primary_glyph.position, this.direction_buffer.pointer)
        var new_tile_top = previous_tile_y_top + previous_tile_primary_glyph_offset.y + new_tile_primary_glyph_offset.y
        var new_tile_bottom = new_tile_top - (new_tile.size.y - 1)

        var y = 0
        if (new_tile_top > previous_tile_top){
            y = y + new_tile_top - previous_tile_top
        }

        if (new_tile_bottom < previous_tile_bottom){
            y = y + previous_tile_bottom - new_tile_bottom
        }

        return {x:x, y:y}
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

    //Returns the lower-left corner in PS coordinates of new_tile after the primary glyph of new_tile has been aligned with that of existing_tile
    //Alignment occurs in screen coordinates.
    getAlignedPosition(existing_tile,new_tile){
        //let x and y bet the coordinates of the new tile after alignment
        var x = existing_tile.position.x + existing_tile.size.x

        var y_distance_from_tile_top_to_primary_glyph_top = Document.convertScreenCoordinatesToPSCoordinates(existing_tile.primary_glyph.position, this.direction_buffer.pointer).y
        var distance_from_primary_glyph_to_tile_bottom = existing_tile.getBaselineHeight()
        var y =

existing_tile.position.y +
existing_tile.size.y - 1 +
y_distance_from_tile_top_to_primary_glyph_top -
existing_tile.primary_glyph.size.y + 1
            - distance_from_primary_glyph_to_tile_bottom

        return {x:x,y:y}
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

    //Tiles is an array  of tiles to place on the baseline
    //Baseline is the height above the y value of the position passed in {x,y}(given in ps coordinates)
    putTilesOnBaseline(tiles,baseline,position){
        for (var i = 0; i < tiles.length; i++){
            var tile = tiles[i]
            var height = position.y + baseline - tile.getBaselineHeight()

            tile.move({x:tile.position.x,y:height})
        }
    }
    //If existing_tile is null, append to head
    //new_tile is placed after existing_tile if existing_tile is provided
    //If no existing_tile is provided, new_tile is appended to the end
    //Attempts to place new_tile onto the document. 
    //returns {success:true} on success, {success:false} on failure
    insertTile(new_tile, existing_tile){
        var results = {success: false}

        if (!existing_tile){
            if (this.spaceAvailable(new_tile.size,{x:0,y:0})){
                new_tile.move({x:0,y:0})
                this.tiles.append(new_tile)
                return {success: true}
            }
            else{
                return {success:false}
            }
        }

        //Try the same line. If space is not available, try the next line.
        var space_available_results = this.spaceAvailableOnSameLine(existing_tile, new_tile);
        if (space_available_results.success){
            //add new_tile on same line, aligning the primary tiles and expanding line length if necessary
            var new_position
            if (!existing_tile){
                new_position = {x:0,y:0}
                new_tile.line_number = 0
            }
            else{
                new_tile.line_number = existing_tile.line_number
                new_position = {x:existing_tile.position.x + existing_tile.size.x, y: existing_tile.position.y}
            }

            new_tile.move(new_position)
            results.success = true
        }else{
            console.log('not enough space')
            if (space_available_results.failure_reasons.not_enough_primary_space){
                //if there is not enough primary space, make a new line

                console.log('not enough primary space')
                results.success = this.addTileToNewLine(existing_tile,new_tile)
            }else if (space_available_results.failure_reasons.not_enough_secondary_space){
                //if there is not enough secondary space, 
                console.log('not enough secondary space')

                //existing line bounding box in PS coordinates
                var line_bounding_box = this.getLineBoundingBox(existing_tile.line_number)


                //if the height of the bounding box were to be increased, how much would it need to be increased at the top? At the bottom?
                var bounding_box_top_and_bottom_increases = this.getRequiredLineBoundingBoxIncreases(line_bounding_box, existing_tile, new_tile)
                var top_increase = bounding_box_top_and_bottom_increases.top
                var bottom_increase = bounding_box_top_and_bottom_increases.bottom

                var line_bounding_box_plus_extensions = {}
                line_bounding_box_plus_extensions.size = {x:line_bounding_box.size.x, y: line_bounding_box.size.y + top_increase + bottom_increase};
                line_bounding_box_plus_extensions.position = {x:line_bounding_box.position.x, y: line_bounding_box.position.y}

                if (this.spaceAvailable(line_bounding_box_plus_extensions.position,line_bounding_box_plus_extensions.size)){
                    //There is enough space. The question is where to put the tiles
                    var tiles_on_line = this.getAllTilesOnLine(existing_tile.line_number)

                    var baseline = this.getBaselineHeight(tiles_on_line)
                    this.putTilesOnBaseline(tiles_on_line,baseline, line_bounding_box_plus_extensions.position)
                    results.success = true

                }else{
                    results.success = false
                }
            }
        }

        //Adds the tile to the model
        if (results.success){
            this.tiles.insertAfter(new_tile, existing_tile)
        }
        return results;
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

        if(tiles_on_line.length == 0){
            debugger
        }
        var tiles_bounding_box = this.areaGlom(tiles_on_line)

        var line_bounding_box = {}
        try{
            line_bounding_box.position = {x:0,y:tiles_bounding_box.position.y}
        }
        catch(e){
            debugger
        }
        line_bounding_box.size = {x: this.size.x,y:tiles_bounding_box.size.y}
        return line_bounding_box
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
    //Returns the tile that was added
    addPrimaryTile(primary_glyph_string){
        //1)First create a new tile with the correct glyph so that it has a calculatable size
        var new_glyph =
        new Glyph(
            this.getImageURLFromPrimaryGlyphString(primary_glyph_string),
            {x:50,y:50} //Primary tile size
        );

        var new_tile = new Tile({primary_glyph:new_glyph, parent_document: this});
        new_glyph.parent_tile = new_tile;
        var results = this.insertTile(new_tile,this.tiles.last);
        if (!results.success){
            console.log('Error placing tile');
        }
        else{
            this.cursor.update()
            return new_tile
        }
    }

    modifyTile(secondary_glyph_string,tile_to_modify){
        if (!tile_to_modify){
            tile_to_modify = this.tiles.last
        }

        var glyph_image_url = this.getImageURLFromPrimaryGlyphString(secondary_glyph_string);
        var new_tile = tile_to_modify.shallowClone()
        if (!new_tile.secondary_glyph){
            new_tile.secondary_glyph = new Glyph(glyph_image_url, {x:25,y:25}, new_tile);
        }
        new_tile.secondary_glyph.image_url = glyph_image_url;
        new_tile.needs_drawing = false
        new_tile.htmlElement = null
        new_tile.primary_glyph = new Glyph(tile_to_modify.primary_glyph.image_url,
                    {x:50,y:50})
        new_tile.primary_glyph.parent_tile = new_tile
        //.htmlElement = null
        new_tile.secondary_glyph.htmlElement = null
        new_tile.changeSecondaryGlyphLocation(this.getDefaultSecondaryGlyphPosition(secondary_glyph_string));

        new_tile.needsDrawing()

        var return_value = this.insertTile(new_tile, tile_to_modify.previous)
        if (return_value.success){
            tile_to_modify.undraw()
            this.tiles.remove(tile_to_modify)
        }else{
            console.log('Error while modifying tile')
        }
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
            this.insertTile(tile);
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
        if (direction_parameters.primary_direction == "top to bottom"){
            sc_pv = {x:0,y:-1}
        }else if (direction_parameters.primary_direction == "right to left"){
            sc_pv = {x:-1,y:0}
        }
        else if (direction_parameters.primary_direction == "bottom to top"){
            sc_pv = {x:0,y:1}
        }
        else if (direction_parameters.primary_direction == "left to right"){
            sc_pv = {x:1,y:0}
        }

        var sc_sv = {} //screen_coordinates primary vector
        if (direction_parameters.secondary_direction == "top to bottom"){
            sc_sv = {x:0,y:-1}
        }else if (direction_parameters.secondary_direction == "right to left"){
            sc_sv = {x:-1,y:0}
        }
        else if (direction_parameters.secondary_direction == "bottom to top"){
            sc_sv = {x:0,y:1}
        }
        else if (direction_parameters.secondary_direction == "left to right"){
            sc_sv = {x:1,y:0}
        }

        return [sc_pv,sc_sv]
    }
}