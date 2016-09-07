//Move all the markers in a group to a new position
function translateMarkers(end, index, drag) {
	var group = groups[index];
	var marker, diff;
	
	//Retrive the original coordinates and update the transform settings on the center dot
	var origin = {"lng": group[0][0].original.x, "lat": group[0][0].original.y};
	var trans = {"lng": group[0][0].transform.x, "lat": group[0][0].transform.y};
	
	//Make sure both the latitude and longitude for the endpoint are set; if not, use the existing values
	for (var key in origin) {
		if (end[key]) {
			if (!drag) {
				end[key] = parseFloat(end[key]) + parseFloat(origin[key]);
			}
		} else {
			end[key] = parseFloat(trans[key] + origin[key]);
		}
	}
	var latlng = new google.maps.LatLng(end.lat, end.lng);
	
	for (var a in group) {
		for (var b in group[a]) {
			markers[group[a][b].key].setPosition(latlng);
			group[a][b].transform.x = end.lng - origin.lng;
			group[a][b].transform.y = end.lat - origin.lat;
		}
	}
	
	//Record any changes we"ve made in this group
	groups[index] = group;
}

//Move all the markers in a group to a new position
/*
function rotateMarkers(angle, index, rotator) {
	var group = groups[index];
	var marker, rotation, symbols, counter;
	
	//Make sure the values are set to round properly
	angle = Math.round(angle/round["rotator"])*round["rotator"];
	if (rotator) {
		rotator.set("value", parseInt(angle));
		//rotator_input.set("value", parseInt(angle));
	}

	for (var a in group) {
		if (a !== 0) {
			//Anything that"s NOT the zero value is a party icon
			marker = group[a][0];
			rotation = marker["original"]["rotation"] + angle;
			//Make sure the angle is between 0 and 360 (ex, 450 degrees becomes 90 degrees)
			if (rotation >= 360) {
				//angle = angle%360;
				rotation -= 360;
			} else if (rotation < 0) {
				rotation = 360 - (Math.Abs(rotation)%360);
			}
			//Make the new symbols
			symbols = collision.makeVector(a, marker["details"], rotation);
			//Make sure to store the transformation for this marker!
			for (var b in group[a]) {
				markers[group[a][b]["key"]].setIcon(symbols[b]);
				group[a][b]["transform"]["rotation"] = angle;
			}
		}
	}
	
	//Record any changes we"ve made in this group
	groups[index] = group;
}
*/
function rotateMarkers(angle, index) {
	var group = groups[index];
	var marker, rotation, symbols, counter;
	
	//Make sure the values are set to round properly
	angle = Math.round(angle/round.rotator)*round.rotator;
	for (var a in group) {
		if (a !== "0") {
			//Anything that"s NOT the zero value is a party icon
			marker = group[a][0];
			rotation = marker.original.rotation + angle;
			//Make sure the angle is between 0 and 360 (ex, 450 degrees becomes 90 degrees)
			if (rotation >= 360) {
				//angle = angle%360;
				rotation -= 360;
			} else if (rotation < 0) {
				rotation = 360 - (Math.Abs(rotation)%360);
			}
			//Make the new symbols
			symbols = collision.makeVector(a, marker.details, rotation);
			//Make sure to store the transformation for this marker!
			for (var b in group[a]) {
				markers[group[a][b].key].setIcon(symbols[b]);
				group[a][b].transform.rotation = angle;
			}
		}
	}
	
	//Record any changes we"ve made in this group
	groups[index] = group;
}
//Move all the markers in a group to their original positions and rotations
function resetPosition(index) {
	var group = groups[index];
	var marker;
	//console.log(group);
	
	//Reset the position
	for (var a in group) {
		for (var b in group[a]) {
			//Now, we are in one of the two party icons; this could potentiall contain multiple markers, so...
			marker = group[a][b];
			markers[marker.key].setPosition(marker.original.position);
		}
	}
}

//Figure out the latitude or longitude per pixel at the current zoom level
function pixelDist() {
	var min = bounds.getSouthWest();
	var max = bounds.getNorthEast();
	
	var x = Math.abs(max.lng() - min.lng())/dojo.contentBox("map_canvas").w;
	var y = Math.abs(max.lat() - min.lat())/dojo.contentBox("map_canvas").h;
	
	var r = Math.pow(10,7);
	pixels = {"x": Math.round(x*r)/r, "y": Math.round(y*r)/r};
}

//When the transformer dialog is opened, fill it up
/*
function fillTransformer(index) {
	var transform = groups[index][1][0]["transform"];
	var fields = ["rotator"];
	for (var key in fields) {
		rotator.set("value", parseInt(transform["rotation"]));
		rotator_input.set("value", parseInt(transform["rotation"]));
	}
}
*/