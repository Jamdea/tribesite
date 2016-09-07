<?php
//ini_set('display_errors',1);
//error_reporting(E_ALL);

$mtime = microtime();
$mtime = explode(" ",$mtime);
$mtime = $mtime[1] + $mtime[0];
$starttime = $mtime;

include "../../../php/config.php";
include "../../../php/mysql.php";
$db->connect($dbhost, $dbid, $dbpass, $dbname, $dbport);

include "details_land.php";
include "details_port.php";

//extract($_POST);
//extract($_GET);

$title = "TIMS Collision Diagram";
include "../../../include/header.php";
include "../../../include/loginCheck.php";
?>

	<link rel="stylesheet" href="css/diagram.css" />
	<link rel="stylesheet" href="css/infobox.css" />
	<link rel="stylesheet" media="print" href="css/print.css" />
	<script>
		var dojoConfig = {
			parseOnLoad: true,
			locale: "en-us"
		};
		var cases = {};
    </script>
	<!--JS Libraries for user controls-->
	<script src="//js.arcgis.com/3.2/"></script>
	<script src="//maps.google.com/maps/api/js?sensor=false&language=en"></script>
	<script src="extra/infobox.js"></script>
	<!--JS Files to load application-->
	<script src="js/ie.js"></script>
	<script src="js/settings.js"></script>
	<script src="js/mapdiagram.js"></script>
	<script src="js/launch.js"></script>
	<!--<script src="js/extension.js"></script>-->

	<!--JS Files to accurately create collision icons-->
	<script src="js/collision.js"></script>
	<script src="js/validity.js"></script>
	<script src="js/svg.js"></script>

	<script src="js/user.js"></script>
<?php

//Make session variables, so that this query can be replicated for downloads or mapping in different php files.

$dbtables = "switrs_all_new";

if(isset($_GET["CASEID"]) && !empty($_GET["CASEID"])){
	$CASEID=$_GET["CASEID"];

	$where = "CASEID IN (";
	$pars = array();
	foreach($CASEID as $k => $v) {
		if ($k == 0){
			$where .= "?";
		} else {
			$where .= ",?";
		}
		$pars[] = str_pad($v, 7, "0", STR_PAD_LEFT);
	}
	$where .= ")";

	$db->select($dbtables, "*", $where, NULL);
	$db->parameters($pars, 3);
	$db->close();

	$nomap = 1;
}
if($total < 5000 && $total > 0) {
	$db->select($dbtables, "*", $where);
	$db->parameters( $pars );
	$db->close();
	$results = $result;

	$nomap = 0;

	echo "<script type='text/javascript'>";
	$Gcount = 0;
	foreach ($results as $row)
	{
		if($row['POINT_X']<>0){
			$where = "Field_Name='CRASHSEV' and Value_ID = ? ";
			$db->select("switrs_fields_info_new", "Field_Value", $where);
			$db->parameters( $row['CRASHSEV'] );
			$db->close();
			$sevrow = $db->single_array($result);
			$sevtmp = $sevrow['Field_Value'];

			$Gcount++;
			echo "cases['id_". $row['CASEID'] ."'] = {
				id: '". $row['CASEID'] ."',
				x: '". $row['POINT_X'] ."',
				y: '". $row['POINT_Y'] ."',
				date: '". $row['DATE_'] ."',
				sev: '". $sevtmp ."',
				ped: '". $row['PEDCOL'] ."',
				bic: '". $row['BICCOL'] ."',
				mc: '". $row['MCCOL'] ."',
				truck: '". $row['TRUCKCOL'] ."',
				prim: '". addslashes($row['PRIMARYRD'])."',
				second: '".  addslashes($row['SECONDRD'])."',
				crashType: '". $row['CRASHTYP'] ."',
				crashSeverity: '". $row['CRASHSEV'] ."',
				pcf: '". $row['VIOLCAT'] ."',
				intersect: '". $row['INTERSECT_'] ."',
				dist: '". $row['DISTANCE'] ."',
				dir: '". $row['DIRECT'] ."',
				highway: '". $row['STATEHW'] ."',
				route: '". $row['STROUTE'] ."',
				postmile: '". $row['POSTMILE'] ."'
			};";

			$db->select("party_new", "PDIRECT, MOVEMENT, PTYPE, VEHTYPE, ATFAULT", "CASEID = ?");
			$db->parameters( $row['CASEID'] );
			$db->close();
			echo "
				cases['id_". $row['CASEID'] ."'].direction = [];
				cases['id_". $row['CASEID'] ."'].movement = [];
				cases['id_". $row['CASEID'] ."'].party = [];
				cases['id_". $row['CASEID'] ."'].vehType = [];
				cases['id_". $row['CASEID'] ."'].atFault = [];
			";

			if (/*count($result) == 2 || count($result) == 1*/ 1 == 1) {
				//Not all the movement variables are valid for our diagram - make an array of the ones that are
				$valid_movement = array("A", "B", "C", "D", "E", "F", "H", "I", "J", "L", "N", "O", "P");
				foreach($result as $v){
					$validity = false;
					//Is this party's movement in the list of valid movements above
					if ($v['PDIRECT'] != "-" && in_array($v['MOVEMENT'], $valid_movement)) {
						$validity = true;
					}
					//If not, is this party a pedestrian or a vehicle?
					if ($v['PTYPE'] == 2 || $v['PTYPE'] == 4) {
						$validity = true;
					}
					//Use another method to check
					if (($v['PTYPE'] == '-' || $v['PTYPE'] == '') && ($v['VEHTYPE'] == 'N' || $v['VEHTYPE'] == 'L')) {
						$validity = true;
					}
					if($validity == true) {
						echo "
							cases['id_". $row['CASEID'] ."'].direction.push('". $v['PDIRECT'] ."');
							cases['id_". $row['CASEID'] ."'].movement.push('". $v['MOVEMENT'] ."');
							cases['id_". $row['CASEID'] ."'].party.push('". $v['PTYPE'] ."');
							cases['id_". $row['CASEID'] ."'].vehType.push('". $v['VEHTYPE'] ."');
							cases['id_". $row['CASEID'] ."'].atFault.push('". $v['ATFAULT'] ."');
						";
					}
				}
			}
		}
	}

	echo "var totCount = ".$total.";</script>";
}
?>
</head>

