function createTools(){
	var menu = new dijit.Menu({
		style: "display: none;"
	});
	menu.addChild(new dijit.MenuItem({
		label:"Select Collisions",
		iconClass: "selectingIcon",
		onClick: function(){
			toggleSelecting();
		}
	}));
	menu.addChild(new dijit.MenuItem({
		label:"Rank by Intersection",
		iconClass:"intersectionIcon",
		onClick: function(){
			showIntersection();
		}
	}));
	/*
	menu.addChild(new dijit.MenuItem({
		label:"Printing",
		iconClass:"esriPrintIcon",
		onClick: function(){togglePrinting();}
	}));
	*/
	var button = new dijit.form.DropDownButton({
		label: 'Tools',
		iconClass: "toolsIcon",
		title: 'Tools',
		dropDown: menu
	});
	document.getElementById('toolbar-center').appendChild(button.domNode);
	menu.startup();

	addSelectingTool();
}
/*
Measurement Tool
*/
//create a floating pane to hold the measure widget and add a button to the toolbar
//that allows users to hide/show the measurement widget.
var measure;
function addMeasurementWidget() {
	var fp = new dojox.layout.FloatingPane({
		title:"Measurement Tool",
		resizable: false,
		dockable: false,
		closable: false,
		style: "position:absolute;left:350px;top:-60px;width:250px;height:175px;z-index:350;visibility:hidden;",
		id: 'floater'
	}, dojo.byId('floater'));
	fp.startup();

	var titlePane = dojo.query('#floater .dojoxFloatingPaneTitle')[0];
	//add close button to title pane
	var closeDiv = dojo.create('div', {
		id: "closeBtn",
		innerHTML:  esri.substitute({close_title:'Close Panel',close_alt:'Close'},'<a alt=${close_alt} title=${close_title} href="#" onclick="toggleMeasure();"><img src="images/Close-icon.png"/></a>')
	}, titlePane);

	var measurebutton = new dijit.form.Button({
		title: 'Measurement',
		id: "measurebutton",
		iconClass: "esriMeasureIcon",
		showLabel: false
	});
	document.getElementById('navToolbar').appendChild(measurebutton.domNode);
	dojo.connect(measurebutton, "onClick", function () {toggleMeasure();});

	measure = new esri.dijit.Measurement({
		map: map,
		defaultAreaUnit: esri.Units.SQUARE_MILES,
		id: 'measureTool'
	}, 'measureDiv');
	measure.startup();
	// for check activation of measure tool and deactivate selecting tool

	dojo.connect(dijit.byId("dijit_form_ToggleButton_0"), 'onClick',startMeasureTool);
	dojo.connect(dijit.byId("dijit_form_ToggleButton_1"), 'onClick',startMeasureTool);
	dojo.connect(dijit.byId("dijit_form_ToggleButton_2"), 'onClick',startMeasureTool);
}
var toggleException=["dijit_form_ToggleButton_0","dijit_form_ToggleButton_1","dijit_form_ToggleButton_2","optionbutton","farsbutton"];
function startMeasureTool(){
	//deactivateNavTools();
	deactivateDrawingTools();

	activateClick=false;
	dijit.registry.byClass("dijit.form.ToggleButton").forEach(function(togbtn) {

		if(!contains(toggleException,togbtn.id)){
			if (togbtn.attr("checked")) {
				togbtn.attr("checked",false);
			}
		}
	});
	mode="measure";
	measure.setTool(measure.activeTool, true);
}
function addFarsLayer() {
	var farsButton = new dijit.form.ToggleButton({
		label: 'Show FARS',
		id: "farsbutton",
		title: 'Fatality Analysis Reporting System',
		showLabel: true
	});
	document.getElementById('toolbar-center').appendChild(farsButton.domNode);

  // To make the same height as other buttons. need to remove if we add farslayer icon here
  dojo.byId("farsbutton_label").style.margin="4px 0 4px 0";
  dojo.byId("farsbutton_label").style.width="80px";
	dojo.connect(farsButton, "onClick", function(){
		toggleLayer(farsLayer);

		if(farsLayer.visible){
			farsButton.set("label", "Hide FARS");
			//farsLayer.setDefinitionExpression(farsquery);
      if(!fquery){
        fquery = new esri.tasks.Query();
        fquery.returnGeometry = true;
      }
      if(!farsquery){
        createBaseQuery();
      }
      fquery.where = farsquery;
      farsLayer.selectFeatures(fquery);
		}
		else{
			farsButton.set("label", "Show FARS");
		}
	});
}
function deactivateNavTools() {
	navToolbar.deactivate();
	dojo.disconnect(identifyHandler);
	document.getElementById("ZOOM_IN").style.border="1px solid transparent";
	document.getElementById("ZOOM_OUT").style.border="1px solid transparent";
	document.getElementById("zoomfullext").style.border="1px solid transparent";
	document.getElementById("zoomprev").style.border="1px solid transparent";
	document.getElementById("zoomnext").style.border="1px solid transparent";
	document.getElementById("PAN").style.border="1px solid transparent";
	document.getElementById("deactivate").style.border="1px solid transparent";
	document.getElementById("identify").style.border="1px solid transparent";
}
function deactivateDrawingTools(){
	var drawingArr=["drawing","buffer"];
	if(contains(drawingArr,mode)){
		drawing.deactivate();
		activateClick=true;
	}
	dojo.disconnect(handleArea);
	dojo.disconnect(handleSelection);

	//activateNavtool("PAN");
}

