<?php 
$objFileName = "file";  //ÆÄÀÏ Object Name
$file_name = $_FILES[$objFileName]['name'];
$file_size = $_FILES[$objFileName]['size'];
$file_temp = $_FILES[$objFileName]['tmp_name'];
$file_type = $_FILES[$objFileName]['type'];

if($file_temp){
	switch($file_type){
		case "text/x-csv":
		case "text/csv":
		case "application/vnd.ms-excel":
		case "application/vnd.google-earth.kml+xml":
			$contents = file($file_temp);
			$type=strtolower(substr($file_name,-3));
			echo "<textarea>";
			echo $type;
			
			foreach($contents as $line_num => $line){
				if($line_num==0 && $type=="kml"){
					echo substr($line,1);
				}
				else{
					echo $line;
				}
				
				//$line = str_replace("\r\n", "", $line);
				//$line = str_replace("\n", "", $line);
				//$line = str_replace('"', '', $line);

			}
			echo "</textarea>";
			break;
		default:
			echo "<script language=\"JavaScript\">";
			echo "alert('You should select a CSV file from the SWITRS or a KML file from the CROSSROADS');";
			echo "</script>";		
	
			break;
	}
}
?>