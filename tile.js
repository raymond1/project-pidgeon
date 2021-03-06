//A tile has its own position, independent of the glyphs that it contains.
class Tile extends DrawingArea{
    constructor(options){
        super(options.parent) //This allows inheriting the functions from the DrawingArea class
        this.primary_glyph = options.primary_glyph?options.primary_glyph:undefined;
        if(this.primary_glyph){
            this.primary_glyph.parent = this
        }
        this.secondary_glyph = options.secondary_glyph;
        this.secondary_glyph_location = options.secondary_glyph_location; //"top", right, bottom, left. Refers to location of secondary glyph relative to primary glyph
        this.needs_drawing = options.needs_drawing?options.needs_drawing:true;
        this.position = options.position?options.position:{x:0,y:0};
        this.subcomponents = options.subcomponents?options.subcomponents:[]
        this.padding = options.padding?options.padding:0;
        this.htmlElement = options.htmlElement?options.htmlElement:null;
        this.line_number = options.line_number?options.line_number: 0;
    }

    get glyph_id(){
        var glyph_id = this.primary_glyph.glyph_id
        return glyph_id
    }

    getBaselineHeight(){
        var distance_from_tile_top_to_primary_glyph_top = Document.convertScreenSizeToPSSize(this.primary_glyph.position, this.parent.direction_buffer.pointer.primary_direction, this.parent.direction_buffer.pointer.secondary_direction).y
        var return_value = this.size.y + distance_from_tile_top_to_primary_glyph_top - this.primary_glyph.size.y
        return return_value
    }

    shallowClone(){
        var new_tile = new Tile(
            {
                parent: this.parent, 
                primary_glyph:this.primary_glyph, 
                secondary_glyph:this.secondary_glyph,
                needs_drawing:this.needs_drawing,
                position:this.position, 
                subcomponents:this.subcomponents,
                padding:this.padding,
                htmlElement:this.htmlElement
            }
        )

        return new_tile
    }


    //Marks the tile as requiring a redraw
    needsDrawing(){
        if (this.primary_glyph){
            this.primary_glyph.needs_drawing = true;
        }
        if (this.secondary_glyph){
            this.secondary_glyph.needs_drawing = true;
        }

        this.needs_drawing = true;
    }

    //Location can be one of top, right, bottom, left
    changeSecondaryGlyphLocation(location){
        this.secondary_glyph_location = location;
        if (this.secondary_glyph){
            if (location == 'top'){
                this.secondary_glyph.position = {x: this.primary_glyph.width/2 - this.secondary_glyph.width/2,y: 0};
                this.primary_glyph.position = {x: 0, y: this.secondary_glyph.size.y};
            }else if (location == 'right'){
                this.secondary_glyph.position = {x: this.primary_glyph.width, y: this.primary_glyph.height/2 -this.secondary_glyph.height/2};
                this.primary_glyph.position = {x: 0, y: 0};
            }
            else if (location == 'bottom'){
                this.secondary_glyph.position = {x: this.primary_glyph.width/2 - this.secondary_glyph.width/2,y: this.primary_glyph.height};
                this.primary_glyph.position = {x: 0, y: 0};
            }
            else if (location == 'left'){
                this.secondary_glyph.position = {x: 0,y: this.primary_glyph.height/2 - this.secondary_glyph.height/2};
                this.primary_glyph.position = {x: this.secondary_glyph.width, y: 0};
            }            
        }

        //Move to the upper left corner relative to the cursor
        this.draw();
    }

    //Given an array of numeric values, finds the lowest value in the array
    //Returns the lowest index where that value can be found
    getHighestIndexContainingLowestValue(input_array){
        //var index = -1;
        //var first_value_gotten = false;
        var lowest_value_value = null;
        for (var i = 0; i < input_array.length; i++){
            if (lowest_value_value == null){
                lowest_value_value = input_array[0];
            }else{
                if (input_array[i] < lowest_value_value){
                    lowest_value_value = input_array[i]
                }
            }
        }


        //Now, with lowest_value, find the highest index that has that value
        var lowest_value_index = -1
        for (var i = 0; i < input_array.length; i++){
            if (input_array[i] == lowest_value_value) lowest_value_index = i
        }

        return lowest_value_index;
    }

    undraw(){
        $(this.htmlElement).remove();        
    }

