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
            <a target="_blank" href="http://cantoneselang.org/">http://cantoneselang.org/</a>
        </li>
        <li>
            <a target="_blank" href="https://larry1010.github.io/project-pidgeon/">https://larry1010.github.io/project-pidgeon/</a>
        </li>
        <li>
            <a target="_blank" href="https://github.com/larry1010/project-pidgeon">https://github.com/larry1010/project-pidgeon</a>
        </li>
    </ul>

    <button type='button' id='options'>Options</button>

    <hr>
    <button id="backspace-button" type="button">Backspace</button>
    <hr>

    <div class='button-group'>
        <div class="canto-letter-button" type="button" value="space"> adf</div>
<?php

	for ($i = 1; $i <= 46; $i++){
        if ($i >= 38 and $i <= 46){
            $symbolclass = "small";
        }else{
            $symbolclass = "";
        }
?>
        <button class="canto-letter-button <?= $symbolclass ?>" type="button" value="<?= $i ?>">
            <img class="canto-letter-svg" src="./assets/cantobet-svg-files/<?= $i ?>.svg" alt="<?= $i?>.svg">
        </button>

<?php
    }
?>
    </div>
    <hr>
    <div>
        Message Area
        <div id="message-area"></div>
    </div>
    <hr>
    <button id="encode-button" type="button">Encode</button>
    <br>
    <div>
        <textarea name="" id="encode-output" cols="30" rows="10" readonly></textarea>
    </div>
    <hr>
    <button id="decode-button" type="button">Decode</button>
    <div>
        Decoded Message Area
        <div id="decoded-message-area"></div>
    </div>

    <!-- ========================================================================================= -->
    <!-- SCRIPT     -->
    <script src="https://code.jquery.com/jquery-3.3.1.js" integrity="sha256-2Kok7MbOyxpgUVvAk/HJ2jigOSYS2auK4Pfzbm7uH60=" crossorigin="anonymous"></script>
    <script src="./script.js"></script>

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
