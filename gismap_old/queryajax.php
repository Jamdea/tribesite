<?php
header("Content-Type: text/plain");
include "../../php/config.php";
include "../../php/mysql.php";

$db->connect($dbhost, $dbid, $dbpass, $dbname, $dbport);

$basequery=(isset($_GET["basequery"]) && !empty($_GET["basequery"])) ? $_GET["basequery"] : NULL; 
$queryParty=(isset($_GET["queryParty"]) && !empty($_GET["queryParty"])) ? $_GET["queryParty"] : NULL; 
$queryVictim=(isset($_GET["queryVictim"]) && !empty($_GET["queryVictim"])) ? $_GET["queryVictim"] : NULL; 

$tables="switrs_all_new";
if(!is_null($queryParty) && !empty($queryParty)){
	$tables.=",party_new";
	$basequery.= " AND switrs_all_new.CASEID=party_new.CASEID";
	$queryParty = " AND ".$queryParty;
}
if(!is_null($queryVictim) && !empty($queryVictim)) {
	$tables.=",victim_new";
	$basequery.= " AND switrs_all_new.CASEID=victim_new.CASEID";
	$queryVictim = " AND ".$queryVictim;
}
$query=$basequery.$queryParty.$queryVictim;
//echo $query;

$db->select($tables, "DISTINCT switrs_all_new.CASEID", $query);
$db->close();
$temp=array();
foreach($result as $row){
	array_push($temp,$row['CASEID']);
}
echo "'".implode("','",$temp)."'";
?>