<body class="claro">
<div id="loadingOverlay">
	<div id="loadingAnim" style="position: relative; top: 45%; margin-left: auto; margin-right: auto; width: 66px;">
		<img src="images/ajax-loader.gif">
	</div>
</div>

<?php
if($nomap == 0){ ?>
<div id="printPage">
	<div id="printSettings">
		<button id="workingView" type="button"></button>
		<button id="printButton" type="button"></button>
	</div>
	<div id="printPane">
	<div id="mapPane" data-dojo-type="dijit.layout.BorderContainer" data-dojo-props="gutters:false,design:'headline'">
		<div id="objContents" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region:'center'">
			<div data-dojo-type="dijit.layout.BorderContainer" data-dojo-props="gutters:false,design:'headline'">
				<div id="mapBox" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region:'center'" >
					<div id="map_canvas"></div>
				</div>
				<div id="settingPane" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region:'bottom'" >
					<div id="dateArea">
						<?php print 'Date Created: '.(Date("m/d/Y")); ?><br>Created by TIMS (http://tims.berkeley.edu) &copy; UC Regents, 2014-<script>document.write(new Date().getFullYear());</script>
					</div>
					<div id="workingSettings">
						<div class="parameter">
							<label for="lightness" style="float:left">Map Opacity: </label><div id="lightness"></div>
						</div>
						<div class="parameter">
							<label for="iconScale" style="float:left">Icon Size: </label><div id="iconScale"></div>
						</div>
						<div>
							<div class="parameter">
								<label for="streetNames">Street Names: </label><input id="streetNames">
							</div>
							<div class="parameter">
								<label for="landMarks">Landmarks: </label><input id="landMarks">
							</div>
							<div class="parameter">
								<label for="grayScale">Grayscale: </label><input id="grayScale">
							</div>
							<!--<div class="parameter" style="border-right: none;">
								<div class="par_text">Show Invalid Collisions: </div>
								<div class="par_check"><input id="showInvalid" /></div>
							</div>-->
						</div>
					</div>
				</div>

			</div>
		</div>
		<?php getDetailsLand();?>

	</div>
	</div>

	<div id="hidden" style="display:none;">
		<!--
		<div id="transformer" style="display: none; width: 240px; float: left;">
			<div class="trans_row">
				<div class="trans_slider"><div id="rotator"></div></div>
			</div>
		</div>
		-->
		<!--The print out details area-->
		<?php getDetailsPort(); ?>

		<!--A prototype for the manual input dialog-->
		<div id="addContent" class="infoWin" style="width:380px">
			<div class="infoTitle">Add Collision</div>
			<div class='infoHead'>1. Choose Collision Severity and Type</div>
			<div class="infoMain">
				<div class="infoText">
					<div id="severityCombo"></div>
				</div>
				<div class="infoText">
					<div id="typeCombo"></div>
				</div>
			</div>
			<div class="infoHead">2. Select Party Information</div>
			<div class="infoMain">
				<div id="party1" class="infoText">
					<div id="p1movementCombo"></div>
					<div id="p1directionCombo"></div>
					<div id="p1partyCombo"></div>
				</div>
				<div id="party2" class="infoText">
					<div id="p2movementCombo"></div>
					<div id="p2directionCombo"></div>
					<div id="p2partyCombo"></div>
				</div>
			</div>
			<div class="infoDone">
				<div id="addMessage" style="float:left;margin-top:5px;color:red"></div>
				<button data-dojo-type="dijit.form.Button" type="button" id="cancelButton">Cancel</button>
				<button data-dojo-type="dijit.form.Button" type="button" id="addButton">Add</button>
			</div>
		</div>

		<!--A prototype for the edit collision dialog-->
		<div id="editContent" class="infoWin" style="width:260px">
			<div class="infoTitle">Edit Collision</div>
			<div class='infoHead'>Rotate&nbsp;&nbsp;<button data-dojo-type="dijit.form.Button" type="button" id="resetButton">Reset</button></div>
			<div id="slider">
				<div id="sliderRule"></div>
				<div id="sliderLabel"></div>
			</div>
			<div class='infoHead'>Delete&nbsp;&nbsp;<button data-dojo-type="dijit.form.Button" type="button" id="deleteButton">Delete</button></div>
			<div class="infoDone"><button data-dojo-type="dijit.form.Button" type="button" id="doneButton">Done</button></div>
		</div>

	</div>
</div>
<?php }
else {

} ?>
</body>
</html>