    //Draws a tile and its primary and secondary glyphs
    draw(){
            if (!this.htmlElement){
                this.htmlElement = document.createElement('div');            
                this.htmlElement.style.position = 'absolute';
                this.htmlElement.style.backgroundColor = '#ffe';

                var innerHtmlElement = document.createElement('div');
                innerHtmlElement.style.position = 'relative';
                this.htmlElement.className = "output_tile"
                this.htmlElement.onclick = function(){
                    console.log(JSON.stringify(this.position))
                    console.log('size' + JSON.stringify(this.size))
                }.bind(this)
                this.htmlElement.append(innerHtmlElement);

                $('#message_area').append(this.htmlElement);
            }
            var tl_corner = this.getScreenCoordinatesTLCorner();
            this.htmlElement.style.left = tl_corner.x + 'px';
            this.htmlElement.style.top = tl_corner.y + 'px';
            var screen_size = Document.getScreenSizeFromPSSize(this.size, this.parent.direction_buffer.pointer.primary_direction)
            
            this.htmlElement.style.width = screen_size.x + 'px';
            this.htmlElement.style.height = screen_size.y + 'px';
            this.htmlElement.style.padding = this.padding + 'px';


            if (this.secondary_glyph){
                this.secondary_glyph.draw();
            }

            this.primary_glyph.draw();

            for (var i = 0; i < this.subcomponents.length; i++){
                this.subcomponents[i].draw()
            }
            this.needs_drawing = false;
    }

    //Returns the size of a tile in screen coordinates
    get screen_size(){
        if (this.secondary_glyph == null){
            var new_size = {
                x:this.primary_glyph.size.x,
                y:this.primary_glyph.size.y
            };
            return new_size;    
        }
        var screen_size = {x:0, y:0}
        if (this.secondary_glyph_location == "top"){
            screen_size = {
                x: Math.max(this.primary_glyph.size.x,this.secondary_glyph.size.x),
                y: this.primary_glyph.size.y + this.secondary_glyph.size.y
            }
        }
        else if (this.secondary_glyph_location == "right"){
            screen_size = {
                x: this.primary_glyph.size.x + this.secondary_glyph.size.x,
                y: Math.max(this.primary_glyph.size.y, this.secondary_glyph.size.y)
            }
        }
        else if (this.secondary_glyph_location == "bottom"){
            screen_size = {
                x: Math.max(this.primary_glyph.size.x,this.secondary_glyph.size.x),
                y: this.primary_glyph.size.y + this.secondary_glyph.size.y
            }
        }
        else if (this.secondary_glyph_location == "left"){
            screen_size = {
                x: this.primary_glyph.size.x + this.secondary_glyph.size.x,
                y: Math.max(this.primary_glyph.size.y, this.secondary_glyph.size.y)
            }
        }
        return screen_size
    }

    //returns top left corner in screen coordinates
    get screen_coordinates(){
        return this.getScreenCoordinatesTLCorner()
    }

    //returns top left corner in screen coordinates
    get screen_position(){
        return this.screen_coordinates
    }


    //Given a set of screen coordinates, saves the corresponding ps coordinates
    set screen_coordinates(position){
        this.position = Document.convertScreenCoordinatesToPSCoordinates(position, this.parent.direction_buffer.pointer, this.parent.screen_size)
        if (isNaN(this.position.x))
        {
            console.log('position is not a number')
            debugger
        }
    }

    //Returns size in ps coordinates
    get size() {
        var size = this.calculateTileSize();
        return size;
    }

    //Returns width of the tile in PS coordinates
    get width(){
        var size = this.calculateTileSize();
        return size.x;
    }

    //Returns height of the tile in PS coordinates
    get height(){
        var size = this.calculateTileSize();
        return size.y;
    }

    //A tile consists of a primary glyph and possibly a secondary glyph.
    //This function calculates the size of the entire tile altogether.
    //Size is returned in PS coordinates
    calculateTileSize(){
        var screen_size = this.screen_size
        var ps_size = Document.convertScreenSizeToPSSize(screen_size, 
            this.parent.direction_buffer.pointer.primary_direction, 
            this.parent.direction_buffer.pointer.secondary_direction)
        return ps_size;
    }

    //Moves a tile to PS coordinates position
    move(position){
        this.position.x = position.x;
        this.position.y = position.y;
    }

    //Given the top-left coordinates where a tile is to be moved onto the screen, calculates the cooresponding ps coordinates and moves the tile there
    //Moves a tile to a screen coordinates position
    moveScreen(position){
        var corners_screen = DrawingArea.getScreenCorners(position, this.screen_size)
        var corners_ps = []
        for (var i = 0; i < 4; i++){
            corners_ps.push(Document.convertScreenCoordinatesToPSCoordinates(corners_screen[i], this.parent.direction_buffer.pointer, this.parent.screen_size))
        }

        var bl_corner = DrawingArea.getBLCorner(corners_ps)

        this.position.x = bl_corner.x
        this.position.y = bl_corner.y
    }
}
