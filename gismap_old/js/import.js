/*
drag and drop
*/
var latFieldStrings = ["point_y"];
var longFieldStrings = ["point_x"];

var switrsLayer, crossroadsLayer, shapeLayer;
var importSymbol;

function dragAndDrop(){
	//esri.config.defaults.io.corsEnabledServers.push("servicesbeta.esri.com");
	dojo.connect(dojo.byId("choose"),"onclick",function(){
		dojo.byId("data").click();
	});
	dojo.connect(dojo.byId("uploadForm").data, "onchange", function (evt) {
		showLoading();
		var fileName = evt.target.value.toLowerCase();
		if (dojo.isIE) { //filename is full path in IE so extract the file name
			var arr = fileName.split("\\");
			fileName = arr[arr.length - 1];
		}
		if (fileName.indexOf(".zip") !== -1) {//is file a zip - if not notify user 
			handleShapefile(fileName, dojo.byId('uploadForm'));
		}
		else{
			uploadFile(evt.target.files);
		}
	});
	
	//dijit.byId('uploadForm').style("display","block");
	importSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([70,70,70]), 1), new dojo.Color([0,215,215,0.5]));	

	if (!window.File || !window.FileReader) {
		return;
	}
	else{
		var node = dojo.byId("map");
		dojo.connect(node, "dragenter", function (evt) {evt.preventDefault();});
		dojo.connect(node, "dragover", function (evt) {evt.preventDefault();});
		dojo.connect(node, "drop", handleDrop);
	}
}
function handleShapefile(fileName, fileform){
    var name = fileName.split(".");
    //Chrome and IE add c:\fakepath to the value - we need to remove it
    //See this link for more info: http://davidwalsh.name/fakepath
    name = name[0].replace("c:\\fakepath\\","");
        
    //dojo.byId('upload-status').innerHTML = '<b>Loading?</b>' + name; 
        
    //Define the input params for generate see the rest doc for details
    //http://www.arcgis.com/apidocs/rest/index.html?generate.html
    var params = {
        'name': name,
        'targetSR': map.spatialReference,
        'maxRecordCount': 1000,
        'enforceInputFileSizeLimit': true,
        'enforceOutputJsonSizeLimit': true
    };
	var extent = esri.geometry.getExtentForScale(map,40000); 
        var resolution = extent.getWidth() / map.width;
        params.generalize = true;
        params.maxAllowableOffset = resolution;
        params.reducePrecision = true;
        params.numberOfDigitsAfterDecimal = 0;

	var myContent = {
        'filetype': 'shapefile',
        'publishParameters': dojo.toJson(params),
        'f': 'json'
        //'callback.html': 'textarea'
    };
	esri.request({
        url: 'http://www.arcgis.com/sharing/rest/content/features/generate', // use arcgis portal 
        content: myContent,
        form: fileform,
        handleAs: 'json',
        load: dojo.hitch(this, function (response) {
			if (response.error) {
				requestFailed(response.error);
				return;
            }
			createImportedLayer("shape",response.featureCollection.layers[0]); // if there are multiple layers in shape file, only shows the first one.
        }),
		error: requestFailed
    });
}
function handleShp(file) {
	console.log("Processing Shape: ", file, ", ", file.name, ", ", file.type, ", ", file.size);

	var newForm = new FormData();
	newForm.append("file", file);
	
	handleShapefile(file.name, newForm);
}
//File upload for older browsers
function uploadFile(files) {
	if (files && files.length === 1) {
		console.log("handle files");
		if (files[0].name.indexOf(".csv") !== -1 || files[0].name.indexOf(".CSV") !== -1) {
            handleCsv(files[0]);
		}
		else if (files[0].name.indexOf(".kml") !== -1 || files[0].name.indexOf(".KML") !== -1) {
            handleKml(files[0]);
		}
	} 
	else {
		// gather all parameters from a form:
		dojo.io.iframe.send({
			// The form node, which contains the
			// data. We also pull the URL and METHOD from it:
			form: dojo.byId("uploadForm"),
			url: "upload.php",
			method: "POST",
			// The used data format:
			handleAs: "text",
			
			// Callback on successful call:
			load: function(response){
				var type=response.slice(0,3);
				var data=response.slice(3);
				
				if (type=="csv") {
					processCsvData(data);	
				}
				else if (type=="kml") {
					processKmlData("<"+data);	
				}
				/*
				else if (type=="zip") {
					//handleShp(file);
				}
				*/				
			}
		});
	}
}
function requestFailed(error) {
	//dojo.byId("status").innerHTML = 'Unable to upload';
	console.log(error.message);
	hideLoading();
}
function handleDrop(evt) {
	showLoading();
	console.log("Drop: ", evt);
	evt.preventDefault();

	var dataTransfer = evt.dataTransfer, 
		files = dataTransfer.files,
		types = dataTransfer.types;
          
    // File drop?
	if (files && files.length === 1) {
		console.log("[ FILES ]");
		var file = files[0]; // that's right I'm only reading one file
		console.log("type = ", file.type);
		if (file.name.indexOf(".csv") !== -1 || file.name.indexOf(".CSV") !== -1) {
            handleCsv(file);
		}
		else if (file.name.indexOf(".kml") !== -1 || file.name.indexOf(".KML") !== -1) {
            handleKml(file);
		}
		else if (file.name.indexOf(".zip") !== -1 || file.name.indexOf(".ZIP") !== -1) {
			handleShp(file);
		}
	}
}
/* CSV file control */
function handleCsv(file) {
	console.log("Processing CSV: ", file, ", ", file.name, ", ", file.type, ", ", file.size);
	if (file.data) {
		var decoded = bytesToString(dojox.encoding.base64.decode(file.data));
		processCsvData(decoded);
	} 
	else {
		var reader = new FileReader();
		reader.onload = function () {
			console.log("Finished reading CSV data");
            processCsvData(reader.result);
		};
		reader.readAsText(file);
	}
}

