/*
Address Tool
*/
function createSearchTool(){
	//add the toolbar section that holds the search tool
	var wrapperDiv = dojo.create('div',{id:'searchWrapper'},dojo.byId('toolbar-right'));
	dojo.addClass('searchWrapper','searchwrapper');
	var searchInput = dojo.create('input',{id:'searchField',type:'text',placeholder: 'Find address or place',onkeydown: function(e) {if(e.keyCode === 13){findLocation();}}},wrapperDiv);
	dojo.addClass(dojo.byId('searchField'),'searchbox');
    
	dojo.create('input',{type:'image',id:'blankImage',src:'images/blank.gif'},wrapperDiv);
	dojo.connect(dojo.byId('blankImage'),'onclick',function(){findLocation();});
	dojo.addClass(dojo.byId('blankImage'),'searchbutton');
    
	//add placeholder for browsers that don't support (IE)
	if (!supportsPlaceholder()) {
		var search = dojo.byId("searchField");
		var text_content = 'Find address or place';

		search.style.color = "gray";
		search.value = text_content;
		search.onfocus = function () {
			if (this.style.color === "gray") {
				this.value = "";
				this.style.color = "black";
			}
		};
		search.onblur = function () {
			if (this.value === "") {
				this.style.color = "gray";
				this.value = text_content;
			}
		};
	} 
	//dojo.on(locator, "address-to-locations-complete", showResults);
}
//determine if the browser supports HTML5 input placeholder
function supportsPlaceholder() {
	var i = document.createElement('input');
	return 'placeholder' in i;
}	
function showResults(candidates) {
	var candidate;
	var geom;
	//hide the info window if displayed
	if(map.infoWindow.isShowing){
		map.infoWindow.hide();
	}
	var zoomExtent;
	dojo.every(candidates, function (candidate) {
		if (candidate.score > 80) {
			geom = candidate.location;
			map.infoWindow.setTitle('Find address or place');
			map.infoWindow.setContent(candidate.address);
			map.infoWindow.show(geom);
			//zoomExtent = new esri.geometry.Extent(geom.extentcandidate.attributes.West_Lon, candidate.attributes.South_Lat,candidate.attributes.East_Lon, candidate.attributes.North_Lat, new esri.SpatialReference({wkid:4326}));
			//zoomExtent = new esri.geometry.Extent(candidate.attributes.Xmin,candidate.attributes.Ymin,candidate.attributes.Xmax,candidate.attributes.Ymax);
			zoomExtent = new esri.geometry.Extent(candidate.attributes.X+0.2,candidate.attributes.Y-0.2,candidate.attributes.X-0.2,candidate.attributes.Y+0.2);
			//console.log(zoomExtent.toJson());
			return false; //break out of loop after one candidate with score greater  than 80 is found.
		}
	});
	if (geom !== undefined) {
		map.setExtent(esri.geometry.geographicToWebMercator(zoomExtent));
	}else{
		//no matches found
		dojo.byId('searchField').value = 'Location not found';
	}
}		
//use the locator to find the input location
function findLocation() {
	//clear any existing map graphics
	map.graphics.clear();
	locator.outSpatialReference= map.spatialReference;
	var address = {"SingleLine":dojo.byId("searchField").value};

	var options = {
		address:address,
		outFields:["*"]
	};
	locator.addressToLocations(options, showResults);
}