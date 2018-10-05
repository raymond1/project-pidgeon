//A tile has its own position, independent of the glyphs that it contains.
class Tile{
    constructor(parent_document, primary_glyph, position, secondary_glyph, secondary_glyph_location){
        this.parent_document = parent_document;
        this.primary_glyph = primary_glyph;
        this.secondary_glyph = secondary_glyph;
        this.secondary_glyph_location = secondary_glyph_location; //"top", right, bottom, left. Refers to location of secondary glyph relative to primary glyph
        this.needs_drawing = true;
        this.position = position;
        this.htmlElement = null;
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
        var lt = {x:this.position.x, y:this.position.y};
        var lb = {x:this.position.x, y:this.position.y};
        var rb = {x:this.position.x, y:this.position.y};
        var rt = {x:this.position.x, y:this.position.y};
        if (this.parent_document.primary_direction == "top to bottom"){
            lb.y = this.position.y + this.size.y;
            rb.y = this.position.y + this.size.y;
        }
        else if (this.parent_document.primary_direction == "right to left"){
            lt.x = this.position.x - this.size.x;
            lb.x = this.position.x - this.size.x;
        }
        else if (this.parent_document.primary_direction == "bottom to top"){
            lt.y = this.position.y - this.size.y;
            rt.y = this.position.y - this.size.y;
        }
        else if (this.parent_document.primary_direction == "left to right"){
            rb.x = this.position.x + this.size.x;
            rt.x = this.position.x + this.size.x;
        }

        if (this.parent_document.secondary_direction == "top to bottom"){
            lb.y = this.position.y + this.size.y;
            rb.y = this.position.y + this.size.y;
        }
        else if (this.parent_document.secondary_direction == "right to left"){
            lt.x = this.position.x - this.size.x;
            lb.x = this.position.x - this.size.x;
        }
        else if (this.parent_document.secondary_direction == "bottom to top"){
            lt.y = this.position.y - this.size.y;
            rt.y = this.position.y - this.size.y;
        }
        else if (this.parent_document.secondary_direction == "left to right"){
            rb.x = this.position.x + this.size.x;
            rt.x = this.position.x + this.size.x;
        }

        return [lt,lb,rb,rt];
    }

    //Draws a tile and its primary and secondary glyphs
    draw(){
        var corners = this.getCorners();
        if (!this.htmlElement){
            this.htmlElement = document.createElement('div');            
            this.htmlElement.style.position = 'absolute';
            this.htmlElement.style.backgroundColor = '#ffe';

            var innerHtmlElement = document.createElement('div');
            innerHtmlElement.style.position = 'relative';
            this.htmlElement.append(innerHtmlElement);

            $('#message_area').append(this.htmlElement);
        }
        this.htmlElement.style.left = corners[0].x + 'px';
        this.htmlElement.style.top = corners[0].y + 'px';
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

    move(position){
        this.position.x = position.x;
        this.position.y = position.y;
        this.draw();
    }
}