function processCsvData(data) {
	var newLineIdx = data.indexOf("\n");
	var firstLine = dojo.trim(data.substr(0, newLineIdx)); //remove extra whitespace, not sure if I need to do this since I threw out space delimiters
	var separator = getSeparator(firstLine);
	var csvStore = new dojox.data.CsvStore({
		data: data,
		separator: separator
	});
	var type="SWITRS";
	csvStore.fetch({
		onComplete: function (items, request) {
            var objectId = 0;
            var featureCollection = generateFeatureCollection("csv",csvStore, items);
            var latField, longField;
            var fieldNames = csvStore.getAttributes(items[0]);
            dojo.forEach(fieldNames, function (fieldName) {
				var matchId;
				matchId = dojo.indexOf(latFieldStrings, fieldName.toLowerCase());
				if (matchId !== -1) {
					latField = fieldName;
				}
				matchId = dojo.indexOf(longFieldStrings, fieldName.toLowerCase());
				if (matchId !== -1) {
					longField = fieldName;
				}
			});
            
            // Add records in this CSV store as graphics
            dojo.forEach(items, function (item, index) {
				var attrs = csvStore.getAttributes(item),
				attributes = {};
				// Read all the attributes for  this record/item
				dojo.forEach(attrs, function (attr) {
					var value = Number(csvStore.getValue(item, attr));
					if (isNaN(value)) {
						attributes[attr] = csvStore.getValue(item, attr);
					} 
					else {
						attributes[attr] = value;
					}
				});

				attributes["__OBJECTID"] = objectId;
				objectId++;

				var latitude = parseFloat(attributes[latField]);
				var longitude = parseFloat(attributes[longField]);
              
				if (isNaN(latitude) || isNaN(longitude) || latitude==0 || longitude==0) {
					return;
				}

				var geometry = esri.geometry.geographicToWebMercator(new esri.geometry.Point(longitude, latitude));
				var feature = {
					"geometry": geometry.toJson(),
					"attributes": attributes
				};
				featureCollection.featureSet.features.push(feature);
			});
			
			createImportedLayer(type,featureCollection);
        },
		onError: function (error) {
            console.error("Error fetching items from CSV store: ", error);
		}
	});
}
function createImportedLayer(type,featureCollection){
	/* Add checkbox to mapcontents */
	if(dojo.byId("CrossroadsCheck")==undefined && dojo.byId("SWITRSCheck")==undefined && dojo.byId("shapeCheck")==undefined){
		dojo.byId("mapcontent").appendChild(dojo.create("hr"));			
	}
	switch(type){
	case "SWITRS":
		if(dojo.byId("SWITRSCheck")==undefined && (dojo.byId("shapeCheck")!=undefined || dojo.byId("CrossroadsCheck")!=undefined)){
			dojo.byId("mapcontent").appendChild(dojo.create("br"));
		}	
		if(switrsLayer) switrsLayer.clear();
		switrsLayer = new esri.layers.FeatureLayer(featureCollection, {
			id: "SWITRS",
			infoTemplate: setPopupContents("Coll")
		});
		var renderer = new esri.renderer.SimpleRenderer(importSymbol);
		switrsLayer.setRenderer(renderer);

        map.addLayer(switrsLayer);
		dojo.connect(switrsLayer,"onMouseOver",function(){
			if(activateClick) {
				map.setMapCursor("pointer");
			}
		});
		dojo.connect(switrsLayer,"onMouseOut",function(){
			if(activateClick) {
				map.setMapCursor("default");
			}
		});
		dojo.connect(switrsLayer,"onClick",function(){
			if(activateClick) {
				collClick(event, this);
			}
		}); 		
        zoomToData(switrsLayer);
			
		if(dojo.byId("SWITRSCheck")==undefined){
			//dojo.byId("mapcontent").appendChild(dojo.create("br"));
			var csvMapcontents = new dijit.form.CheckBox({
				id: "SWITRSCheck",
				onClick: function(){toggleLayer(switrsLayer);},
				checked: true
			});
			dojo.byId("mapcontent").appendChild(csvMapcontents.domNode);
			dojo.create("label", {innerHTML:"&nbsp;<img src='images/mapcontents/imported.png' border=0>&nbsp;Imported (SWITRS)", "for":"SWITRSCheck"},"mapcontent");
		}
		else{
			dijit.byId("SWITRSCheck").set("checked",true);
		}
		createUserPane(switrsLayer);
		break;
	case "Crossroads":
		if(dojo.byId("CrossroadsCheck")==undefined && (dojo.byId("shapeCheck")!=undefined || dojo.byId("SWITRSCheck")!=undefined)){
			dojo.byId("mapcontent").appendChild(dojo.create("br"));
		}			
		var content = buildInfoTemplate(featureCollection.layerDefinition.fields);
		var template = new esri.dijit.PopupTemplate({
			description: content
		});	
		if(crossroadsLayer) crossroadsLayer.clear();
		crossroadsLayer = new esri.layers.FeatureLayer(featureCollection, {
			id: "Crossroads",
			infoTemplate: template
		});
		var renderer = new esri.renderer.SimpleRenderer(importSymbol);
		crossroadsLayer.setRenderer(renderer);

		map.addLayer(crossroadsLayer);
		dojo.connect(crossroadsLayer,"onMouseOver",function(){
			if(activateClick) {
				map.setMapCursor("pointer");
			}
		});
		dojo.connect(crossroadsLayer,"onMouseOut",function(){
			if(activateClick) {
				map.setMapCursor("default");
			}
		});
		dojo.connect(crossroadsLayer,"onClick",function(){
			if(activateClick) {
				CrossroadsClick(event, this);
			}
		}); 		
    	zoomToData(crossroadsLayer);	
	
		if(dojo.byId("CrossroadsCheck")==undefined){
			var kmlMapcontents = new dijit.form.CheckBox({
				id: "CrossroadsCheck",
				onClick: function(){toggleLayer(crossroadsLayer);},
				checked: true
			});
			dojo.byId("mapcontent").appendChild(kmlMapcontents.domNode);
			dojo.create("label", {innerHTML:"&nbsp;<img src='images/mapcontents/imported.png' border=0>&nbsp;Imported (Crossroads)", "for":"CrossroadsCheck"},"mapcontent");
		}
		else{
			dijit.byId("CrossroadsCheck").set("checked",true);
		}
		createUserPane(crossroadsLayer);	
	
		break;
	case "shape":
		if(dojo.byId("shapeCheck")==undefined && (dojo.byId("CrossroadsCheck")!=undefined || dojo.byId("SWITRSCheck")!=undefined)){
			dojo.byId("mapcontent").appendChild(dojo.create("br"));
		}				
		var content = buildInfoTemplate(featureCollection.layerDefinition.fields);
		var template = new esri.dijit.PopupTemplate({
			description: content
		});	
		if(shapeLayer) shapeLayer.clear();
		shapeLayer = new esri.layers.FeatureLayer(featureCollection, {
			id: "Shapefile",
			infoTemplate: template
		});
		var renderer = new esri.renderer.SimpleRenderer(importSymbol);
		shapeLayer.setRenderer(renderer);

		map.addLayer(shapeLayer);
		dojo.connect(shapeLayer,"onMouseOver",function(){
			if(activateClick) {
				map.setMapCursor("pointer");
			}
		});
		dojo.connect(shapeLayer,"onMouseOut",function(){
			if(activateClick) {
				map.setMapCursor("default");
			}
		});
		dojo.connect(shapeLayer,"onClick",function(){
			if(activateClick) {
				CrossroadsClick(event, this);
			}
		}); 		
    	zoomToData(shapeLayer);			

		if(dojo.byId("shapeCheck")==undefined){
			var shapeMapcontents = new dijit.form.CheckBox({
				id: "shapeCheck",
				onClick: function(){toggleLayer(shapeLayer);},
				checked: true
			});
			dojo.byId("mapcontent").appendChild(shapeMapcontents.domNode);
			dojo.create("label", {innerHTML:"&nbsp;<img src='images/mapcontents/imported.png' border=0>&nbsp;Imported (Shapefile)", "for":"shapeCheck"},"mapcontent");
		}
		else{
			dijit.byId("shapeCheck").set("checked",true);
		}
		createUserPane(shapeLayer);			
	}
}
function getSeparator(string) {
	var separators = [",", "      ", ";", "|"];
	var maxSeparatorLength = 0;
	var maxSeparatorValue = "";
	dojo.forEach(separators, function (separator) {
		var length = string.split(separator).length;
		if (length > maxSeparatorLength) {
            maxSeparatorLength = length;
            maxSeparatorValue = separator;
		}
	});
	return maxSeparatorValue;
}
function generateFeatureCollection(type, store, items, placemarks) {
	//create a feature collection for the input csv file
	var featureCollection = {
		"layerDefinition": null,
		"featureSet": {
			"features": [],
			"geometryType": "esriGeometryPoint"
		}
	};
	featureCollection.layerDefinition = {
		"geometryType": "esriGeometryPoint",
		"objectIdField": "__OBJECTID",
		"type": "Feature Layer",
		"typeIdField": "",
		"fields": [{
			"name": "__OBJECTID",
            "alias": "__OBJECTID",
            "type": "esriFieldTypeOID",
            "editable": false,
            "domain": null
        }],
		"types": [],
		"capabilities": "Query"
	};
	switch(type){
	case "csv":
		var fields = store.getAttributes(items[0]);
		dojo.forEach(fields, function (field) {
			var value = store.getValue(items[0], field);
			var parsedValue = Number(value);
			if (isNaN(parsedValue)) { //check first value and see if it is a number
				featureCollection.layerDefinition.fields.push({
					"name": field,
					"alias": field,
					"type": "esriFieldTypeString",
					"editable": true,
					"domain": null
				});
			} 
			else {
				featureCollection.layerDefinition.fields.push({
					"name": field,
					"alias": field,
					"type": "esriFieldTypeDouble",
					"editable": true,
					"domain": null
				});
			}
		});
		
		break;
	case "kmlCrossroads":
		var fields = placemarks[0].ExtendedData.Data;
		dojo.forEach(fields, function (field) {
			var parsedValue = Number(field.value);
			if (isNaN(parsedValue)) { //check first value and see if it is a number
				featureCollection.layerDefinition.fields.push({
					"name": field.name,
					"alias": field.name,
					"type": "esriFieldTypeString",
					"editable": true,
					"domain": null
				});
			} 
			else {
				featureCollection.layerDefinition.fields.push({
					"name": field.name,
					"alias": field.name,
					"type": "esriFieldTypeDouble",
					"editable": true,
					"domain": null
				});
			}
		});	
		break;
	case "kmlSWITRS":
		featureCollection.layerDefinition.fields.push({
			"name": "CASEID",
			"alias": "CASEID",
			"type": "esriFieldTypeString",
			"editable": true,
			"domain": null
		});
		featureCollection.layerDefinition.fields.push({
			"name": "YEAR",
			"alias": "YEAR",
			"type": "esriFieldTypeDouble",
			"editable": true,
			"domain": null
		});
		featureCollection.layerDefinition.fields.push({
			"name": "CRASHSEV" ,
			"alias": "CRASHSEV" ,
			"type": "esriFieldTypeString",
			"editable": true,
			"domain": null
		});
		featureCollection.layerDefinition.fields.push({
			"name": "PEDCOL",
			"alias": "PEDCOL",
			"type": "esriFieldTypeString",
			"editable": true,
			"domain": null
		});
		featureCollection.layerDefinition.fields.push({
			"name": "BICCOL",
			"alias": "BICCOL",
			"type": "esriFieldTypeString",
			"editable": true,
			"domain": null
		});
		featureCollection.layerDefinition.fields.push({
			"name": "MCCOL",
			"alias": "MCCOL",
			"type": "esriFieldTypeString",
			"editable": true,
			"domain": null
		});
		featureCollection.layerDefinition.fields.push({
			"name": "TRUCKCOL",
			"alias": "TRUCKCOL",
			"type": "esriFieldTypeString",
			"editable": true,
			"domain": null
		});
		featureCollection.layerDefinition.fields.push({
			"name": "PRIMARYRD",
			"alias": "PRIMARYRD",
			"type": "esriFieldTypeString",
			"editable": true,
			"domain": null
		});
		featureCollection.layerDefinition.fields.push({
			"name": "SECOND",
			"alias": "SECOND",
			"type": "esriFieldTypeString",
			"editable": true,
			"domain": null
		});
		featureCollection.layerDefinition.fields.push({
			"name": "INTERSECT",
			"alias": "INTERSECT",
			"type": "esriFieldTypeString",
			"editable": true,
			"domain": null
		});
		featureCollection.layerDefinition.fields.push({
			"name": "DISTANCE",
			"alias": "DISTANCE",
			"type": "esriFieldTypeDouble",
			"editable": true,
			"domain": null
		});		
		featureCollection.layerDefinition.fields.push({
			"name": "DIRECT",
			"alias": "DIRECT",
			"type": "esriFieldTypeString",
			"editable": true,
			"domain": null
		});
		featureCollection.layerDefinition.fields.push({
			"name": "POINT_X",
			"alias": "POINT_X",
			"type": "esriFieldTypeDouble",
			"editable": true,
			"domain": null
		});
		featureCollection.layerDefinition.fields.push({
			"name": "POINT_Y",
			"alias": "POINT_Y",
			"type": "esriFieldTypeDouble",
			"editable": true,
			"domain": null
		});
		break;		
	}
	return featureCollection;
}
function createUserPane(layer){
	if(dojo.byId("user").className==""){
		var fp = new dojox.layout.FloatingPane({
			title:"Imported Collisions",
			resizable: false,
			dockable: false,
			closable: false,
			style: "position:absolute;right:240px;top:10px;width:220px;height:140px;z-index:390;visibility:hidden;",
			id: 'user'
		}, dojo.byId('user'));

		var titlePane = dojo.query('#user .dojoxFloatingPaneTitle')[0];
		//add close button to title pane
		var closeDiv = dojo.create('div', {
			id: "closeBtn2",
			innerHTML:  esri.substitute({close_title:'Close Panel',close_alt:'Close'},'<a alt=${close_alt} title=${close_title} href="#" onclick="toggleUser();"><img src="images/Close-icon.png"/></a>')
		}, titlePane);
	}
	dojo.byId('user').style.visibility="visible";
	dojo.byId(layer.id+"Content").innerHTML = layer.id + ":<br>&nbsp;&nbsp;&nbsp;" + layer.graphics.length + " collisions mapped. ";
}
function handleKml(file) {
	console.log("Processing KML: ", file, ", ", file.name, ", ", file.type, ", ", file.size);

	var reader = new FileReader();
	reader.onload = function () {
		console.log("Finished reading KML data");
        processKmlData(reader.result);
	};
	reader.readAsText(file);
}
function processKmlData(data) {
	//var myParser = new geoXML3.parser({afterParse: kmlComplete});
    //myParser.parseKmlString(data);
	var doc=xmlNodeToJson(parseXml(data));
	var placemarks=doc.kml.Document.Placemark;
	
	if(doc.kml.Document.name){
		if(doc.kml.Document.name.$t=="Selected SWITRS Data"){
			var type="kmlSWITRS";
		}
		else{
			var type="kmlCrossroads";
		}
	}
	else{
		var type="kmlCrossroads";
	}
	
    var objectId = 0;
	var featureCollection = generateFeatureCollection(type,'','',placemarks);
	
	dojo.forEach(placemarks, function (placemark) {
		var attributes = {};
		
		attributes["__OBJECTID"] = objectId;
		objectId++;	

		var latlong=placemark.Point.coordinates.$t.split(",");
		var latitude=parseFloat(latlong[1]);
		var longitude=parseFloat(latlong[0]);		
		if (isNaN(latitude) || isNaN(longitude) || latitude==0 || longitude==0) {
			return;
		}
		
		switch(type){
		case "kmlCrossroads":
			// Read all the attributes for  this record/item
			dojo.forEach(placemark.ExtendedData.Data, function (field) {
				attributes[field.name] = field.value.$t;
			});
			break;
		case "kmlSWITRS":
			var fields = placemark.description.$t.split("<br>");
			
			// remove dummy
			fields.pop(); 
			fields.shift();
			fields.splice(6,1);
			fields.unshift(placemark.name.$t) // add caseid
			
			for(var i=0;i<fields.length;i++){
				fields[i]=fields[i].split(": ")[1];
			}
			fields.push(longitude,latitude);
			var i=0;
			dojo.forEach(featureCollection.layerDefinition.fields, function(field){
				if(field.name=="CRASHSEV"){
					attributes[field.name]=fields[i].charAt(0);
					i+=1;
				}
				else if(field.name!="__OBJECTID"){
					attributes[field.name]=fields[i];
					i+=1;
				}
				
			});
			break;
		}
		var geometry = esri.geometry.geographicToWebMercator(new esri.geometry.Point(longitude, latitude));
		var feature = {
			"geometry": geometry.toJson(),
			"attributes": attributes
		};
		featureCollection.featureSet.features.push(feature);
	});	
	createImportedLayer(type.slice(3),featureCollection);
}

