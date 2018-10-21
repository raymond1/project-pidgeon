class Glyph{
    //image_url and content_size are required parameters
    //Content_size is the size of the glyph before padding is added around it.
    //parent_tile is the tile object that contains the glyph
    constructor(image_url, content_size, parent_tile){
        this.content_size = {x: content_size.x,y:content_size.y}
        this.position = {x:0,y:0} //relative to top left corner of a tile, in screen coordinates
        this.next = null;
        this.padding = 5;
        this.image_url = image_url;
        this.needs_drawing = true;
        this.htmlElement = null;
        this.parent_tile = parent_tile;
        this.needs_drawing = true;
    }

    get size(){
        return {x: this.content_size.x + 2 * this.padding, y: this.content_size.y + 2 * this.padding}
    }

    get width(){
        return this.size.x;
    }
    get height(){
        return this.size.y;
    }

    //requires that parent_tile has been set
    draw(){

        if (!this.htmlElement){
            this.htmlElement = document.createElement('img');
            $(this.parent_tile.htmlElement).children('div').append(this.htmlElement);
        }
        this.htmlElement.style.width = this.width + 'px';
        this.htmlElement.style.height = this.height + 'px';
        this.htmlElement.style.left = this.position.x + 'px';
        this.htmlElement.style.top = this.position.y + 'px';
        this.htmlElement.src = this.image_url;
        this.htmlElement.style.position = 'absolute';

        this.needs_drawing = false;
    }
}
