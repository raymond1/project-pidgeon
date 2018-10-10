//A generic rectangular drawing area

class DrawingArea{
	    //Returns the corner coordinates of the tile
	constructor(parent_document){
        this.parent_document = parent_document;
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



    //Calculate the screen coordinates for a tile and then finds the top left corner
    getScreenCoordinatesTLCorner(){
        var cornersInScreenCoordinates = []
        var cornersInPSCoordinates = this.getCorners();
console.log('cornersInPSCoordinates' + JSON.stringify(cornersInPSCoordinates))
        for (var i = 0; i < 4; i++){
            cornersInScreenCoordinates[i] = this.parent_document.getScreenCoordinatesFromPSCoordinates(cornersInPSCoordinates[i]);
        }

        var cornersSortedByLeftness = this.sortCornersByLeftness(cornersInScreenCoordinates)

        var leftCorners = cornersSortedByLeftness.slice(0,2)
        var cornersSortedByTopness = this.sortCornersByTopness(leftCorners)
        var upperLeftCorner = cornersSortedByTopness[0];
        return upperLeftCorner
    }
    getCorners(){
        //Order for corners is left top, left bottom, right bottom, right top
        var lt = {x:this.position.x, y:this.position.y + this.size.y};
        var lb = {x:this.position.x, y:this.position.y};
        var rb = {x:this.position.x + this.size.x, y:this.position.y};
        var rt = {x:this.position.x + this.size.x, y:this.position.y + this.size.y};

        return [lt,lb,rb,rt];
    }
}