//Show/hide the measure widget when the measure button is clicked.
function toggleMeasure() {
	var floater=document.getElementById("floater").style;
	if (floater.visibility === 'hidden') {
		floater.visibility="visible";
		floater.display="block";
	} else {
		floater.visibility="hidden";
		floater.display="none";

		//deactivate the tool and clear the results
		deactivateMeasureTools();
	}
}
function deactivateMeasureTools(){
	if(measure)	{
		measure.clearResult();
		if (measure.activeTool) {
			measure.setTool(measure.activeTool, false);
			activateClick=true;
		}
	}
	//activateNavtool("PAN");
}
/*
Selecting Tool
*/
var gvsc;
var areaLayer, selectionLayer, outlineLayer; // for refresh collisions
var selectingHandler;
function addSelectingTool(){
	var fp = new dojox.layout.FloatingPane({
		title:"Select Collisions",
		resizable: false,
		dockable: false,
		closable: false,
		//style: "position:absolute;left:70px;top:-60px;width:250px;height:245px;z-index:360;visibility:hidden;",
		style: "position:absolute;right:255px;top:120px;width:250px;height:245px;z-index:360;visibility:hidden;",
		id: 'selecting'
	}, dojo.byId('selecting'));
	fp.startup();

	var titlePane = dojo.query('#selecting .dojoxFloatingPaneTitle')[0];
	//add close button to title pane
	var closeDiv = dojo.create('div', {
		id: "closeBtn1",
		innerHTML:  esri.substitute({close_title:'Close Panel',close_alt:'Close'},'<a alt=${close_alt} title=${close_title} href="#" onclick="toggleSelecting();"><img src="images/Close-icon.png"/></a>')
	}, titlePane);
	dojo.byId("selectTool").appendChild(dojo.byId('selectAcc'));

	selectionLayer=initGraphicsLayer();
	outlineLayer=initGraphicsLayer();

	selectingHandler=dojo.connect(drawing, "onDrawEnd", addToMap);

	gsvc = new esri.tasks.GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");
}
function initGraphicsLayer() {
	var layer = new esri.layers.GraphicsLayer({displayOnPan:true});
	map.addLayer(layer);
	return layer;
}
var handleArea, handleSelection;
var mode;
var areaIndex;
function selectButton(type){
	deactivateNavTools();
	//deactivateDrawingTools();
	if(mode=="measure"){
		deactivateMeasureTools();
	}
	//document.getElementById("PAN").style.border="1px solid transparent";

	if(type.substring(0,4)=="buff") mode="buffer";
	else if(type.substring(0,4)=="draw") mode="drawing";
	else if(type.substring(0,4)=="area") {
		deactivateDrawingTools();
		mode="area";
	}
	toggleSelectButton(type);

	if(mode=="buffer" || mode=="drawing") {
		if(areaLayer) {
			areaIndex="";
			areaLayer.clear();
			map.removeLayer(areaLayer);
		}
		if(selectionLayer) selectionLayer.clear();
		var sType=dijit.byId("symbolForm").attr("value").symbolOption;
		dojo.forEach(collLayer.graphics,function(collision){
			if(collision.symbol==highlightSymbol){
				symbolUpdate(sType,collision);
			}
		});
		activateClick=false;
		drawing.activate(eval("esri.toolbars.Draw."+type.substring(4)));
	}
	else if(mode=="area"){
		//var server="http://arcgis-ags101-1190701823.us-west-1.elb.amazonaws.com/ArcGIS/rest/services/CaliforniaC4/MapServer/";
		var county=dijit.byId('county').attr('value');
		if(county=="") county="ALAMEDA";

		var symbol=new esri.symbol.SimpleFillSymbol("solid", new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new dojo.Color([70,70,70, 0.8]), 1.5), new dojo.Color([70,70,70,0.2]));

		var newindex;
		switch (type.substring(4)){
		case "census":
			newindex="4";
			break;
		case "taz":
			newindex="11";
			break;
		case "zip":
			newindex="12";
			break;
		}
		if(newindex!=areaIndex){
			if(areaLayer) {
				areaLayer.clear();
				map.removeLayer(areaLayer);
			}
			if(selectionLayer) selectionLayer.clear();
			var sType=dijit.byId("symbolForm").attr("value").symbolOption;
			dojo.forEach(collLayer.graphics,function(collision){
				if(collision.symbol==highlightSymbol){
					symbolUpdate(sType,collision);
				}
			});

			areaLayer=new esri.layers.FeatureLayer(server+newindex,{
				mode: esri.layers.FeatureLayer.MODE_ONDEMAND,
				outFields: ["COUNTY"],
				opacity: 0.5
			});
			areaLayer.setDefinitionExpression("COUNTY = '"+county+"'");
			map.addLayer(areaLayer);
			areaIndex=newindex;
		}
		map.reorderLayer(cityLayer, 0); // To avoid selecting citylayer instead of arealayer
		map.reorderLayer(areaLayer, 50);
		map.reorderLayer(selectionLayer, 100);
		//map.reorderLayer(collLayer, 30);
		activateClick=false;
		handleArea=dojo.connect(areaLayer, "onClick", selectArea);
		handleSelection=dojo.connect(selectionLayer, "onClick", deselectArea);
	}
}
function toggleSelectButton(type) {
    dijit.registry.byClass("dijit.form.ToggleButton").forEach(function(togbtn) {
		if(type!=undefined){
			if (togbtn == dijit.byId(type)) {
				togbtn.attr("checked", true);
			}
		    else if(togbtn.id !='optionbutton'){
				togbtn.attr("checked", false);
			}
		}
    });
}
function addToMap(geometry) {	// function related to drawing on map for draw, measure, coll selection tools(buffer,drawing,area...)
	switch (geometry.type) {
		case "point":
			var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 1), new dojo.Color([0,255,0,0.25]));
			break;
		case "polyline":
			var symbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASH, new dojo.Color([255,0,0]), 1);
			break;
		case "polygon":
			var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.25]));
			break;
		case "extent":
			var symbol = new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_DASHDOT, new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.25]));
			break;
		case "multipoint":
			var symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_DIAMOND, 20, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,0,0]), 1), new dojo.Color([255,255,0,0.5]));
			break;
	}
	var graphic = new esri.Graphic(geometry, symbol);

	if(mode=="buffer"){	// selection by creating buffer
		selectionLayer.clear();
		createBuffer(geometry);
		selectionLayer.add(graphic);
	}
	else if(mode=="drawing"){	// selection by drawing
		selectionLayer.clear();
		map.graphics.clear();
		selectionLayer.add(graphic);
		selectCollision(geometry);
	}
}
function createBuffer(geometry){
	var params = new esri.tasks.BufferParameters();

	var distances = [];
	for(var i=0; i<document.getElementById('bufferCount').value; i++){
		distances[i] = document.getElementById('bufferDistance').value * (i+1);
	}
	params.geometries = [geometry];
	params.distances = distances;
	params.unit = eval("esri.tasks.GeometryService."+document.getElementById("bufferunit").value);
	params.bufferSpatialReference = new esri.SpatialReference({wkid: 32610});
    params.outSpatialReference = map.spatialReference;
	gsvc.buffer(params, showBuffer);
	//dojo.byId('messages').innerHTML = "<b>Creating Buffer Using Geometry Service...</b>";
}
function showBuffer(geometries) { // it should be "geometries" not "geomety" since it is the number of buffer count
	var symbol = new esri.symbol.SimpleFillSymbol("solid", new esri.symbol.SimpleLineSymbol("solid", new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.2]));

	dojo.forEach(geometries, function(geometry){
		var graphic = new esri.Graphic(geometry,symbol);
		selectCollision(geometry);
		selectionLayer.add(graphic);
	});
}
function selectCollision(geometry){
	var count=0;
	var sType=dijit.byId("symbolForm").attr("value").symbolOption;
	dojo.forEach(collLayer.graphics,function(graphic){
		if(geometry.contains(graphic.geometry)){
			graphic.setSymbol(highlightSymbol);
			count=count+1;
		}
		else if(graphic.symbol==highlightSymbol){
			symbolUpdate(sType,graphic);
		}
	});
	document.getElementById('selectResult').innerHTML=count + " collisions were selected.";
	if(count>0) document.getElementById('diagram').style.display="block";
	else document.getElementById('diagram').style.display="none";
	if(dijit.byId('resultsPane').open==false) dijit.byId('resultsPane').toggle();
}
function symbolUpdate(sType,graphic){
	if(sType=="severity"){
		var fieldValue=graphic.attributes['CRASHSEV'];
		if(dijit.byId('severity_'+fieldValue).checked==true) {
			graphic.setSymbol(severitySymbol[fieldValue]);
		}
		else graphic.setSymbol(defaultSymbol);
	}
	else if(sType=="sNone") graphic.setSymbol(defaultSymbol);
	else{
		switch(sType){
		case "sPed":
			var fieldValue=graphic.attributes['PEDCOL'];
			break;
		case "sBike":
			var fieldValue=graphic.attributes['BICCOL'];
			break;
		case "sMotor":
			var fieldValue=graphic.attributes['MCCOL'];
			break;
		case "sTruck":
			var fieldValue=graphic.attributes['TRUCKCOL'];
			break;
		}
		if(fieldValue=="Y") graphic.setSymbol(newSymbol);
		else graphic.setSymbol(defaultSymbol);
	}
}
function selectArea(evt) {
	var selectsymbol = new esri.symbol.SimpleFillSymbol("solid", new esri.symbol.SimpleLineSymbol("solid", new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.2]));
	var graphic = new esri.Graphic(evt.graphic.geometry,selectsymbol,evt.graphic.attributes);
	//alert("before:" + selectionLayer.graphics.length);
	selectionLayer.add(graphic);
	selectCollsions(selectionLayer.graphics);
	//alert("after:" + selectionLayer.graphics.length);
}
function deselectArea(evt){
	dojo.forEach(selectionLayer.graphics, function(graphic){
		if(graphic){
			if(graphic.geometry==evt.graphic.geometry){
				selectionLayer.remove(graphic);
				deselectCollsions(graphic)
			}
		}
	});
	if(selectionLayer.graphics.length==0){ // if there is no selected area, clear selection number from result
		document.getElementById('selectResult').innerHTML="";
		document.getElementById('diagram').style.display="none";
	}
}
function selectCollsions(graphics){
	var count=0;

	dojo.forEach(collLayer.graphics,function(collision){
		dojo.forEach(graphics,function(graphic){
			if(graphic.geometry.contains(collision.geometry)){
				collision.setSymbol(highlightSymbol);
				count=count+1;
			}
		});
	});
	document.getElementById('selectResult').innerHTML=count + " collisions were selected.";
	if(count>0) document.getElementById('diagram').style.display="block";
	else document.getElementById('diagram').style.display="none";
	document.getElementById('resultsPane').style.visibility="visible";
}
function deselectCollsions(graphic){
	var count=0;
	var sType=dijit.byId("symbolForm").attr("value").symbolOption;
	dojo.forEach(collLayer.graphics,function(collision){
		if(graphic.geometry.contains(collision.geometry)){
			symbolUpdate(sType,collision);
			count=count+1;
		}
	});
	count=parseInt(document.getElementById('selectResult').innerHTML)-count;
	document.getElementById('selectResult').innerHTML=count + " collisions were selected.";
	if(count>0) document.getElementById('diagram').style.display="block";
	else document.getElementById('diagram').style.display="none";
	document.getElementById('resultsPane').style.visibility="visible";
}

