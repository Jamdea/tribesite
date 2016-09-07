<?php 
include "../../php/config.php";
include "../../php/mysql.php";

extract($_POST);

$db->connect($dbhost, $dbid, $dbpass, $dbname, $dbport);

$filename=$downOption2;
$filetype=$downOption3;

$caseid = str_replace('"]','',str_replace('["','',$caseid));
$caseids=explode('","',$caseid);
/*
$query = "CASEID IN (?";
$count=sizeof($caseids);
for($i=1; $i < $count; $i++){
	$query .= ",?";
}
$query.=")";
*/

$caseids=explode('","',$caseid);

for($i=0; $i < sizeof($caseids); $i++){
	if($i!=0) $query.=" or ";
	$query .= "CASEID = ?";
}

if($filename == 'Collisions') $dbtable = "switrs_all_new";
else if($filename == 'Parties') {
	$dbtable = "party_new";
	if($partyvictimQuery!="") $query = "(".$query.") AND ".$partyvictimQuery;
}
else if($filename == 'Victims') {
	$dbtable = "victim_new";
	if($partyvictimQuery!="") $query = "(".$query.") AND ".$partyvictimQuery;	
}
$query=str_replace("switrs_all.","switrs_all_new.",$query);

$db->select($dbtable, "*", $query);
$db->parameters($caseids);
$db->close();

//$data = unset_fields($result,array("seq_num","BEATCLASS","COL_COMB"));
$data = $result;
if($filetype=="csv"){
	$db->create_csv($data, $filename. '.csv', 1);
}
else if($filetype=="kml"){
	// Creates an array of strings to hold the lines of the KML file.
	$kml = array('<?xml version="1.0" encoding="UTF-8"?>');
	$kml[] = '<kml xmlns="http://earth.google.com/kml/2.2">';
	$kml[] = ' <Document><name>Selected SWITRS Data</name><description>All geocoded results matching the query of SWITRS data.</description>';
	$kml[] = ' <StyleMap id="pins">';
	$kml[] = ' <Pair>';
	$kml[] = ' <key>normal</key>';
	$kml[] = ' <styleUrl>#s_normal</styleUrl>';
	$kml[] = ' </Pair>';
	$kml[] = ' <Pair>';
	$kml[] = ' <key>highlight</key>';
	$kml[] = ' <styleUrl>#s_highlight</styleUrl>';
	$kml[] = ' </Pair>';
	$kml[] = ' </StyleMap>';
	$kml[] = ' <Style id="s_normal">';
	$kml[] = ' <IconStyle>';
	$kml[] = '  <scale>1.0</scale>';
	$kml[] = '  <Icon>';
	$kml[] = '  <href>http://maps.google.com/mapfiles/kml/paddle/red-circle.png</href>';
	$kml[] = '  </Icon>';
	$kml[] = ' </IconStyle>';
	$kml[] = ' <LabelStyle>';
	$kml[] = '  <color>00ffffff</color>';
	$kml[] = ' </LabelStyle>';
	$kml[] = ' </Style>';
	$kml[] = ' <Style id="s_highlight">';
	$kml[] = ' <IconStyle>';
	$kml[] = '  <scale>1.2</scale>';	
	$kml[] = '  <Icon>';
	$kml[] = '  <href>http://maps.google.com/mapfiles/kml/paddle/red-circle.png</href>';
	$kml[] = '  </Icon>';
	$kml[] = ' </IconStyle>';
	$kml[] = ' <LabelStyle>';
	$kml[] = '  <color>ffffffff</color>';
	$kml[] = ' </LabelStyle>';
	$kml[] = ' </Style>';
	
	// Iterates through the rows, printing a node for each row.
	foreach($data as $row){
		$kml[] = ' <Placemark id="' . $row['CASEID'] . '">';
		$kml[] = ' <name>Case ID: ' . $row['CASEID'] . '</name>';
		$kml[] = ' <description>'; 
		$kml[] = '  <![CDATA[';
		
		$kml[] = "<table><tr style='font-size:12px;'><td colspan='2'><b style='font-size:14px;'>Collision Details</b><br>";
		$kml[] = "<tr><td>Date(Y-M-D): ".$row['DATE_']."<br>";			
		$kml[] = "Killed: ".$row['KILLED']."<br>";
		$kml[] = "Injured: ".$row['INJURED']."<br>";
		$kml[] = "Crash Severity: ".$row['CRASHSEV']."<br></td>";
		$kml[] = "<td>Pedestrian: ".$row['PEDCOL']."<br>";
		$kml[] = "Bicycle: ".$row['BICCOL']."<br>";
		$kml[] = "Motorcycle: ".$row['MCCOL']."<br>";
		$kml[] = "Truck: ".$row['TRUCKCOL']."<br></td></tr>";
		$kml[] = "<tr style='font-size:12px;'><td colspan='2'><b style='font-size:14px;'>Collision Location</b><br>";
		$kml[] = "Primary: ".$row['PRIMARYRD']."<br>";
		$kml[] = "Secondary: ".$row['SECONDRD']."<br>";
		$kml[] = "Intersection: ".$row['INTERSECT_']."<br>";
		$kml[] = "Offset Distance: ".$row['DISTANCE']."<br>";
		$kml[] = "Offset Direction: ".$row['DIRECT']."<br></td></tr></table>";		

		$kml[] = '  ]]>';
		$kml[] = ' </description>';
		$kml[] = ' <styleUrl>#pins</styleUrl>';
		$kml[] = ' <Point>';
		$kml[] = ' <coordinates>' . $row['POINT_X'] . ','  . $row['POINT_Y'] . '</coordinates>';
		$kml[] = ' </Point>';
		$kml[] = ' </Placemark>';
	}
	// End XML file
	$kml[] = ' </Document>';
	$kml[] = '</kml>';
	$kmlOutput = join("\n", $kml);
	header('Content-type: application/vnd.google-earth.kml+xml');
	header("Content-Disposition: attachment; filename=$filename".".kml");
	echo $kmlOutput;
}
?>