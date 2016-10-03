<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
	<title>Trabal TIMS</title>
      <!-- Calcite Bootstrap -->
  <!-- <link rel="stylesheet" href="//esri.github.io/calcite-bootstrap/assets/css/calcite-bootstrap-open.min.css"> -->
<!--   <link rel="stylesheet" href="//esri.github.io/calcite-maps/dist/vendor/dojo-bootstrap/assets/datepicker.css"> -->
  <!-- Calcite Maps -->
  <!-- <link rel="stylesheet" href="//esri.github.io/calcite-maps/dist/css/calcite-maps-arcgis-4.x.min-v0.2.css"> -->
	<!-- ArcGIS JavaScript api 4.0 -->
	<link rel="stylesheet" href="https://js.arcgis.com/4.1/esri/css/main.css">
	<!-- <script src="https://js.arcgis.com/4.0/"></script> -->

	<link rel="stylesheet" href="//code.jquery.com/ui/1.12.0/themes/base/jquery-ui.css">
	<!-- <link rel="stylesheet" href="/resources/demos/style.css"> -->
	<script src="https://code.jquery.com/jquery-1.12.4.js"></script>
	<script src="https://code.jquery.com/ui/1.12.0/jquery-ui.js"></script>

  <!-- <script src="http://code.highcharts.com/highcharts.js"></script> -->
  <script src="https://code.highcharts.com/stock/highstock.js"></script>
  <script src="http://code.highcharts.com/modules/exporting.js"></script>

	<link rel="stylesheet" href="css/style.css">




</head>
<body>
	<div class = "menubar" id = "menuDiv">
        <!-- <div id = "title"><span>Tribal TIMS</span><div>  -->
		<ul class = "topnav" id = "myTopnav">
			<div class = "dropdown">
<!-- 				<li><button onclick="dropdownFun()" class="dropbtn" title="Click to start mapping traffic injuries">Map SWITRS</button></li> -->
            <li><button id="mapSwitrs" class="dropbtn" title="Click to start mapping traffic injuries">Map SWITRS</button></li>
				<div id="optionsDiv" class = "dropdown-content">
			    	<h2>California Tribes</h2>
			    	<span>Select Tribe by Name:</span>
			    	<br>
			    	<select id="tribename"></select>
                    <br>
			    	<span>Select Date:</span>
			    	<br>
					<input class="span2" size="16" type="text" value="01/01/2005" id="startDate"> - <input class="span2" size="16" type="text" value="12/31/2015" id="endDate">
			    	<br>
			    	<span>Select Buffer:</span>
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
			    	<span>Select Injury Level:</span>
			    	<br>
			    	<select id = "injury">
			    		<option value = 0>All Injury Levels</option>
			    		<option value = 1>Fatality Only</option>
			    		<option value = 2>Fatality and Severe Injury</option>
			    	</select>
<!-- 			    	<br>
                    <input type="checkbox" id="tribeBound" checked>Show tribe boundry
                    <br>
                    <input type="checkbox" id="bufferBond" checked>Show buffer boundry -->
                    <br>
                    <!-- <input type="checkbox" id="tribeBond" checked data-dojo-type="dijit/form/CheckBox"> -->
                    <!-- <input type="checkbox" id="dbox1Bond" checked data-dojo-type="dijit/form/CheckBox"> -->
                    <div id="boundryBox" class = "checkbox"> 
                    </div>
                    <label for="tribeBond">Show Tribe Boundry</label>
                    <br>
                    <div id="bufferBox" class = "checkbox">
                    </div>
                    <label for="bufferBond">Show Buffer</label>
                    <br>
                    <br>
                    <button id="doBtn" class = "actionBtn">Apply</button>
			    	<button id="clearBtn" class = "actionBtn">Clear Search</button>
			    	<br>
			    	<!-- <p><span id="printResults"></span></p> -->
			    	<br>
			  	</div>
			<!-- </div>         -->
			   
            <li id = "printMap"><a href = "#">Print</a></li>
    			<li class = "dropdownHover">
    				<a href ="#" class="dropbtnHover" title="Change basemap layer">Basemap</a>
    				<div class = "dropdnHover-content" id = "dropdnBasemap">
    					<div id="streets">Streets</div>
    					<div id="satellite">Satellite</div>
    					<div id="hybrid">Hybrid</div>
    					<div id="topo">Topography</div>
    					<div id="gray">Light Gray Canvas</div>
    					<div id="dark-gray">Dark Gray Canvas</div>
    					<div id="oceans">Oceans</div>
    					<div id="national-geographic">National Geographic</div>
    					<div id="terrain">Terrain</div>
    					<div id="osm">Open Street Map</div>
    				</div>
    			</li>
			<li class = "dropdownHover">
        <a href = "#layers" class = "dropbtnHover" title = "Map layers">Layers</a>
        <div class = "dropdnHover-content">
            <div id = "tribeLayer"><label for="tribe">Tribe Area</label></div>
        </div>
      </li>
			<li class = "dropdownHover">
        <a href = "#options" class = "dropbtnHover" title="Change collision point symbol">Symbol</a>
        <div class = "dropdnHover-content" id = "symbolOptions">
          <div>
            <p>Choose Symbol Size: <span id="sizetext">8</span></p>
            <input type="range" id="symbolsize" value="8" min="5" max="15">
          </div>
          <div>
            <p>Choose an Attribute to Show:</p>
            <select id = "symbol">
              <option value = 0>Default</option>
              <option value = 1>Collision Severity</option>
