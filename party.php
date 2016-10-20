<?php
include "../../php/config.php";
include "../../php/mysql.php";
$caseid = $_POST["caseid"];
$db->connect($dbhost, $dbid, $dbpass, $dbname, $dbport);
$where = "party_new.caseid in (";
for($i=0; $i<count($caseid); $i++) {
	$where .="?,";
}
$where = trim($where, ",");
$where .= ")";

$db->select("party_new", "ptype, psober, pdrug", $where);
$db->parameters($caseid);
$db->close();

$ptype = [];
$psober = [];
$pdrug = [];

foreach ($result as $key => $value) {
	$ptype[] = $value['ptype'];
	$psober[] = $value['psober'];
	$pdrug[] = $value['pdrug'];
}

echo implode(",", $ptype).".".implode(",", $psober).".".implode(",", $pdrug);
?>