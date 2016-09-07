var clusterLayer;
var heatLayer;
function clusterOption(type){
	map.infoWindow.hide();
	selectionLayer.clear();
	if(outlineLayer){
		if(outlineLayer.graphics.length==1){
			if(outlineLayer.graphics[0].geometry.type=="polyline") var geometry=outlineLayer.graphics[0].geometry.getExtent();
			else var geometry=outlineLayer.graphics[0].geometry;
		}
	}
	if(start) showCollisions(type, geometry);
}
function addClusters(query) {
	if(clusterLayer){
		clusterLayer.clear();
		map.removeLayer(clusterLayer);
	}
	//var queryTask = new esri.tasks.QueryTask("http://arcgis-ags101-1190701823.us-west-1.elb.amazonaws.com/ArcGIS/rest/services/CaliforniaC3/MapServer/0");
	
	//queryTask.execute(query,function(featureSet){
	collFeatureLayer.queryFeatures(query,function(fset){	
		var inputInfo = {};
		
		inputInfo.data = dojo.map(fset.features, function(feature){
			var pointX = feature.geometry.x;
			var pointY = feature.geometry.y;
			var att = feature.attributes;
			return {
				"x": pointX,
				"y": pointY,
				"attributes": att
			};
		});
		// cluster layer that uses OpenLayers style clustering
		clusterLayer = new extras.ClusterLayer({ 
			"data": inputInfo.data,
			"distance": 50,
			"id": "clusters", 
			"labelColor": "#fff",
			"labelOffset": 10,
			"resolution": map.extent.getWidth() / map.width,
			"singleColor": "#888",
			"singleTemplate": setPopupContents("Coll")
		});
		var defaultSym = new esri.symbol.SimpleMarkerSymbol().setSize(4);
		var renderer = new esri.renderer.ClassBreaksRenderer(
			defaultSym, 
			"clusterCount"
		);
		var blue = new esri.symbol.PictureMarkerSymbol("images/cluster/BluePin1LargeB.png", 28, 28).setOffset(0, 15);
		var green = new esri.symbol.PictureMarkerSymbol("images/cluster/GreenPin1LargeB.png", 42, 42).setOffset(0, 15);
		//var yellow = new esri.symbol.PictureMarkerSymbol("images/cluster/YellowPin1LargeB.png", 52, 52).setOffset(0, 15);
		var orange = new esri.symbol.PictureMarkerSymbol("images/cluster/OrangePin1LargeB.png", 56, 56).setOffset(0, 15);
		var purple = new esri.symbol.PictureMarkerSymbol("images/cluster/PurplePin1LargeB.png", 70, 70).setOffset(0, 15);
		var red = new esri.symbol.PictureMarkerSymbol("images/cluster/RedPin1LargeB.png", 84, 84).setOffset(0, 15);
		
		renderer.addBreak(0, 2, blue);
		renderer.addBreak(2, 10, green);
		renderer.addBreak(10, 100, orange);
		renderer.addBreak(100, 1000, purple);
		renderer.addBreak(1000, 10000, red);

		clusterLayer.setRenderer(renderer);
		map.addLayer(clusterLayer);
		queryResults(fset.features.length);
		hideLoading();

		dojo.connect(clusterLayer,"onMouseOver",function(){map.setMapCursor("pointer");});
		dojo.connect(clusterLayer,"onMouseOut",function(){map.setMapCursor("default");});
		
		// close the info window when the map is clicked
		// dojo.connect(map, "onClick", cleanUp);
		// close the info window when esc is pressed
		dojo.connect(map, "onKeyDown", function(e) {if ( e.keyCode == 27 ) { cleanUp(); }});
	});	
}
function cleanUp() {
	map.infoWindow.hide();
	clusterLayer.clearSingles();
}
function heatMap(query){
	if(heatLayer){
		//heatLayer.clearData();
		map.removeLayer(heatLayer);
	}
	//var queryTask = new esri.tasks.QueryTask("http://arcgis-ags101-1190701823.us-west-1.elb.amazonaws.com/ArcGIS/rest/services/CaliforniaC3/MapServer/0");
	collFeatureLayer.queryFeatures(query,function(fset){	
	//queryTask.execute(query,function(featureSet){
		heatLayer = new HeatmapLayer({
            config: {
                "useLocalMaximum": true,
                "radius": 30,
                "gradient": {
                    0.45: "rgb(000,000,255)",
                    0.55: "rgb(000,255,255)",
                    0.65: "rgb(000,255,000)",
                    0.95: "rgb(255,255,000)",
                    1.00: "rgb(255,000,000)"
                }
            },
            "map": map,
            "domNodeId": "heatLayer",
            "opacity": 0.85
        });
		heatLayer.setData(fset.features);
		map.addLayer(heatLayer);		
		map.reorderLayer(heatLayer, 101); 
		queryResults(fset.features.length);
		
		hideLoading();
	});
}


