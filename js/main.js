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
  		"esri/widgets/BasemapToggle",
  		"esri/geometry/geometryEngine",
  		"dojo/mouse",

  		//Bootstrap
  		//"extra/Datepicker",

		"dojo/domReady!"	
		],
		function(Map, MapView, FeatureLayer, QueryTask, Query, arrayUtils, 
			dom, on, GraphicsLayer, SimpleMarkerSymbol, 
			Graphic, Point, Geometry, SpatialReference, SimpleRenderer, SimpleFillSymbol,
			watchUtils, dquery, Home, BasemapToggle, geometryEngine, mouse
			){

			var resultsLyr = new GraphicsLayer();

			var map = new Map({
				basemap: "dark-gray",
				layers: [resultsLyr]
			});

			var overviewMap = new Map({
				basemap: "gray"
			});

			var oriExtent = {
				xmin: -13849947.1077,
				ymin: 3833641.0796,
				xmax: -12705116.39,
				ymax: 5162385.525,
				spatialReference: 102100
			};

			var view = new MapView({
				container: "viewDiv",
				map: map,
				extent: oriExtent
			});

			var toggle = new BasemapToggle({
				view: view,
				nextBasemap: "osm"
			});
			toggle.startup();

			var homeBtn = new Home({
				view: view
			});

			homeBtn.startup();
			view.ui.add(homeBtn, "top-left");
			view.ui.add(toggle, "top-right");

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

  			var bufferSymbol = new SimpleFillSymbol({
  				color: [255, 255, 255, 0.1],
  				outline: {
  					width: 2,
  					color: [51, 173, 255, 0.2]
  				}
  			})

  			var highlSymbol = new SimpleFillSymbol({
  				color: [255, 255, 255, 0.2],
  				outline: {
  					width: 3,
  					color: [151, 173, 255, 1]
  				}
  			})

			var switrsLayer = new FeatureLayer({
				url: "http://services2.arcgis.com/Sc1y6FClT0CxoM9q/ArcGIS/rest/services/California_AGOL_20160901/FeatureServer/0"
			});

			var tribeLayer = new FeatureLayer({
				url: "http://services2.arcgis.com/Sc1y6FClT0CxoM9q/ArcGIS/rest/services/tribal/FeatureServer/0",
				renderer: polygonRenderer
			});

			map.add(tribeLayer);
			//map.add(switrsLayer);

			var qTask = new QueryTask({
				url: "http://services2.arcgis.com/Sc1y6FClT0CxoM9q/ArcGIS/rest/services/California_AGOL_20160901/FeatureServer/0"
			});

			var params = new Query ({
				returnGeometry: true,
				outFields: ["*"],
				outSpatialReference: SpatialReference(102100)
			});

			// var filters = {
			// 	"date":{
			// 		"startDate": query("#startDate").val(),
			// 		"endDate": query("#endDate").val()
			// 	}
			// };




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
					//console.log(text);
					dquery("#tribename")[0].innerHTML = text;
				});
			});

			function dateToYMD(date){
				var dateParts = date.split(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
			    return dateParts[3] + "-" + dateParts[1] + "-" + dateParts[2];				
			}

			var tribeName = dom.byId("tribename");
			var buffer = dom.byId("buffer");
			var highlGraphic = new Graphic();
			// var startDate = dateToYMD(dom.byId("startDate").value);
			// var endDate = dateToYMD(dom.byId("endDate").value);
			//var lastSelect = "";

			function gotoTribe(){
				view.graphics.remove(highlGraphic);
				var query = new Query({
					returnGeometry: true,
					outFields: ["*"],
					outSpatialReference: SpatialReference(102100)
				});
				query.where = "OBJECTID ='" + tribeName.value + "'";
				tribeLayer.queryFeatures(query).then(function(featureSet){
					var zoomGeo = featureSet.features[0].geometry;
					highlGraphic.geometry = zoomGeo;
					highlGraphic.symbol = highlSymbol;
					view.graphics.add(highlGraphic);
					view.goTo(highlGraphic);
				});
				//lastSelect = tribeName;
			};

			function doQuery(){
				view.graphics.remove(highlGraphic);
				resultsLyr.removeAll();
				var query = new Query({
					returnGeometry: true,
					outFields: ["*"],
					outSpatialReference: SpatialReference(102100)
				});
				query.where = "OBJECTID ='" + tribeName.value + "'";
				tribeLayer.queryFeatures(query).then(function(featureSet){

					tribeLayer.definitionExpression = query.where;
					var geometry = featureSet.features[0].geometry;
					var zoomGraphic = featureSet.features;
					
					if(buffer.value == 1){
						var bufferGeo = geometryEngine.buffer(geometry, 5, "miles");
						var bufferGraphic = new Graphic({
							geometry: bufferGeo,
							symbol: bufferSymbol
						});
						params.geometry = bufferGeo;
						view.graphics.add(bufferGraphic);
						zoomGraphic = bufferGraphic;
					} else {
						params.geometry = geometry;
					};
					view.goTo(zoomGraphic);
					params.spatialRelationship = "intersects";
					var startDate = dateToYMD(dom.byId("startDate").value);
					var endDate = dateToYMD(dom.byId("endDate").value);
					params.where = "DATE_ >= '" + startDate + "' AND DATE_ <= '" + endDate + "'";
					console.log(params.where);
					qTask.execute(params).then(getResults).otherwise(promiseRejected);

				});
			};

			function getResults(response){
				console.log(response);
				var switrsResults = arrayUtils.map(response.features, function(feature){
					feature.symbol = new SimpleMarkerSymbol({
						color: [255, 100, 0, 0.8],
						size: 8,
						outline: {
							color: [255, 50, 0, 0.6],
							width: 1.5
						}
					});
					return feature;
				});
				
				resultsLyr.addMany(switrsResults);

				//console.log(response.spatialReference.wkid);
				
				//map.add(resultsLyr);
				//view.goTo(switrsResults);
				//view.extent = tribeResults.fullExtent;
				dom.byId("printResults").innerHTML = switrsResults.length + " results found";
			};

			function promiseRejected(err) {
				console.error("Promise rejected: ", err.message);
			}

			function resetView(){
				resultsLyr.removeAll();
				tribeLayer.definitionExpression = "OBJECTID LIKE '%'";
				dom.byId("printResults").innerHTML = "";
			}

			on(dom.byId("tribename"), "change", gotoTribe);

			on(dom.byId("doBtn"), "click", doQuery);
			on(dom.byId("clearBtn"), "click", resetView);

		});