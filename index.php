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
	<div id = "menuDiv">
		<ul class = "topnav" id = "myTopnav">
			<div class = "dropdown">
				<li><button onclick="dropdownFun()" class="dropbtn" title="Start mapping traffic injuries">Map SWITRS</button></li>
				<div id="optionsDiv" class = "dropdown-content">
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
			    		<option value = 1>1-Mile Buffer</option>
			    		<option value = 2>2-Mile Buffer</option>
			    		<option value = 3>3-Mile Buffer</option>
			    		<option value = 4>4-Mile Buffer</option>
			    		<option value = 5>5-Mile Buffer</option>
			    	</select>
			    	<br>
			    	Select injury level:
			    	<br>
			    	<select id = "injury">
			    		<option value = 0>All Injury Levels</option>
			    		<option value = 1>Fatality Only</option>
			    		<option value = 2>Fatality and Severe Injury</option>
			    	</select>
			    	<br>
			    	<br>
			    	<button id="doBtn" class = "actionBtn">Do Query</button>
			    	<button id="clearBtn" class = "actionBtn">Clear Search</button>
			    	<br>
			    	<p><span id="printResults"></span></p>
			  	</div>
			</div>
			<li><a href = "#tools">Tools</a></li>
			<li><a href = "#options">Options</a></li>
			<li><a href = "#layers">Layers</a></li>
			<li><a href = "#basemap">Basemap</a></li>
			<li><a href = "#print">Print</a></li>
			<li class = "icon">
				<a href="javascript:void(0);" onclick="myFunction()">&#9776;</a>
			</li>
		</ul>
	</div>
	<div id="viewDiv"></div>
	<div id="overviewDiv">
		<div id="extentDiv"></div>
	</div>
  	<script>

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

		function dropdownFun() {
		    document.getElementById("optionsDiv").classList.toggle("show");
		}

		// Close the dropdown menu if the user clicks outside of it
		// window.onclick = function(event) {
		//   	if (!event.target.matches('.dropbtn')) {

		//     	var dropdowns = document.getElementsByClassName("dropdown-content");
		//     	var i;
		//     	for (i = 0; i < dropdowns.length; i++) {
		//       		var openDropdown = dropdowns[i];
		//       		if (openDropdown.classList.contains('show')) {
		//         		openDropdown.classList.remove('show');
		//         	}
		//     	}
		//   	}
		// }

		function myFunction() {
			var x = document.getElementById("myTopnav");
			if (x.className === "topnav") {
				x.className += " responsive";
			} else {
				x.className = "topnav";
			}
		}

  	</script>
	<script src="//js.arcgis.com/4.0/"></script>
	<script src="js/main.js"></script>

</body>
</html>