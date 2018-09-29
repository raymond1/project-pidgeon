var image_directory = 'assets/cantobet-svg-files/';

class LinkedList{
    constructor(){
        this.head = null;
    }
    append(new_item){
        if (this.head == null){
            this.head = new_item;
        }else{
            var last_item = this.head;
            while (last_item.next != null){
                last_item = last_item.next;
            }
            last_item.next = new_item;
        }
    }

    get last(){
        var last = this.head;
        if (last == null){
            return null;
        }

        while(last.next != null){
            last = last.next;
        }
        return last;
    }
}

class Glyph{
    //image_url and content_size are required parameters
    //Content_size is the size of the glyph before padding is added around it.
    //parent_tile is the tile object that contains the glyph
    constructor(image_url, content_size, parent_tile){
        this.content_size = {x: content_size.x,y:content_size.y}
        this.position = {x:0,y:0} //relative to top left corner of a tile
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
            $(this.parent_tile.htmlElement).first().append(this.htmlElement);
            this.htmlElement.style.position = 'absolute';
        }
        this.htmlElement.src = this.image_url;
        this.htmlElement.style.left = this.position.x + 'px';
        this.htmlElement.style.top = this.position.y + 'px';
        this.htmlElement.style.width = this.width + 'px';
        this.htmlElement.style.height = this.height + 'px';
        this.needs_drawing = false;
    }
}

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

    //used to draw and redraw a tile
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
            if (this.secondary_glyph.needs_drawing){

                this.secondary_glyph.draw();
            }
/*            
            var secondary_glyph = document.createElement('img');
            secondary_glyph.src = this.secondary_glyph.image_url;
            secondary_glyph.style.position = 'absolute';
            $('#message_area').append(secondary_glyph);
            secondary_glyph.style.zIndex = 100; //For troubleshooting only...
            secondary_glyph.style.left = corners[0].x + this.secondary_glyph.position.x + 'px';
            secondary_glyph.style.top = corners[0].y + this.secondary_glyph.position.y + 'px';
            secondary_glyph.style.width = this.secondary_glyph.width + 'px';
            secondary_glyph.style.height = this.secondary_glyph.height + 'px';
            secondary_glyph.style.padding = this.secondary_glyph.padding + 'px';
            this.secondary_glyph.needs_drawing = false;*/
        }

        if (this.primary_glyph.needs_drawing){
            this.primary_glyph.draw();
        }
        /*
        var primary_glyph = document.createElement('img');
        primary_glyph.src = this.primary_glyph.image_url;
        primary_glyph.setAttribute('class', 'letter');
        primary_glyph.style.left = corners[0].x + this.primary_glyph.position.x + 'px';
        primary_glyph.style.top = corners[0].y + this.primary_glyph.position.y + 'px';
        primary_glyph.style.width = this.primary_glyph.width;
        primary_glyph.style.height = this.primary_glyph.height;
        primary_glyph.style.padding = this.primary_glyph.padding + 'px';
        $('#message_area').append(primary_glyph);
*/
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
}

class Page{
    constructor(size){
        this.size = {x: size.x, y: size.y};
    }
}

class Cursor{
    constructor(page, position){
        if (!position){
            position = {x:page.size.x, y:0}
        }
        this.position = position;
        this.image_url = 'assets/ui/cursor.svg';
        this.element = null;
        this.page = page; //The page that a cursor is on
    }

    draw(){
        if (this.element == null){
            this.element = document.createElement('img');
            $('#message_area').append(this.element);
            this.element.src = this.image_url;
            this.element.style.position = 'absolute';
            this.element.style.zIndex = 1;
        }
        this.element.style.left = (this.position.x - 12) + 'px';
        this.element.style.top = (this.position.y - 12) + 'px';
        this.element.style.width = '25px';
        this.element.style.height = '25px';
    }

    //Moving the cursor draws the cursor
    move(new_position){
        this.position.x = new_position.x;
        this.position.y = new_position.y;
        this.element.style.left = this.position.x + 'px';
        this.element.style.top = this.position.y + 'px';
    }
}

class Document{
    //size.x and size.y are the size of the page in pixels
    //The only required parameter is size
    constructor(size, primary_direction, secondary_direction){
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
        this.pages.append(new Page(size));
        this.cursor = new Cursor(this.pages.head);
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
            new_position.x = this.pages.head.size.x - new_tile.size.x;
        }
        else if (this.primary_direction == "bottom to top"){
            new_position.y = this.pages.head.size.y - new_tile.size.y;
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
console.log('addTile');
        var new_glyph =
        new Glyph(
            this.getImageURLFromPrimaryGlyphString(primary_glyph_string),
            {x:50,y:50} //*Content size*/
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
        console.log('modifyTile');

        var last_tile = this.tiles.last;
        var glyph_image_url = this.getImageURLFromPrimaryGlyphString(secondary_glyph_string);
        if (last_tile != null){
            if (!last_tile.secondary_glyph){
                last_tile.secondary_glyph = new Glyph(glyph_image_url, {x:25,y:25}, last_tile);
            }
            last_tile.secondary_glyph.image_url = glyph_image_url;
            last_tile.secondary_glyph_location = "top";
            last_tile.secondary_glyph.position = {x:last_tile.primary_glyph.width/2 - last_tile.secondary_glyph.width/2, y:0}

            last_tile.primary_glyph.position.x = 0;
            last_tile.primary_glyph.position.y = last_tile.secondary_glyph.height;
            last_tile.needs_drawing = true;
            last_tile.primary_glyph.needs_drawing = true;
            last_tile.secondary_glyph.needs_drawing = true;

            if (this.primary_direction == "top to bottom"){
                this.cursor.move({x: this.cursor.position.x, y: last_tile.position.y + last_tile.size.y});
            }else if (this.primary_direction == "right to left"){
                this.cursor.move({x: last_tile.position.x - last_tile.width, y: this.cursor.position.y});
            }
            else if (this.primary_direction == "bottom to top"){
                this.cursor.move({x: this.cursor.position.x, y: last_tile.position.y - last_tile.size.y});
            }
            else if (this.primary_direction == "left to right"){
                this.cursor.move({x: last_tile.position.x + last_tile.width, y: this.cursor.position.y});
            }

        }
    }

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
        if (point.x < 0 || point.x > this.pages.head.size.x){
            return_value = false;
        } else if (point.y < 0 || point.y > this.pages.head.size.y){
            return_value = false;
        }

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
        var document1_size = {x:$('#message_area').width(), y:500}
        var document1 = new Document(document1_size);
        document1.draw();
        $('.options').click(
            function(){
                var command = $(this).attr('value');
                if (command == "rotate writing direction"){

                }else if (command == "top"){
                }else if (command == "right"){
                }else if (command == "bottom"){
                }else if (command == "left"){
                }
            }
        );
        
        $('.canto-letter-button').click(
            function(){
                var glyph_value = $(this).attr('value');
                if (primary_glyphs.indexOf(glyph_value) > -1){
                    document1.addTile(glyph_value);
                }else if (secondary_glyphs.indexOf(glyph_value) > -1){
                    document1.modifyTile(glyph_value);
                }
                document1.draw();
            }
        );
    }
)


/*
    //1-37 = letters
    //38-44 = tonal symbols
    //45 - short indicator
    //46 - saliva symbol

// [04] Get rid of manual button pushes. Encoding and decoding should happen automatically as you type.
*/