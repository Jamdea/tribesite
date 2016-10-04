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
  		// "esri/widgets/BasemapToggle",
  		"esri/geometry/geometryEngine",
  		"dojo/mouse",
  		"esri/PopupTemplate",
  		"dojo/_base/fx",
  		"dojo/dom-style",
  		"dijit/registry",
  		"dijit/form/CheckBox",
  		"dojo/dom-style",
  		"esri/geometry/Extent",
  		"esri/tasks/PrintTask",
  		"esri/tasks/support/PrintTemplate",
  		"esri/tasks/support/PrintParameters",
  		"dijit/Dialog",
  		"esri/widgets/Legend",
  		"esri/widgets/Search",
  		"esri/renderers/UniqueValueRenderer",
		"dojo/domReady!"	
		],
		function(Map, MapView, FeatureLayer, QueryTask, Query, arrayUtils, 
			dom, on, GraphicsLayer, SimpleMarkerSymbol, Graphic, Point, Geometry,
			SpatialReference, SimpleRenderer, SimpleFillSymbol, watchUtils, dquery, 
			Home, geometryEngine, mouse, PopupTemplate, fx, style, registry, CheckBox, 
			domStyle, Extent, PrintTask, PrintTemplate, PrintParameters, Dialog, Legend, Search, UniqueValueRenderer
			){
			var tribeName = dom.byId("tribename");
			var buffer = dom.byId("buffer");
			var injury = dom.byId("injury");
			var highlGraphic = new Graphic();
			// var startDate = dateToYMD(dom.byId("startDate").value);
			// var endDate = dateToYMD(dom.byId("endDate").value);
			//var lastSelect = "";
			var tribeSelected = false;
			var showinfo = false;
			var showinfoTribe = false;
			var showinfoVitm = false;
			var showinfoInjur = false;
			var heightTribe = 0;
			var heightVitm = 0;
			var heightInjur = 0;

			var doquery = false;

			// var resultsLyr = new GraphicsLayer();
			// var resultsLyr = new FeatureLayer();
			var tribeLyr = new GraphicsLayer();
			var buffferLyr = new GraphicsLayer();

			var reportTribe = '';

			var map = new Map({
				basemap: "gray",
				layers: [tribeLyr, buffferLyr]
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
				extent: oriExtent,
				ui: {
        			components: ["zoom"],
        			padding: {top: 60}
        		}
			});

			view.popupManager.enabled = false;
			// view.ui.add(new Search({
			// 	view: view
			// }), "top-right");
		    function createSearchWidget(parentId) {
		      	var search = new Search({
		        	viewModel: {
		          		view: view,
		          		highlightEnabled: true,
		          		popupEnabled: true,
		          		showPopupOnSelect: true
		        	}
		      	}, parentId);
		      	search.startup();
		      	return search;
		    }		

		    searchWidgetNav = createSearchWidget("searchDiv");
		    // if (searchWidgetNav.selectedResult) {
		    // 	searchWidgetNav.search(searchWidgetNav.selectedResult.name);
		    // }

			var box1 = new CheckBox({
				id: "tribeBond",
				checked: true
			});

			var box2 = new CheckBox({
				id: "bufferBond",
				checked: true
			});

			var box3 = new CheckBox({
				id: "tribe",
				checked: true
			});

			box1.placeAt("boundryBox", "first");
			box2.placeAt("bufferBox", "first");
			box3.placeAt("tribeLayer", "first");

			// var toggle = new BasemapToggle({
			// 	view: view,
			// 	nextBasemap: "osm"
			// });
			// toggle.startup();
			view.watch("updating", function(response){
				if(response){
			    	dquery(".loader").style("display", "flex");
			  	}
			  	else{
			  		dquery(".loader").style("display", "none");
			  }
			});

			var homeBtn = new Home({
				view: view
			});

			homeBtn.startup();
			view.ui.add(homeBtn, "top-left");
			// view.ui.add(toggle, "top-right");

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

			var polygonSymbol = new SimpleFillSymbol({
				color: [255, 255, 255, 0.1],
				outline: {
					width: 2,
					color: [51, 173, 255, 0.6]
				}
			});


			var polygonRenderer = new SimpleRenderer({
				symbol: polygonSymbol
  			});

  			function generateRenderer(){

	  			var colSize = dom.byId("symbolsize").value;
	  			var colType = dom.byId("symbol").value;
	  			var renderer;

				var	pointsymbol = new SimpleMarkerSymbol({
					color: [255, 100, 0, 0.3],
					size: colSize,
					outline: {
						color: [255, 50, 0, 0.6],
						width: 1.5
					}
				});

				var pointRender = new SimpleRenderer({
					symbol: pointsymbol
				});

				var	fatalSymbol = new SimpleMarkerSymbol({
					color: [255, 173, 153, 0.3],
					size: colSize,
					outline: {
						color: [255, 0, 0, 0.8],
						width: 1.5
					}
				}); 
				var	sevSymbol = new SimpleMarkerSymbol({
					color: [255, 255, 100, 0.3],
					size: colSize,
					outline: {
						color: [255, 153, 0, 0.8],
						width: 1.5
					}
				});
				var	otrSymbol = new SimpleMarkerSymbol({
					color: [214, 245, 214, 0.3],
					size: colSize,
					outline: {
						color: [51, 204, 51, 0.8],
						width: 1.5
					}
				});
				var	painSymbol = new SimpleMarkerSymbol({
					color: [204, 238, 255, 0.3],
					size: colSize,
					outline: {
						color: [102, 204, 255, 0.8],
						width: 1.5
					}
				});
				var injuryRenderer = new UniqueValueRenderer({
					defaultSymbol: painSymbol,
					defaultLabel: "4 - Injury (Complaint of Pain)",
					field: "CRASHSEV",
					uniqueValueInfos: [
					{
						value: "1",
						symbol: fatalSymbol,
						label: "1 - Fatal"
					}, {
						value: "2",
						symbol: sevSymbol,
						label: "2 - Injury (Severe)"

					}, {
						value: "3",
						symbol: otrSymbol,
						label: "3 - Injury (Other Visible)"
					}, {
						value: "4",
						symbol: painSymbol,
						label: "4 - Injury (Complaint of Pain)"
					}]			
				});

				if(colType == 0) {
					renderer = pointRender;
				} else if (colType == 1) {
					renderer = injuryRenderer;
				}

				return renderer;
			}

  			var polygonDeselect = new SimpleRenderer({
				symbol: new SimpleFillSymbol({
					color: [51, 173, 255, 0.2],
					outline: {
  						width: 0,
  						color: [0, 0, 0, 0.2]
  					}
  				})
  			});

  			var bufferSymbol = new SimpleFillSymbol({
  				color: [255, 255, 255, 0.1],
  				outline: {
  					width: 2,
  					color: [51, 173, 255, 0.2]
  				}
  			});

  			var highlSymbol = new SimpleFillSymbol({
  				color: [255, 255, 255, 0.2],
  				outline: {
  					width: 3,
  					color: [255, 255, 0, 0.8]
  				}
  			});

  			var detailsAction = {
  				// title: '<a href = "http://tims.berkeley.edu/tools/query/collision_details.php?no=6326200">view details</a>',
  				title: "View details",
  				id: "view-details"
  			};

  			var openTribeInfo = {
  				title: "View tribe details",
  				id: "view-tribe"
  			}

			var popContent="<table id = 'popupTable'>";
			// popContent+= "<tr><td colspan='2'><hr width='100%'></td></tr>";
			popContent+= "<tr><td style='background-color: white; padding: 2px 5px 2px 5px;'><b>Collision Details</b></td><td style='background-color:white;padding: 2px 5px 2px 5px;'><b>Collision Location</b></td></tr>";
			popContent+= "<tr valign='top'><td width='120px' style='padding: 2px 5px 2px 5px;'>Date: {DATE_}<br>";
			popContent+= "Time: {TIME_: formatTime}<br>";
			popContent+= "Killed: {KILLED}<br>";
			popContent+= "Injured: {INJURED}<br>";
			popContent+= "Crash severity: {CRASHSEV}<br>";
			popContent+= "Alcohol Involved: {ETOH}<br>"
			popContent+= "Pedestrian: {PEDCOL}<br>";
			popContent+= "Bicycle: {BICCOL}<br>";
			popContent+= "Motorcycle: {MCCOL}<br>";
			popContent+= "Truck: {TRUCKCOL}<br></td>";
			popContent+= "<td width='140px' style='padding: 2px 5px 2px 5px;'>Primary: <br>&nbsp;&nbsp;&nbsp;&nbsp;{PRIMARYRD}<br>";
			popContent+= "Secondary: <br>&nbsp;&nbsp;&nbsp;&nbsp;{SECONDRD}<br>";
			popContent+= "Intersection: {INTERSECT_}<br>";
			popContent+= "Offset Distance: {DISTANCE}<br>";
			popContent+= "Offset Direction: {DIRECT}<br></td></tr></style>";
			popContent+= "</table>";

			// var popContent = "<td style='font-size:13px;font-weight:bold;'>SWITRS</td>";

  			var poptemplate = {
  				title: "CASEID: {CASEID}",
				content: popContent,
				actions: [detailsAction],
				fieldInfos: [{
					fieldName: "DATE_",
					format: {
						dateFormat: "short-date"
					}
				}
				]
			};

			var tribePopupTem = {
				title: "{TRIBE}",
				// title: "<a href = '{website}' target = '_blank'>{TRIBE}</a>",
				content: "<div id='popup'>" +
					"<p><b>County: </b>{COUNTY}</p>" + 
					"<p><b>Population: </b>{Population}</p>" +
					"<p><b>Area (in sq. miles): </b>{Area_sq_mi}</p>" +  
					"<p><b>Road Miles: </b>{Road_mileage_total}</p>" + 
					"<p><b>Tribal Police: </b>{Tribal_Police}</p>" + 
					"<p><b>Tribal Court: </b>{Tribal_Court}</p>" +
					"<p><b>Tribal Fire Department: </b>{Tribal_Fire_Department}</p>" +
					"<p><b>Tribal Emergency Medical Services: </b>{Tribal_EMS}</p>" +
					"<p><b>Casino: </b>{Casino}</p>" +
					"<p><b>Has Transportation Agency: </b>{Trans_Agency}</p>" +
					"<p><b>Roadway Infrastructure Collection:: </b>{Roadway_Data}</p></div>",
				// actions: [openTribeInfo],
				fieldInfos: [{
					fieldName: "Area_sq_mi",
					format: {
						digitSeparator: true,
						places: 2
					}
				}]
			};

			view.popup.on("trigger-action", function(evt) {
				var feature = view.popup.selectedFeature;
				if (evt.action.id === "view-details") {
          			//go to details page    			
          			var newWin=window.open("http://tims.berkeley.edu/tools/query/collision_details.php?no="+feature.attributes.CASEID,'_blank','height=840,width=1080');
          			newWin.focus();
        		}
        		if (evt.action.id === "view-tribe") {
        			// dquery("#tribename")[0].value = feature.attributes.OBJECTID
        			// gotoTribe();

        			tribeSelected = true;
        			doquery = false;
        			displayInfo();
        			showInfoText(feature);
        		}
      		});

			var switrsLayer = new FeatureLayer({
				url: "http://services2.arcgis.com/Sc1y6FClT0CxoM9q/ArcGIS/rest/services/California_AGOL_20160901/FeatureServer/0"
			});

			var tribeLayer = new FeatureLayer({
				url: "http://services2.arcgis.com/iq8zYa0SRsvIFFKz/arcgis/rest/services/Tribal_upload/FeatureServer/0",
				renderer: polygonRenderer,
				outFields: ["*"],
				popupTemplate: tribePopupTem
			});

			map.add(tribeLayer);
			// map.add(resultsLyr);
			//map.add(switrsLayer);
			// var legend = new Legend({
			//   	view: view,
			//   	layerInfos: [
			//   	{
			//     	layer: tribeLayer,
			//     	title: "Tribe Area"
			//   	}]
			// });

			// view.ui.add(legend, "bottom-right");

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

			var reportingInjury = new Dialog({
				title: "Injury Trend Report",
				content: "<p id='injuryTitle' class = 'chartTitle'>Please apply query first!</p> <hr> <div id='yearChart' class = 'chart'></div> <div id = 'monthChart' class = 'chart'>",
				style: "width: 650px"
			});

			var reportingCrash = new Dialog({
				title: "Crash Variable Report",
				content: "<p id='crashTitle' class = 'chartTitle'>Please apply query first!</p> <hr>" + 
				"<div id = 'crashVari'><label for = 'variable'>Select Variable Type</label><br><select id = 'variable'>" + 
				"<option value = 0>Collision Variable</option><option value = 1>PCF Variable</option>" + 
				"<option value = 2>Party Variable</option><option value = 3>Victim Variable</option>" + 
				"<option value = 4>CA Variable</option>" +
				"</select></div><div id = 'crashChart'></div>",
				style: "width: 650px"
			});
			// read all tribe names and parse to html
			tribeLayer.then(function(result){
				return view.map.layers.getItemAt(0).load();
			}).then(function(){
				var tribequery = new Query();
				tribequery.outFields = ["NAME", "OBJECTID_12"];
				tribequery.where = "NAME LIKE '%'";
				tribeLayer.queryFeatures(tribequery).then(function(featureSet){
					var features = featureSet.features;
					var text = "";
					arrayUtils.forEach(features, function(feature){
						var name = feature.attributes.NAME;
						if(name.length > 30){
							name = name.split("Tribe")[0];
						}
						text += "<option value='" + feature.attributes.OBJECTID_12 + "'>" + name + "</option>";
						
					});
					//console.log(text);
					dquery("#tribename")[0].innerHTML = text;
				});
			});

			function dateToYMD(date){
				var dateParts = date.split(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
			    return dateParts[3] + "-" + dateParts[1] + "-" + dateParts[2];				
			}

			function gotoTribe(){
				// view.graphics.remove(highlGraphic);
				var resultsLyr = map.findLayerById("resultsLyr");
				if(resultsLyr) {
					map.remove(resultsLyr);
				}
				dom.byId("printResults").innerHTML = "";
				dom.byId("fatalities").innerHTML = "";
				dom.byId("severe").innerHTML = "";
				dom.byId("totalVictim").innerHTML = "";
				view.graphics.removeAll();
				var query = new Query({
					returnGeometry: true,
					outFields: ["*"],
					outSpatialReference: SpatialReference(102100)
				});
				query.where = "OBJECTID_12 ='" + tribeName.value + "'";
				tribeLayer.queryFeatures(query).then(function(featureSet){
					var zoomGeo = featureSet.features[0].geometry;
					highlGraphic.geometry = zoomGeo;
					highlGraphic.symbol = highlSymbol;
					// highlGraphic.symbol = highlSymbol;
					view.graphics.add(highlGraphic);
					view.goTo(highlGraphic.geometry.extent.expand(1.5));

					showInfoText(featureSet.features[0]);
					// var area = featureSet.features[0].attributes.Area_sq_mi;
					// var road = featureSet.features[0].attributes.Road_mileage_total;
					// // dom.byId("printResults").innerHTML = featureSet.features[0].attributes.NAME;
					// // dom.byId("tribeCounty").innerHTML = featureSet.features[0].attributes.COUNTY;
					// // dom.byId("tribeArea").innerHTML = area.toFixed(2);
					// // dom.byId("tribeTrans").innerHTML = featureSet.features[0].attributes.AGENCY;
					// dom.byId("printResults").innerHTML = featureSet.features[0].attributes.NAME;
					// dom.byId("tribePop").innerHTML = featureSet.features[0].attributes.Population;
					// dom.byId("tribeCounty").innerHTML = featureSet.features[0].attributes.COUNTY;
					// dom.byId("tribeArea").innerHTML = area.toFixed(2);
					// dom.byId("tribeTrans").innerHTML = featureSet.features[0].attributes.Trans_Agency;
					// dom.byId("tribeRoad").innerHTML = parseFloat(road).toFixed(2);
					// dom.byId("tribePolice").innerHTML = featureSet.features[0].attributes.Tribal_Police;
					// dom.byId("tribeCourt").innerHTML = featureSet.features[0].attributes.Tribal_Court;
					// dom.byId("tribeFire").innerHTML = featureSet.features[0].attributes.Tribal_Fire_Department;
					// dom.byId("tribeEms").innerHTML = featureSet.features[0].attributes.Tribal_EMS;
					// dom.byId("tribeCasino").innerHTML = featureSet.features[0].attributes.Casino;
					// dom.byId("tribeInfra").innerHTML = featureSet.features[0].attributes.Roadway_Data;
				});
				//lastSelect = tribeName;
				tribeSelected = true;
				doquery = false;
				heightTribe = 0;
				heightVitm = 0;
				displayInfo();
			};

			function doQuery(){
				// view.graphics.remove(highlGraphic);

				view.graphics.removeAll();
				// resultsLyr.removeAll();
				var resultsLyr = map.findLayerById("resultsLyr");
				if(resultsLyr) {
					map.remove(resultsLyr);
				}
				tribeLyr.removeAll();
				buffferLyr.removeAll();
				var query = new Query({
					returnGeometry: true,
					outFields: ["*"],
					outSpatialReference: SpatialReference(102100)
				});
				query.where = "OBJECTID_12 ='" + tribeName.value + "'";
				tribeLayer.queryFeatures(query).then(function(featureSet){
					// tribeLayer.definitionExpression = query.where;
					// highlight selected freature
					tribeLayer.renderer = polygonDeselect;
					// featureSet.features[0].popupTemplate = null;
					var geometry = featureSet.features[0].geometry;
					var zoomGraphic = featureSet.features;
					var tribeGraphic = new Graphic({
						attributes: featureSet.features[0].attributes,
						geometry: geometry,
						symbol: polygonSymbol,
						popupTemplate: tribePopupTem
					});

					tribeGraphic.symbol.color = [0, 0, 0, 0];
					
					if(buffer.value != 0){
						var bufferGeo = geometryEngine.buffer(geometry, buffer.value, "miles");
						var bufferGraphic = new Graphic({
							geometry: bufferGeo,
							symbol: bufferSymbol,
							popupTemplate: {
								title: buffer.value + "-Mile Buffer"
							}
						});
						params.geometry = bufferGeo;
						// view.graphics.add(bufferGraphic);
						buffferLyr.add(bufferGraphic);
						if(!registry.byId("bufferBond").get("checked")){
							// bufferGraphic.symbol.outline.width = 0;
							buffferLyr.visible = false;
						};
						// resultsLyr.add(bufferGraphic);
						
						zoomGraphic = bufferGraphic;
					} else {
						params.geometry = geometry;
					};
					// resultsLyr.add(tribeGraphic);
					tribeLyr.add(tribeGraphic);
					if(!registry.byId("tribeBond").get("checked")){
						// tribeGraphic.symbol.outline.width = 0;
						tribeLyr.visible = false;
					};
					// view.goTo(zoomGraphic);
					view.goTo(params.geometry.extent.expand(1.5));
					// view.extent = geometry.extent.expand(2.5);
					params.spatialRelationship = "intersects";
					var startDate = dateToYMD(dom.byId("startDate").value);
					var endDate = dateToYMD(dom.byId("endDate").value);
					params.where = "DATE_ >= '" + startDate + "' AND DATE_ <= '" + endDate + "'";

					if(injury.value == 1){
						params.where += "AND CRASHSEV = 1";
					} else if(injury.value == 2) {
						params.where += "AND (CRASHSEV = 1 OR CRASHSEV = 2)";
					};

					showInfoText(featureSet.features[0]);
					reportTribe = featureSet.features[0].attributes.NAME;
					tribeSelected = true;
					qTask.execute(params).then(getResults).otherwise(promiseRejected);

				});
			};

			var datePoints = [];
			var crashType = [];
			var pcfType = [];
			var partyType = [];
			function getResults(response){
				datePoints = [];
				crashType = [];
				pcfType = [];
				partyType = [];
				var fatalVitm = 0;
				var severeVitm = 0;
				var injurVitm = 0;
				// var x = dom.byId("symbolsize").value;
				// pointRender.symbol.size = x;
				var renderer = generateRenderer();
				var option = {
					id: "resultsLyr",
					fields: response.fields,
					source: response.features,
					objectIdField: "CASEID",
					geometryType: "point",
					spatialReference: response.spatialReference,
					renderer: renderer,
					// renderer: injuryRenderer,
					popupTemplate: poptemplate
				};
				// gloabl variable
				resultsLyr = new FeatureLayer(option);
				map.add(resultsLyr);
				// resultsLyr = FeatureLayer(option);

				arrayUtils.map(response.features, function(feature){
					// feature.symbol = new SimpleMarkerSymbol({
					// 	color: [255, 100, 0, 0.3],
					// 	size: 8,
					// 	outline: {
					// 		color: [255, 50, 0, 0.6],
					// 		width: 1.5
					// 	}
					// });
					// feature.popupTemplate = poptemplate;
					fatalVitm += feature.attributes.KILLED;
					injurVitm += feature.attributes.INJURED;
					severeVitm += feature.attributes.SEVINJ;

					datePoints.push(feature.attributes.DATE_);
					crashType.push(feature.attributes.CRASHTYP);
					pcfType.push(feature.attributes.VIOLCAT);
					partyType.push(feature.attributes.INVOLVE);
				});

				// console.log(datePoints);
				dom.byId("fatalities").innerHTML = fatalVitm;
				dom.byId("severe").innerHTML = severeVitm;
				dom.byId("totalVictim").innerHTML = injurVitm + fatalVitm;
				// view.graphics.add(switrsResults);

				// resultsLyr.addMany(switrsResults);

				// console.log(response.spatialReference.wkid);
				
				//map.add(resultsLyr);
				//view.goTo(switrsResults);
				//view.extent = tribeResults.fullExtent;
				dom.byId("printResults").innerHTML += ": " + response.features.length + " collisions found";
				// dquery("#info").style("display", "block");
				// dquery("#victimTable").style("display", "table");
				// heightVitm = 1;
				// showinfoVitm = true;
				// console.log();
				doquery = true;
				heightVitm = 0;
				displayInfo();

				// showVitmInfo();		
				// dquery(".loader").style("display", "none");
			};

			function promiseRejected(err) {
				console.error("Promise rejected: ", err.message);
			};

			function resetView(){
				view.graphics.removeAll();
				// resultsLyr.removeAll();
				var resultsLyr = map.findLayerById("resultsLyr");
				if(resultsLyr) {
					map.remove(resultsLyr);
				}
				buffferLyr.removeAll();
				tribeLyr.removeAll();
				tribeLayer.definitionExpression = "OBJECTID_12 LIKE '%'";
				tribeLayer.renderer = polygonRenderer;
				dom.byId("printResults").innerHTML = "Please select tribe!";
				// dquery("#info").style("display", "none");
				tribeSelected = false;
				doquery = false;
				//clear chart
				yearChart.series[0].update({data: []});
				yearChart.series[1].update({data: []});
				monthChart.series[0].update({data: []});
				monthChart.series[1].update({data: []});
				crashChart.series[0].update({data: []});
				crashChart.setTitle({text: 'Type of Collision'});
				dom.byId("crashTitle").innerHTML = "Please apply query first!";
				dom.byId("injuryTitle").innerHTML = "Please apply query first!";

				if(showinfo){
					hideInfo();
					showinfo = false;
				};

			};

			function changeBasemap(basemapid){
				map.basemap = basemapid;
				console.log(basemapid);
			};



			function displayInfo(){
				// dquery("#infoPanel").style("display", "block");
				// console.log("display info");
				style.set("infoPanel", "opacity", "0");
				var fadeArgs = {
					node: "infoPanel"
				};
				fx.fadeIn(fadeArgs).play();
				dquery("#infoPanel").style("width", "300px");
				dquery("#infoPanel").style("background-color", "white");
				dquery("#infoPanel").style("box-shadow", "0px 2px 4px 0px rgba(0,0,0,0.2)");
				dquery("#info").style("display", "inline");
				dquery("#infoIcon")[0].title = "Hide tribe info window";
				dquery("#infoIcon").style("width", "320px");
				// dquery("#infoIcon").style("border-radius", "0px");
				if(tribeSelected) {
					showTribeInfo();
				} else {
					hideTribeInfo();
				}
				// console.log(doquery);
				if(doquery) {
					showVitmInfo();
					showInjurInfo();
				} else {
					hideVitmInfo();
					hideInjurInfo();
				}
				showinfo = true;
			};

			function hideInfo(){
				// dquery("#info").style("display", "none");
				style.set("infoPanel", "opacity", "1");
				var fadeArgs = {
					node: "infoPanel",
					duration: 200
				};
				fx.fadeOut(fadeArgs).play();
				// dquery("#infoIcon").style("title", "Display tribe info window");
				dquery("#infoPanel").style("width", "");
				// dquery("#infoPanel").style("background-color", "");
				dquery("#infoPanel").style("box-shadow", "none");
				dquery("#infoIcon")[0].title = "Display tribe info window";
				dquery("#infoIcon").style("width", "auto");
				// dquery("#infoIcon").style("border-radius", "5px");
				showinfo = false;
			}

			function showTribeInfo(){
				if(tribeSelected & heightTribe != 0){
					// dquery("#tribeTable").style("display", "block");
					// dquery("#tribeTable").style("height", "auto");
					// style.set("tribeTable", "opacity", "0");
					// var fadeArgs = {
					// 	node: "tribeTable"
					// };
					// fx.fadeIn(fadeArgs).play();

					// dquery("#tribeTable").style("display", "block");
					// style.set("tribeTable", "display", "none");
					// coreFx.wipeIn({
					// 	node: "tribeTable"
					// }).play();
					// style.set("tribeTable", "display", "none");
					// dquery("#tribeTable").style("display", "block");
					// dquery("#tribeTable").style("height", "auto");
					// height = style.get(dom.byId("tribeTable"), 'height');
					// console.log(height);
					fx.animateProperty({
						node: dom.byId("tribeTable"), duration: 200,
						properties: {
							opacity: 1,
							height: heightTribe
						}, onBegin: function(){
							dquery("#tribeTable").style("display", "table");
						}
					}).play();

					dom.byId("noTribeText").innerHTML = "";						
				} else if (tribeSelected & heightTribe == 0) {
					// if query the tribe the first time
					dquery("#tribeTable").style("display", "table");
					dquery("#tribeTable").style("opacity", "1");
					heightTribe = style.get(dom.byId("tribeTable"), "height");
					dom.byId("noTribeText").innerHTML = "";
						
				} else {
					dom.byId("noTribeText").innerHTML = "&nbsp&nbspNo tribe selected!";
				}
				showinfoTribe = true;
				dquery("#tribeToggle")[0].title = "Hide tribe summary info";	
			}

			function hideTribeInfo(){
				// style.set("tribeTable", "display", "none");
				// var fadeArgs = {
				// 	node: "tribeTable"
				// };
				// fx.fadeOut(fadeArgs).play();
				heightTribe = style.get(dom.byId("tribeTable"), "height");
				if(heightTribe != 0) { 
					fx.animateProperty({
						node: dom.byId("tribeTable"), duration: 200,
						properties: {
							opacity: 0,
							// height: 1<1 ? height : 0
							height: 0
						}, onEnd: function(){
							dquery("#tribeTable").style("display", "none");
						}
					}).play();
				}
				// style.set("tribeTable", "height", "0");
				// coreFx.wipeOut({
				// 	node: "tribeTable"
				// }).play();
				// dquery("#tribeTable").style("display", "none");
				dom.byId("noTribeText").innerHTML = "";
				dquery("#tribeToggle")[0].title = "Display tribe summary info";
				showinfoTribe = false;
			}

			function showVitmInfo(){
				if(doquery & heightVitm != 0){
					fx.animateProperty({
						node: dom.byId("victimTable"), duration: 200,
						properties: {
							opacity: 1,
							height: heightVitm
						}, onBegin: function(){
							dquery("#victimTable").style("display", "table")
						}
					}).play();
					// console.log("table already shown");
					dom.byId("noVictimText").innerHTML = "";					
				} else if (doquery & heightVitm == 0){
					dquery("#victimTable").style("display", "table");
					dquery("#victimTable").style("opacity", "1");
					heightVitm = style.get(dom.byId("victimTable"), "height");
					// console.log("first time show: " + heightVitm);
					dom.byId("noVictimText").innerHTML = "";
				} else {
					dom.byId("noVictimText").innerHTML = "&nbsp&nbspPlease apply query!";
				}
				showinfoVitm = true;		
				dquery("#victimToggle")[0].title = "Hide victim info";	
			}

			function hideVitmInfo(){
				heightVitm = style.get(dom.byId("victimTable"), "height");
				fx.animateProperty({
					node: dom.byId("victimTable"), duration: 200,
					properties: {
						opacity: 0,
						height: 0
					}, onEnd: function(){
						dquery("#victimTable").style("display", "none")
					}
				}).play();
				dom.byId("noVictimText").innerHTML = "";
				dquery("#victimToggle")[0].title = "Display victim info";
				showinfoVitm = false;
			}

			function showInjurInfo(){
				if(doquery & heightInjur != 0){
					fx.animateProperty({
						node: dom.byId("injurTable"), duration: 200,
						properties: {
							opacity: 1,
							height: heightInjur
						}, onBegin: function(){
							dquery("#injurTable").style("display", "table")
						}
					}).play();
					// console.log("table already shown");
					dom.byId("noInjurText").innerHTML = "";					
				} else if (doquery & heightInjur == 0){
					dquery("#injurTable").style("display", "table");
					dquery("#injurTable").style("opacity", "1");
					heightVitm = style.get(dom.byId("injurTable"), "height");
					// console.log("first time show: " + heightVitm);
					dom.byId("noInjurText").innerHTML = "";
				} else {
					dom.byId("noInjurText").innerHTML = "&nbsp&nbspPlease apply query!";
				}
				showinfoInjur = true;		
				dquery("#injurToggle")[0].title = "Hide severe injury info";	
			}

			function hideInjurInfo(){
				heightInjur = style.get(dom.byId("injurTable"), "height");
				fx.animateProperty({
					node: dom.byId("injurTable"), duration: 200,
					properties: {
						opacity: 0,
						height: 0
					}, onEnd: function(){
						dquery("#injurTable").style("display", "none")
					}
				}).play();
				dom.byId("noInjurText").innerHTML = "";
				dquery("#injurToggle")[0].title = "Display victim info";
				showinfoInjur = false;
			}

			function formatDate(value){
				if (isNaN(value)) {
					var temp = value.split(" ");
					var r = temp[0].match(/^\s*([0-9]+)\s*-\s*([0-9]+)\s*-\s*([0-9]+)(.*)$/);
					return r[2]+"/"+r[3]+"/"+r[1]+r[4];
				}
				else {
					var a = new Date(value);
					return (a.getUTCMonth() + 1) + "/" + a.getUTCDate() + "/" + a.getUTCFullYear();
				}
			};

			function formatTime(value, key, data){
				var time = data.TIME_;
				time = "000" + time;
				time = time.substr(time.length - 4);
				// return time.substr(0, 2) + ":" + time.substr(2);
				return "time";
			};

			// tribeLayer.on("mouse-over", function(evt){
			// 	//go to selection
			// 	console.log(evt.mapPoint);
			// });

			view.on("click", function(e){
				this.whenLayerView(tribeLayer).then(function(lyrView){
					var point = e.mapPoint;
					var query = new Query();
					var searchPixel = 10;
					var pixelWidth = view.extent.width / view.width;
					var distance = searchPixel * pixelWidth;
					query.geometry = new Extent({
						xmin: point.x - distance,
						ymin: point.y - distance,
						xmax: point.x + distance,
						ymax: point.y + distance,
						spatialReference: view.spatialReference
					});
					query.spatialRelationship = "intersects";
					query.spatialReference = view.spatialReference;
					lyrView.queryFeatures(query).then(function(results){
						if(results.length) {
							view.popup.open({
								features: results,
								updateLocationEnabled: true
							});
						};
					});
				});

				var resultsLyr = map.findLayerById("resultsLyr");
				if(resultsLyr) {
					this.whenLayerView(resultsLyr).then(function(lyrView){
						var point = e.mapPoint;
						var query = new Query();
						var searchPixel = 10;
						var pixelWidth = view.extent.width / view.width;
						var distance = searchPixel * pixelWidth;
						query.geometry = new Extent({
							xmin: point.x - distance,
							ymin: point.y - distance,
							xmax: point.x + distance,
							ymax: point.y + distance,
							spatialReference: view.spatialReference
						});
						query.spatialRelationship = "intersects";
						query.spatialReference = view.spatialReference;
						lyrView.queryFeatures(query).then(function(results){
							if(results.length) {
								view.popup.open({
									features: results,
									updateLocationEnabled: true
								});
							};
						});
					});
				}

			});

			function showInfoText(feature){
				var area = feature.attributes.Area_sq_mi;
				var road = feature.attributes.Road_mileage_total;
				var website = feature.attributes.website; 
				var police = feature.attributes.Tribal_Police_Website;
				var court = feature.attributes.Tribal_Court_Website;
				var fire = feature.attributes.Fire_Department_Website;
				var ems = feature.attributes.EMS_Website;
				if(website) {
					dom.byId("printResults").innerHTML = "<a href = '" + website + "' target='_blank'>" 
					+ feature.attributes.NAME + "</a>";
				} else {
					dom.byId("printResults").innerHTML = feature.attributes.NAME;
				};
				dom.byId("tribePop").innerHTML = feature.attributes.Population;
				dom.byId("tribeCounty").innerHTML = feature.attributes.COUNTY;
				dom.byId("tribeArea").innerHTML = area.toFixed(2);
				dom.byId("tribeTrans").innerHTML = formatInfo(feature.attributes.Trans_Agency);
				dom.byId("tribeRoad").innerHTML = parseFloat(road).toFixed(2);
				if(police) {
					dom.byId("tribePolice").innerHTML = formatInfo(feature.attributes.Tribal_Police) + 
					" (<a href = '" + police + "' target='_blank'>Website</a>)";
				} else {
					dom.byId("tribePolice").innerHTML = formatInfo(feature.attributes.Tribal_Police);
				};
				if(court) {
					dom.byId("tribeCourt").innerHTML = formatInfo(feature.attributes.Tribal_Court) + 
					" (<a href = '" + court + "' target='_blank'>Website</a>)";						
				} else {
					dom.byId("tribeCourt").innerHTML = formatInfo(feature.attributes.Tribal_Court);
				};
				if(fire) {
					dom.byId("tribeFire").innerHTML = formatInfo(feature.attributes.Tribal_Fire_Department) + 
					" (<a href = '" + fire + "' target='_blank'>Website</a>)";								
				} else {
					dom.byId("tribeFire").innerHTML = formatInfo(feature.attributes.Tribal_Fire_Department);
				};
				if(ems) {
					dom.byId("tribeEms").innerHTML = formatInfo(feature.attributes.Tribal_EMS) + 
					" (<a href = '" + ems + "' target='_blank'>Website</a>)";						
				} else {
					dom.byId("tribeEms").innerHTML = formatInfo(feature.attributes.Tribal_EMS);
				};
				dom.byId("tribeCasino").innerHTML = formatInfo(feature.attributes.Casino);
				dom.byId("tribeInfra").innerHTML = formatInfo(feature.attributes.Roadway_Data);
			};

			function formatInfo(text) {
				var newText;
				if(text == "Y") {
					newText = "Yes";
				} else if (text == "N") {
					newText = "No";
				} else {
					newText = "No Data"
				};
				return newText;

			}

			function groupDate(array){
				var yearGroup = {2004: 0, 2005: 0, 2006: 0, 2007: 0, 2008: 0, 2009: 0, 
					2010: 0, 2011: 0, 2012: 0, 2013: 0, 2014: 0, 2015: 0};
				var monthGroup = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 
					8: 0, 9: 0, 10: 0, 11: 0};
				var yearArray = [];
				var monthArray = [];
				for (i=0; i<array.length; i++) {
					var d = new Date(array[i]);
					var year = d.getFullYear();
					var month = d.getMonth();
					yearGroup[year] += 1;
					monthGroup[month] += 1;
				};			
				for(key in yearGroup) {
					if (key != 2004){
						yearArray.push(yearGroup[key]);
					}
				};
				for(key in monthGroup) {
					monthArray.push(monthGroup[key]);
				};
				var index = yearArray.findIndex(function (val) {
  					return val>0;
				});
				return [yearArray.slice(index), monthArray];
			};

			function groupCrash(array, type){
				var crashGroup = {};
				var crashArray = [];
				var typeDict = {};
				var catCrash = [];
				var sumCrash = [];

				if (type == 0){
					//crash type
					typeDict = {'A':'Head-On', 'B':'Sideswipe', 'C':'Rear End', 'D':'Broadside',
					'E':'Hit Object', 'F':'Overturned', 'G':'Vehicle/Pedestrian', 'H':'Other', '-': 'Not Stated'};
				} else if (type == 1) {
					//PCF type
					typeDict = {
						'01': 'Driving or Bicycling Under the Influence of Alcohol or Drug',
						'02': 'Impeding Traffic',
						'03': 'Unsafe Speed',
						'04': 'Following Too Closely',
						'05': 'Wrong Side of Road',
						'06': 'Improper Passing',
						'07': 'Unsafe Lane Change',
						'08': 'Improper Turning',
						'09': 'Automobile Right of Way',
						'10': 'Pedestrian Right of Way',
						'11': 'Pedestrian Violation',
						'12': 'Traffic Signals and Signs',
						'13': 'Hazardous Parking',
						'14': 'Lights',
						'15': 'Brakes',
						'16': 'Other Equipment',
						'17': 'Other Hazardous Violation',
						'18': 'Other Than Driver (or Pedestrian)',
						'19': '',
						'20': '',
						'21': 'Unsafe Starting or Backing',
						'22': 'Other Improper Driving',
						'23': 'Pedestrian or "Other" Under the Influence of Alcohol or Drug',
						'24': 'Fell Asleep',
						'00': 'Unknown',
						'-': 'Not Stated'
					};
				} else if (type == 2) {
					typeDict = {
						'A': 'Non-Collision',
						'B': 'Pedestrian',
						'C': 'Other Motor Vehicle',
						'D': 'Motor Vehicle on Other Roadway',
						'E': 'Parked Motor Vehicle',
						'F': 'Train',
						'G': 'Bicycle',
						'H': 'Animal',
						'I': 'Fixed Object',
						'J': 'Other Object',
						'-': 'Not Stated'
					};
				};

				for(i=0; i<array.length; i++) {
					type = array[i];
					if (crashGroup[type]) {
						crashGroup[type] += 1;
					} else {
						crashGroup[type] = 1;
					};
				};
				for(var key in crashGroup) {
					crashArray.push([key, crashGroup[key]]);
				};
				crashArray.sort(function(a, b){
					return b[1] - a[1];
				});
				// console.log(crashArray);
				for(var i=0; i<crashArray.length; i++) {
					catCrash.push(typeDict[crashArray[i][0]]);
					sumCrash.push(crashArray[i][1]);
				};
				return [catCrash, sumCrash];

			};

			function calMovingAvg(series, period){
				var sumAvg = 0;
				var data = []
				for(var i=0; i<series.data.length; i++) {
					sumAvg += series.data[i].y;
					if(i<period-1) {
						data.push(null);
					} else if (i == period - 1) {
						data.push(parseFloat((sumAvg/period).toFixed(2)));
					} else {
						sumAvg -= series.data[i-period].y;
						// data.push([series.data[i].category, parseFloat((sumAvg/period).toFixed(2))]);
						data.push(parseFloat((sumAvg/period).toFixed(2)));
					}
 				}
 				return data.slice(1);	
			};

			on(dom.byId("tribename"), "change", function(){
				gotoTribe();
			});

			on(dom.byId("doBtn"), "click", function(){
				// dquery(".loader").style("display", "flex");
				doQuery();
				// dquery(".loader").style("display", "none");
			});

			on(dom.byId("clearBtn"), "click", resetView);

			// var basemapArray = ["streets", "satellite", "hybrid", "topo"];
			// on(dom.byId("streets"), "click", changeBasemap(dom.byId("streets").id));
			on(dom.byId("streets"), "click", function(){
				map.basemap = dom.byId("streets").id
    		});

			dquery("#dropdnBasemap > div").on("click", function(e) {
				var id = e.target.id;
				map.basemap = id;
			});

    		on(dom.byId("infoIcon"), "click", function(){
    			if(showinfo) {
    				hideInfo();
    			} else {
    				// var tribetext = dom.byId("printResults").innerHTML;
    				// if(tribetext.length == 0) 
    				displayInfo();
    			};
    		});

    		on(dom.byId("tribeToggle"), "click", function(){
    			if(showinfoTribe){
    				hideTribeInfo();
    			} else {
    				showTribeInfo();
    			}
    		});

    		on(dom.byId("victimToggle"), "click", function(){
    			if(showinfoVitm){
    				hideVitmInfo();
    			} else {
    				showVitmInfo();
    			}
    		});

    		on(dom.byId("injurToggle"), "click", function(){
    			if(showinfoInjur){
    				hideInjurInfo();
    			} else {
    				showInjurInfo();
    			}
    		});

    		on(dom.byId("mapSwitrs"), "click", function(){
    			if(domStyle.get("optionsDiv", "display") == "block"){
    				dquery("#optionsDiv").style("display", "none");
    			} else {
    				dquery("#optionsDiv").style("display", "block");
    			}
    			// 
    		});

    		on(dom.byId("printMap"), "click", function(){
    			var printTask = new PrintTask({
    				url: "http://services2.arcgis.com/Sc1y6FClT0CxoM9q/ArcGIS/rest/services/California_AGOL_20160901/FeatureServer/0"
				});
				var template = new PrintTemplate({
						format: "pdf",
					 	exportOptions: { 
					   		dpi: 300 
					 	},
					 	layout: "a4-portrait",
					 	layoutOptions: {
					   		titleText: "Warren Wilson College Trees", 
					   	authorText: "Sam"
					 	}
					});
					  
				var params = new PrintParameters({
					view: view,
					template: template
					});
					    
					printTask.execute(params);
    		});

    		on(dom.byId("injuryReport"), "click", function(){
    			if (doquery){
	    			var d = groupDate(datePoints);
	    			var start = dom.byId("startDate").value;
	    			var end = dom.byId("endDate").value;
	    			var buffer = dom.byId('buffer').value;
	    			var injurLevel = dom.byId('injury').value;
	    			var average = [];
	    			var cat = ['2005', '2006', '2007', '2008', '2009', '2010', 
			            '2011', '2012', '2013', '2014', '2015'];
			        var index = cat.length - d[0].length;
	    			// for(i=0; i<d.length; i++) {
	    			// 	average.push(d[i]/2);
	    			// }
	    			
	    			yearChart.series[0].update({
	    				data: d[0]
	    			});
	    			yearChart.xAxis[0].setCategories(cat.slice(index));
	    			var yearAvg = calMovingAvg(yearChart.series[0], 3);
	    			yearChart.series[1].update({
	    				data: yearAvg
	    			});
	    			
	    			monthChart.series[0].update({
	    				data: d[1]
	    			});
	    			var monAvg = calMovingAvg(monthChart.series[0], 3);
	    			monthChart.series[1].update({
	    				data: monAvg
	    			});


	    			dom.byId('injuryTitle').innerHTML = reportTribe;

	    			if (injurLevel == 1) {
	    				yearChart.setTitle({text: "Yearly Injury Trend - Fatality Only"});
	    				monthChart.setTitle({text: "Monthly Injury Trend - Fatality Only"});
	    			} else if (injurLevel == 2) {
	    				yearChart.setTitle({text: "Yearly Injury Trend - Fatality and Severe Injury"});
	    				monthChart.setTitle({text: "Monthly Injury Trend - Fatality and Severe Injury"});
	    			};

	    			if (buffer != 0) {
	    				dom.byId('injuryTitle').innerHTML += " (" + buffer + "-Mile Buffer): " + start + " - " + end;
	    			} else {
	    				dom.byId('injuryTitle').innerHTML += ": " + start + " - " + end;
	    			};
	    		};
    			reportingInjury.show();
    		});

    		on(dom.byId("crashReport"), "click", function(){
    			dquery("#variable")[0].value = 0;
    			crashChart.setTitle({text: 'Type of Collision'});
    			if(doquery) {
	    			var start = dom.byId("startDate").value;
	    			var end = dom.byId("endDate").value;
	    			var buffer = dom.byId('buffer').value;
	    			var d = groupCrash(crashType, 0);
	    			crashChart.series[0].update({
	    				data: d[1]
	    			});
	    			crashChart.xAxis[0].setCategories(d[0]);
	    			if (buffer != 0) {
	    				dom.byId('crashTitle').innerHTML = reportTribe + " (" + buffer + "-Mile Buffer): " + start + " - " + end;
	    			} else {
	    				dom.byId('crashTitle').innerHTML = reportTribe + ": " + start + " - " + end;
	    			};    				
    			}
    			reportingCrash.show();
    		});

    		on(dom.byId("variable"), "change", function(){
    			var variable = dom.byId("variable").value;
    			var d = [];
    			if (variable == 0) {
    				if(doquery) d = groupCrash(crashType, 0);
    				crashChart.setTitle({text: 'Type of Collision'})
    			} else if (variable == 1) {
    				if(doquery) d = groupCrash(pcfType, 1);
    				crashChart.setTitle({text: "PCF Violation Category"});
    			} else if (variable == 2) {
    				if(doquery) d = groupCrash(partyType, 2);
    				crashChart.setTitle({text: "Motor Vehicle Involved With"});
    			};
	    		crashChart.series[0].update({data: d[1]});
	    		crashChart.xAxis[0].setCategories(d[0]);
    		});

    		on(dom.byId("symbolsize"), "change", function(){
    			var x = dom.byId("symbolsize").value;
				var resultsLyr = map.findLayerById("resultsLyr");
				if (resultsLyr) {
	    			
					// var	pointsymbol = new SimpleMarkerSymbol({
					// 		color: [255, 100, 0, 0.3],
					// 		size: x,
					// 		outline: {
					// 			color: [255, 50, 0, 0.6],
					// 			width: 1.5
					// 		}
					// 	});

					// var renderer = new SimpleRenderer({
					// 	symbol: pointsymbol
					// });

	    			resultsLyr.renderer = generateRenderer(); 			
	    		}
				dom.byId("sizetext").innerHTML = x;
    		})

    		on(dom.byId("symbol"), "change", function(){
    			var resultsLyr = map.findLayerById("resultsLyr");
    			var type = dom.byId("symbol").value;
    			if(resultsLyr) {
    				resultsLyr.renderer = generateRenderer();
    			}
				if(type == 0) {
					dom.byId("setSymbol").innerHTML = 
					"Color:<a href='#' class = 'collisionSymbol'></a><span class = 'symbolText'>Collision</span>";
				} else if (type == 1) {
					dom.byId("setSymbol").innerHTML = 
					"Color:<a href='#' class = 'collisionSymbol' style = 'background-color: #ffad99; border-color: #ff0000'></a>" + 
					"<span class = 'symbolText'>1 - Fatal</span><br>" +
					"<a href='#' class = 'collisionSymbol' style = 'background-color: #ffff64; border-color: #ff9900; left: 42px;'></a>" +
					"<span class = 'symbolText' style = 'left: 42px'>2 - Injury (Severe)</span><br>" + 
					"<a href='#' class = 'collisionSymbol' style = 'background-color: #d6f5d6; border-color: #33cc33; left: 42px;'></a>" +
					"<span class = 'symbolText' style = 'left: 42px'>3 - Injury (Other Visible)</span><br>" +
					"<a href='#' class = 'collisionSymbol' style = 'background-color: #cceeff; border-color: #66ccff; left: 42px;'></a>" +
					"<span class = 'symbolText' style = 'left: 42px'>4 - Injury (Complaint of Pain)</span>";
				}
    		})

    		registry.byId("tribeBond").on("change", function(isChecked){
    			if(doquery){
	    			if(isChecked){	
	    				tribeLyr.visible = true;
	    			} else {
	    				tribeLyr.visible = false;
	    			}
	    		}
    		}, true);

    		registry.byId("bufferBond").on("change", function(isChecked){
    			if(doquery){
	    			if(isChecked){
	    				buffferLyr.visible = true;
	    			} else {
	    				buffferLyr.visible = false;
	    			}
    			}
    		}, true);

    		registry.byId("tribe").on("change", function(isChecked){
    			if(isChecked){
    				tribeLayer.visible = true;
    			} else {
    				tribeLayer.visible = false;
    			}
    		}, true);

    		Highcharts.setOptions({
    			colors: ["#7cb5ec", "#f7a35c", "#90ee7e", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
    			"#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
				title: {
				  	style: {
				     	color: "#666666",
				     	fontSize: '16px',
				     	// fontWeight: 'bold'
				  	}
				},
				plotOptions: {
					series: {
				     	shadow: true
				  	}
				},
				chart: {
					style: {
						fontFamily: "verdana"
					}
				}
			});

			var yearChart = new Highcharts.Chart({
			    chart: {
			        renderTo: "yearChart",
			        // zoomType: 'x'
			        // type: 'column'
			    },
			    title: {
			    	text: "Yearly Injury Trend"
			    },
			    xAxis: {
			        categories: ['2005', '2006', '2007', '2008', '2009', '2010', 
			            '2011', '2012', '2013', '2014', '2015']
			    },
			    yAxis: {
			    	title: {text: "Sum of Collisions"}
			    },
			    legend: {
            		enabled: false
		    		// itemStyle: {width: 120},
		    		// layout: "vertical",
		    		// align: "right",
		    		// verticalAlign: "middle",
		    		// borderWidth: 0
        		},
			    credits:{enabled:false},
			    series: [{
			    	type: "column",
			        name: "Collisions",
			        dataLabels: {
		                enabled: true,
		                color: '#666666',
		                align: 'center',
		                y: 5,
		                style: {
		                    fontSize: '10px',
		                    fontFamily: 'Verdana, sans-serif'
		                }
            		}
			    }, {
			    	type: "spline",
			    	name: 'Moving Average (3 years)',
			    	marker: {
			    		lineColor: Highcharts.getOptions().colors[1],
			    		lineWidth: 2,
			    		fillColor: "white"
			    	}
			    }]
			});
			var monthChart = new Highcharts.Chart({
			    chart: {
			        renderTo: 'monthChart',
			    },
			    title: {
			    	text: 'Monthly Injury Trend'
			    },
			    xAxis: {
		            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
		                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
			        // type: 'datetime'
			    },
			    yAxis: {
		    		title: {text: "Sum of Collisions"}
		    	},
		    	legend: {
		    		// enabled: false
		    		// itemWidth: 80,
		    		// itemStyle: {width: 120},
		    		// layout: "vertical",
		    		// align: "right",
		    		// verticalAlign: "middle",
		    		// borderWidth: 0
		    	},
			    credits:{enabled:false},
			    series: [{
			    	type: 'column',
			        name: "Collisions",
			        dataLabels: {
		                enabled: true,
		                color: '#666666',
		                align: 'center',
		                y: 5,
		                style: {
		                    fontSize: '10px',
		                    fontFamily: 'Verdana, sans-serif'
		                }
            		}
			    }, {
			    	type: "spline",
			    	name: 'Moving Average (3 years)',
			    	marker: {
			    		lineColor: Highcharts.getOptions().colors[1],
			    		lineWidth: 2,
			    		fillColor: "white"
			    	}
			    }]
			});

			var crashChart = new Highcharts.Chart({
			    chart: {
			        renderTo: 'crashChart',
			    },
			    title: {
			    	text: 'Type of Collision'
			    },
			    yAxis: {
		    		title: {text: "Sum of Collisions"}
		    	},
		    	legend: {
		    		// enabled: false
		    	},
		    	credits: {enabled: false},
			    series: [{
			    	type: 'column',
			        name: "Collisions",
			        dataLabels: {
		                enabled: true,
		                color: '#666666',
		                align: 'center',
		                y: 5,
		                style: {
		                    fontSize: '10px',
		                    fontFamily: 'Verdana, sans-serif'
		                }
            		}
			    }]
			});
		});