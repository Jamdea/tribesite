var map;

var markerImage = null;
var detailWindow=null;
var editWindow=null;
var addWindow=null;
//var transformWindow=null;
var Points = [];
var center;
var bounds;
var mapDone = 0;

var scaleMin = 9;
//scaleMax = 14;
var currentZoom = 10;

//Global variables
var scalar = 7.5;
var arrowScale = 0.75;
var arrowWeight = 1;
var pixels = {"x": 0, "y": 0};

//Rounding settings for user icon control
var round = {
	"x": 0.1,
	"y": 0.1,
	"rotator": 5
};

//An array that stores the names of various Crash Types, and whether they are currently mapped
var iconType = {
	"A": {name: "Head-On", visible: true},
	"B": {name: "Sideswipe", visible: true},
	"C": {name: "Rear End", visible: true},
	"D": {name: "Broadside", visible: true},
	"E": {name: "Hit Object", visible: true},
	"F": {name: "Overturned", visible: true},
	"G": {name: "Pedestrian Involved", visible: true},
	"H": {name: "Other", visible: true},
	"I": {name: "Not Stated", visible: true}
};

var switrsText = {
	movement: {
		A: "Stopped",
		B: "Proceeding Straight",
		C: "Ran Off Road",
		D: "Making Right Turn",
		E: "Making Left Turn",
		F: "Making U-Turn",
		G: "Backing",
		H: "Slowing/Stopping",
		I: "Passing Other Vehicle",
		J: "Changing Lanes",
		K: "Parking Maneuver",
		L: "Entering Traffic",
		M: "Other Unsage Turn",
		N: "Crossed Into Opposing Lane",
		O: "Parked",
		P: "Merging",
		Q: "Traveling Other Way",
		R: "Other"
	},
	direction: {
		N: "North",
		S: "South",
		E: "East",
		W: "West"
	},
	party: [
		"Not Stated",
		"Driver",
		"Pedestrian",
		"Parked Vehicle",
		"Bicycle",
		"Other"
	],
	vehType: {
		A: "Passenger Car/Wagon",
		B: "Passenger Car w/ Trailer",
		C: "Motorcycle/Scooter",
		D: "Pickup or Panel Truck",
		E: "Pickup or Panel Truck w/ Trailer",
		F: "Truck or Tractor Truck",
		G: "Truck or Tractor Truck w/ Trailer",
		H: "School Bus",
		I: "Other Bus",
		J: "Emergency Vehicle",
		K: "Highway Construction Equipment",
		L: "Bicycle",
		M: "Other Vehicle",
		N: "Pedestrian",
		O: "Moped"
	}
};
function initialize(setting, checks){
	if (document.getElementById){
		//Get the map height
		//document.getElementById("objContents").style.height  = document.getElementById("mapPane").offsetHeight - document.getElementById("details").offsetHeight;
		var mapPaneBox = dojo.contentBox("mapPane");
		var detailsBox = dojo.contentBox("details_port");
		document.getElementById("objContents").style.height  = mapPaneBox.h - detailsBox.h;
		var myLatlng = new google.maps.LatLng(37.4419, -122.1419);

		//Set the map style
		var stylesArray = [{
			featureType: "all",
			elementType: "all",
			stylers: [
				{hue: "1"},
				{saturation: "10"},
				{lightness: "0"}
			]
		}];
		var myOptions = {
			zoom: currentZoom,
			center: myLatlng,
			mapTypeControlOptions: {
				mapTypeIds: [
					google.maps.MapTypeId.ROADMAP,
					google.maps.MapTypeId.SATELLITE
				]
			},
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			styles: stylesArray
		};
		map=new google.maps.Map(document.getElementById("map_canvas"),myOptions);

		//Change to the default style
		google.maps.event.addListenerOnce(map, "idle", function(){
			//loaded fully
			mapDone = 1;
			mapStyle(setting,checks);
		});

		//Create the new infoBox
		var addArrow=function(){
			this.arrow_ = document.createElement("div");
			this.arrow_.className = "customInputArrow";

			var border = document.createElement("div");
			border.className = "border";

			var fill = document.createElement("div");
			fill.className = "fill";

			this.arrow_.appendChild(border);
			this.arrow_.appendChild(fill);
			this.div_.appendChild(this.arrow_);
		};

		//detailWindow=new google.maps.InfoWindow({position: myLatlng, content:"Initial"});
		var infoOptions = {
			boxClass: "infoBox",
			closeBoxURL: "images/buttons/info_close.png",
			closeBoxMargin: "10px 10px -20px 0",
			alignBottom: true,
			pixelOffset: new google.maps.Size(-60, (-1*(iconScale()) - 19))
		};
		detailWindow=new InfoBox(infoOptions);
		google.maps.event.addListener(detailWindow,"domready",addArrow);

		editWindow=new InfoBox(infoOptions);
		google.maps.event.addListener(editWindow,"domready",addArrow);
		createEditContent();

		addWindow=new InfoBox(infoOptions);
		google.maps.event.addListener(addWindow,"domready",addArrow);
		createAddContent();

		//Add a right click event to the map, allowing the user to create a new marker
		google.maps.event.addListener(map,"rightclick",function(e){
			//console.log("clicky clicky!");
			markerAdd(e.latLng);
		});

		//Recalculate the pixel distance
		google.maps.event.addListener(map, "zoom_changed", function() {
			pixelDist();
			//If we have a transformWindow open, let"s make sure the X and Y values are updated
			if (thisMarker > 0) {
				moveX_input.set("value", (groups["id_"+CaseID[thisMarker]][1][0].transform.x * pixels.x));
				moveY_input.set("value", (groups["id_"+CaseID[thisMarker]][1][0].transform.y * pixels.y));
			}
		});

		if(cases.length === 0){
			window.alert("There are no records that match your query. Please edit your selection.");
		}
		else {
			var counter = collision.generate();
			//console.log("COLLISIONS GENERATED");
			counter.tot = totCount;

			//Update mapping counts
			var fields = {
				map: counter.map,
				non: counter.tot - counter.map,
				fat: counter.fat,
				inj: counter.map - counter.fat,
				tot: counter.tot
			};
			for (var f in fields) {
				dojo.byId(f+"Count").innerHTML = fields[f];
				dojo.byId(f+"Count_port").innerHTML = fields[f];
			}

			//Fit the map to the canvas boundary
			map.fitBounds(bounds);
			pixelDist();

			//Load a new polygon over the map - this layer will control the opacity; only for the Satellite view!
			mapTypeSwitch("#FFFFFF");
		}
	}
}
function mapTypeSwitch(color) {
	//Add event to initialize the opacity layer if the SATELLITE MapType is selected
	google.maps.event.addListener( map, "maptypeid_changed", function() {
		//If we are switching to "satellite" view, create a custom opacity cover layer
		if (map.getMapTypeId() === "satellite") {
			if (!window.opLayer) {
				var margin = 0.5;
				var edges = {
					latMin: bounds.getSouthWest().lat() - (margin/2),
					latMax: bounds.getNorthEast().lat() + (margin/2),
					lngMin: bounds.getSouthWest().lng() - margin,
					lngMax: bounds.getNorthEast().lng() + margin
				};

				var opCoords = [
					new google.maps.LatLng(edges.latMin, edges.lngMin),
					new google.maps.LatLng(edges.latMax, edges.lngMin),
					new google.maps.LatLng(edges.latMax, edges.lngMax),
					new google.maps.LatLng(edges.latMin, edges.lngMax)
				];

				var opacitySlider = dijit.byId("lightness").get("value")/100;
				opLayer = new google.maps.Polygon({
					paths: opCoords,
					strokeWeight: 0,
					fillColor: color,
					fillOpacity: opacitySlider,
					clickable: false
				});

				opLayer.setMap(map);

				//Hide the checkboxes in the bottom bar
				dijit.byId("streetNames").domNode.parentNode.style.visibility = "hidden";
				dijit.byId("landMarks").domNode.parentNode.style.visibility = "hidden";
				dijit.byId("grayScale").domNode.parentNode.style.visibility = "hidden";
			}
		}
		else {
			if (window.opLayer) {
				opLayer.setMap(null);
				delete window.opLayer;

				//Show the checkboxes in the bottom bar
				dijit.byId("streetNames").domNode.parentNode.style.visibility = "visible";
				dijit.byId("landMarks").domNode.parentNode.style.visibility = "visible";
				dijit.byId("grayScale").domNode.parentNode.style.visibility = "visible";
			}
		}
	});
}

