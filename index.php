<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
	<title>Trabal TIMS</title>
	<link rel="stylesheet" href="css/style.css">
	<link rel="stylesheet" href="https://js.arcgis.com/4.0/esri/css/main.css">
	<script src="https://js.arcgis.com/4.0/"></script>
	<script src="js/main.js"></script>
</head>
<body>
	<div id="viewDiv"></div>
	<div id="overviewDiv">
		<div id="extentDiv"></div>
	</div>
	<div id="optionsDiv">
    	<h2>California Tribes</h2>
    	Select tribe by name
    	<select id="tribename"></select>

    	<br>
    	<br>
    	<button id="doBtn">Do Query</button>
    	<br>
    	<p><span id="printResults"></span></p>
  	</div>

</body>
</html>