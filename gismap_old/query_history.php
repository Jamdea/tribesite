<?php
include "../../php/config.php";
include "../../php/mysql.php";
$db->connect($dbhost, $dbid, $dbpass, $dbname, $dbport);

extract($_POST);

$save['q_total'] = $total;
$save['q_date'] = date("Y-m-d H:i:s");
$save['user_ID'] = $_SESSION['p_num'];
if($special){
	$save['special'] = $special;
	$save['cityORroute'] = "case";
}
else{
	$save['st_date'] = $stDate ? date("Y-m-d",strtotime($stDate)) : null;
	$save['ed_date'] = $edDate ? date("Y-m-d",strtotime($edDate)) : null;
	$save['county'] = $county;
	$save['city'] = $city;
	$save['stroute'] = $stroute;
	$save['direct'] = $direct;
	$save['cityORroute'] = $cityORroute;
	$save['factors'] = $factors;
	$save['selection'] = $select;
	$save['used'] = 1;
}

$db->insert("query_history", array_keys($save) );
$db->parameters($save,1);
$db->close();
?>