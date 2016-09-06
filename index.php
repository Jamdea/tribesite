<!DOCTYPE html>
<html lang="en">
<head>
	<link rel="stylesheet" href="https://js.arcgis.com/4.0/esri/css/main.css">
	<script src="https://js.arcgis.com/4.0/"></script>
	<style>
		html,
		body,
		#viewDiv {
			padding: 0;
			margin: 0;
			height: 100%;
			width: 100%;
		}
	</style>
	<script>
		require([
			"esri/Map",
			"esri/views/MapView",
			"esri/layers/FeatureLayer",
			/*"dijit/allyclick",
			"dojo/on",
			"dojo/dom",
			"dojo/dom-attr",
			"dojo/dom-construct",*/
			"dojo/domReady!"	
			],
			function(Map, MapView, FeatureLayer
				//allyclick, on, dom, domAttr, domConstruct
				){
				var map = new Map({
					basemap: "topo"
				});
				var view = new MapView({
					container: "viewDiv",
					map: map,
					extent: {
						xmin: -13849947.1077,
						ymin: 3833641.0796,
						xmax: -12705116.39,
						ymax: 5162385.525,
						spatialReference: 102100
					},
					//padding: {right: 300}
				});

				var switrsLayer = new FeatureLayer({
					url: "http://services2.arcgis.com/Sc1y6FClT0CxoM9q/ArcGIS/rest/services/California_AGOL_20160518/FeatureServer/1"
				});

				var tribeLayer = new FeatureLayer({
					url: "http://services2.arcgis.com/Sc1y6FClT0CxoM9q/ArcGIS/rest/services/tribal/FeatureServer/0"
				});

				map.add(tribeLayer);
				//map.add(switrsLayer);

			});
	</script>
</head>
<body>
	<div id="viewDiv"></div>
</body>
</html>