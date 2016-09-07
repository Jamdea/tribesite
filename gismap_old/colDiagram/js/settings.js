function iconScale(value) {
	if (value) {
		//This is a setter - recalculate the scalars, and redraw all the collisions
		arrowScale = value/2;
		scalar = 5 * value;
		//collision.clear();
		collision.generate();
	} else {
		//Just a getter - return the current scalar value
		return scalar;
	}
}

//Gather all the style info; that means iterating through sliders, radios, and checkboxes
function mapStyle(setting, checks) {
	var newStyle = [];
	var nextSet = [];
	
	if (window.opLayer) {
		opLayer.setOptions({fillOpacity: setting.lightness/100});  
	}
	
	//Change the grayscale value
	if(checks.grayScale === true) {
		setting.saturation = -100;
	} else {
		setting.saturation = 0;
	}
	
	//Add checkbox options
	for (var x in checks) {
		nextSet = window[x](checks[x], setting);
		for (var y in nextSet) {
			newStyle.push(nextSet[y]);
		}
	}
	
	//Set the new style
	map.setOptions( {styles: newStyle} );
	
	//Return with thew new HSL settings
	return setting;
}

//Set a new map style
function oldmapStyle(newStyle) {
	//console.log(newStyle);
	map.setOptions( {styles: newStyle} );
}

//Turn landmarks on and off
function landMarks(val, setting) {
	if (mapDone == 1) {
		//Figure out if we're turning things on or off
		var vis = "off";
		if (val === true) {
			vis = "on";
		}
		var newStyle = [
			{
				featureType: "poi",
				elementType: "labels",
				stylers: [ 
					{visibility: vis}
				]
			}, {
				featureType: "landscape",
				elementType: "labels",
				stylers: [ 
					{visibility: vis}
				]
			}, {
				featureType: "transit",
				elementType: "labels",
				stylers: [ 
					{visibility: vis}
				]
			} 
		];
		return newStyle;
		
	} else {
		return;
	}
}

//Turn landmarks on and off
function streetNames(val, setting) {
	if (mapDone == 1) {
		//Figure out if we"re turning things on or off
		var vis = "off";
		if (val === true) {
			vis = "on";
		}
		var newStyle = [
			{
				featureType: "administrative",
				elementType: "labels",
				stylers: [ 
					{visibility: vis}
				]
			}, {
				featureType: "road",
				elementType: "labels",
				stylers: [ 
					{visibility: vis}
				]
			}
		];
		return newStyle;
		
	} else {
		return;
	}
}

//Turn landmarks on and off
function grayScale(val, setting) {
	if (mapDone == 1) {
		var newStyle = [
			{
				featureType: "all",
				elementType: "all",
				stylers: [ 
					{hue: setting.hue},
					{saturation: setting.saturation},
					{lightness: setting.lightness}
				]
			}
		];
		return newStyle;
		
	} else {
		return;
	}
}

//Change the background maps HSL ratings
function lightness(light, setting) {
	if (mapDone == 1) {
		var newHSL = [
			{
				featureType: "all",
				elementType: "all",
				stylers: [ 
					{hue: setting.saturation},
					{saturation: setting.saturation},
					{lightness: light}
				]
			}
		];
		return newHSL;
		
	} else {
		return;
	}
}

//Show and hide the loadScreen
function loadScreen(duration, type, id) {
	var overlay = dojo.byId("loadingOverlay");
	//If we are flashing the loadScreen (ie, turning it off and on), halve the duration
	if (type === "flash") {
		duration = duration/4;
	}
	
	//Show the loadScreen
	if (type === "show" || type === "flash") {
		//Display the appropriate note
		if (id) {
			dojo.byId(id).style.display = "block";
		}
		
		overlay.style.opacity = 0;
		overlay.style.display = "block";
		fadeIn = dojo.fadeIn({
			node: overlay,
			duration: duration,
			onEnd: function () {
				//Hide the loadScreen
				overlay.style.display = "block";
			}
		});
		fadeIn.play();
	}
	
	//Hide the loadScreen
	if (type === "hide" || type === "flash") {
		setTimeout(function() {
			fadeOut = dojo.fadeOut({
				node: overlay,
				duration: duration/2,
				onEnd: function () {
					//Hide the loadScreen
					overlay.style.display = "none";
					//Make sure to hide all the "loadNote" divs as well
					/*
					var loadNote = dojo.query(".loadNote");
					for (var x in loadNote) {
						loadNote[x].style.display = "none";
					}
					*/
				}
			});
			fadeOut.play();
		}, duration/2);
	}
}

//Convert the page to a printable format, and print it!
function changeView(type) {
	//var orient = "orientPortrait";
	var nodes = {};
	nodes.mapPane = dijit.byId("mapPane");
	nodes.mapBox = dojo.byId("objContents");
	nodes.dateArea = dojo.byId("dateArea");
	nodes.printSettings = dojo.byId("printSettings");
	//nodes.settings = dojo.byId("settingPane");
	nodes.settings = dojo.byId("workingSettings");
	
	nodes.detailsPort = dijit.byId("details_port");
	nodes.detailsLand = dijit.byId("details_land");
	
	//Are we closing the printView, or opening it?
	if (type === "print") {
		sidebar(dijit.byId("toggleButton"), 300, true);
	
		//After the sidebar has collapsed, create the print preview
		setTimeout(function () {
			orientPrint(nodes, 300);
		}, 400);
	} else {
		orientWorking(nodes, 300);
	}
}

