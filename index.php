<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
	<title>Trabal TIMS</title>
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
				<li><button onclick="dropdownFun()" class="dropbtn" title="Click to start mapping traffic injuries">Map SWITRS</button></li>
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
			    	<!-- <p><span id="printResults"></span></p> -->
			    	<br>
			  	</div>
			</div>
			<li><a href = "#print">Print</a></li>
			<li class = "dropdownHover">
				<a href ="#" class="dropbtnHover" title="Change basemap layer">Basemap</a>
				<div class = "dropdnHover-content">
					<p><span id="streets">Streets</span></p>
<!-- 					<p><span id="streets-night-vector">Streets Night</span></p>
					<p><span id="streets-navigation-vector">Streets Navigation</span></p> -->
					<p><span id="satellite">Satellite</span></p>
					<p><span id="hybrid">Hybrid</span></p>
					<p><span id="topo">Topography</span></p>
					<p><span id="gray">Light Gray Canvas</span></p>
					<p><span id="dark-gray">Dark Gray Canvas</span></p>
					<p><span id="oceans">Oceans</span></p>
					<p><span id="national-geographic">National Geographic</span></p>
					<p><span id="terrain">Terrain</span></p>
					<p><span id="osm">Open Street Map</span></p>
				</div>
			</li>
			<li><a href = "#layers">Layers</a></li>
			<li><a href = "#options">Options</a></li>
			<li><a href = "#tools">Tools</a></li>			
			<li class = "icon">
				<a href="javascript:void(0);" onclick="myFunction()">&#9776;</a>
			</li>
<!-- 			<li><a href = "">Basemap-test</a>
			<select id = "basemapChg">
	    		<option value = "streets">streets</option>
	    		<option value = "satellite">Satellite</option>
	    		<option value = "hybrid">hybrid</option>
	    		<option value = "topo">topo</option>
	    	</select>
	    	<li> -->
		</ul>
	</div>
	<div id="viewDiv"></div>
	<div id="overviewDiv">
		<div id="extentDiv"></div>
	</div>
	<div id="infoPanel">
		<p><h4 id="printResults"></h4></p>
	<table>
	  <col width= "70%">
	  <col width= "30%">
	  <tr>
	    <th colspan= 2>Tribal Summary</th>
	  </tr>
	  <tr>
	    <td>County:</td>
	    <td id = "tribeCounty"></td>
	  </tr>
	  <tr>
	    <td>Population:</td>
	    <td id = "tribePop"></td>
	  </tr>
	  <tr>
	    <td>Area (in sq. miles):</td>
	    <td id = "tribeArea"></td>
	  </tr>
	  <tr>
	    <td>Road Miles:</td>
	    <td id = "tribeRoad"></td>
	  </tr>
	  <tr>
	    <td>Tribal Police:</td>
	    <td id = "tribePolice"></td>
	  </tr>
	  <tr>
	    <td>Tribal Fire:</td>
	    <td id = tribeFire></td>
	  </tr>
	  <tr>
	    <td>Tribal EMS:</td>
	    <td id = tribeEms></td>
	  </tr>
	  <tr>
	    <td>Casino:</td>
	    <td id = tribeCasino></td>
	  </tr>
	  <tr>
	    <td>Transportation Agency:</td>
	    <td id = tribeTrans></td>
	  </tr>
	  <tr>
	    <td>Roadway Infrastructure Collection:</td>
	    <td id = tribeInfra></td>
	  </tr>
	</table>
	<br>
	<table>
	  <col width= "70%">
	  <col width= "30%">
	  <tr>
	    <th colspan= 2>Snapshot of Victims</th>
	  </tr>
	  <tr>
	    <td>Total Victims:</td>
	    <td id = "totalVictim"></td>
	  </tr>
	  <tr>
	    <td>Fatalities:</td>
	    <td id = "fatalities"></td>
	  </tr>
	  <tr>
	    <td>Severe Injuries:</td>
	    <td id = "severe"></td>
	  </tr>
	</table>
	<br>
	<table>
	  <col width= "70%">
	  <col width= "30%">
	  <tr>
	    <th colspan= 2>Snapshot of Fatal and Severe Injuries</th>
	  </tr>
	  <tr>
	    <td>Pedestrain Victims:</td>
	    <td id = "pedVictim"></td>
	  </tr>
	  <tr>
	    <td>Bicycle Victims:</td>
	    <td id = "bikeVictim"></td>
	  </tr>
	  <tr>
	    <td>Pedestrain Victims:</td>
	    <td id = "carVictim"></td>
	  </tr>
	  <tr>
	    <td>Impaired Victims:</td>
	    <td id = "impairedVictim"></td>
	  </tr>
	</table>		
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