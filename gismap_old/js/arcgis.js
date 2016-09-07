var map;
var censusLayer, institLayer, landmarkLayer, urbanLayer, eleschoolLayer, secschoolLayer, unischoolLayer, tazLayer, zipLayer, schLayer;
var farsLayer;
var countyLayer, cityLayer;
var collFeatureLayer, collLayer;
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
}
function formatTime(value){
	value="000" + value;
	value=value.substr(value.length - 4);
	return value.substr(0, 2) + ":" + value.substr(2);
}
function formatNum(value){
	value="0" + value;
	return value.substr(value.length - 2);
}
function setPopupContents(layer){
	switch (layer){
	case "Coll":
		var content="<table><tr><td style='font-size:13px;font-weight:bold;'>SWITRS</td><th style='font-size:13px;'>CASEID :{CASEID}</a></th></tr>";
		content+= "<tr><td colspan='2'><hr width='100%'></td></tr>";
		content+= "<tr><td style='background-color:#EEEEFF;padding: 2px 5px 2px 5px;'><b>Collision Details</b></td><td style='background-color:#EEEEFF;padding: 2px 5px 2px 5px;'><b>Collision Location</b></td></tr>";
		content+= "<tr valign='top'><td width='120px' style='padding: 2px 5px 2px 5px;'>Date:{DATE_:formatDate}<br>";
		content+= "Time:{TIME_:formatTime}<br>";
		content+= "Killed:{KILLED}<br>";
		content+= "Injured:{INJURED}<br>";
		content+= "Crash severity:{CRASHSEV}<br>";
		content+= "Pedestrian:{PEDCOL}<br>";
		content+= "Bicycle:{BICCOL}<br>";
		content+= "Motorcycle:{MCCOL}<br>";
		content+= "Truck:{TRUCKCOL}<br></td>";
		content+= "<td width='140px' style='padding: 2px 5px 2px 5px;'>Primary: <br>&nbsp;&nbsp;&nbsp;&nbsp;{PRIMARYRD}<br>";
		content+= "Secondary: <br>&nbsp;&nbsp;&nbsp;&nbsp;{SECONDRD}<br>";
		content+= "Intersection:{INTERSECT_}<br>";
		content+= "Offset Distance:{DISTANCE}<br>";
		content+= "Offset Direction:{DIRECT}<br></td></tr></style>";
		content+= "</table>";
		var template = new esri.dijit.PopupTemplate({
			description: content
		});
		break;
	case "Census Tracts":
		var content="<table><tr><th colspan='2' style='font-size:13px;'>"+layer+"</th></tr>";
		content+= "<tr><td colspan='2'><hr width='100%'></td></tr>";
		content+= "<tr><td style='background-color:#EEEEFF;padding: 2px 5px 2px 5px;'><b>Details</b></td>";
		content+= "<td style='background-color:#EEEEFF;padding: 2px 5px 2px 5px;'><b>By Gender</b></td></tr>";
		content+= "<tr valign='top'><td width='160px' style='padding: 2px 5px 2px 5px;'>";
		content+= "Tract No: {TRACT}<br>";
		content+= "Pop (2010): {POP2010}<br>";
		content+= "Households: {HOUSEHOLDS}<br>";
		content+= "Square Mile: {SQMI}";
		content+= "<td width='100px' style='padding: 2px 5px 2px 5px;'>";
		content+= "Males: {MALES}<br>";
		content+= "Females: {FEMALES}";
		content+= "</td></tr>";
		content+= "<tr><td colspan='2'></td></tr>";
		content+= "<tr><td colspan='2' style='background-color:#EEEEFF;padding: 2px 5px 2px 5px;'><b>By Age</b></td></tr>";
		content+= "</table>"

		var template = new esri.dijit.PopupTemplate({
			description: content,
			mediaInfos: [{
				type: "piechart",
				value: {
					fields: ["AGE_UNDER5","AGE_5_9","AGE_10_14","AGE_15_19","AGE_20_24","AGE_25_34","AGE_35_44","AGE_45_54","AGE_55_64","AGE_65_74","AGE_75_84","AGE_85_UP"]
				}
			}]
		});
		break;
	/*
	case "Institutions":
		var content="<table><tr><th width='269px' style='font-size:13px;'>"+layer+"</th></tr>";
		content+= "<tr><td><hr width='100%'></td></tr>";
		content+= "<tr><td style='background-color:#EEEEFF;padding: 2px 5px 2px 5px;'><b>Details</b></td></tr>";
		content+= "<tr valign='top'><td style='padding: 2px 5px 2px 5px;'>";
		content+= "Name: {NAME}<br>";
		content+= "Type: {FEATTYPE}<br>";
		content+= "County: {COUNTY}";
		content+= "</td></tr></style>";
		content+= "</table>"

		var template = new esri.dijit.PopupTemplate({
			description: content
		});
		break;
	*/
	case "Landmarks":
		var content="<table><tr><th width='269px' style='font-size:13px;'>"+layer+"</th></tr>";
		content+= "<tr><td><hr width='100%'></td></tr>";
		content+= "<tr><td style='background-color:#EEEEFF;padding: 2px 5px 2px 5px;'><b>Details</b></td></tr>";
		content+= "<tr valign='top'><td style='padding: 2px 5px 2px 5px;'>";
		content+= "Name: {NAME}<br>";
		content+= "County: {COUNTY}";
		content+= "</td></tr></style>";
		content+= "</table>"

		var template = new esri.dijit.PopupTemplate({
			description: content
		});
		break;
	case "Urban Areas":
		var content="<table><tr><th width='269px' style='font-size:13px;'>"+layer+"</th></tr>";
		content+= "<tr><td><hr width='100%'></td></tr>";
		content+= "<tr><td style='background-color:#EEEEFF;padding: 2px 5px 2px 5px;'><b>Details</b></td></tr>";
		content+= "<tr valign='top'><td style='padding: 2px 5px 2px 5px;'>";
		content+= "Name: {NAME}<br>";
		content+= "County: {COUNTY}<br>";
		content+= "Square Mile: {SQMI}";
		content+= "</td></tr></style>";
		content+= "</table>"

		var template = new esri.dijit.PopupTemplate({
			description: content
		});
		break;
	case "Secondary School Districts":
	case "Elementary School Districts":
	case "Unified School Districts":
		var content="<table><tr><th width='269px' style='font-size:13px;'>"+layer+"</th></tr>";
		content+= "<tr><td><hr width='100%'></td></tr>";
		content+= "<tr><td style='background-color:#EEEEFF;padding: 2px 5px 2px 5px;'><b>Details</b></td></tr>";
		content+= "<tr valign='top'><td style='padding: 2px 5px 2px 5px;'>";
		content+= "Name: {NAME10}<br>";
		content+= "County: {COUNTY}";
		content+= "</td></tr></style>";
		content+= "</table>"

		var template = new esri.dijit.PopupTemplate({
			description: content
		});
		break;
	case "TAZ":
		layer="Traffic Analysis Zones";
		var content="<table><tr><th width='269px' style='font-size:13px;'>"+layer+"</th></tr>";
		content+= "<tr><td><hr width='100%'></td></tr>";
		content+= "<tr><td style='background-color:#EEEEFF;padding: 2px 5px 2px 5px;'><b>Details</b></td></tr>";
		content+= "<tr valign='top'><td style='padding: 2px 5px 2px 5px;'>";
		content+= "ID: {TAZ}<br>";
		content+= "County: {COUNTY}";
		content+= "</td></tr></style>";
		content+= "</table>"

		var template = new esri.dijit.PopupTemplate({
			description: content
		});

		break;
	case "Zip Codes":
		var content="<table><tr><th width='269px' style='font-size:13px;'>"+layer+"</th></tr>";
		content+= "<tr><td><hr width='100%'></td></tr>";
		content+= "<tr><td style='background-color:#EEEEFF;padding: 2px 5px 2px 5px;'><b>Details</b></td></tr>";
		content+= "<tr valign='top'><td style='padding: 2px 5px 2px 5px;'>";
		content+= "POSTAL: {POSTAL}<br>";
		content+= "County: {COUNTY}";
		content+= "</td></tr></style>";
		content+= "</table>"

		var template = new esri.dijit.PopupTemplate({
			description: content
		});
		break;
	case "Schools":
		var content="<table><tr><th width='269px' style='font-size:13px;'>"+layer+"</th></tr>";
		content+= "<tr><td><hr width='100%'></td></tr>";
		content+= "<tr><td style='background-color:#EEEEFF;padding: 2px 5px 2px 5px;'><b>Details</b></td></tr>";
		content+= "<tr valign='top'><td style='padding: 2px 5px 2px 5px;'>";
		content+= "School: {School}<br>";
		content+= "Address: {Address}<br>";
		content+= "City: {City}<br>";
		content+= "County: {County}<br>";
		content+= "District: {District}<br>";
		content+= "CDS Code: {cds_code_1}";
		content+= "</td></tr></style>";
		content+= "</table>"
		var template = new esri.dijit.PopupTemplate({
			description: content
		});
	case "FARS":
		layer="FARS Collisions";
		var content="<table><tr><td style='font-size:13px;font-weight:bold;'>FARS</td><th style='font-size:13px;'>State Case:{ST_CASE}</a></th></tr>";
		content+= "<tr><td colspan='2'><hr width='100%'></td></tr>";
		content+= "<tr><td style='background-color:#EEEEFF;padding: 2px 5px 2px 5px;'><b>Collision Details</b></td><td style='background-color:#EEEEFF;padding: 2px 5px 2px 5px;'><b>Collision Location</b></td></tr>";
		content+= "<tr valign='top'><td width='120px' style='padding: 2px 5px 2px 5px;'>Date:{MONTH:formatNum}/{DAY:formatNum}/{YEAR}<br>";
		content+= "Time:{HOUR:formatNum}:{MINUTE:formatNum}<br>";
		content+= "Killed:{FATALS}<br>";
		content+= "<td width='140px' style='padding: 2px 5px 2px 5px;'>Primary: <br>&nbsp;&nbsp;&nbsp;&nbsp;{TWAY_ID}<br>";
		content+= "Secondary: <br>&nbsp;&nbsp;&nbsp;&nbsp;{TWAY_ID2}<br>";
		content+= "</td></tr>";
		content+= "</table>"

		var template = new esri.dijit.PopupTemplate({
			description: content
		});
		break;
	}
	return template;
}
//var server="http://arcgis-ags101-1190701823.us-west-1.elb.amazonaws.com/ArcGIS/rest/services/CaliforniaC4/MapServer/";
//var server="http://services2.arcgis.com/Sc1y6FClT0CxoM9q/ArcGIS/rest/services/California/FeatureServer/";
function addMapContents(){
	var county=dijit.byId('county').attr('value');
	if(county=="") county="ALAMEDA";

	var cp = new dijit.layout.ContentPane({
		id: 'mapcontents',
		style:"width:200px;",
		//postCreate: function(){	dragAndDrop();},
		content: dojo.byId('mapcontent')
	});

	var maxOffset = function maxOffset(map, pixelTolerance) {
		return Math.floor(map.extent.getWidth() / map.width) * pixelTolerance;
	};

	cityLayer=new esri.layers.FeatureLayer(server+"2",{
		mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
		//maxAllowableOffset: maxOffset(map,1),
		opacity: 0.5
	});
	cityLayer.setDefinitionExpression("NAME is null");
	map.addLayer(cityLayer);

	countyLayer=new esri.layers.FeatureLayer(server+"3",{
		mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
		//maxAllowableOffset: maxOffset(map,1),
		opacity: 0.5
	});
	//countyLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	countyLayer.setDefinitionExpression("COUNTY is null");
	map.addLayer(countyLayer);

	censusLayer=new esri.layers.FeatureLayer(server+"4",{
		mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields: ["TRACT","POP2010","MALES","FEMALES","AGE_UNDER5","AGE_5_9","AGE_10_14","AGE_15_19","AGE_20_24","AGE_25_34","AGE_35_44","AGE_45_54","AGE_55_64","AGE_65_74","AGE_75_84","AGE_85_UP","HOUSEHOLDS","SQMI"],
		//opacity: 0.5,
		visible: false
	});
	censusLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	map.addLayer(censusLayer);
	/*
	institLayer=new esri.layers.FeatureLayer(server+"4",{
		mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields: ["NAME","FEATTYPE","COUNTY"],
		//opacity: 0.5,
		visible: false
	});
	institLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	map.addLayer(institLayer);
	*/
	landmarkLayer=new esri.layers.FeatureLayer(server+"6",{
		mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields: ["NAME","COUNTY"],
		//opacity: 0.5,
		visible: false
	});
	landmarkLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	map.addLayer(landmarkLayer);

	urbanLayer=new esri.layers.FeatureLayer(server+"7",{
		mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields: ["NAME","SQMI","COUNTY"],
		//opacity: 0.5,
		visible: false
	});
	urbanLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	map.addLayer(urbanLayer);

	secschoolLayer=new esri.layers.FeatureLayer(server+"8",{
		mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields: ["NAME10","COUNTY"],
		//opacity: 0.5,
		visible: false
	});
	secschoolLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	map.addLayer(secschoolLayer);

	eleschoolLayer=new esri.layers.FeatureLayer(server+"9",{
		mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields: ["NAME10","COUNTY"],
		//opacity: 0.5,
		visible: false
	});
	eleschoolLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	map.addLayer(eleschoolLayer);

	unischoolLayer=new esri.layers.FeatureLayer(server+"10",{
		mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields: ["NAME10","COUNTY"],
		//opacity: 0.5,
		visible: false
	});
	unischoolLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	map.addLayer(unischoolLayer);

	tazLayer=new esri.layers.FeatureLayer(server+"11",{
		mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields: ["TAZ","COUNTY"],
		//opacity: 0.5,
		visible: false
	});
	tazLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	map.addLayer(tazLayer);

	zipLayer=new esri.layers.FeatureLayer(server+"12",{
		mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields: ["POSTAL","COUNTY"],
		//opacity: 0.5,
		visible: false
	});
	zipLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	map.addLayer(zipLayer);

	schLayer=new esri.layers.FeatureLayer(server+"13",{
		mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
		outFields: ["School","Address","City","County","District","cds_code_1"],
		//opacity: 0.5,
		visible: false
	});
	schLayer.setDefinitionExpression("County = '"+county+"'");
	map.addLayer(schLayer);

	farsLayer=new esri.layers.FeatureLayer(server+"15",{
		mode: esri.layers.FeatureLayer.MODE_SELECTION,
		outFields: ["ST_CASE","YEAR","MONTH","DAY","HOUR","MINUTE","TWAY_ID","TWAY_ID2","FATALS"],
		//opacity: 0.5,
		visible: false
	});
	//farsLayer.setDefinitionExpression("COUNTY_C = '"+county+"'");
	farsLayer.setInfoTemplate(setPopupContents("FARS"));
	map.addLayer(farsLayer);

	var button = new dijit.form.DropDownButton({
		label: 'Map Contents',
		iconClass: "mapcontentsIcon",
		title: 'Map Contents',
		dropDown: cp
	});
	button.startup();
	dojo.byId('toolbar-center').appendChild(button.domNode);
	//if(checkbrowser()==false) button.set('disabled',true);

	dojo.connect(countyLayer, "onLoad", function() {
		/*
        dojo.connect(map, "onZoomEnd", function() {
			countyLayer.setMaxAllowableOffset(maxOffset(map,1));
        });
		*/
		dojo.connect(countyLayer,"onUpdateEnd",function(){
			var city=dijit.byId('city').attr('displayedValue');
			if(city=="ALL")	{
				countyLayer.show();
				if(countyLayer.graphics.length==1) map.setExtent(countyLayer.graphics[0].geometry.getExtent().expand(1.3));
			}
			else countyLayer.hide();
		});
	});

	dojo.connect(cityLayer, "onLoad", function() {
		/*
        dojo.connect(map, "onZoomEnd", function() {
			cityLayer.setMaxAllowableOffset(maxOffset(map,1));
        });
		*/
		dojo.connect(cityLayer,"onUpdateEnd",function(){
			if(cityLayer.graphics.length==1) {
				countyLayer.hide();
				map.setExtent(cityLayer.graphics[0].geometry.getExtent().expand(1.3));
			}
			else focusCounty();
		});
	});

	// Identify map contents
	var idbutton = new dijit.form.Button({
		iconClass:'identifyIcon',
		id:'identify',
		title:'Identify Map Contents',
		showLabel:false ,
		onClick:function(){activateNavtool(this.id);}
	});
	dojo.byId('toolbar-center').appendChild(idbutton.domNode);

	identifyTask = new esri.tasks.IdentifyTask(server);
    identifyParams = new esri.tasks.IdentifyParameters();

	initCollLayer();
}
var layerids=[];
function initCollLayer(){
	collLayer=initGraphicsLayer();
	collLayer.setInfoTemplate(setPopupContents("Coll"));
	collRendering("sNone");
	activateClick=true;
	enableClick();

	dojo.connect(collLayer, "onUpdateEnd", function() {
		if(selectionLayer){
			if(selectionLayer.graphics.length>0) selectCollsions(selectionLayer.graphics);
		}
	});
	dragAndDrop();

	collFeatureLayer=new esri.layers.FeatureLayer(server+"1", {
		mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        outFields: ["CASEID","POINT_X","POINT_Y","YEAR_","DATE_","TIME_","LOCATION","CRASHTYP","VIOLCAT", "KILLED", "INJURED", "CRASHSEV", "PEDCOL","BICCOL","MCCOL","TRUCKCOL","PRIMARYRD","SECONDRD","INTERSECT_","DISTANCE","DIRECT","INVOLVE"],
		//infoTemplate: setPopupContents("Coll"),
		opacity: 0.9,
		visible: false
	});
	//collLayer.setDefinitionExpression("COUNTY = '"+"'");
	//collRendering("sNone");
	//map.addLayer(collLayer);

	// Add a link into the InfoWindow Actions panel
	var streetviewLink = dojo.create("a", {
		"class": "action",
		"innerHTML": "Street Preview",
		"href": "javascript:void(0);"
	}, dojo.query(".actionList", map.infoWindow.domNode)[0] );
	dojo.connect(streetviewLink, "onclick",streetView);
	var detailLink = dojo.create("a", {
		"id": "detailLink",
		"class": "action",
		"innerHTML": "Collision Details",
		"href": "javascript:void(0);"
	}, dojo.query(".actionList", map.infoWindow.domNode)[0] );
	dojo.connect(detailLink, "onclick",detailView);

	dojo.connect(collLayer, "onLoad", function() {
		activateClick=true;
		enableClick();
		dojo.connect(collLayer, "onUpdateEnd", function() {
			if(selectionLayer){
				if(selectionLayer.graphics.length>0) selectCollsions(selectionLayer.graphics);
			}
		});
		dragAndDrop();
		//identifyHandler=dojo.connect(map,"onClick",doIdentify);
	});
}
var collCursorOver, collCursorDown, collCursorOut, collClickHandler;
var farsCursorOver, farsCursorDown, farsCursorOut, farsClickHandler;
var activateClick;
function enableClick(){
	// for collision click
	collCursorOver=dojo.connect(collLayer,"onMouseOver",function(){
		if(activateClick) {
			map.setMapCursor("pointer");
		}
	});
	collCursorDown=dojo.connect(collLayer,"onMouseDown",function(){
		if(activateClick) {
			map.setMapCursor("pointer");
		}
	});
	collCursorOut=dojo.connect(collLayer,"onMouseOut",function(){
		if(activateClick) {
			map.setMapCursor("default");
		}
	});

	collClickHandler=dojo.connect(collLayer,"onClick",function(event){
		if(activateClick) {
			collClick(event, this);
		}
	});
	farsCursorOver=dojo.connect(farsLayer,"onMouseOver",function(){
		if(activateClick) {
			map.setMapCursor("pointer");
		}
	});
	farsCursorDown=dojo.connect(farsLayer,"onMouseDown",function(){
		if(activateClick) {
			map.setMapCursor("pointer");
		}
	});
	farsCursorOut=dojo.connect(farsLayer,"onMouseOut",function(){
		if(activateClick) {
			map.setMapCursor("default");
		}
	});
	farsClickHandler=dojo.connect(farsLayer,"onClick",function(event){
		if(activateClick) {
			collClick(event, this);
		}
	});
}
function collClick(evt, layer){
	var extentGeom=pointToExtent(map, evt.mapPoint, 10);
	var filteredGraphics=[];
	dojo.forEach(layer.graphics, function(graphic){
		if(extentGeom.contains(graphic.geometry)){
			filteredGraphics.push(graphic);
		}
	});
	dojo.query(".actionList", map.infoWindow.domNode)[0].style.display="block";
	if(layer.name=="FARS"){
		dojo.byId("detailLink").style.display="none";
	}
	else{
		dojo.byId("detailLink").style.display="inline";
	}
	map.infoWindow.setFeatures(filteredGraphics);
	var graphic=map.infoWindow.getSelectedFeature();
	map.infoWindow.show(graphic.geometry);
	dojo.query("#map_root .esriPopup .titleButton").on(".prev:click, .next:click", function(){
		var graphic=map.infoWindow.getSelectedFeature();
		map.infoWindow.show(graphic.geometry);
	});
}
function streetView(){
	var feature = map.infoWindow.getSelectedFeature();

	var lat=feature.attributes.POINT_X;
	var lon=feature.attributes.POINT_Y;
	dojo.byId("streetViewImage").innerHTML="<img src='http://maps.googleapis.com/maps/api/streetview?size=400x400&location="+lon+",%20"+lat+"&sensor=false'>";
	dijit.byId("streetViewDialog").show();
}
function detailView(){
	var feature = map.infoWindow.getSelectedFeature();
	if(feature){
		var newWin=window.open("../query/collision_details.php?no="+feature.attributes.CASEID,'_blank','height=840,width=1080');
		newWin.focus();
	}
}
function doIdentify(evt){
	map.infoWindow.clearFeatures();
	map.infoWindow.hide();

	var layerids=checkMapContents();
	if(layerids.length>0){
		identifyParams.tolerance = 5;
		identifyParams.returnGeometry = true;
		identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_ALL;
		identifyParams.width  = map.width;
		identifyParams.height = map.height;
		identifyParams.layerIds = layerids;
		identifyParams.geometry = evt.mapPoint;
		identifyParams.mapExtent = map.extent;
		var deferred=identifyTask.execute(identifyParams)

		deferred.addCallback(function(response) {
			return dojo.map(response, function(result) {
				var feature = result.feature;
				feature.attributes.layerName = result.layerName;
				var contents=setPopupContents(result.layerName);
				feature.setInfoTemplate(contents);
				return feature;
			});
		});
		dojo.query(".actionList", map.infoWindow.domNode)[0].style.display="none";
		map.infoWindow.setFeatures([deferred]);
		map.infoWindow.show(evt.mapPoint);
	}
	/*
	else{
	    identifyParams.layerIds = [3,5,6,12,8,8,7,9,10,11];
	}
	*/
}
function checkMapContents(){
	var layerids=[];
	if(censusLayer.visible) layerids.push("4");
	//if(institLayer.visible) layerids.push("4");
	if(landmarkLayer.visible) layerids.push("6");
	if(urbanLayer.visible) layerids.push("7");
	if(secschoolLayer.visible) layerids.push("8");
	if(eleschoolLayer.visible) layerids.push("9");
	if(unischoolLayer.visible) layerids.push("10");
	if(tazLayer.visible) layerids.push("11");
	if(zipLayer.visible) layerids.push("12");
	if(schLayer.visible) layerids.push("13");
	//if(farsLayer.visible) layerids.push("14");
	return layerids;
}
function pointToExtent(map, point, toleranceInPixel) {
	var pixelWidth = map.extent.getWidth() / map.width;
	var toleraceInMapCoords = toleranceInPixel * pixelWidth;
	return new esri.geometry.Extent(point.x - toleraceInMapCoords, point.y - toleraceInMapCoords, point.x + toleraceInMapCoords, point.y + toleraceInMapCoords, map.spatialReference);
}
function toggleIcon(id){
	var icon = document.getElementById(id+'Icon');
	var submenu = document.getElementById(id+'Sub');

	if(submenu.style.display=='none'){
		icon.src = "images/collapse.png";
		submenu.style.display='block';
	}
	else {
		icon.src = "images/expand.png";
		submenu.style.display='none';
	}
}
function showLoading() {
    esri.show(loading);
    //map.disableMapNavigation();
    map.hideZoomSlider();
}
function hideLoading(error) {
    esri.hide(loading);
    //map.enableMapNavigation();
    map.showZoomSlider();
}
function focusCounty(){
	var county=dijit.byId('county').attr('value');
	if(county=="") county="ALAMEDA";

	censusLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	//institLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	landmarkLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	urbanLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	eleschoolLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	secschoolLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	unischoolLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	tazLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	zipLayer.setDefinitionExpression("COUNTY = '"+county+"'");
	schLayer.setDefinitionExpression("County = '"+county+"'");
	//farsLayer.setDefinitionExpression("COUNTY_C = '"+county+"'");
	//schLayer.setDefinitionExpression("COUNTY = 'ALAMEDA' AND DATE = '2010-07-01'");

	countyLayer.setDefinitionExpression("COUNTY = '"+county+"'");

	//if(start) queryCollisions();// update collisions after changing county
	/*
	var queryTask = new esri.tasks.QueryTask("http://arcgis-ags101-1190701823.us-west-1.elb.amazonaws.com/ArcGIS/rest/services/CaliforniaC3/MapServer/2");
	var query = new esri.tasks.Query();
	query.returnGeometry = true;
	query.where = "COUNTY = '"+county+"'";
	queryTask.execute(query, function(features){
		map.setExtent(features.features[0].geometry.getExtent().expand(1.3));
	});
	*/
}
function focusCity(){
	var city=dijit.byId('city').attr('displayedValue');
	var county = dijit.byId('county').attr('value');

	if(county=="") county="ALAMEDA";
	//if(city=="ALL") focusCounty();
	cityLayer.setDefinitionExpression("COUNTY = '"+county+"' AND NAME = '"+city+"'");

	//if(start && city!="ALL") queryCollisions();// update collisions after changing city
	if(start) queryCollisions();// update collisions after changing city
}
function toggleLayer(layer){
	(layer.visible) ? layer.hide() : layer.show();
}
function extentHistoryChangeHandler() {
	dijit.byId("zoomprev").disabled = navToolbar.isFirstExtent();
	dijit.byId("zoomnext").disabled = navToolbar.isLastExtent();
}
function checkSubLayers(menuId,num){
	if(dijit.byId(menuId).checked==true){
		for(var i=1; i<=num; i++) dijit.byId(menuId+'_'+i).set("checked",true);
	}
	else{
		for(var i=1; i<=num; i++) dijit.byId(menuId+'_'+i).set("checked",false);
	}
}
var severitySymbol=new Array();
var involvSymbol=new Array();
function collRendering(type,layer){
	if(layer === undefined) layer = collLayer;
	//create symbol for collisions
	if(type!="severity") for(var i=1; i<=4; i++) dijit.byId('severity_'+i).set("checked",false);
	if(type!="involv") for(var i=1; i<=11; i++) dijit.byId('involv_'+i).set("checked",false);
	dijit.byId(type).set("checked",true);

	severitySymbol[1]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([255,0,0,0.8]));
	severitySymbol[2]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([255,0,255,0.8]));
	severitySymbol[3]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([244,154,193,0.8]));
	severitySymbol[4]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([255,255,255,0.8]));

	involvSymbol[1]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([255,255,0,0.8]));
	involvSymbol[2]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([255,0,0,0.8]));
	involvSymbol[3]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([0,255,0,0.8]));
	involvSymbol[4]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([0,255,255,0.8]));
	involvSymbol[5]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([0,0,255,0.8]));
	involvSymbol[6]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([70,70,70,0.8]));
	involvSymbol[7]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([255,0,255,0.8]));
	involvSymbol[8]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([0,166,81,0.8]));
	involvSymbol[9]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([0,174,239,0.8]));
	involvSymbol[10]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([244,154,193,0.8]));
	involvSymbol[11]=new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1),new dojo.Color([255,255,255,0.8]));


	switch(type){
		case "sNone":
			var renderer = new esri.renderer.SimpleRenderer(defaultSymbol);
			break;
		/*
		case "sPed":
			//create renderer
			var renderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, "PEDCOL");
			renderer.addValue("Y", newSymbol);
			break;
		*/
		case "severity":
			//create renderer
			var renderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, "CRASHSEV");
			for(var i=1;i<=4;i++) if(dijit.byId('severity_'+i).checked==true) renderer.addValue(i, severitySymbol[i]);
			break;
		case "involv":
			//create renderer
			var renderer = new esri.renderer.UniqueValueRenderer(defaultSymbol, "INVOLVE");
			if(dijit.byId('involv_1').checked==true) renderer.addValue("A", involvSymbol[1]);
			if(dijit.byId('involv_2').checked==true) renderer.addValue("B", involvSymbol[2]);
			if(dijit.byId('involv_3').checked==true) renderer.addValue("C", involvSymbol[3]);
			if(dijit.byId('involv_4').checked==true) renderer.addValue("D", involvSymbol[4]);
			if(dijit.byId('involv_5').checked==true) renderer.addValue("E", involvSymbol[5]);
			if(dijit.byId('involv_6').checked==true) renderer.addValue("F", involvSymbol[6]);
			if(dijit.byId('involv_7').checked==true) renderer.addValue("G", involvSymbol[7]);
			if(dijit.byId('involv_8').checked==true) renderer.addValue("H", involvSymbol[8]);
			if(dijit.byId('involv_9').checked==true) renderer.addValue("I", involvSymbol[9]);
			if(dijit.byId('involv_10').checked==true) renderer.addValue("J", involvSymbol[10]);
			if(dijit.byId('involv_11').checked==true) renderer.addValue("-", involvSymbol[11]);
			break;
	}
	layer.setRenderer(renderer);
	if(start) layer.refresh();
}

function checkbrowser(){
	var Browser = {
		Version: function() {
			var version = 999; // we assume a sane browser
			if (navigator.appVersion.indexOf("MSIE") != -1)
				// bah, IE again, lets downgrade version number
				version = parseFloat(navigator.appVersion.split("MSIE")[1]);
			return version;
		}
	}
	if (navigator.appName=="Microsoft Internet Explorer" && Browser.Version() < 9) return false;
	else return true;
}
function contains(arr, item){
   return dojo.indexOf(arr, item) >= 0;
}