<?php
error_reporting( E_ALL );
ini_set('display_errors', true);
require 'vendor/autoload.php';


$startDate = $_REQUEST['startDate'];
$endDate = $_REQUEST['endDate'];

if( !$startDate || !$endDate ){
    die( "Need startDate and endDate in GET params");
}

/*
$socrata = new \BathHacked\Socrata(
    'http://data.bathhacked.org',
    'nLdZb4jL6cHSikEGIATYbuUFP',
    'fletcher.tom@gmail.com',
    '5cFKhEmjI3r6'
);

$response = $socrata->get('/resource/37nn-vnib.json?$where=datetime>\2013-12-01\'');//, ['$where' => 'datetime > \'2013-12-01\'']);
*/

header('Content-type: application/json');
$result = file_get_contents('http://data.bathhacked.org/resource/37nn-vnib.json?$where=datetime%3E%27'.$startDate.'%27%20AND%20datetime<%27'.$endDate.'%27');
echo($result);

?>