<!--               <option value = 2>Type of Collision</option> -->
            </select>
            <br>
            <br>
            <div id="setSymbol">
              Color:
              <a href="#" class = "collisionSymbol"></a><span class = "symbolText">Collision</span>
            </div>
          </div>
        </div>
      </li>
			<li class = "dropdownHover">
        <a href = "#report" class = "dropbtnHover" title="Create reporting charts">Reporting</a>
        <div class = "dropdnHover-content">
          <div title = "Create crash variable reports" id = "crashReport">Crash Variables</div>
          <div title = "Create injurt trend reports" id = "injuryReport">Injury Trend</div>
        </div>
      </li>
      <li id = "title">Tribal TIMS</li>

			<li class = "icon">
				<a href="javascript:void(0);" onclick="myFunction()">&#9776;</a>
			</li>
		</ul>
	</div>
	<div id="viewDiv">
        <div class="loader" alt="Loading">
            <div><img src="images/loading.gif"></div>
            <div class="loader-text">Loading...</div>        
    </div>
	<div id="overviewDiv">
		<div id="extentDiv"></div>
	</div>
    <div>
        <button id = "infoIcon" class = "panelHeading" title="Display tribe info window">Detail Tribe Info</button>
    </div>
	<div id="infoPanel">
		<!-- <span aria-hidden="true" id = "infoIcon" title="Display tribe info window">i</span> -->

        <div id = "info">
            <h4 id="printResults">Please select tribe!</h4>
            <button class = "panelHeading" id = "tribeToggle" title = "Display tribal summary info">Tribal Summary</button>
            <span id = "noTribeText"></span>
            <br>
                <table id = "tribeTable">
                  <col width= "68%">
                  <col width= "32%">
<!--                   <tr>
                    <th colspan= 2>Tribal Summary</th>
                  </tr> -->
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
                    <td>Tribal Court:</td>
                    <td id = "tribeCourt"></td>
                  </tr>
                  <tr>
                    <td>Tribal Fire Department:</td>
                    <td id = tribeFire></td>
                  </tr>
                  <tr>
                    <td>Tribal Emergency Medical Services:</td>
                    <td id = tribeEms></td>
                  </tr>
                  <tr>
                    <td>Casino:</td>
                    <td id = tribeCasino></td>
                  </tr>
                  <tr>
                    <td>Has Transportation Agency:</td>
                    <td id = tribeTrans></td>
                  </tr>
                  <tr>
                    <td>Roadway Infrastructure Collection:</td>
                    <td id = tribeInfra></td>
                  </tr>
                </table>
            <br>
                <button class = "panelHeading" id = "victimToggle" title="Display victim info">Snapshot of Victims</button>
                <span id = "noVictimText"></span>
                <br>
                <table id = "victimTable">
                  <col width= "70%">
                  <col width= "30%">
<!--                   <tr>
                    <th colspan= 2>Snapshot of Victims</th>
                  </tr> -->
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
                <button class = "panelHeading" id = "injurToggle" title = "Display fatal and severe injury info">Snapshot of Fatal and Severe Injuries</button>
                <span id = "noInjurText"></span>
                <br>
                <table id = "injurTable">
                  <col width= "70%">
                  <col width= "30%">
<!--                   <tr>
                    <th colspan= 2>Snapshot of Fatal and Severe Injuries</th>
                  </tr> -->
                  <tr>
                    <td>Pedestrain Victims:</td>
                    <td id = "pedVictim"></td>
                  </tr>
                  <tr>
                    <td>Bicycle Victims:</td>
                    <td id = "bikeVictim"></td>
                  </tr>
                  <tr>
                    <td>Motocycle Victims:</td>
                    <td id = "carVictim"></td>
                  </tr>
                  <tr>
                    <td>Alcohol-Involved Victims:</td>
                    <td id = "impairedVictim"></td>
                  </tr>
                </table>
        </div>		
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

		// function dropdownFun() {
		//     document.getElementById("optionsDiv").classList.toggle("show");
		// }

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
	<script src="https://js.arcgis.com/4.1/"></script>
	<script src="js/main.js"></script>

</body>
</html>