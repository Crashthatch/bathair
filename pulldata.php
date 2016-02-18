<?php
//error_reporting( E_ALL );
//ini_set('display_errors', true);

$startDate = $_REQUEST['startDate'];
$endDate = $_REQUEST['endDate'];

if( !$startDate || !$endDate ){
    die( "Need startDate and endDate in GET params");
}

$historicalDecoded = array();
$liveDecoded = array();

if( strtotime( $startDate ) < strtotime('2014-06-31') ){
    $historicalResult = file_get_contents('http://data.bathhacked.org/resource/37nn-vnib.json?$where=datetime%3E%27'.$startDate.'%27%20AND%20datetime<%27'.$endDate.'%27&$limit=10000&$offset=0');
    $historicalDecoded = json_decode( $historicalResult, true );
}
if( strtotime( $endDate ) > strtotime ('2014-06-31') ){
    $liveResult = file_get_contents('http://data.bathhacked.org/resource/hqr9-djir.json?$where=datetime%3E%27'.$startDate.'%27%20AND%20datetime<%27'.$endDate.'%27&$limit=10000&$offset=0');
    $liveDecoded = json_decode( $liveResult, true );
}

header('Content-type: application/json');
echo json_encode(array_merge( $historicalDecoded, $liveDecoded ));

?>