//Simple: what to do when the map is resized
function mapResize(pan, offset) {
	//Get the current viewport data
	var center = map.getCenter();

	//Resize the map!
	google.maps.event.trigger(map, "resize");
	map.setCenter(center);

	//In some cases, the map needs to be panned a VERY small amount to prevent an error known as "phantom tiling" - this is a very hacky solution to that error...
	/*if (pan){
		if (!offset) {
			offset = .001;
		}
		map.panTo(new google.maps.LatLng(center.lat() + offset, center.lng() + offset));
		map.panTo(new google.maps.LatLng(center.lat() - offset, center.lng() - offset));
	}*/
}
/*
//New infoBubble for a user to manually input a new collision
function createInfoBox(type, openArgs){
	//Get the contents for this window from our hidden prototype
	var content = dojo.byId(type+"Prototype").innerHTML;
	//Create the new infoBubble
	var inputWindow = new window[type]({
		content: content,
		position: openArgs.position,
		alignBottom: true,
		maxWidth: 600,
		maxHeight: 600,
		disableAutoPan: true,
		boxClass: "inputWindow",
		idPrefix: "customInput" //Custom property, to differentiate the different types of infoBubbles we have on this page
	},openArgs);
	inputWindow.open(map, openArgs.marker);

	return inputWindow;
}
*/

