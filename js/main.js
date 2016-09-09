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
  		"esri/symbols/SimpleMarkerSymbol",
  		"esri/Graphic",
  		"esri/geometry/Point",
  		"esri/geometry/Geometry",
  		"esri/geometry/SpatialReference",
  		"esri/renderers/SimpleRenderer",
  		"esri/symbols/SimpleFillSymbol",
  		"esri/core/watchUtils",
  		"dojo/query",
  		"esri/widgets/Home",
		"dojo/domReady!"	
		],
		function(Map, MapView, FeatureLayer, QueryTask, Query, arrayUtils, 
			dom, on, GraphicsLayer, SimpleMarkerSymbol, 
			Graphic, Point, Geometry, SpatialReference, SimpleRenderer, SimpleFillSymbol,
			watchUtils, dquery, Home
			){

			var resultsLyr = new GraphicsLayer();

			var map = new Map({
				basemap: "dark-gray",
				layers: [resultsLyr]
			});

			var overviewMap = new Map({
				basemap: "gray"
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
				}
			});

			var homeBtn = new Home({
				view: view
			});

			homeBtn.startup();
			view.ui.add(homeBtn, "top-left");

			var overview = new MapView({
				container: "overviewDiv",
				map: overviewMap
			});

			overview.ui.components = [];
			var extentDiv = dom.byId("extentDiv");
			overview.then(function(){
				view.watch("extent", updateOverviewExtent);
				overview.watch("extent", updateOverviewExtent);
				watchUtils.when(view, "stationary", updateOverview);

				function updateOverview(){
					overview.goTo({
						center: view.center,
						scale: view.scale * 2 * Math.max(view.width/overview.width, 
							view.height/overview.height)
					});
				}

				function updateOverviewExtent(){
					var extent = view.extent;
					var bottomLeft = overview.toScreen(extent.xmin, extent.ymin);
					var topRight = overview.toScreen(extent.xmax, extent.ymax);
					extentDiv.style.top = topRight.y + "px";
					extentDiv.style.left = bottomLeft.x + "px";
					extentDiv.style.height = (bottomLeft.y - topRight.y) + "px";
					extentDiv.style.width = (topRight.x - bottomLeft.x) + "px";
				}
			});

			var polygonRenderer = new SimpleRenderer({
				symbol: new SimpleFillSymbol({
					color: [255, 255, 255, 0.1],
					outline: {
  					width: 2,
  					color: [51, 173, 255, 0.6]
  					}
  				})
  			});


			var switrsLayer = new FeatureLayer({
				url: "http://services2.arcgis.com/Sc1y6FClT0CxoM9q/ArcGIS/rest/services/California_AGOL_20160518/FeatureServer/1"
			});

			var tribeLayer = new FeatureLayer({
				url: "http://services2.arcgis.com/Sc1y6FClT0CxoM9q/ArcGIS/rest/services/tribal/FeatureServer/0",
				renderer: polygonRenderer
			});

			map.add(tribeLayer);
			//map.add(switrsLayer);

			var qTask = new QueryTask({
				url: "http://services2.arcgis.com/Sc1y6FClT0CxoM9q/ArcGIS/rest/services/California_AGOL_20160518/FeatureServer/1"
			});

			var params = new Query ({
				returnGeometry: true,
				outFields: ["*"],
				outSpatialReference: SpatialReference(102100)
			});

			// view.whenLayerView(tribeLayer).then(function(lyrView){
			// 	lyrView.watch("updating", function(val){
			// 		if(!val){
			// 			var tribequery = new Query();
			// 			tribequery.outFields = ["NAME", "OBJECTID"];
			// 			tribequery.where = "NAME LIKE '%'";
			// 			tribeLayer.queryFeatures(tribequery).then(function(featureSet){
			// 				var features = featureSet.features;
			// 				var text = "";
			// 				arrayUtils.forEach(features, function(feature){
			// 					var name = feature.attributes.NAME;
			// 					if(name.length > 30){
			// 						name = name.split("Tribe")[0];
			// 					}
			// 					text += "<option value='" + feature.attributes.OBJECTID + "'>" + name + "</option>";
								
			// 				});
			// 				console.log(text);
			// 				dquery("#tribename")[0].innerHTML = text;
			// 			});
			// 		}
			// 	});
			// });

			tribeLayer.then(function(result){
				return view.map.layers.getItemAt(0).load();
			}).then(function(){
				var tribequery = new Query();
				tribequery.outFields = ["NAME", "OBJECTID"];
				tribequery.where = "NAME LIKE '%'";
				tribeLayer.queryFeatures(tribequery).then(function(featureSet){
					var features = featureSet.features;
					var text = "";
					arrayUtils.forEach(features, function(feature){
						var name = feature.attributes.NAME;
						if(name.length > 30){
							name = name.split("Tribe")[0];
						}
						text += "<option value='" + feature.attributes.OBJECTID + "'>" + name + "</option>";
						
					});
					console.log(text);
					dquery("#tribename")[0].innerHTML = text;
				});
			});

			var tribeName = dom.byId("tribename");
			function doQuery(){
				resultsLyr.removeAll();
				query = "OBJECTID ='" + tribeName.value + "'";
				tribeLayer.definitionExpression = query;
				tribeLayer.queryFeatures().then(function(featureSet){
					var geometry = featureSet.features[0].geometry;
					params.geometry = geometry;
					params.spatialRelationship = "intersects";
					qTask.execute(params).then(getResults).otherwise(promiseRejected);
				});
			};

			function getResults(response){
				var switrsResults = arrayUtils.map(response.features, function(feature){
					feature.symbol = new SimpleMarkerSymbol({
						color: [255, 100, 0, 0.8],
						size: 8,
						outline: {
							color: [255, 255, 255, 0.8],
							width: 0.5
						}
					});
					return feature;
				});
				
				resultsLyr.addMany(switrsResults);

				//console.log(response.spatialReference.wkid);
				
				//map.add(resultsLyr);
				view.goTo(switrsResults);
				//view.extent = tribeResults.fullExtent;
				dom.byId("printResults").innerHTML = switrsResults.length + " results found";
			};

			function promiseRejected(err) {
				console.error("Promise rejected: ", err.message);
			}

			on(dom.byId("doBtn"), "click", doQuery);

		});