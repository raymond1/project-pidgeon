class Cursor extends DrawingArea{
    constructor(document1, position){
        super(document1)
        this.position = position;
        this.image_url = 'assets/ui/cursor.svg';
        this.element = null;
        this.document = document1; //The page that a cursor is on
        this.size = {x:25,y:25}
    }

    draw(){
        if (this.element == null){
            this.element = document.createElement('img');
            $('#message_area').append(this.element);
            this.element.style.width = '25px';
            this.element.style.height = '25px';
            this.element.src = this.image_url;
            this.element.style.position = 'absolute';
            this.element.style.zIndex = 1;
        }

        var offsetCursorLocation = super.getScreenCoordinatesTLCorner()//this.document.getScreenCoordinatesFromPSCoordinates({x: this.position.x,y: this.position.y})
        //var this.getScreenCoordinatesTLCorner()
        this.element.style.left = offsetCursorLocation.x + 'px';
        this.element.style.top = offsetCursorLocation.y + 'px';

    }

    //Moving the cursor draws the cursor
    move(new_position){
        this.position.x = new_position.x;
        this.position.y = new_position.y;
        this.draw();
    }

    //If there is space on the current line, move the cursor to the next space on the line
    //If there is no space on the current line, move to the beginning of the next line.
    //Takes in a size with x and y properties that will tell the cursor how much to increment.
    //size is normally the size of the tile being added.
    moveToNextPositionOnCurrentLine(size){
        //Increment line position
        if (this.document.primary_direction == "top to bottom"){
            this.position.y = this.position.y + size.y;
        }else if (this.document.primary_direction == "right to left"){
            this.position.x = this.position.x - size.x;
        }else if (this.document.primary_direction == "bottom to top"){
            this.position.y = this.position.y - size.y;
        }else if (this.document.primary_direction == "left to right"){
            this.position.x = this.position.x + size.x;
        }else{
            console.log('Error: this.document.primary_direction undefined');
        }
    }

    //Given the size of the tile being added and the current position of the cursor, calculate the position of the beginning of the next line
    //This will depend on the writing direction
    getStartOfNextLine(size){
        var new_position = {x: this.position.x, y: this.position.y};
        if (this.document.secondary_direction == "top to bottom"){
            new_position.y = this.position.y + size.y;
        }else if (this.document.secondary_direction == "right to left"){
            new_position.x = this.position.x - size.x;
        }else if (this.document.secondary_direction == "bottom to top"){
            new_position.y = this.position.y - size.y;
        }else if (this.document.secondary_direction == "left to right"){            
            new_position.x = this.position.x + size.x;
        }

        if (this.document.primary_direction == "top to bottom"){
            new_position.y = 0;
        }
        else if (this.document.primary_direction == "right to left"){
            new_position.x = this.document.size.x - size.x;
        }
        else if (this.document.primary_direction == "bottom to top"){
            new_position.y = this.document.size.y - size.y;
        }
        else if (this.document.primary_direction == "left to right"){
            new_position.x = 0;
        }
        return new_position;
    }

    //moves the cursor to the end of the last added item
    update(){
        if (this.document.tiles.size == 0){
            this.move({x:0,y:0})
        }
        else{
            this.move({x: this.document.tiles.last.position.x + this.document.tiles.last.size.x, y: this.document.tiles.last.position.y})
        }
    }
}