function createEditContent(){
	var horizontalSlider = new dijit.form.HorizontalSlider({
        name: "slider",
        value: 0,
		minimum: 0,
		maximum: 360,
        intermediateChanges: true,
		discreteValues: 73,
        style: "width: 240px; margin:10px 10px 0 10px; float:left",
		showButtons: true//,
        //onChange: function(value){
			//rotateMarkers(value, that.crashIndex, this);
            //dom.byId("sliderValue").value = value;
        //}
    }, "slider");
	// reset rotation
	dojo.on(dijit.byId("resetButton"),"click",resetRotation);
	function resetRotation(){
		horizontalSlider.set("value", 0);
	}
	dojo.on(dijit.byId("doneButton"),"click",function(){
		editWindow.close();
	});
	var sliderRules = new dijit.form.HorizontalRule({
		container: "bottomDecoration",
		count: 5,
		style: "height: 4px; bottom: 1px;"
	}, "sliderRule");
	var sliderLabels = new dijit.form.HorizontalRuleLabels({
		container: "bottomDecoration",
		labelStyle: "font-style: italic; font-size: 0.75em",
		labels: ["0&#176;", "90&#176;", "180&#176;", "270&#176;", "360&#176;"],
		count: 5,
		minimum: 0,
		maximum: 360,
		constraints: {pattern: "###0."}
	}, "sliderLabel");
	editWindow.setContent(document.getElementById("editContent"));
}
var rotateHandler=null;
var deleteHandler=null;
function markerEdit(marker,index){
	if (detailWindow) detailWindow.close();
	if (addWindow) addWindow.close();

	if (rotateHandler) rotateHandler.remove();
	if (deleteHandler) deleteHandler.remove();

	var horizontalSlider=dijit.byId("slider");

	// get current angle from first party information
	var group = groups[index];
	var angle = group["1"]["0"].transform.rotation;

	horizontalSlider.set("value", parseInt(angle, 0));
	rotateHandler=dojo.on(horizontalSlider,"change",rotateCollision);
	function rotateCollision(value){
		//console.log(index + " " + value);
		rotateMarkers(value, index);
	}
	// delete collision
	deleteHandler=dojo.on(dijit.byId("deleteButton"),"click",deleteCollision);
	function deleteCollision(){
		for (var x in groups[index]) {
			for (var y in groups[index][x]) {
				markers[groups[index][x][y].key].setMap(null);
				markers.remove(groups[index][x][y].key);
				delete cases[index];
			}
			if (x === 0) {
				var severity = groups[index][0][0].details.sev;
			}
		}
		delete groups[index];
		//The collision has been successfully removed!  Update mapping summary
		editCrashSummary(severity, -1);
		editWindow.close();
	}

	editWindow.open(map,marker);
}
function createAddContent(){
	var severityOption=new dojo.store.Memory({
		idProperty: "value",
        data: [
			{label: "Injury", value: "4"},
			{label: "Fatal", value: "1"}
		]
	});
	var severityFilter=new dijit.form.FilteringSelect({
		placeHolder: "Collision Severity",
		searchAttr: "label",
		required: false,
		store: severityOption
	},"severityCombo");
	dojo.addClass(severityFilter.domNode, "filterStyle");
	var typeOption=new dojo.store.Memory({
		idProperty: "value",
		data: [
			{label: "A: Head-On", value: "A"},
			{label: "B: Sideswipe", value: "B"},
			{label: "C: Rear-end", value: "C"},
			{label: "D: Broadside", value: "D"},
			{label: "E: Hit Object", value: "E"},
			{label: "F: Overturned", value: "F"},
			{label: "G: Pedestrian Involved", value: "G"}
		]
	});
	var typeFilter=new dijit.form.FilteringSelect({
		placeHolder: "Collision Type",
		searchAttr: "label",
		required: false,
		store: typeOption,
		onChange: function(value){
			//In every scenario except F, the options for party 1 are the same
			if (value=="F"){
				dijit.byId("p1movementCombo").set("disabled", true);
			}
			else{
				dijit.byId("p1movementCombo").set("disabled", false);
			}
			//For crash type G and E, the second party is automatically just opposite of the first, so no user input for those
			if(value=="G" || value=="E"){
				dojo.query("div[id^='widget_p2']|.filterStyle").forEach(function(node){
					dijit.getEnclosingWidget(node).set("disabled", true);
				});
			}
			else{
				dojo.query("div[id^='widget_p2']|.filterStyle").forEach(function(node){
					dijit.getEnclosingWidget(node).set("disabled", false);
				});
			}
		}
	},"typeCombo");
	dojo.addClass(typeFilter.domNode, "filterStyle");
	var movementOption=new dojo.store.Memory({
		idProperty: "value",
		data: [
			{label: "A: Stopped", value: "A"},
			{label: "B: Proceeding Straight", value: "B"},
			{label: "C: Ran Off Road", value: "C"},
			{label: "D: Making Right Turn", value: "D"},
			{label: "E: Making Left Turn", value: "E"},
			{label: "F: Making U-Turn", value: "F"},
			{label: "O: Parked", value: "O"}
		]
	});
	var p1movementFilter=new dijit.form.FilteringSelect({
		placeHolder: "Party1 Movement",
		searchAttr: "label",
		required: false,
		store: movementOption
	},"p1movementCombo");
	dojo.addClass(p1movementFilter.domNode, "filterStyle");
	var p2movementFilter=new dijit.form.FilteringSelect({
		placeHolder: "Party2 Movement",
		searchAttr: "label",
		required: false,
		store: movementOption
	},"p2movementCombo");
	dojo.addClass(p2movementFilter.domNode, "filterStyle");
	var directionOption=new dojo.store.Memory({
		idProperty: "value",
		data: [
			{label: "North", value: "N"},
			{label: "East", value: "E"},
			{label: "South", value: "S"},
			{label: "West", value: "W"}
		]
	});
	var p1directionFilter=new dijit.form.FilteringSelect({
		placeHolder: "Party1 Direction",
		searchAttr: "label",
		required: false,
		store: directionOption
	},"p1directionCombo");
	dojo.addClass(p1directionFilter.domNode, "filterStyle");
	var p2directionFilter=new dijit.form.FilteringSelect({
		placeHolder: "Party2 Direction",
		searchAttr: "label",
		required: false,
		store: directionOption
	},"p2directionCombo");
	dojo.addClass(p2directionFilter.domNode, "filterStyle");
	var partyTypeOption=new dojo.store.Memory({
		idProperty: "value",
		data: [
			{label: "Driver", value: "1"},
			{label: "Bicyclist", value: "4"}
		]
	});
	var p1typeFilter=new dijit.form.FilteringSelect({
		placeHolder: "Party1 Type",
		searchAttr: "label",
		required: false,
		store: partyTypeOption
	},"p1partyCombo");
	dojo.addClass(p1typeFilter.domNode, "filterStyle");
	var p2typeFilter=new dijit.form.FilteringSelect({
		placeHolder: "Party2 Type",
		searchAttr: "label",
		required: false,
		store: partyTypeOption
	},"p2partyCombo");
	dojo.addClass(p2typeFilter.domNode, "filterStyle");

	dijit.byId("cancelButton").on("click",function(){
		initializeFilter();
		addWindow.close();
	});
	addWindow.setContent(document.getElementById("addContent"));
	dojo.query(".filterStyle").forEach(function(node){
		dijit.getEnclosingWidget(node).on("change",function(){
			if(document.getElementById("addMessage") !== null){
				document.getElementById("addMessage").innerHTML="";
			}
		});
	});
}
function initializeFilter(){
	// reset filteringselect when it is reloaded
	dojo.query(".filterStyle").forEach(function(node){
		dijit.getEnclosingWidget(node).set("value","");
		dijit.getEnclosingWidget(node).set("disabled", false);
	});
}
var count=0;
function markerAdd(position){
	if (editWindow) editWindow.close();
	if (detailWindow) detailWindow.close();

	initializeFilter();
	addWindow.setPosition(position);
	addWindow.open(map);
	dijit.byId("addButton").on("click",function(e){
		e.stopPropagation();
		var userInputs = {
			crashType: dijit.byId("typeCombo").get("value"),
			crashSeverity: dijit.byId("severityCombo").get("value"),
			direction: {},
			movement: {},
			party: {}
		};
		dojo.query("div[id^='widget_p']|.filterStyle").forEach(function(node){
			var id=dijit.getEnclosingWidget(node).id.replace("Combo","");
			var partyNum=id.substring(1,2);
			var fieldType=id.substring(2);
			userInputs[fieldType][partyNum] = dijit.getEnclosingWidget(node).get("value");
		});
		if(mapCollision(userInputs)){
			//The collision has been successfully mapped!  Update mapping summary
			editCrashSummary(userInputs.crashSeverity, 1);

			initializeFilter();
			addWindow.close();
		}
		else{
			document.getElementById("addMessage").innerHTML="This combination is not available.";
		}
	});
	mapCollision = function(userInputs) {
		count++;
		var thisCase = {
			id: "manual"+count,
			x: position.lng(),
			y: position.lat(),
			crashType: userInputs.crashType,
			crashSeverity: userInputs.crashSeverity,
			movement: [],
			direction: [],
			party: []
		};
		var props = ["movement", "direction", "party"];
		for (var x in props) {
			thisCase[props[x]].push(userInputs[props[x]][1]);
			if (userInputs[props[x]][2]){
				thisCase[props[x]].push(userInputs[props[x]][2]);
			}
		}
		// special case for overturned: First car is always at fault.
		if(thisCase.crashType=="F") {
			thisCase.atFault=new Array("Y","N");
		}
		if(thisCase.crashType=="G") {
			thisCase.movement.push("");
			thisCase.direction.push("");
			thisCase.party.push("2")
		}
		cases["id_"+thisCase.id] = thisCase;

		return collision.mapCollision(thisCase, /*dojo.byId("showInvalid").checked*/ false, true);
	};
}