function toggleSelecting(){
	var selecting=document.getElementById("selecting").style;
	if (selecting.visibility === 'hidden') {
		selecting.visibility="visible";

		// to check if the select tool has previous selection
		var flag=dijit.registry.byClass("dijit.form.ToggleButton").some(function(togbtn) {
			if(!contains(toggleException,togbtn.id)){
				if (togbtn.attr("checked")) {
					selectButton(togbtn.id);
					return true;
				}
			}
		});
		if(!flag){
			selectButton("drawFREEHAND_POLYGON");
		}
	}
	else {
		selecting.visibility="hidden";

		deactivateDrawingTools();
	}
}

/* Navi Tool */
var identifyHandler, farsCursorOver, farsCursorOut;
function activateNavtool(selectedTool){
	switch(selectedTool){
		case "zoomfullext":
			navToolbar.zoomToFullExtent();
			break;
		case "zoomprev":
			navToolbar.zoomToPrevExtent();
			break;
		case "zoomnext":
			navToolbar.zoomToNextExtent();
			break;
		case "ZOOM_IN":
		case "ZOOM_OUT":
		case "ZOOM_OUT":
			deactivateDrawingTools();
			deactivateMeasureTools();
			borderToolbar(selectedTool);

			navToolbar.activate(eval("esri.toolbars.Navigation." + selectedTool));
			dijit.registry.byClass("dijit.form.ToggleButton").forEach(function(togbtn) {
				if(!contains(toggleException,togbtn.id)){
					if (togbtn.attr("checked")) {
						togbtn.attr("checked",false);
					}
				}
			});
			activateClick=false;
			break;
		case "identify":
			deactivateMeasureTools();
		case "PAN":
			deactivateDrawingTools();
			borderToolbar(selectedTool);
			navToolbar.activate(eval("esri.toolbars.Navigation." + selectedTool));

			dijit.registry.byClass("dijit.form.ToggleButton").forEach(function(togbtn) {
				if(!contains(toggleException,togbtn.id)){
					if (togbtn.attr("checked")) {
						togbtn.attr("checked",false);
					}
				}
			});
			activateClick=true;
			break;

		case "deactivate":
			navToolbar.deactivate();
			deactivateMeasureTools();

			document.getElementById('selectResult').innerHTML="";
			document.getElementById('diagram').style.display="none";

			areaIndex=""; // initialize previous area selection index
			if(areaLayer) {
				areaLayer.clear();
				map.removeLayer(areaLayer);
			}
			if(selectionLayer) selectionLayer.clear();
			var sType=dijit.byId("symbolForm").attr("value").symbolOption;
			dojo.forEach(collLayer.graphics,function(collision){
				if(collision.symbol==highlightSymbol){
					symbolUpdate(sType,collision);
				}
			});
			activateNavtool("PAN");
			break;
	}
	if(selectedTool=="identify") {
		activateClick=false;
		identifyHandler=dojo.connect(map,"onClick",doIdentify);
	}
	else{
		dojo.disconnect(identifyHandler);
	}
}
function borderToolbar(selectedTool){
	//deactivateDrawingTools();
	//deactivateMeasureTools();
	deactivateNavTools();
	document.getElementById(selectedTool).style.border='1px solid #577398';
}
/* collision query */
function createLeftPane(){
	document.getElementById("leftContent1").style.display="block";
	document.getElementById("leftContent2").style.display="block";
}

