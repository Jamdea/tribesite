<?php
include "../../php/config.php";
include "../../php/mysql.php";
$caseid = $_POST["caseid"];
// $basequery = ["victim_new.caseid = 1884361", "victim_new.caseid = 2066076"];
$db->connect($dbhost, $dbid, $dbpass, $dbname, $dbport);
// $db->select("victim_new", "victim_new.caseid, victim_new.vsex, victim_new.vinjury", "victim_new.caseid = 1884361 or victim_new.caseid = 2066076");
// echo implode(" or ", $basequery)." and (vinjury = 1 or vinjury = 2)";
$where = "party_new.caseid in(";
for($i=0; $i<count($caseid); $i++) {
	$where .="?,";
}
$where = trim($where, ",");
$where .= ")";

$db->select("victim_new, party_new", "victim_new.vinjury, victim_new.vtype, victim_new.vsex, victim_new.vage, party_new.psober, party_new.vehtype", "(".$where.") AND (victim_new.caseid = party_new.caseid AND party_new.PARNUM=victim_new.PARNUM)");
$db->parameters($caseid);
// $db->select(" victim_new", "victim_new.vage", "(".implode(" or ", $basequery).") and (victim_new.vinjury = 1 or victim_new.vinjury = 2)");
$db->close();

$ped = 0;
$bike = 0;
$motor = 0;
$alcoh = 0;
$total = 0;
$vtype = [];
$vage = [];
$vgender = [];
foreach ($result as $k => $v) {
  	$vtype[] = $v['vtype'];
  	// $vage[] = $v["vage"];
  	// $vgender[] = $v["vsex"];
  	if($v["vinjury"] == 1 or $v["vinjury"] == 2) {
		$total += 1;
	  	$vage[] = $v["vage"];
	  	$vgender[] = $v["vsex"];
	  	if($v["vehtype"] == "C") $motor += 1;
	  	if($v["vehtype"] == "L") $bike += 1;
	  	if($v["vehtype"] == "N") $ped += 1;
	  	if($v["psober"] == "B" or $v["psober"] == "C" or $v["psober"] == "D") $alcoh += 1;
	}
  	// foreach($v as $key => $value) {
  	// 	echo $key."<br>";
  	// 	echo $value."<br>";
  	// }
}
echo implode(",", [$ped, $bike, $motor, $alcoh, $total]).".".implode(",", $vtype).".".implode(",", $vage).".".implode(",", $vgender);
?>