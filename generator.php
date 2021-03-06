<?php

function generate(){
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible">
    <link rel="stylesheet" href="./style.css">
    <title>Cantobet Input</title>
</head>

<body>
    <h1>Cantobet Input</h1>
    <ul>
        <li>
            See <a target="_blank" href="http://cantoneselang.org/">http://cantoneselang.org/</a> for more information on how to interpret the symbols.
        </li>
    </ul>

    <div class='button-group'><button
         type="button" class="eraser">Eraser</button><button
         class="canto-letter-button" type="button" value="space"><img class="canto-letter-svg" src="./assets/cantobet-svg-files/space.svg" alt="space"></button
    >
<?php

	for ($i = 1; $i <= 37; $i++){
?>
<button class="canto-letter-button" type="button" value="<?= $i ?>"><img class="canto-letter-svg" src="./assets/cantobet-svg-files/<?= $i ?>.svg" alt="<?= $i?>.svg"></button
><?php
    }

    //Saliva symbol
	for ($i = 45; $i <= 47; $i++){
        if ($i == 46) continue;
?>
<button class="canto-letter-button small" type="button" value="<?= $i ?>"><img class="canto-letter-svg" src="./assets/cantobet-svg-files/<?= $i ?>.svg" alt="<?= $i?>.svg"></button>
<?php
    }
	for ($i = 38; $i <= 44; $i++){
        ?>
<button class="canto-letter-button" type="button" value="<?= $i ?>"><img class="canto-letter-svg" src="./assets/cantobet-svg-files/<?= $i ?>.svg" alt="<?= $i?>.svg"></button>
<?php
    }
?>

<button type='button' class='options' value='place secondary glyph on left'><img src='assets/ui/left.svg' alt='Place glyph onleft'></button
><button type='button' class='options' value='place secondary glyph on right'><img src='assets/ui/right.svg' alt='Place glyph on right'></button
><button type='button' class='options' value='place secondary glyph on top'><img src='assets/ui/top.svg' alt='Place glyph on top'></button
><button type='button' class='options' value='place secondary glyph on bottom'><img src='assets/ui/bottom.svg' alt='Place glyph on bottom'></button
>

<button type='button' class='options' value='change writing direction'><img src='assets/ui/writing-direction.svg' alt='Change writing direction'></button
><!--<button type='button' class='options' value='rotate'><img src='assets/ui/rotate.svg' alt='Rotate'></button
><button type='button' class='options' value='flip'><img src='assets/ui/flip.svg' alt='Flip'>--></button>
    <!--<button type='button' class='options' value='debug'>Debug</button>-->
    </div>
    <hr>
    <div>
        Message Area
        <div id="message_area"></div>
    </div>
    <hr>
    <div>
        <textarea name="" id="encoded_text" cols="30" rows="10"></textarea>
    </div>
    <hr>
    <button id="decode" type="button">Decode</button>


    <!-- ========================================================================================= -->
    <!-- SCRIPT     -->
    <script src="drawingarea.js"></script>
    <script src="document.js"></script>
    <script src="linkedlist.js"></script>
    <script src="circularlinkedlist.js"></script>
    <script src="glyph.js"></script>
    <script src="tile.js"></script>
    <script src="page.js"></script>
    <script src="cursor.js"></script>
    <script src="jquery-3.3.1.js"></script>
    <script src="script.js"></script>
</body>

</html>

<?php

}
ob_start();
generate();
$output_contents = ob_get_contents();

$output_file = fopen('index.html', 'w+');
fwrite($output_file, $output_contents);
fclose($output_file);
ob_end_clean();
?>
