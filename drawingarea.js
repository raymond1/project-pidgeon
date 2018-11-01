//A generic rectangular drawing area

class DrawingArea{
	    //Returns the corner coordinates of the tile
	constructor(parent){
        this.parent = parent;
	}

    static switchIndices(input_array, index_to_switch_1, index_to_switch_2){
        var temp = input_array[index_to_switch_1]
        input_array[index_to_switch_1] = input_array[index_to_switch_2]
        input_array[index_to_switch_2] = temp
    }

    //Takes in a set of corner coordintates(using screen coordinate system)
    //Ouputs the leftmost coordinates.
    static sortCornersByLeftness(corners_array){
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

    //PS coordinates and screen coordinates share the same left-right system, so the algorithm for screen coordinates
    //will work for ps coordinates
    static sortCornersByLeftnessPS(corners){
        return DrawingArea.sortCornersByLeftness(corners)
    }

    //Takes in an array of corner coordinates using screen coordinates
    //Ouputs the leftmost coordinates.
    //Sorts the two corners by height, with the top corner in the first index, and the lower corner in the second index
    static sortCornersByTopness(corners_array){
        var corners_array_to_be_returned = []
        for (var i = 0; i < corners_array.length; i++){
            corners_array_to_be_returned[i] = {x:corners_array[i].x,y:corners_array[i].y}
        }

        var sorted = false;
        //The greater value of y gets the 
        while (!sorted){
            var sort_occurred = false;
            for (var i = 0; i < corners_array_to_be_returned.length - 1; i++){
                if (corners_array_to_be_returned[i].y > corners_array_to_be_returned[i+1].y){
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

    //Takes in an array of corner coordinates using ps coordinates
    //Ouputs the leftmost coordinates.
    //Sorts the two corners by height, with the top corner in index 0, and the lower corner in index 1
    static sortCornersByTopnessPS(corners_array){
        var corners_array_to_be_returned = []
        for (var i = 0; i < corners_array.length; i++){
            corners_array_to_be_returned[i] = {x:corners_array[i].x,y:corners_array[i].y}
        }

        var sorted = false;
        //The greater value of y gets the 
        while (!sorted){
            var sort_occurred = false;
            for (var i = 0; i < corners_array_to_be_returned.length - 1; i++){
                if (corners_array_to_be_returned[i].y < corners_array_to_be_returned[i+1].y){
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

    //Calculate the screen coordinates for a tile and then finds the top left corner
    //Usable for ps or screen coordinate systems
    static getBLCorner(corners){
        var cornersInPSCoordinates = []

        var cornersSortedByLeftness = DrawingArea.sortCornersByLeftnessPS(corners)

        var leftCorners = cornersSortedByLeftness.slice(0,2)
        var cornersSortedByTopness = DrawingArea.sortCornersByTopnessPS(leftCorners)
        var lowerLeftCorner = cornersSortedByTopness[1];
        return lowerLeftCorner
    }

    //Calculate the screen coordinates for a tile and then finds the top left corner
    getScreenCoordinatesTLCorner(){
        var cornersInScreenCoordinates = []
        var cornersInPSCoordinates = this.getCorners();
        for (var i = 0; i < 4; i++){
            cornersInScreenCoordinates[i] = this.parent.getScreenCoordinatesFromPSCoordinates(cornersInPSCoordinates[i]);
        }

        var cornersSortedByLeftness = DrawingArea.sortCornersByLeftness(cornersInScreenCoordinates)

        var leftCorners = cornersSortedByLeftness.slice(0,2)
        var cornersSortedByTopness = DrawingArea.sortCornersByTopness(leftCorners)
        var upperLeftCorner = cornersSortedByTopness[0];
        return upperLeftCorner
    }

    //Returns the ps coordinates corners of a drawing area
    //Assumes this.position represents the lower-left corner in the rectangle
    getCorners(){
        //Order for corners is left top, left bottom, right bottom, right top
        var lt = {x:this.position.x, y:this.position.y + this.size.y - 1};
        var lb = {x:this.position.x, y:this.position.y};
        var rb = {x:this.position.x + this.size.x - 1, y:this.position.y};
        var rt = {x:this.position.x + this.size.x - 1, y:this.position.y + this.size.y - 1};

        return [lt,lb,rb,rt];
    }

    //Given top left corner in screen coordinates, and the size of a rectangular area, returns the 4 corners
    static getScreenCorners(position, size){
        var lt = {x:position.x, y:position.y};
        var lb = {x:position.x, y:position.y + size.y - 1};
        var rb = {x:position.x + size.x - 1, y:position.y + size.y - 1};
        var rt = {x:position.x + size.x - 1, y:position.y};

        return [lt,lb,rb,rt];
    }
}