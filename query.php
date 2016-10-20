<?php
include "../../php/config.php";
include "../../php/mysql.php";

$caseid = json_decode($_POST["caseid"]);

// $basequery = ["victim_new.caseid = 1884361", "victim_new.caseid = 2066076"];
$db->connect($dbhost, $dbid, $dbpass, $dbname, $dbport);
// $db->select("victim_new", "victim_new.caseid, victim_new.vsex, victim_new.vinjury", "victim_new.caseid = 1884361 or victim_new.caseid = 2066076");
// echo implode(" or ", $basequery)." and (vinjury = 1 or vinjury = 2)";
$where = "switrs_all_new.caseid in(";
for($i=0; $i<count($caseid); $i++) {
	$where .="?,";
}
$where = trim($where, ",");
$where .= ")";

$db->select("victim_new, switrs_all_new", "victim_new.vinjury, victim_new.vtype, victim_new.vsex, victim_new.vage, victim_new.vinjury,victim_new.vseat,victim_new.vsafety1,victim_new.vejected, switrs_all_new.ETOH, switrs_all_new.PEDCOL,switrs_all_new.BICCOL,switrs_all_new.MCCOL", "(".$where.") AND (victim_new.caseid = switrs_all_new.caseid)");

// $db->select("victim_new, party_new", "victim_new.vinjury, victim_new.vtype, victim_new.vsex, victim_new.vage, victim_new.vinjury,victim_new.vseat,victim_new.vsafety1,victim_new.vejected, party_new.psober, party_new.vehtype", "(".$where.") AND (victim_new.caseid = party_new.caseid AND party_new.PARNUM=victim_new.PARNUM)");

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
$vinjury = [];
$vseat = [];
$vsafety1 = [];
$vejected = [];
$fatal = 0;
$severe = 0;
foreach ($result as $k => $v) {
  	$vtype[] = $v['vtype'];
  	$vage[] = $v["vage"];
  	$vgender[] = $v["vsex"];
  	$vinjury[] = $v["vinjury"];
  	$vseat[] = $v["vseat"];
  	$vsafety1[] = $v["vsafety1"];
  	$vejected[] = $v["vejected"];
  	$total += 1;
  	if($v["vinjury"] == 1) {
		
	  	// $vage[] = $v["vage"];
	  	// $vgender[] = $v["vsex"];
	  	$fatal += 1;
	  	if($v["MCCOL"] == "Y") $motor += 1;
	  	if($v["BICCOL"] == "Y") $bike += 1;
	  	if($v["PEDCOL"] == "Y") $ped += 1;
	  	if($v["ETOH"] == "Y") $alcoh += 1;
	} else if ($v["vinjury"] == 2) {
	  	$severe += 1;
	  	if($v["MCCOL"] == "Y") $motor += 1;
	  	if($v["BICCOL"] == "Y") $bike += 1;
	  	if($v["PEDCOL"] == "Y") $ped += 1;
	  	if($v["ETOH"] == "Y") $alcoh += 1;		
	}
  	// foreach($v as $key => $value) {
  	// 	echo $key."<br>";
  	// 	echo $value."<br>";
  	// }
}
echo implode(",", [$ped, $bike, $motor, $alcoh, $total, $fatal, $severe]).".".implode(",", $vtype).".".implode(",", $vage).".".implode(",", $vgender).".".implode(",", $vinjury).".".implode(",", $vseat).".".implode(",", $vsafety1).".".implode(",", $vejected);
?>