//Re-organize the map to print in portrait mode
function orientPrint(nodes, duration) {
	//Resize the mapPane
	dojo.animateProperty({
		node: nodes.mapPane.domNode,
		duration: duration,
		properties: { 
			width: { end: "680", units: "px" }, 
			height: { end: "915", units: "px" } 
		},
		onEnd: function() {
			//console.log(nodes);
			//Remove the sidebar, add the print details on top
			nodes.mapPane.resize();
			nodes.mapPane.layout();			
			var hidden = nodes.detailsLand.domNode;
			nodes.dateArea.style.display = "block";
			nodes.settings.style.display = "none";
			nodes.mapPane.removeChild(nodes.detailsLand);
			dojo.place(hidden, dojo.byId("hidden")); 
			nodes.mapPane.addChild(nodes.detailsPort);
			
			//Animate the top details area open
			dojo.animateProperty({
				node: nodes.detailsPort.domNode,
				duration: duration,
				properties: { 
					height: { end: "207", units: "px" }
				},
				onEnd: function(){
					//Resize and redraw the map
					var controls = ["mapType", "pan", "streetView", "zoom"];
					for (var k in controls) {
						map.set(controls[k]+"Control", false);
					}
					dojo.animateProperty({
						node: "printPane",
						duration: duration,
						properties: { 
							width: { end: "680", units: "px" },
							height: { end: "915", units: "px" },
							padding: { end: "30", units: "px" },
							marginTop: { end: "10", units: "px" }
						}
					}).play();							
					//Commit the resize
					nodes.mapPane.resize();
					nodes.mapPane.layout();
					new mapResize(true);
					nodes.printSettings.style.visibility = "visible";
				}
			}).play();
		}
	}).play();
}

//Re-organize the map to print in landscape mode
function orientWorking(nodes, duration) {
	//Reopen the settings
	nodes.printSettings.style.visibility = "hidden";
	nodes.dateArea.style.display = "none";
	nodes.settings.style.display = "block";

	//Animate the top details area open
	dojo.animateProperty({
		node: nodes.detailsPort.domNode,
		duration: duration,
		properties: { 
			height: { end: "0", units: "px" }
		},
		onEnd: function(){
			//Remove the sidebar, add the print details on top
			var hidden = nodes.detailsPort.domNode;
			
			nodes.mapPane.removeChild(nodes.detailsPort);
			dojo.place(hidden, dojo.byId("hidden")); 
			nodes.mapPane.addChild(nodes.detailsLand);
			nodes.mapPane.resize();
			nodes.mapPane.layout();
			
			dojo.animateProperty({
				node: "printPane",
				duration: duration,
				properties: { 
					width: { start: "0",end: "100", units: "%" },
					height: { start: "0",end: "100", units: "%" },
					padding: { start: "30",end: "0", units: "px"},
					marginTop: { start: "10",end: "0", units: "px"}
				},
				onEnd: function(){
					//Resize the dojo bordercontainer
					nodes.mapPane.domNode.style.width="100%";
					nodes.mapPane.domNode.style.height="100%";
					nodes.mapPane.resize();
					nodes.mapPane.layout();
					sidebar(dijit.byId("toggleButton"), 300, false);
					setTimeout(function () {
						getNewHeight();
					}, 400);					
					//Resize the map
					var controls = ["mapType", "pan", "streetView", "zoom"];
					for (var k in controls) {
						map.set(controls[k]+"Control", true);
					}
				}
			}).play();
		}
	}).play();
}
/*
//Make sure the input fields in the print view and working view are identical
function syncInputs(working) {
	var inputs = ["primary", "secondary", "period", "agency"];
	if (working) {
		for (var x in inputs) {
			dojo.byId(inputs[x]).value = dojo.byId(inputs[x]+"_print").value;
		}
	} else {
		for (x in inputs) {
			dojo.byId(inputs[x]+"_print").value = dojo.byId(inputs[x]).value;
		}
	}
}
*/
//Collapse and expand the details view on the left
function sidebar(icon, duration, collapse){
	//First thing is absolutely first - change the iconClass
	var title = dojo.byId("pageTitle");
	//var leftBox = dijit.byId("details_land").domNode;
	//var leftBox = dojo.byId("accord_land");
	var content = dojo.byId("pageBottom");
	var mapP = dijit.byId("mapPane");
	//var rightBox = dijit.byId("objContents").domNode
	
	if (collapse) {
		//We need to collapse the sidebar
		var step1=dojo.animateProperty({
			node: "details_land",
			duration: duration,
			properties: { width: { end: "40", units: "px" } },
			onEnd: function(){
				mapP.resize();
				mapP.layout();
				//Resize the map
				new mapResize();
				title.style.display ="none";
				content.style.display="none";
				//console.log("sidebar collapsed"); 
				
				icon.set("iconClass","expandButton");
				icon.set("showLabel",false);
				dijit.byId("printPreviewButton").set("showLabel",false);
				//console.log("The current iconClass is "+icon.get("iconClass"));		
			}
		}).play();
	} else {
		//We need to expand the sidebar
		//leftBox.style.borderBottom = "1px solid #CDCDCD";
		
		var moveLeft=dojo.animateProperty({
			node: "details_land",
			duration: duration,
			properties: { width: { start: "40",end: "290", units: "px" } },
			onEnd: function(){
				mapP.resize();
				mapP.layout();
			
				title.style.display = "block";
				content.style.display="block";
				//Resize the map
				new mapResize();
				//console.log("sidebar expanded");
				
				icon.set("iconClass","collapseButton");
				icon.set("showLabel",true);
				dijit.byId("printPreviewButton").set("showLabel",true);
			}
		}).play();		
	}
}
// Titlepane scrollbar max height control
function getNewHeight(){
	var top=dojo.style("details_land","height");
	var title=dojo.style("pageHeader","height");
	var newHeight=top-title;
	dojo.style("pageBottom","maxHeight",newHeight + "px");
}