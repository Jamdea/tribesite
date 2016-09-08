<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
	<title>Trabal TIMS</title>
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
		#optionsDiv {
			background-color: dimgrey;
      		color: white;
      		z-index: 23;
      		position: absolute;
      		top: 0px;
      		left: 0px;
      		padding: 0px 10px 0px 10px;
      		border-bottom-right-radius: 5px;
      		max-width: 350px;
    }
	</style>
	<script>
		require([
			"esri/Map",
			"esri/views/MapView",
			"esri/layers/FeatureLayer",
			"esri/tasks/QueryTask",
      		"esri/tasks/support/Query",
      		"dojo/_base/array",
      		"dojo/dom",
      		"dojo/on",
      		"esri/layers/GraphicsLayer",
      		"esri/renderers/SimpleRenderer",
      		"esri/symbols/SimpleMarkerSymbol",
      		"esri/symbols/SimpleFillSymbol",
      		"esri/Graphic",
      		"esri/geometry/Point",
      		"esri/geometry/Geometry",
			"dojo/domReady!"	
			],
			function(Map, MapView, FeatureLayer, QueryTask, Query, arrayUtils, 
				dom, on, GraphicsLayer, SimpleRenderer, SimpleMarkerSymbol, SimpleFillSymbol, 
				Graphic, Point, Geometry
				){

				var resultsLyr = new GraphicsLayer();

				var map = new Map({
					basemap: "dark-gray",
					layers: [resultsLyr]
				});

				var point = new Point({
					longitude: -117.667,
					latitude: 37.526
				});

				// TEST Create a symbol for drawing the point
				/*var markerSymbol = new SimpleMarkerSymbol({
					color: [226, 119, 40],
					outline: { // autocasts as new SimpleLineSymbol()
				  		color: [0, 0, 0],
				  		width: 10
				  	}
				});

				// Create a graphic and add the geometry and symbol to it
				var pointGraphic = new Graphic({
					geometry: point,
					symbol: markerSymbol
				});

				resultsLyr.add(pointGraphic);*/



				var view = new MapView({
					container: "viewDiv",
					map: map,
					extent: {
						xmin: -13849947.1077,
						ymin: 3833641.0796,
						xmax: -12705116.39,
						ymax: 5162385.525,
						spatialReference: 102100
					}
				});


				var switrsLayer = new FeatureLayer({
					url: "http://services2.arcgis.com/Sc1y6FClT0CxoM9q/ArcGIS/rest/services/California_AGOL_20160518/FeatureServer/1"
				});

				var tribeLayer = new FeatureLayer({
					url: "http://services2.arcgis.com/Sc1y6FClT0CxoM9q/ArcGIS/rest/services/tribal/FeatureServer/0"
				});

				map.add(tribeLayer);
				//map.add(switrsLayer);

				// Create graphics layer and symbol to use for displaying the results of query
				//var resultsLyr = new FeatureLayer();
				
				var qTask = new QueryTask({
					url: "http://services2.arcgis.com/Sc1y6FClT0CxoM9q/ArcGIS/rest/services/California_AGOL_20160518/FeatureServer/1"
				});
				/*var params = new Query ({
					returnGeometry: true,
					outFields: ["*"]
				});*/
				var params = new Query;
				var tribeName = dom.byId("tribename");

			    var generateRenderer = function(type) {
			    	type = type || "default";
			    	if (type == "default") {
    					var colRenderer = new SimpleRenderer({
      						symbol: new SimpleMarkerSymbol({
        						size: 8,
        						color: "#3b7ea1",
        						outline: {
        							width: 0.5,
          							color: "white"
        						}
      						})
    					});
  					}
  					return colRenderer;
  				};

				function doQuery(){
					//resultsLyr.removeAll();
					map.resultsLyr = null;
					query = "NAME LIKE '" + tribeName.value + "'";
					tribeLayer.definitionExpression = query;
					//dom.byId("printResults").innerHTML = tribeLayer.source;
					var geometry = new Geometry();
					tribeLayer.queryFeatures().then(function(featureSet){
						geometry = featureSet.features.geometry;
					});
					params.geometry = geometry;
					params.spatialRelationship = "intersects";
					qTask.execute(params).then(getResults).otherwise(promiseRejected);
					
				};

				function getResults(response){
					dom.byId("printResults").innerHTML = "query start";

					var switrsResults = arrayUtils.map(response.features, function(feature){
						feature.symbol = new SimpleMarkerSymbol({
							color: "red",
            				outline: {
              					color: "white",
              					width: "0.5px"
            				}
						});
						return feature;
					});
					
					resultsLyr.add(response.features);
					//resultsLyr.addMany(response.features);
					
					//map.add(resultsLyr);
					view.goTo(response.features);
					//view.extent = tribeResults.fullExtent;
					dom.byId("printResults").innerHTML = switrsResults.length;
				};

				/*function getResults(results){
					var option = {
						fields: results.fields,
                		source: results.features,
                		objectIdField: "OBJECTID",
                		geometryType: "polygon",
                		spatialReference: results.spatialReference,
                		renderer: generateRenderer()
					};
					resultsLyr = new FeatureLayer(option);
					map.add(resultsLyr);
					view.goTo(results.features);
					dom.byId("printResults").innerHTML = results;
					//console.log(results.features);
				}*/

				function promiseRejected(err) {
					console.error("Promise rejected: ", err.message);
				}

				on(dom.byId("doBtn"), "click", doQuery);

			});
	</script>
</head>
<body>
	<div id="viewDiv"></div>
	<div id="optionsDiv">
    	<h2>California Tribes</h2>
    	Select tribe by name
    	<select id="tribename">
      		<option value="%">All</option>
      		<option value="Chemehuevi">Chemehuevi</option>
    		<option value="Mechoopda">Mechoopda</option>
    		<option value="Yurok">Yurok</option>
    		<option value="Wilton">Wilton</option>
    	</select>

    	<br>
    	<br>
    	<button id="doBtn">Do Query</button>
    	<br>
    	<p><span id="printResults"></span></p>
  	</div>

</body>
</html>