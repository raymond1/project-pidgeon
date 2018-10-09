//A tile has its own position, independent of the glyphs that it contains.
class Tile{
    constructor(options){
        //options = {primary_glyph: a, position:b, secondary_glyph:c, secondary_glyph_location:d}
        this.parent_document = options.parent_document;
        this.primary_glyph = options.primary_glyph;
        this.secondary_glyph = options.secondary_glyph;
        this.secondary_glyph_location = options.secondary_glyph_location; //"top", right, bottom, left. Refers to location of secondary glyph relative to primary glyph
        this.needs_drawing = true;
        this.position = options.position?options.position:{};
        //this.htmlElement = null;
        this.padding = 0;
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

    //Returns the corner coordinates of the tile
    getCorners(){
        //Order for corners is left top, left bottom, right bottom, right top
        var lt = {x:this.position.x, y:this.position.y + this.size.y};
        var lb = {x:this.position.x, y:this.position.y};
        var rb = {x:this.position.x + this.size.x, y:this.position.y};
        var rt = {x:this.position.x + this.size.x, y:this.position.y + this.size.y};

        return [lt,lb,rb,rt];
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

    static switchIndices(input_array, index_to_switch_1, index_to_switch_2){
        var temp = input_array[index_to_switch_1]
        input_array[index_to_switch_1] = input_array[index_to_switch_2]
        input_array[index_to_switch_2] = temp
    }

    //Takes in a set of corner coordintates(using screen coordinate system)
    //Ouputs the leftmost coordinates.
    sortCornersByLeftness(corners_array){
        var corners_array_to_be_returned = []
        for (var i = 0; i < corners_array.length; i++){
            corners_array_to_be_returned[i] = {x:corners_array[i].x,y:corners_array[i].y}
        }

        var sorted = false;
        while (!sorted){
            var sort_occurred = false;
            for (var i = 0; i < corners_array_to_be_returned.length - 1; i++){
                if (corners_array_to_be_returned[i].x >corners_array_to_be_returned[i+1].x){
                    Tile.switchIndices(corners_array_to_be_returned, i, i+1)
                    sort_occurred = true
                }
            }

            if (!sort_occurred){
                sorted = true;
            }
        }

        return corners_array_to_be_returned;
    }

    //Takes in a set of corner coordintates(using screen coordinate system)
    //Ouputs the leftmost coordinates.
    sortCornersByTopness(corners_array){
        var corners_array_to_be_returned = []
        for (var i = 0; i < corners_array.length; i++){
            corners_array_to_be_returned[i] = {x:corners_array[i].x,y:corners_array[i].y}
        }

        var sorted = false;
        while (!sorted){
            var sort_occurred = false;
            for (var i = 0; i < corners_array_to_be_returned.length - 1; i++){
                if (corners_array_to_be_returned[i].y >corners_array_to_be_returned[i+1].y){
                    Tile.switchIndices(corners_array_to_be_returned, i, i+1)
                    sort_occurred = true
                }
            }

            if (!sort_occurred){
                sorted = true;
            }
        }

        return corners_array_to_be_returned;
    }



    //Returns the top left corner in terms of screen coordinates for the tiles
    getScreenCoordinatesTLCorner(){
        //if (this.parent_document.primary_direction)
        var cornersInScreenCoordinates = []
        var cornersInPSCoordinates = this.getCorners();
        for (var i = 0; i < 4; i++){
            cornersInScreenCoordinates[i] = this.parent_document.getScreenCoordinatesFromPSCoordinates(cornersInPSCoordinates[i]);
        }

        var cornersSortedByLeftness = this.sortCornersByLeftness(cornersInScreenCoordinates)

        var leftCorners = cornersSortedByLeftness.slice(0,2)
        var cornersSortedByTopness = this.sortCornersByTopness(leftCorners)
        var upperLeftCorner = cornersSortedByTopness[0];
        return upperLeftCorner
    }


    //Draws a tile and its primary and secondary glyphs
    draw(){
        if (!this.htmlElement){
            this.htmlElement = document.createElement('div');            
            this.htmlElement.style.position = 'absolute';
            this.htmlElement.style.backgroundColor = '#ffe';

            var innerHtmlElement = document.createElement('div');
            innerHtmlElement.style.position = 'relative';
            this.htmlElement.append(innerHtmlElement);

            $('#message_area').append(this.htmlElement);
        }
        var tl_corner = this.getScreenCoordinatesTLCorner();
        this.htmlElement.style.left = tl_corner.x + 'px';
        this.htmlElement.style.top = tl_corner.y + 'px';
        this.htmlElement.style.width = this.size.x + 'px';
        this.htmlElement.style.height = this.size.y + 'px';
        this.htmlElement.style.padding = this.padding + 'px';


        if (this.secondary_glyph){
            this.secondary_glyph.draw();
        }

        this.primary_glyph.draw();
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

    //A tile consists of a primary glyph and possibly a secondary glyph.
    //This function calculates the size of the entire tile altogether.
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
        else if (this.secondary_glyph_location == "right"){
            return_size = {
                x: this.primary_glyph.size.x + this.secondary_glyph.size.x,
                y: Math.max(this.primary_glyph.size.y, this.secondary_glyph.size.y)
            }
        }
        else if (this.secondary_glyph_location == "bottom"){
            return_size = {
                x: Math.max(this.primary_glyph.size.x,this.secondary_glyph.size.x),
                y: this.primary_glyph.size.y + this.secondary_glyph.size.y
            }
        }
        else if (this.secondary_glyph_location == "left"){
            return_size = {
                x: this.primary_glyph.size.x + this.secondary_glyph.size.x,
                y: Math.max(this.primary_glyph.size.y, this.secondary_glyph.size.y)
            }
        }
        return return_size;
    }

    move(position){
        this.position.x = position.x;
        this.position.y = position.y;
        this.draw();
    }
}