function createFactors(){
	var menu = new dijit.Menu({
		style: "width:200px;"
	},'addfactors');
	var subMenu = new Array();
	for (var i=0; i<3; i++) {
		subMenu[i] = dijit.byId("factor"+i);
	}
	menu.addChild(new dijit.PopupMenuItem({
		id:"submenu0",
		label:"Collision Factors",
		popup:subMenu[0]
	}));
	menu.addChild(new dijit.MenuSeparator());
	menu.addChild(new dijit.PopupMenuItem({
		id:"submenu1",
		label:"Party Factors",
		popup:subMenu[1]
	}));
	menu.addChild(new dijit.MenuSeparator());
	menu.addChild(new dijit.PopupMenuItem({
		id:"submenu2",
		label:"Victim Factors",
		popup:subMenu[2]
	}));
	menu.startup();
	/*
	var button = new dijit.form.DropDownButton({
		label: 'Select Factors',
		iconClass: "esriLegendIcon",
		title: 'Select Factors',
		dropDown: menu
	});
	dojo.byId('factors').appendChild(menu.domNode);
	*/
}
function checkAll(factorID,option){
	dojo.query('[id^="values_'+factorID+'_"]').forEach(function(checkbox){
		if(option) dijit.getEnclosingWidget(checkbox).set("checked",true);
		else dijit.getEnclosingWidget(checkbox).set("checked",false);
	});
}
function createBasemapGallery() {
	//add the basemap gallery, in this case we'll display maps from ArcGIS.com including bing maps
	var basemapGallery = new esri.dijit.BasemapGallery({showArcGISBasemaps: true,map: map}, "basemapGallery");
	basemapGallery.startup();
	//dojo.connect(basemapGallery, "onError", function(msg) {console.log(msg)});

	var basemapContents=dijit.byId("basemapContents");
	var button = new dijit.form.DropDownButton({
		label: 'Basemap',
		iconClass: "basemapIcon",
		title: 'Basemap',
		dropDown: basemapContents
	});
	document.getElementById('toolbar-center').appendChild(button.domNode);
}
function createOverview() {
	var overviewMapDijit = new esri.dijit.OverviewMap({	map: map,attachTo:"bottom-right",visible:true,height:"150",width:"150"});
	overviewMapDijit.startup();
}
function createOptions() {
	var fp = new dojox.layout.FloatingPane({
		title:"Options",
		resizable: false,
		dockable: false,
		closable: false,
		style: "position:absolute;left:-200px;top:-60px;width:250px;z-index:360;visibility:hidden;",
		id: 'options'
	}, dojo.byId('options'));
	fp.startup();

	var titlePane = dojo.query('#options .dojoxFloatingPaneTitle')[0];
	//add close button to title pane
	var closeDiv = dojo.create('div', {
		id: "closeBtn3",
		innerHTML:  esri.substitute({close_title:'Close Panel',close_alt:'Close'},'<a alt=${close_alt} title=${close_title} href="#" onclick="toggleOptions();"><img src="images/Close-icon.png"/></a>')
	}, titlePane);

	var optionbutton=dijit.byId("optionbutton");
	/*
	var optionbutton = new dijit.form.ToggleButton({
		label: 'Options',
		title: 'Options',
		id: "optionbutton",
		iconClass: "optionsIcon"
	});
	dojo.byId('toolbar-left').appendChild(optionbutton.domNode);
	*/
	dojo.connect(optionbutton, "onClick", function () {toggleOptions();});
	dojo.connect(dijit.byId("points"),"onClick",function(){
		dojo.query("#symbolize").style("visibility", "visible");
	});
	dojo.connect(dijit.byId("clusters"),"onClick",function(){
		dojo.query("#symbolize").style("visibility", "hidden");
	});
	dojo.connect(dijit.byId("heatmap"),"onClick",function(){
		dojo.query("#symbolize").style("visibility", "hidden");
	});
}
function resizeOption(id){ // option floatingpane size change
	switch(id){
		case "severity":
			margin=4;
			break;
		case "involv":
			margin=12;
			break;
	}
	margin=margin*21; // 21: line height

	var options=document.getElementById('options').style;
	if(document.getElementById(id+'Sub').style.display=='none') {
		var newHeight=parseFloat(options.height) + margin;
	}
	else {
		var newHeight=parseFloat(options.height) - margin;
	}

	options.height=newHeight + "px";
}
function toggleOptions() {
	var options=document.getElementById('options').style;
	if (options.visibility === 'hidden') {
		options.visibility="visible";
		options.display="block";
	}
	else {
		options.visibility="hidden";
		options.display="none";
		dijit.byId('optionbutton').set('checked', false);
	}
}
// Print tool
var printer;
function addPrintTool(){
	var fp = new dojox.layout.FloatingPane({
		title:"Printing Tool",
		resizable: false,
		dockable: false,
		closable: false,
		style: "position:absolute;left:620px;top:-60px;width:250px;height:130px;z-index:370;visibility:hidden;",
		id: 'printing'
	}, dojo.byId('printing'));
	fp.startup();

	var titlePane = dojo.query('#printing .dojoxFloatingPaneTitle')[0];
	//add close button to title pane
	var closeDiv = dojo.create('div', {
		id: "closeBtn4",
		innerHTML:  esri.substitute({close_title:'Close Panel',close_alt:'Close'},'<a alt=${close_alt} title=${close_title} href="#" onclick="togglePrinting();"><img src="images/Close-icon.png"/></a>')
	}, titlePane);

	var printbutton = new dijit.form.Button({
		//label: 'Measurement',
		title: 'Printing',
		id: "printbutton",
		iconClass: "esriPrintIcon",
		showLabel: false
	});
	document.getElementById('navToolbar').appendChild(printbutton.domNode);
	dojo.connect(printbutton, "onClick", function () {togglePrinting();});

	// create an array of objects that will be used to create print templates
	var layouts = [{
		"name": "Letter ANSI A Landscape",
		"label": "Landscape (PDF)",
		"format": "pdf"
	}, {
		"name": "Letter ANSI A Portrait",
		"label": "Portrait (PDF)",
        "format": "pdf"
	}, {
		"name": "Letter ANSI A Landscape",
		"label": "Landscape (Image)",
		"format": "jpg"
	}, {
		"name": "Letter ANSI A Portrait",
		"label": "Portrait (Image)",
        "format": "jpg"
	}];
	 var options = {
		"authorText": "Made by: SWITRS GIS Map at TIMS (http://tims.berkeley.edu)",
		"copyrightText": "Copyright UC Regents, 2013",
		"legendLayers": ["collLayer"],
		"scaleBarUnit": "Miles"
	};
	// create the print templates, could also use dojo.map
	var templates = [];
	dojo.forEach(layouts, function(lo) {
		var t = new esri.tasks.PrintTemplate();
		t.layout = lo.name;
		t.label = lo.label;
		t.format = lo.format;
		t.preserveScale = false;
		t.layoutOptions = options;
		templates.push(t);
	});
	/*
	dojo.connect(dijit.byId("print"),"onClick", function(){
		var url ='http://arcgis-ags101-1190701823.us-west-1.elb.amazonaws.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task';
		var printTask = new esri.tasks.PrintTask(url);

		var params = new esri.tasks.PrintParameters();
		params.map = map;
		params.template = templates[0];

		printTask.execute(params);

		dojo.connect(printTask,'onComplete',function(result){
			window.open(result.url);
		});
	});
	*/
	printer=new esri.dijit.Print({
		map: map,
		templates: templates,
		url: "http://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
	},  dojo.byId("print_button"));

	printer.startup();
	//dojo.byId('dijit_form_ComboButton_0_label').innerHTML="Prepare Printing";
	dojo.connect(printer,'onPrintStart',function(){
		dojo.forEach(templates,function(t){
			var county=dijit.byId('county').attr('value');
			var city=dijit.byId('city').attr('displayedValue');
			var fromdate=dijit.byId('FromDate').get('value');
			var todate=dijit.byId('ToDate').get('value');
			var fromdateYMD=dojo.date.locale.format(fromdate, {datePattern: "M-d-yy", selector: "date"});
			var todateYMD=dojo.date.locale.format(todate, {datePattern: "M-d-yy", selector: "date"});

			t.layoutOptions.titleText = "SWITRS Collisions from " + fromdateYMD + " to " + todateYMD + ", " + city + ", " + county;
		});
	});
}
function togglePrinting(){
	var printing=document.getElementById('printing').style;
	if (printing.visibility === 'hidden'){
		printing.visibility="visible";
	}
	else {
		printing.visibility="hidden";
	}
}
function startDownload(){
	showLoading();
	var option1=dijit.byId("downloadForm").attr("value").downOption1;

	var form=document.getElementById("downloadForm");
	form.action="download.php";

	dijit.byId("downloadDialog").hide();
	var caseids=[];
	switch(option1){
	case "All":
		dojo.forEach(collLayer.graphics, function(graphic){
			caseids.push(graphic.attributes['CASEID'].toString());
		});
		break;
	case "Selected":
		dojo.forEach(collLayer.graphics, function(graphic){
			if(graphic.symbol==highlightSymbol){
				caseids.push(graphic.attributes['CASEID'].toString());
			}
		});
		break;
	case "Current":
		dojo.forEach(collLayer.graphics, function(graphic){
			if(map.extent.contains(graphic.geometry)){
				caseids.push(graphic.attributes['CASEID'].toString());
			}
		});
		break;
	}
	document.getElementById("caseid").value=dojo.toJson(caseids);
	if(document.getElementById("selectedOnlyValue").value=="All"){
		document.getElementById("partyvictimQuery").value="";
	}
	else{
		var option2=dijit.byId("downloadForm").attr("value").downOption2;

		document.getElementById("partyvictimQuery").value="";
		switch(option2){
		case "Parties":
			if(factorQuery[2]!=undefined) {
				document.getElementById("partyvictimQuery").value=factorQuery[2];
			}
			break;
		case "Victims":
			if(factorQuery[3]!=undefined) document.getElementById("partyvictimQuery").value=factorQuery[3];
			break;
		}
	}
	form.submit();

	hideLoading();
}
function makeDiagram(){
	showLoading();

	var caseids=[];
	dojo.forEach(collLayer.graphics, function(graphic){
		if(graphic.symbol==highlightSymbol){
			caseids.push(graphic.attributes['CASEID'].toString());
		}
	});
	//console.log(caseids);
	var idString = caseids.join("&CASEID[]=");
	window.open("colDiagram/diagram.php?CASEID[]="+idString)

	hideLoading();
}
/*
Download when using setDefinitionExpression as a query method

function startDownload(){
	showLoading();
	var option1=dijit.byId("downloadForm").attr("value").downOption1;

	var form=dojo.byId("downloadForm");
	form.action="download.php";

	dijit.byId("downloadDialog").hide();
	var caseids=[];
	switch(option1){
		case "All":
			var deferred=collLayer.queryFeatures(querystr,function(featureSet){
				dojo.forEach(featureSet.features, function(feature){
					caseids.push(feature.attributes['CASEID'].toString());
				});
			});
			deferred.then(function(){
				dojo.byId("caseid").value=dojo.toJson(caseids);
				form.submit();
			});
			break;
		case "Selected":
			dojo.forEach(collLayer.graphics, function(graphic){
				if(graphic.symbol==highlightSymbol){
					caseids.push(graphic.attributes['CASEID'].toString());
				}
			});
			dojo.byId("caseid").value=dojo.toJson(caseids);
			form.submit();
			break;
		case "Current":
			dojo.forEach(collLayer.graphics, function(graphic){
				caseids.push(graphic.attributes['CASEID'].toString());
			});
			dojo.byId("caseid").value=dojo.toJson(caseids);
			form.submit();
			break;
	}
	hideLoading();
}
*/
function startRefresh(option1){
	showLoading();
	outlineLayer.clear();
	if(mode=="measure"){
		deactivateMeasureTools();
	}
	//var option1=dijit.byId("refreshForm").attr("value").refreshOption1;
	var type=dijit.byId("clusterForm").attr("value").clusterOption;
	switch(option1){
	case "CurrentExtent":
		deactivateDrawingTools();
		dijit.byId("refreshDialog").hide();
		refreshOutline();
		if(outlineLayer.graphics.length==1) {
			showCollisions(type,map.extent);
			//map.setExtent(map.extent.expand(1.1),true);
		}
		break;
	case "DrawExtent":
		hideLoading();

		var drawType;
		drawType="FREEHAND_POLYGON";
		/*
		if(dijit.byId("refreshFREEHAND_POLYGON").attr("checked")) drawType="FREEHAND_POLYGON";
		if(dijit.byId("refreshPOLYGON").attr("checked")) drawType="POLYGON";
		*/
		if(drawType!=undefined){
			dijit.byId("refreshDialog").hide();
			//dojo.disconnect(selectingHandler);
			deactivateDrawingTools();
			activateClick=false;

			refreshing.activate(eval("esri.toolbars.Draw."+drawType));

			var refreshHandler=dojo.connect(refreshing, "onDrawEnd", function(geometry){
				var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([50, 200, 100, 0.5]), 3);
				var graphic = new esri.Graphic(geometry, lineSymbol);

				outlineLayer.add(graphic);
				/*
				if(outlineLayer.graphics.length==1) {
					map.setExtent(outlineLayer.graphics[0].geometry.getExtent().expand(1.1),true);
				}
				*/
				showCollisions(type,geometry);
				refreshing.deactivate();
				setTimeout(function(){
					dojo.disconnect(refreshHandler);
					activateClick=true;
					if(outlineLayer.graphics.length==1) {
						map.setExtent(outlineLayer.graphics[0].geometry.getExtent().expand(1.1),true);
					}
					//selectingHandler=dojo.connect(drawing, "onDrawEnd", addToMap);
				},100);
			});
		}
		break;
	}

}
//draw the red line extent
function refreshOutline(){
	var xm = map.extent.xmin;
	var xM = map.extent.xmax;
	var ym = map.extent.ymin;
	var yM = map.extent.ymax;

	var lineSymbol = new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([50, 200, 100, 0.5]), 3);
	var outlineGeometry = new esri.geometry.Polyline({"paths":[[[xm, ym],[xm, yM],[xM, yM],[xM, ym],[xm, ym]]],"spatialReference":{"wkid":102100}});
	outlineLayer.add(new esri.Graphic(outlineGeometry, lineSymbol));

}
// unused function
/*
function createDate(){
	var cp = new dijit.layout.ContentPane({
		id: 'createdates',
		style:"width:280px;",
		content: document.getElementById('createdate')
	});

	var button = new dijit.form.DropDownButton({
		label: 'Date and Location',
		iconClass: "datelocationIcon",
		title: 'Date and Location',
		dropDown: cp
	});
	dojo.byId('toolbar-left').appendChild(button.domNode);
}
function createResults() {
	var fp = new dojox.layout.FloatingPane({
		title:"Results",
		resizable: false,
		dockable: false,
		closable: false,
		style: "position:absolute;right:20px;bottom:170px;width:250px;height:100px;z-index:501;visibility:hidden;",
		id: 'resultsPane'
	}, dojo.byId('resultsPane'));
	fp.startup();

	var titlePane = dojo.query('#resultsPane .dojoxFloatingPaneTitle')[0];
	//add close button to title pane
	var closeDiv = dojo.create('div', {
		id: "closeBtn2",
		innerHTML:  esri.substitute({close_title:'Close Panel',close_alt:'Close'},'<a alt=${close_alt} title=${close_title} href="#" onclick="toggleResults();"><img src="images/Close-icon.png"/></a>')
	}, titlePane);
	var resultbutton = new dijit.form.ToggleButton({
		label: 'results',
		title: 'Results',
		id: "resultbutton",
		iconClass: "resultsIcon"
	});
	dojo.connect(resultbutton, "onClick", function () {	toggleResults();});
	dojo.byId('resultPosition').appendChild(resultbutton.domNode);
}
function toggleResults() {
	if (dojo.byId('resultsPane').style.visibility === 'hidden') {dojo.byId('resultsPane').style.visibility="visible";}
	else {
		dojo.byId('resultsPane').style.visibility="hidden";
		dijit.byId('resultbutton').set('checked', false);
	}
}
*/