//Get the pop-up data
function markerInfo(marker,index){
	if (editWindow) editWindow.close();
	if (addWindow) addWindow.close();

	var custom=index.indexOf("manual");
	var thisCase = cases[index];
	var thisId = index.split("_");

	var makeInfoSection = function(headers, fields) {
		var html = "";
		if (headers instanceof Array) {
			for (var h in headers) {
				html += "<div class='infoHeadParty'>"+headers[h]+"</div>";
			}
		} else {
			html += "<div class='infoHead'>"+headers+"</div>";
		}

		var rows = Math.ceil(fields.length/2) - 1;
		var inc = 0;
		for (var f = 0; f <= rows; f++) {
			html += "<div class='infoText'>"+fields[f].title+": "+fields[f].data+"</div>";
			inc = f + rows + 1;
			if (fields[inc]) {
				html += "<div class='infoText'>"+fields[inc].title+": "+fields[inc].data+"</div>";
			} else {
				html += "<div class='infoText'>&nbsp;&nbsp;&nbsp;&nbsp;</div>";
			}
		}
		return html;
	};
	var bubble = "<div class='infoWin' style='width:460px'>";
	var partyHeader = "Party 1";
	var partyInfo;
	if(custom == -1){
		bubble += "<div class='infoTitle'>CASEID: " + thisId[1] + "</div>";
		bubble += "<div class='infoMain'>";

		bubble += makeInfoSection("Collision Details", [
			{title: "Date", data: thisCase.date},
			{title: "Severity", data: thisCase.sev},
			{title: "Pedestrian", data: (thisCase.ped) ? thisCase.ped : "N"},
			{title: "Bicycle", data: (thisCase.bic) ? thisCase.bic : "N"},
			{title: "Motorcycle", data: (thisCase.mc) ? thisCase.mc : "N"},
			{title: "Truck", data: (thisCase.truck) ? thisCase.truck : "N"}
		]);
		bubble += "</div><div class='infoMain'>";
		bubble += makeInfoSection("Collision Location", [
			{title: "Primary", data: thisCase.prim},
			{title: "Secondary", data: thisCase.second},
			{title: "Intersection", data: thisCase.intersect},
			{title: "Offset Distance & Direction", data: thisCase.dist + " " + thisCase.dir},
			//{title: "Offset Direction", data: thisCase.dir},
			{title: "Highway", data: thisCase.highway},
			{title: "Route", data: thisCase.route},
			{title: "Postmile", data: thisCase.postmile},
			{title: "Crash Type", data: iconType[thisCase.crashType].name}
		]);

		partyInfo = [
			{title: "Movement", data: switrsText.movement[thisCase.movement[0]]},
			{title: "Direction", data: switrsText.direction[thisCase.direction[0]]},
			{title: "Party Type", data: switrsText.party[thisCase.party[0]]},
			{title: "Vehicle Type", data: switrsText.vehType[thisCase.vehType[0]]}
		];
		if (thisCase.movement[1]) {
			partyHeader = [partyHeader, "Party 2"];
			partyInfo = partyInfo.concat([
				{title: "Movement", data: switrsText.movement[thisCase.movement[1]]},
				{title: "Direction", data: switrsText.direction[thisCase.direction[1]]},
				{title: "Party Type", data: switrsText.party[thisCase.party[1]]},
				{title: "Vehicle Type", data: switrsText.vehType[thisCase.vehType[1]]}
			]);
		}
		bubble += "</div><div class='infoMain'>";
		bubble += makeInfoSection(partyHeader, partyInfo);
		bubble += "</div>";
	}
	else{
		bubble += "<div class='infoTitle'>User Inputted Collision</div>";
		bubble += "<div class='infoMain'>";
		partyInfo = [
			{title: "Movement", data: switrsText.movement[thisCase.movement[0]]},
			{title: "Direction", data: switrsText.direction[thisCase.direction[0]]},
			{title: "Party Type", data: switrsText.party[thisCase.party[0]]}
		];
		if (thisCase.movement[1]) {
			partyHeader = [partyHeader, "Party 2"];
			partyInfo = partyInfo.concat([
				{title: "Movement", data: switrsText.movement[thisCase.movement[1]]},
				{title: "Direction", data: switrsText.direction[thisCase.direction[1]]},
				{title: "Party Type", data: switrsText.party[thisCase.party[1]]}
			]);
		}
		bubble += "</div><div class='infoMain'>";
		bubble += makeInfoSection(partyHeader, partyInfo);
		bubble += "</div>";
	}
	//Close any open transformWindows
	/*
	google.maps.event.addListener(detailWindow,'domready',function(){
		if (transformWindow) {
			var transformer = dojo.byId('transformer');
			transformer.style.display = 'none';
			dojo.byId('hidden').appendChild(transformer);
			transformWindow.close();
			thisMarker = 0;
		}
	});
	*/
	//Display
	detailWindow.setContent(bubble);
	detailWindow.open(map,marker);
}

