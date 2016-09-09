<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
	<title>Trabal TIMS</title>
	<!-- Calcite Bootstrap -->
	<!-- <link rel="stylesheet" href="//esri.github.io/calcite-bootstrap/assets/css/calcite-bootstrap-open.min.css"> -->
	<!-- <link rel="stylesheet" href="//esri.github.io/calcite-maps/dist/vendor/dojo-bootstrap/assets/datepicker.css"> -->
	<!-- ArcGIS JavaScript api 4.0 -->
	<link rel="stylesheet" href="https://js.arcgis.com/4.0/esri/css/main.css">
	<!-- <script src="https://js.arcgis.com/4.0/"></script> -->

	<link rel="stylesheet" href="//code.jquery.com/ui/1.12.0/themes/base/jquery-ui.css">
	<!-- <link rel="stylesheet" href="/resources/demos/style.css"> -->
	<script src="https://code.jquery.com/jquery-1.12.4.js"></script>
	<script src="https://code.jquery.com/ui/1.12.0/jquery-ui.js"></script>

	<link rel="stylesheet" href="css/style.css">

</head>
<body>
	<div id="viewDiv"></div>
	<div id="overviewDiv">
		<div id="extentDiv"></div>
	</div>
	<div id="optionsDiv">
    	<h2>California Tribes</h2>
    	Select tribe by name:
    	<br>
    	<select id="tribename"></select>
    	<br>
    	Select date:
    	<br>
		<input class="span2" size="16" type="text" value="01/01/2005" id="startDate"> - <input class="span2" size="16" type="text" value="12/31/2015" id="endDate">
    	<br>
    	Select buffer:
    	<br>
    	<select id = "buffer">
    		<option value = 0>No Buffer</option>
    		<option value = 1>5-Mile Buffer</option>
    	</select>
    	<br>
    	<br>
    	<button id="doBtn">Do Query</button>
    	<button id="clearBtn">Clear Search</button>
    	<br>
    	<p><span id="printResults"></span></p>
  	</div>
  	<script>
		// var dojoConfig = {
		// 	packages: [{
		// 		name: "bootstrap",
		//     	location: "https://esri.github.io/calcite-maps/dist/vendor/dojo-bootstrap"
		//     },
		//     {
		//     	name: "extra",
		//     	location: location.pathname.replace(/\/[^/]+$/, '') + "/extra"
		//     }]
		// };
		// var minyear = <?php print $minyear;?>;
		// var startyear = <?php print $startyear;?>;
		// var endyear = <?php print $endyear;?>;
		// var arcgisOnline = "<?php print $arcgis;?>";
		$(function(){
			$("#startDate").datepicker({
				minDate: new Date(2005, 0, 1),
				maxDate: new Date(2015, 11, 31),
				changeMonth: true,
				changeYear: true
			});
			$("#endDate").datepicker({
				minDate: new Date(2005, 0, 1),
				maxDate: new Date(2015, 11, 31),
				changeMonth: true,
				changeYear: true				
			});
		});
  	</script>
	<script src="//js.arcgis.com/4.0/"></script>
	<script src="js/main.js"></script>

</body>
</html>