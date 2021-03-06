//Some global variables to store data creates as we map our crashes
var markers = {
	counter: 0, //Keep track of the highest key value used so far
	length: 0, //Total number of markers CURRENTLY in the array
	add: function(value) { //Add a new value to the array, and increment the counter
		this[this.counter] = value;
		this.length++;
		this.counter++;
		return this.counter;
	},
	remove: function(key) { //Delete a value from the array by key
		if(this[key]){
			delete this[key];
			this.length--;
			return true;
		}
		return false;
	},
	reset: function() {
		this.counter = 0;
	}
};
var groups = {};

//A list of some common stuff we"ll need...
var psuedoMov = ["H", "I", "J", "L", "N", "P", "Q"];
var angles = [0, 90, 180, 270];

//This object contains ALL the methods needed to create a crash marker group, and to manipulate crash sprites
var collision = {
	//Generate a new slate of collisions - this is the beginning of a long odyssey....
	generate: function(){
		//Before we do ANYTHING else, clear the old collisions of the map!
		collision.clear();

		//Create a global variable to keep track of the crash area extents
		bounds = new google.maps.LatLngBounds();

		//Create an array to keep track of the number of various types of crashes
		var counter = {
			map: 0, //Number of mapped collisions
			fat: 0 //Number of fatal collisions
		};

		//Cycle through every crash that we grabbed from the database
		var crashes = (groups.length > 0) ? groups : cases;
		for(var i in cases){
			if (collision.mapCollision(cases[i], /*dojo.byId("showInvalid").checked*/ false ) === true){
				//The collision has been mapped successfully
				counter.map++;
				if (cases[i].crashSeverity == 1) {
					counter.fat++;
				}
			}
		}

		return counter;

	},

	mapCollision: function(thisCase, mapInvalid, custom) {
		//Some pre-loop variables
		//var thisCase, newTyp, isValid, code, reverse, markerType, thisSymbol, rotation, marker;
		var newTyp, isValid, code, reverse, markerType, thisSymbol, rotation, marker;
		var skipValidity = false;
		var mapped = false;
		var thisId = "id_"+thisCase.id;

		//Some preliminary housekeeping before we go into the loop
		newTyp = thisCase.crashType;
		//console.log("   ");
		if (newTyp == "-"){
			newTyp = "I";
			thisCase.crashType = "I";
		}

		//Before we do ANYTHING, make sure this is an appropriate crash-type: A, B, C, D, E, F, G, H, or I
		for (var x in iconType){
			if(newTyp == x.toString()){
				//If we get to this point, we have a valid crashtype, so set its coordinates
				//console.log(".  ID: "+thisId);
				//console.log("crashtype: validated");
				var latlng = new google.maps.LatLng(thisCase.y, thisCase.x);

				//Is there an existing transformation on this marker
				var parType = thisCase.party.slice(0);

				//Make sure we have the right party type selected - if not, we can use thisCase.vehType as a proxy
				for (var p in parType) {
					if ( parseInt(parType[p], 0) < 1 || parseInt(parType[p], 0) > 4 || typeof parseInt(parType, 0) != "number" || !parType) {
						//The parType is inconclusive!  Check if thisCase.vehType can help...
						if (thisCase.vehType[p] == "L") {
							//Its a bike
							parType[p] = "4";
						} else if (thisCase.vehType[p] == "N") {
							//Its a pedestrian
							parType[p] = "2";
						} else if (thisCase.vehType[p] && thisCase.vehType[p] != "-") {
							//Its a motor vehicle
							parType[p] = "1";
						} else {
							//Something is really screwed up here - generate a console error
							//console.log("FAILURE: ONE OF THE PARTY"S HAS AN AMBIGOUS VEHICLE/PARTY TYPE");
						}
					}
				}
				//If first party is pedestrian, swap the first and second
				if (parseInt(parType[0], 0) == 2) {
					thisCase.direction=thisCase.direction.reverse();
					thisCase.movement=thisCase.movement.reverse();
					thisCase.party=thisCase.party.reverse();
					thisCase.vehType=thisCase.vehType.reverse();
					thisCase.atFault=thisCase.atFault.reverse();
					parType[0]=parType[1];
					parType[1]="2";
				}
				//Is there an existing transformation on this marker
				var direction = thisCase.direction.slice(0);
				var movement = thisCase.movement.slice(0);

				//Is this a PED collision?  If so, change to type G
				var isBike;
				for (var q in parType) {
					if (parseInt(parType[q], 0) == 2) {
						//If there is at least one pedestrian, change the crashtype and movement type
						//pedCount++;
						//If first party is pedestrian, swap the first and second
						newTyp = "G";
						direction[q] = "N";
						movement[q] = "Z";
					} else if (parseInt(parType[q], 0) == 4) {
						//If there is at least one bike, change the crashtype and movement type
						isBike = true;
						movement[q] = "Y";
						if (thisCase.crashType == "H") {
							if (direction[0] == direction[1]) {
								//console.log("Treated as sideswipe");
								newTyp = "B";
							} else {
								newTyp = "A";
							}
						}
					}
					if (thisCase.atFault) {
						//console.log("Party "+q+" ATFAULT: "+thisCase.atFault[q]);
					}
				}

				//Is the crashtype H with no bikes?  FAIL!
				if (!isBike && thisCase.crashType == "H") {
					//console.log("FAILURE (CRASH TYPE H FOR A NON-BIKE COLLISION")");
					mapped = false;
					//break;
				}

				//Was this an overturned crashType (F)?  If so, treat it as either head-on or rear-end, but make the at fault car Movement type X
				if (thisCase.crashType == "F") {
					if (direction.length === 2) {
						//Two parties!  Figure out whose at fault
						for (var a in thisCase.atFault) {
							if (thisCase.atFault[a] == "Y") {
								//This is the car at fault!  Change its movement type
								movement[a] = "X";
								parType[x] = 1;
							}
						}
						//If the two parties are going the same direction, we'll assume it was a rear-end; otherwise, its a head-on collision
						if (direction[0] == direction[1]) {
							newTyp = "C";
						} else {
							newTyp = "A";
						}
					} else if (direction.length === 1) {
						//One party - just skip the validity check and map it
						//parType[x] = 1;
						movement[0] = "X";
						newTyp = "A";
						skipValidity = true;
						mapped = true; //This collision has been successfully mapped!
					} else {
						//console.log("FAILURE (INVALID NUMBER OF PARTIES FOR CRASHTYPE F')");
						if (direction.length) {
							mapped = parseInt(direction.length, 0); //Collision can't be mapped because there are too many parties
						}
						//break;
					}
				}

				//Is the movement type psuedo-headon?  Change it!
				for (var m in movement) {
					for (p in psuedoMov) {
						if (movement[m] == psuedoMov[p]) {
							movement[m] = "B";
							break;
						}
					}
					//console.log("The party "+m+" movement is "+movement[m].replace(/S/g , "B"));
				}
				//console.log("TYPE:"+newTyp);

				//This crashtype cannot be mapped!
				if (!iconType[newTyp].visible) {
					skipValidity = true;
					mapped = false;
				}



				//Conduct a series of validity checks, if required
				if (!skipValidity) {
					if (movement.length == 2) {
						isValid = false;
						for (a in angles) {
							//Replace certain characters for the validity check
							var replaceChars = {
								"F": "E", //For validity checks, treat U-Turns as Left Turns
								"X": "B", //"-----------------", assume all overturned cares are proceeding straight
								"Y": "B" //"-----------------", assume all bicycles are proceeding straight
							};
							var doReplace = function(source) {
								return source.replace(/[FXY]/g,function(c) { return replaceChars[c]; });
							};

							code = doReplace(movement[0]) +  collision.dirAngle(direction[0], angles[a]) + doReplace(movement[1]) + collision.dirAngle(direction[1], angles[a]);
							reverse = doReplace(movement[1]) + collision.dirAngle(direction[1], angles[a]) + doReplace(movement[0]) + collision.dirAngle(direction[0], angles[a]);

							if (mapCheckValidity(newTyp, code) === true) {
								isValid = code;
								break;
							} else if (mapCheckValidity(newTyp, reverse) === true){
								isValid = reverse;
								break;
							}
						}
						if (!isValid) {
							//code = movement[0].replace(/S/g , 'B') +  direction[0] + movement[1].replace(/S/g , 'B') + direction[1];
							//console.log("FAILURE ("+code+" IS AN INVALID COMBO)");
							mapped = false;
							//break;
						} else {
							//Does this collision contain the appropriate vehicles?
							if (checkVehicles(newTyp, parType) === true) {
								//console.log("SUCCESS ("+isValid+")");
								mapped = true; //This collision has been successfully mapped!
							} else {
								//console.log("FAILURE ("+isValid+" DOES NOT HAVE VALID VEHICLES FOR THIS CRASHTYPE)");
								mapped = false;
								//break;
							}
						}
					} else if (movement.length == 1) {
						//Single party collisions only count when they are hit objects!
						if (newTyp == "E") {
							//console.log("SUCCESS (1 PARTY)");
							//If this was a 1 party crash, add a "Hit Object" as the second party
							movement[1] = "OBJ";
							direction[1] = collision.dirAngle(direction[0], 180);
							mapped = true; //This collision has been successfully mapped!
						} else {
							//console.log("FAILURE (1 PARTY, NOT 'HIT OBJECT')");
							mapped = false;
							//break;
						}
					} else {
						//console.log("FAILURE (3+ PARTIES ["+movement.length+"])");
						if (movement.length) {
							mapped = parseInt(direction.length, 0); //Collision can't be mapped because there are too many parties
						}
						//break;
					}
				}


				//If the "Show Invalid Collisions" box is unchecked and this is an invalid crash, skip mapping
				if (mapInvalid === false && mapped !== true) { break; }


				//Create the center dot for this collision
				if (!groups[thisId]) { groups[thisId] = []; }
				if (groups[thisId][0]) {
					thisSymbol = groups[thisId][0][0];
					latlng = new google.maps.LatLng(thisSymbol.original.y + thisSymbol.transform.y,thisSymbol.original.x + thisSymbol.transform.x);
				}
				//if (typeof mapped === 'number') {
				//	redmarkerType = 'unmapped'+mapped;
				//} else {
					if (thisCase.crashSeverity == 1){
						markerType = "red_dot";
					} else {
						markerType = "white_dot";
					}
				//}
				marker = collision.createMarker(latlng, thisId, 0, markerType, newTyp);
				if (!groups[thisId][0]) {
					groups[thisId][0] = [collision.groupMarkers({"num": 0}, markers.counter, marker[0], {typ: newTyp, sev: thisCase.crashSeverity})];
				}/* else {
					//Update the pointer-key pairs in the groups object
					collision.updateMarkers(thisId, [markers.counter]);
				}*/
				markers.add(marker[0]);
				if (custom) {
					for (var d in marker) {
						marker[d].setMap(map);
					}
				}
				bounds.extend(marker[0].getPosition());

				if (mapped === true) {
					var ordered = doHierarchy(newTyp, movement);
					for (var key in ordered){
						//An object containing the details of this particular collision
						var details = {
							"typ": newTyp,
							"mov": movement[ordered[key]],
							"dir": direction[ordered[key]],
							"par": parType[ordered[key]]
						};

						//Create the marker, and add it to the markers array
						if (groups[thisId][parseInt(key, 0) + 1]) {

							//We have an existing symbol
							thisSymbol = groups[thisId][parseInt(key, 0) + 1][0];
							rotation = thisSymbol.original.rotation + thisSymbol.transform.rotation;

							//Make sure the angle is between 0 and 360 (ex, 450 degrees becomes 90 degrees)
							if (rotation >= 360) {
								//angle = angle%360;
								rotation -= 360;
							} else if (rotation < 0) {
								rotation = 360 - (Math.Abs(rotation)%360);
							}

							//Create the symbol
							marker = collision.createMarker(latlng, thisId, (parseInt(key, 0) + 1), details, rotation);

							//Add the new data to the markers and global object for display
							for (m in marker){
								var newKey = {};
								//Note the marker array key for future translations
								if (parseInt(m, 0) >= 0) {
									markers.add(marker[m]);
									bounds.extend(marker[m].getPosition());
								}
								/*//Update the pointer-key pairs in the groups object
								newKey[(parseInt(key) + 1)] = markers.counter;
								collision.updateMarkers(thisId, );*/
							}

						} else {

							//We do not have an existing symbol
							marker = collision.createMarker(latlng, thisId, (parseInt(key, 0) + 1), details);
							if (custom) {
							for (d in marker) {
									marker[d].setMap(map);
								}
							}
							groups[thisId][parseInt(key, 0) + 1] = [];

							for (m in marker){
								//Note the marker array key for future translations
								if (parseInt(m, 0) >= 0) {
									groups[thisId][parseInt(key, 0) + 1][parseInt(m, 0)] = collision.groupMarkers({"num": parseInt(key, 0) + 1}, markers.counter, marker[m], details);
									markers.add(marker[m]);
									bounds.extend(marker[m].getPosition());
								}
							}

						}
					}
				}
				break;
			} else {
				/*if (groups[thisId]) {
					//This case was originally mapped, but no longer!  Make sure the key reference is updated...
					collision.updateMarkers(thisId);
				}*/
			}
		}


		return mapped;
	},

	//Clear all of the collision markers
	clear: function() {
		//Collapse the transform dialog, if it is already open
		//killTransform();
		for (var i = 0; i < markers.counter; i++ ) {
			if (markers[i]){
				markers[i].setMap(null);
			}
		}

		i = 0;
		while (i < markers.counter) {
			markers.remove(i);
			i++;
		}
		markers.reset();
	},


	//Group markers, so that all of the markers pertaining to a particular crash are referenced by one object
	groupMarkers: function(pointer, key, marker, details){
		var thisMarker = {
			"key": key,//stores the key of our particular marker in the "markers" global array
			"pointer": pointer.num,//if true, this is the center dot; if false, this is one of the party icons
			"details": details,//the original collision info; this is so we can rebuild symbols if necessary
			"original": {//Stores the original values, before the user can translate the marker
				"x": marker.getPosition().lng(),
				"y": marker.getPosition().lat()
			},
			"transform": {//Notes how the marker has been transformed
				"x": 0,
				"y": 0,
				"rotation": 0
			}
		};
		if (pointer.num > 0) {
			thisMarker.original.rotation = marker.getIcon().rotation;
		} else {
			thisMarker.original.rotation = 0;
		}

		return thisMarker;
	},

	//When a markers key value changes, make sure that the relevant group's corresponding value is updated as well
	updateMarkers: function(id, newVal){
		var x, y;
		if (newVal) {
			for (x in newVal) {
				var pointer = (newVal instanceof Array) ? x : x.pointer ;
				for (y in id[x]) {
					groups[id][pointer][y] = newVal[x].key;
				}
			}
		} else {
			//No pointer-key pairings - just clear the old ones
			for (x in id) {
				for (y in id[x]) {
					groups[id][x][y].key = null;
				}
			}
		}
	},

	//Generate one of the three markers that is part of the collision
	createMarker: function(point, index, position, details, angle){
		var markerImage = [];
		var marker = [];
		var mark;
		var click, drag, zInd;
		if (position === 0) {
			//What to do if this is the center dot...
			click = true;
			drag = true;
			zInd = 10;
			markerImage.push(collision.formatDot(details));
			//Points.push(point);
			if (index >= 0) {
				cases[index].point = point;
			}
		} else {
			//This isn't the center dot, so make the arrow icons
			click = false;
			drag = false;
			zInd = 20;

			//If we have an angle, that means a rotation value for this icon already exists
			markerImage = collision.makeVector(position, details, angle);
		}
		for (var x in markerImage){
			//Create the marker
			mark = new google.maps.Marker({
				position: point,
				draggable: drag,
				icon: markerImage[x],
				//title: cases[index].prim +" & " + cases[index].second,
				clickable: click,
				zIndex: zInd,
				map: map
			});
			marker.push(mark);

			if (position === 0)  {
				//If the user left clicks, show them some vital data
				google.maps.event.addListener(mark,"click",function(){
					map.panTo(mark.getPosition());
					markerInfo(mark, index);
				});

				//If they right click, give them the transformation menu
				google.maps.event.addListener(mark,"rightclick",function(){
					//markTransform(mark, index);
					/*if (groups[index][0].transform.x || groups[index][0].transform.x) {
					}*/
					/*
					createInfoBox("editCollision", {
						index: index,
						marker: mark,
						position: (groups[index][0][0]) ? new google.maps.LatLng(point.lat() + groups[index][0][0].transform.y, point.lng() + groups[index][0][0].transform.x) : point
					});
					*/
					map.panTo(mark.getPosition());
					markerEdit(mark, index);
				});

				//And if they drag the point, make sure that the rest of the markers in this group go with it!
				google.maps.event.addListener(mark,"dragend",function(){
					translateMarkers({"lng": mark.getPosition().lng(), "lat": mark.getPosition().lat()}, index, true);
				});
			}
		}

		return marker;
	},


	//Create a vector image for a particular crash; may require creating more than one marker
	makeVector: function(num, details, angle) {
		//Set the basic parameters
		var parameters = {};
		parameters.origin = new google.maps.Point(36, -1* scalar);
		parameters.scale = arrowScale;
		parameters.weight = arrowWeight;

		//A set of exceptions...
		if (angle || angle === 0) {
			//If we have a custom "angle" parameter, it means a user is editing it!  Override the direction value
			parameters.angle = angle;
		} else if (num == 2 && details.typ == "D") {
			//If this is a broadside, the second party symbol must ALWAYS be opposite the first
			parameters.angle = collision.convertAngle(collision.dirAngle(lastDetails.dir, 180));
			//parameters.angle = collision.convertAngle(collision.dirAngle(details.dir, 180));
		} else if (details.par == 2) {
			//If we have a pederstrian, they must always be directly across from the first symbol
			parameters.angle = collision.convertAngle(collision.dirAngle(lastDetails.dir, 180));
			//parameters.angle = collision.convertAngle(collision.dirAngle(details.dir, 180));
		} else {
			//In all other cases, just go with the natural direction
			parameters.angle = collision.convertAngle(details.dir);
		}

		//Make the symbols
		var move;
		if (details.par == 4) {
			move = "BIC";
		} else if (details.par == 2) {
			move = "PED";
		} else {
			move = details.mov;
		}
		var data = getSVG(move, parameters);
		var symbols = [];
		var svg = {};

		for (var a in data) {
			for (var b in data[a].properties) {
				svg[b] = data[a].properties[b];
			}
			data[a].points = collision.typePath(num, details,data[a]);
			svg.path = collision.makePath(data[a].points, scalar);
			symbols.push(svg);
			svg = {};
		}

		//Create a variable to store this symbol"s details, in case we have a broadside collision...
		if (num == 1) {
			lastDetails = details;
		} else {
			lastDetails = 0;
		}

		return symbols;
	},

	//Change the SVG paths for each movement type
	typePath: function(num, details, data) {
		//Split the data object into more manageable variables
		var points = data.points;
		var settings = data.settings;
		var props = data.properties;

		//If the 'vertical' setting is true, counter-rotate the object
		if (settings.vertical !== false) {
			//Get the base point for the counter-rotation
			var basePt = [];
			basePt.push(settings.vertical.x);
			basePt.push(settings.vertical.y);
			//Do the rotation
			points = collision.pivotSVG(points, basePt, (-1*props.rotation));
		}
		points = collision.offsetSVG(points, [0, 1]);

		//Mirror objects as necessary
		//If the bike is being rotated more than 180 degrees, mirror it so that it does not appear upside down

		if (details.par == 4 && details.typ != "D") {
			var flipLine;
			if (details.typ == "B") {
				//For a broadside or sideswipe
				flipLine = 36;
			} else {
				//For all others
				flipLine = 38;
			}
			if (props.rotation >= 180) {
				points = collision.mirrorSVG(points, flipLine, "y");
			}
		}

		//Create a function to handle a standard arrow pointing to the crash circle
		var stdArrow = function(points) {
			if (details.par == 2) {
				//If this is a pedestrian, move him up a little bit...
				points = collision.offsetSVG(points, [-3, 3]);
			} else if (details.par == 4) {
				//Adjust the bike a tiny bit
				points = collision.offsetSVG(points, [-2, 1]);
			} else if (details.mov == "D") {
				//Right Turn, move slightly offset so that arrow edge touches crash dot
				return collision.offsetSVG(points, [-18, 0]);
			} else if (details.mov == "E") {
				//Left Turn, move slightly offset so that arrow edge touches crash dot
				return collision.offsetSVG(points, [18, 0]);
			} else if (details.mov == "F") {
				//U-Turn, move very slightly offset so that top of arced line touches crash dot
				return collision.offsetSVG(points, [13, 2]);
			}
			return points;
		};

		switch(details.typ){
			//SIDESWIPE
			case "B":
				//Party 0 needs to move a bit to the left; Party 1 needs to move a bit to the right
				var x = 10;
				var y = -41;
				if (details.par == 4) {
					//Is it a bicycle?
					y = (y/2) - 3;
					x += 2;
				}
				//Move Parked farther!
				if (details.mov == "O") {
					x *= 1.8;
				}
				if (num == 1 ) {
					return collision.offsetSVG(points, [(-1*x), y]);
				} else {
					if (lastDetails.dir != details.dir) {
						//What if the second party is NOT going the same direction as the first?
						return collision.offsetSVG(points, [(-1*x), y]);
					}
					return collision.offsetSVG(points, [x, y]);
				}
				break;

			//REAR END
			case "C":
				//Party 0 is fine; Party 1 needs to be moved over the anchor point (arrow height + 2*(dot height) = 54 + 20 = 74)
				if (num == 1 ) {
					return stdArrow(points);
				} else {
					if (details.par == 4) {
						//Is it a bicycle?
						return collision.offsetSVG(points, [0, -43]);
					} else {
						//Ok, then it must be a car!
						return collision.offsetSVG(points, [0, -72]);
					}
					//return points;
				}
				break;

			//BROADSIDE
			case "D":
				//Party 0 is fine; Party 1 needs to be rotated around the pivot by 90 left or right degrees, then moved a bit closed to the anchor point
				if (num == 1) {
					//If this is a bicycle, make sure it"s always mirrored properly!
					if (props.rotation >= 180 && details.par == 4) {
						points = collision.mirrorSVG(points, 38, "y");
					}
					return stdArrow(points);
				} else {
					var yPivot, yOffset;
					if (details.par == 4) {
						//Is it a bicycle?
						yPivot = 12;
						yOffset = -5;
					} else {
						//Ok, then it must be a car!
						yPivot = 27+scalar;
						yOffset = -24-scalar;
					}

					//Pivot the arrow so that it is facing the right direction (this is some serious magic - BE REALLY CAREFUL WHEN EDITING!
					if (details.par == 4) {
						//Note that we have slightly different pivoting logic for bikes as opposed to cars
						if (props.rotation > 90 && props.rotation < 270) {
							points = collision.pivotSVG(points, [36, yPivot], 270);
						} else {
							points = collision.pivotSVG(points, [36, yPivot], 90);
						}
					} else {
						// Broadside fix - 8/11/2014
						/*
						if (collision.dirAngle(lastDetails.dir, details.dir) == 270) {
							points = collision.pivotSVG(points, [36, yPivot], 90);
						} else {
							points = collision.pivotSVG(points, [36, yPivot], 270);
						}
						*/
						var diff = collision.dirAngle(lastDetails.dir, details.dir);
						points = collision.pivotSVG(points, [36, yPivot], diff + 180);
						switch(diff){
							case 0:
								if(details.mov == "D"){
									//For right turn
									points = collision.offsetSVG(points, [scalar*2, 0]);
								}
								else{
									//For left turn or others
									points = collision.offsetSVG(points, [-scalar*1.5, 0]);
								}
								break;
							case 180:
								if(details.mov == "D"){
									//For right turn
									points = collision.offsetSVG(points, [-scalar*2, -yOffset]);
								}
								else{
									//For left turn
									points = collision.offsetSVG(points, [scalar*1.5, -yOffset]);
								}
								break;
							case 90:
								//For U-turn
								if(details.mov == "F"){
									//points = collision.offsetSVG(points, [-scalar*2, -yOffset]);
								}
								break;
							case 270:
								//For U-turn
								if(details.mov == "F"){
									points = collision.offsetSVG(points, [-scalar*2, -yOffset]);
								}
								break;
						}
					}
					points = collision.offsetSVG(points, [0, yOffset]);
					return points;
				}
				break;

			//ALL OTHER CRASH TYPES
			default:
				return stdArrow(points);
				break;
		}
	},

	//Make an SVG path from a collection of points
	makePath: function(points, scalar) {
		//Create a string for storing the path output
		var svg = "";

		//Iterate through each point, adding it to the output string
		var num = 0;
		var offset;
		for (var pt in points) {
			svg += points[pt].type+" ";
			//If its a relative path, set the scalar values to 0!
			if ((points[pt].type.charAt(0) == points[pt].type.charAt(0).toUpperCase()) && points[pt].type.charAt(0) != " ") {
				offset = 0;
			} else {
				offset = 0;
			}
			if (points[pt].xy) {
				for (var sub in points[pt].xy) {
					//Even numbered values are always assumed to be X coordinates; Odd numbered ones are Y coordinates
					if (sub%2 === 0) {
						svg += points[pt].xy[sub]+" ";
					} else {
						num = parseFloat(points[pt].xy[sub]) + offset;
						svg += num.toString()+" ";
					}
				}
			}
		}

		return svg;
	},

	//Mirror an SVG across the X Axis, Y Axis, or both
	mirrorSVG: function(points, flipAxes, axis) {
		//First, figure out what axis we need to use
		var mirror = {};
		if (axis) {
			//We are only mirroring along one axis
			if (axis == "x") {
				//Flipping vertically
				mirror.y = flipAxes;
			} else {
				//Flipping horizontally
				mirror.x = flipAxes;
			}
		} else {
			//We are mirroring across two axes!
			mirror.x = flipAxes[0];
			mirror.y = flipAxes[1];
		}

		var flip = function(point, fulcrum) {
			return fulcrum - (point - fulcrum);
		};

		var newPath = [];
		var newPt = {};
		var newX, newY, newCoord;
		for (var pt in points) {
			//The point type never changes
			newPt.type = points[pt].type;
			if (points[pt].xy) {
				//Even numbered values are always assumed to be X coordinates; Odd numbered ones are Y coordinates
				for (var i=0; i<points[pt].xy.length; i+=2) {
					//Flip vertically, if necessary
					if (mirror.x) {
						newX = flip(parseFloat(points[pt].xy[i]), parseFloat(mirror.x));
					} else {
						newY = points[pt].xy[i];
					}
					//Flip horizontally, if necessary
					if (mirror.y) {
						newY = flip(parseFloat(points[pt].xy[i + 1]), parseFloat(mirror.y));
					} else {
						newY = points[pt].xy[i + 1];
					}

					if (i === 0) {
						newCoord = [newX.toString(), newY.toString()];
					} else {
						newCoord.push(newX.toString());
						newCoord.push(newY.toString());
					}
				}
				newPt.xy = newCoord;
			}
			//Add the tranlsated point to the path array
			newPath.push(newPt);
			newPt = {};
		}

		return newPath;
	},

	//Translate an SVG image using given X and Y distances
	offsetSVG: function(points, offset) {
		//Translate each point in the path
		var newPath = [];
		var newPt = {};
		var newX, newY, newCoord;
		for (var pt in points) {
			//The point type never changes
			newPt.type = points[pt].type;
			if (points[pt].xy) {
				//Even numbered values are always assumed to be X coordinates; Odd numbered ones are Y coordinates
				for (var i=0; i<points[pt].xy.length; i+=2) {
					//Offset the points X and Y coordinates
					newX = parseFloat(points[pt].xy[i]) + parseFloat(offset[0]);
					newY = parseFloat(points[pt].xy[i+1]) + parseFloat(offset[1]);

					if (i === 0) {
						newCoord = [newX.toString(), newY.toString()];
					} else {
						newCoord.push(newX.toString());
						newCoord.push(newY.toString());
					}
				}
				newPt.xy = newCoord;
			}
			//Add the tranlsated point to the path array
			newPath.push(newPt);
			newPt = {};
		}

		return newPath;
	},

	//Rotate an SVG image around a given base point
	pivotSVG: function(points, base, angle) {
		//Convert the angle to radians
		angle = (parseFloat(angle)/180) * Math.PI;

		//Translate each point in the path
		var newPath = [];
		var newPt = {};
		var newX, newY, newCoord;
		for ( var pt in points) {
			//The point type never changes
			newPt.type = points[pt].type;
			if (points[pt].xy) {
				//Even numbered values are always assumed to be X coordinates; Odd numbered ones are Y coordinates
				for (var i=0; i<points[pt].xy.length; i+=2) {
					//These two functions are super complicated; just know that they are created to rotate a point (points[pt].xy) around the base point
					newX = (Math.cos(angle) * (points[pt].xy[i] - base[0])) - (Math.sin(angle) * (points[pt].xy[i+1] - base[1])) + base[0];
					newY = (Math.sin(angle) * (points[pt].xy[i] - base[0])) + (Math.cos(angle) * (points[pt].xy[i+1] - base[1])) + base[1];

					if (i === 0) {
						newCoord = [newX.toString(), newY.toString()];
					} else {
						newCoord.push(newX.toString());
						newCoord.push(newY.toString());
					}
				}
				newPt.xy = newCoord;
			}
			//Add the tranlsated point to the path array
			newPath.push(newPt);
			newPt = {};
		}

		return newPath;
	},

	//Get the angle between two cardinal directions, or the direction of rotating an angle by x degrees (x can either be a cardinal direction OR a degree angle)
	dirAngle: function(dir, x){
		//NOTE: Rotation is done in the clockwise direction
		var angle = {
			"N": {
				"N": 0,
				"E": 90,
				"S": 180,
				"W": 270
			},
			"E": {
				"N": 270,
				"E": 0,
				"S": 90,
				"W": 180
			},
			"S": {
				"N": 180,
				"E": 270,
				"S": 0,
				"W": 90
			},
			"W": {
				"N": 90,
				"E": 180,
				"S": 270,
				"W": 0
			}
		};

		//Now, the fun part...
		if (isNaN(x) === true) {
			return angle[dir][x];
		} else {
			//So, we have an angle value...
			for (var key in angle[dir]) {
				if (x == angle[dir][key]) {
					//We return a cardinal direction that is x degrees clockwise from the "dir" variable
					return key;
				}
			}
		}
	},

	//Convert an angle to a cardinal direction, and vice versa
	convertAngle: function(x) {
		var direction = {"N":0, "E":90, "S":180, "W":270};
		if (isNaN(x) === true) {
			//x is a cardinal direction; this means we just need to return the proper value from the object above
			return direction[x];
		} else {
			//So, we have an angle value...
			for (var key in direction) {
				if (x == direction[key]) {
					//Return the cardinal direction that corresponds to "x"
					return key;
				}
			}
		}
	},

	//Make the center dot for the crash
	formatDot: function(type) {
		var x = 2*scalar;
		var y = 2*scalar;
		var markerImageURL = "images/png/"+type+".png";
		markerImage = new google.maps.MarkerImage(markerImageURL, null, null, new google.maps.Point((x/2), (y/2)), new google.maps.Size(x, y));
		return markerImage;
	}
};