var thisMarker;
//Get the transform window
/*
function markTransform(marker,index){
	//Ensure that this window's opening closes all other transformWindows...
	if (transformWindow) {
		var oldWindow = transformWindow;
	}

	//Create a bubble for window content
	var bubble = document.createElement("div");
	transformWindow = new google.maps.InfoWindow({
      content: bubble,
	  maxWidth: 420
    });

	//Make sure it closes properly when the time comes!
	google.maps.event.addListener(transformWindow,'closeclick',function(){
		killTransform();
	});

	//Close all other open windows
	google.maps.event.addListener(transformWindow,'domready',function(){
		if (detailWindow) {
			detailWindow.close();
		}
		if (oldWindow) {
			oldWindow.close();
		}
	});

	//Populate the content
	var transformer = dojo.byId('transformer');
	fillTransformer(index);
	thisMarker = index;
	bubble.appendChild(transformer);
	transformer.style.display = 'block';

	//Display
	transformWindow.open(map,marker);
}

//Close the transform dialog
function killTransform(){
	var transformer = dojo.byId('transformer');
	transformer.style.display = 'none';
	dojo.byId('hidden').appendChild(transformer);
	thisMarker = 0;
}
*/
//Change the crash summary counts when a crash is added/deleted
function editCrashSummary(severity, value){
	if (severity == 1) {
		dojo.byId("fatCount").innerHTML = parseInt(dojo.byId("fatCount").innerHTML, 0) + value;
		dojo.byId("fatCount_port").innerHTML = parseInt(dojo.byId("fatCount_port").innerHTML, 0) + value;
	} else {
		dojo.byId("injCount").innerHTML = parseInt(dojo.byId("injCount").innerHTML, 0) + value;
		dojo.byId("injCount_port").innerHTML = parseInt(dojo.byId("injCount_port").innerHTML, 0) + value;
	}
	dojo.byId("mapCount").innerHTML = parseInt(dojo.byId("mapCount").innerHTML, 0) + value;
	dojo.byId("mapCount_port").innerHTML = parseInt(dojo.byId("mapCount_port").innerHTML, 0) + value;
	dojo.byId("totCount").innerHTML = parseInt(dojo.byId("totCount").innerHTML, 0) + value;
	dojo.byId("totCount_port").innerHTML = parseInt(dojo.byId("totCount_port").innerHTML, 0) + value;
}