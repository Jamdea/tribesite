//Load dojo widgets
dojo.require("dojo.on");
dojo.require("dijit.TitlePane");

dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
//dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.store.Memory");
//dojo.require("dojo.data.ObjectStore");
//dojo.require("dijit.form.Select");
//dojo.require("dijit.Dialog");
//dojo.require("dijit.form.Slider");
dojo.require("dijit.form.HorizontalSlider");
dojo.require("dijit.form.HorizontalRule");
dojo.require("dijit.form.HorizontalRuleLabels");
//dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.CheckBox");
//dojo.require("dijit.form.Select");
//dojo.require("dijit.form.NumberTextBox");
//dojo.require("dojo.NodeList-traverse");

//Set up dojo browser history management
/*
dojo.require("dojo.hash");
dojo.subscribe("/dojo/hashchange", function(hash) {
	console.log("New hash state: "+hash);
	if(hash == "print"){
		//If the new hash is "print," go the printView
		changeView("print");
	} else {
		//The new hash is not "print;" show the workingView
		changeView();
	}
});
*/
//Some stuff to do when the body loads...
dojo.ready(function() {
	//Options
	var setting = {hue: 1, saturation: 1, lightness: 0};
	var checks = {streetNames: false, landMarks: false, grayScale: false};
	var selects = [
		{//Print orientation dropdown
			name: "printOrient",
			opts: {
				Portrait: "orientPortrait",
				Landscape: "orientLandscape"   
			},
			value: "Portrait"
		}
	];
	var options = {};
	
	//Create the lightness slider
	options.lightness = new dijit.form.HorizontalSlider({
		name: "lightness",
		value: setting.lightness,
		minimum: 0,
		maximum: 100,
		intermediateChanges: true,
		discreteValues: 21,
		style: "width: 140px; float: left;",
		onChange: function(value) {
			setting[this.name] = value;
			setting = mapStyle(setting, checks);
		}
	}, "lightness");
	//Create the iconScale slider
	options.iconScale = new dijit.form.HorizontalSlider({
		name: "iconScale",
		value: 1.5,
		minimum: 1,
		maximum: 2,
		intermediateChanges: true,
		discreteValues: 9,
		style: "width: 100px; float: left;",
		onChange: function(value) {
			window[this.name](this.value);
		}
	}, "iconScale");
	
	//Create the checkboxes
	for (var x in checks){
		options[x] = new dijit.form.CheckBox({
			name: x,
			value: 1,
			checked: checks[x],
			onChange: function(b) {
				checks[this.name] = this.checked;
				setting = mapStyle(setting, checks);
			}
		}, x);
	}
	/*options["showInvalid"] = new dijit.form.CheckBox({
		name: "showInvalid",
		value: 1,
		checked: false,
		onChange: function(b) {
			//Hide/show all the "expanded" fields in the legend
			dojo.query(".legend_expanded").forEach( function(expanded){
				expanded.style.visibility = "visible";
			});
			//Regenerate the collisions
			collision.generate();
		}
	}, "showInvalid");*/

	// Collapse and expand
	var toggleB = new dijit.form.Button({
		iconClass: "collapseButton",
		showLabel: true,
		label: "Hide",
		onClick: function() {
			if (this.iconClass === "collapseButton") {
				sidebar(this, 500, true);
			} else {
				sidebar(this, 500);
			}
		}
	}, "toggleButton");
	//dojo.addClass("toggleButton","redButton");
	
	// The workingView button
	var workingViewB = new dijit.form.Button({
		iconClass: "exitPrintPreviewButton",
		label: "Exit Print Preview",
		onClick: function() {
			/*
			if (dojo.hash() != "working") {
				dojo.hash("working");
			} else {
				changeView();
			}
			*/
			changeView();
		}
	}, "workingView");
	
	// The print preview button
	var printPreviewB = new dijit.form.Button({
		iconClass: "printPreviewButton",
		showLabel: true,
		label: "Print Preview",
		onClick: function() {
			/*
			if (dojo.hash() != "print") {
				dojo.hash("print");
			} else {
				changeView("print");
			}
			*/
			changeView("print");
		}
	}, "printPreviewButton");
	//dojo.addClass("printPreviewButton","redButton");
	
	// The save button
	/*var saveButton = new dijit.form.Button({
		iconClass: "saveButton",
		onClick: function() {
			//saveMap();
		}
	}, "saveButton");
	saveButton.addClass("redButton");*/
	
	// The print button
	var printB = new dijit.form.Button({
		iconClass: "printButton",
		label: "Print",
		onClick: function() {
			window.print();
		}
	}, "printButton");
	
	//Filtering checkboxes
	var filters = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
	for (x in filters){
		options[x] = new dijit.form.CheckBox({
			name: "filter" + filters[x],
			value: filters[x],
			checked: true,
			onChange: function(b) {
				iconType[this.value].visible = b;
				//collision.generate();
				/*
				for (var index in cases) {
					if (!cases.hasOwnProperty(index)) {
						//The current property is not a direct property of p
						continue;
					}
					//Do your logic with the property here
					if(cases[index].crashType==this.value){
						console.log(index);
						
						for (var x in groups[index]) {
							for (var y in groups[index][x]) {
								this.checked ? markers[groups[index][x][y].key].setMap(map) : markers[groups[index][x][y].key].setMap(null);
							}
							if (x == 0) {
								var severity = groups[index][0][0].details.sev;
							}
						}							
						this.checked ? editCrashSummary(severity, 1) : editCrashSummary(severity, -1);
					}
				}
				*/
				for (var index in groups) {
					if (!groups.hasOwnProperty(index)) {
						//The current property is not a direct property of p
						continue;
					}
					//Do your logic with the property here
					var crashType=cases[index].crashType;
					if(crashType==this.value){
						//console.log(index);
						
						for (var x in groups[index]) {
							for (var y in groups[index][x]) {
								this.checked ? markers[groups[index][x][y].key].setMap(map) : markers[groups[index][x][y].key].setMap(null);
							}
							if (x === 0) {
								var severity = groups[index][0][0].details.sev;
							}
						}
						this.checked ? editCrashSummary(severity, 1) : editCrashSummary(severity, -1);
					}
				}
			}
		}, "filter" + filters[x]);
	}

	//Add watchers to the landscape and print out text fields
	var updateFields = function(e) {
		var splitId = e.target.id.split("_");
		if (splitId.length > 1) {
			dojo.byId(splitId[0]).value = e.target.value;
		} else {
			dojo.byId(splitId[0]+"_print").value = e.target.value;
		}
	};
	var fields = ["primary", "secondary", "period", "agency"];
	for (x in fields){
		dojo.connect(dojo.byId(fields[x]), "onchange", updateFields);
		dojo.connect(dojo.byId(fields[x]+"_print"), "onchange", updateFields);
	}
	
	//Unhide everything
	//dojo.byId("settingPane").style.visibility = "visible";

	//window.onload = initialize(setting, checks));	
	/*
	google.maps.event.addDomListener(window, "load", setTimeout(function(){
		initialize(setting, checks);
	}, 2000));
	*/
	getNewHeight();
	
	initialize(setting, checks);
	dojo.on(window, "resize", function(){
		clearTimeout(this.id);
		this.id = setTimeout(getNewHeight, 500);	
	});	
	//new loadScreen(5000, "hide"); 
	new loadScreen(1, "hide"); 
});