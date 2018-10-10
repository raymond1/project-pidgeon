//Terminology: primary axis: the direction in which new characters are added on a line
//secondary axis: the direction in which new lines are added

var image_directory = 'assets/cantobet-svg-files/';
var secondary_glyphs_top = ["38", "39", "40", "41"]; //secondary glyphs typically placed on top
var secondary_glyphs_bottom = ["42","43", "44"]; //secondary glyphs typically placed on bottom



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
        //The document size entered is in screen coordinates sizes
        var document_size = {x:$('#message_area').width(), y:$('#message_area').height()}
        var document1 = new Document(document_size);
        document1.draw();

        $('.options').click(
            function(){
                var command = $(this).attr('value');
                if (command == "change writing direction"){
                    document1.changeWritingDirection()
                    console.log(document1.direction_buffer.pointer.primary_direction + '|' + document1.direction_buffer.pointer.secondary_direction)
                }else if (command.substring(0, 24) == "place secondary glyph on"){ //Move the location of the secondary glyph around
                    if (document1.tiles.last){
                        newSecondaryGlyphLocation = command.substring(25);

                        document1.tiles.last.changeSecondaryGlyphLocation(newSecondaryGlyphLocation);
                        document1.cursor.update()
                    }
                }
            }
        );
        
        $('.canto-letter-button').click(
            function(){
                var glyph_value = $(this).attr('value');
                if (primary_glyphs.indexOf(glyph_value) > -1){//If this is a primary glyph button, add a new tile
                    document1.addTile(glyph_value);
                }else if (secondary_glyphs.indexOf(glyph_value) > -1){//If this is a secondary glyph button, modify the last tile
                    document1.modifyTile(glyph_value);
                }
                document1.draw();
            }
        );

        $(window).resize(function() {
            document1.size = {x:$('#message_area').width(), y: $('#message_area').height()};
            document1.retile();
        });
    }
)


/*
    //1-37 = letters
    //38-44 = tonal symbols
    //45 - short indicator
    //46 - saliva symbol

// [04] Get rid of manual button pushes. Encoding and decoding should happen automatically as you type.
*/