function CrossroadsClick(evt, layer){
	//dojo.disconnect(indentifyHandler);
	map.infoWindow.clearFeatures();
	map.infoWindow.hide();
        	
	var query = new esri.tasks.Query();
	query.geometry = pointToExtent(map,evt.mapPoint,5);
	var deferred = layer.selectFeatures(query);

	map.infoWindow.setFeatures([deferred]);
			
	dojo.query(".actionList", map.infoWindow.domNode)[0].style.display="none";
	map.infoWindow.show(evt.mapPoint);
			
	//if(!areaLayer) setTimeout(function(){indentifyHandler=dojo.connect(map,"onClick",doIdentify)}, 500); 			
}
 function buildInfoTemplate(fields) {
	var content="<table>";

	dojo.forEach(fields, function (field) {
		content += "<tr><td valign='top'>" + field.name + ": </td><td valign='top'>{" + field.name + "}</td></tr>";
	});
	content += "</table>";
	return content;
}
function toggleUser(){
	if (dojo.byId('user').style.visibility === 'hidden') {dojo.byId('user').style.visibility="visible";} 
	else {dojo.byId('user').style.visibility="hidden";}
}
function zoomToData(featureLayer) {
	// Zoom to the collective extent of the data
	var multipoint = new esri.geometry.Multipoint(map.spatialReference);
	dojo.forEach(featureLayer.graphics, function (graphic) {
		var geometry = graphic.geometry;
		if (geometry) {
			multipoint.addPoint({
				x: geometry.x,
				y: geometry.y
			});
		}
	});

	if (multipoint.points.length > 0) map.setExtent(multipoint.getExtent(), true);
}
