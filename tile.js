//A tile has its own position, independent of the glyphs that it contains.
class Tile extends DrawingArea{
    constructor(options){
        super(options.parent_document) //This allows inheriting the functions from the DrawingArea class
        this.primary_glyph = options.primary_glyph;
        this.secondary_glyph = options.secondary_glyph;
        this.secondary_glyph_location = options.secondary_glyph_location; //"top", right, bottom, left. Refers to location of secondary glyph relative to primary glyph
        this.needs_drawing = true;
        this.position = options.position?options.position:{};
        //this.htmlElement = null;
        this.subcomponents = []
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
        var screen_size = Document.getScreenSizeFromPSSize(this.size, this.parent_document.direction_buffer.pointer.primary_direction)
        
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

    //Returns size in ps coordinates
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
    //The size of the tile is in screen coordinates, not PS coordinates, as the orientation of a tile does not change when the writing direction changes
    calculateTileSize(){
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
        var ps_size = Document.convertScreenSizeToPSSize(screen_size, this.parent_document.direction_buffer.pointer.primary_direction, this.parent_document.direction_buffer.pointer.secondary_direction)
        return ps_size;
    }

    move(position){
        this.position.x = position.x;
        this.position.y = position.y;
        this.draw();
    }
}
