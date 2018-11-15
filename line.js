//Line refers to a line of text

class Line extends DrawingArea{

	//position and height are given in ps coordinates
	constructor(position, height, line_number){
		this.position = position
		this.height = height
		this.line_number = line_number
	}
}