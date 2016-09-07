/*===============================================================================
	CRASH INFO KEY:
	
	CRASHTYPE
	A: Head-On
	B: Sideswipe
	C: Rear End
	D: Broadside
	E: Hit Object
	
	MOVEMENT:
	A: Stopped
	B: Straight
	C: Rand Off Road
	D: Right Turn
	E: Left Turn
	F: Left Turn
	O: Parked
	X: Overturned (Psuedo-Movement, not actually in the codex)
	===============================================================================*/

//Re-organize the keys based on the hierarchy
function doHierarchy(type, mov){
	//A list of hierarchies for each crash type; lowest mapped first
	var order = {
		//For "HEAD-ON"
		"A": {
			"A": 0, // MIN = AGGRESSOR PARTY
			"B": 0,
			"C": 0,
			"D": 0,
			"E": 0,
			"F": 0,
			"O": 0,
			"X": 0, //X is a pseudo-movement type for "overturned" cars
			"Y": 1, 
			"Z": 2  // MAX = VICTIM PARTY 
		},
		//For "SIDESWIPE"
		"B": {
			"A": 3,
			"B": 2,
			"C": 5,
			"D": 8, // MAX = RIGHTMOST PARTY BEFORE ROTATION
			"E": 1, // MIN = LEFTMOST PARTY BEFORE ROTATION
			"F": 0,
			"O": 4,
			"Y": 6,
			"Z": 7 
		},
		//For "REAREND"
		"C": {
			"A": 7,
			"B": 2,
			"C": 1, // MIN = AGGRESSOR PARTY
			"D": 3,
			"E": 4,
			"F": 5,
			"O": 8,
			"X": 0, //X is a pseudo-movement type for "overturned" cars
			"Y": 6,
			"Z": 9  // MAX = VICTIM PARTY
		},
		//For "BROADSIDE"
		"D": {
			"A": 6,
			"B": 1,
			"C": 0, // MIN = AGGRESSOR PARTY
			"D": 2,
			"E": 3,
			"F": 4,
			"O": 7,
			"Y": 5,
			"Z": 8  // MAX = VICTIM PARTY
		},
		//For "HIT OBJECT"
		"E": {
			"A": 0, // MIN = AGGRESSOR PARTY
			"B": 0,
			"D": 0,
			"E": 0,
			"F": 0,
			"O": 0,
			"Y": 1,
			"Z": 2  // MAX = VICTIM PARTY
		},
		//For "VEHICLE/PEDESTRIAN"
		"G": {
			"A": 0, // MIN = AGGRESSOR PARTY
			"B": 0,
			"D": 0,
			"E": 0,
			"F": 0,
			"O": 0,
			"Y": 1,
			"Z": 2  // MAX = VICTIM PARTY
		},
		//For "OTHER"
		"H": {
			"A": 0, // MIN = AGGRESSOR PARTY
			"B": 0,
			"D": 0,
			"E": 0,
			"F": 0,
			"O": 0,
			"Y": 1,
			"Z": 2  // MAX = VICTIM PARTY
		},
		//For "NOT STATED"
		"I": {
			"A": 0, // MIN = AGGRESSOR PARTY
			"B": 0,
			"D": 0,
			"E": 0,
			"F": 0,
			"O": 0,
			"Y": 1,
			"Z": 2  // MAX = VICTIM PARTY
		}
	};
	
	//Assign a numerical value to each movement
	var assigned = [];
	for (var key in mov) {
		assigned.push([ key, order[type][mov[key]] ]);
	}
	
	//Sort the movements, then output the new order
	var sorted = assigned.sort(function(a, b) {
		return parseInt(a[1],10) - parseInt(b[1],10);
	});
	assigned = [];
	for (key in sorted) {
		assigned.push(sorted[key][0]);
	}
	
	return assigned;
}

//What vehicle types are forbidden for this crash?
function checkVehicles(type, par){
	//A list of valid vehicles
	var min = {
		//For "OTHER"
		"H": {_4: 1},
		//For "NOT STATED"
		"I": {_4: 1}
	};
	
	//Do the validity check
	var valid = true;
	for (var x in min){
		if (type == min[x]) {
			for (var y in min[x]) {
				var counter = 0;
				for (var z in par) {
					if ("_"+par[z] == y) {
						counter++;
					}
				}
				if (counter < min[x][y]) {
					return false;
				}
			}
		}
	}
	
	//Make sure that this is not a Hit Object collision - otherwise, it needs only 1 vehicle!
	if (type == "E" /*&& par.length == 2*/) {
		return false;
	}
	return valid;
}

//Check if a given crash is valid
function mapCheckValidity (type, code) {
	//This is the validity array - make sure to update it as crashes become valid or invalid!
	/*Codes are formated as follows: "WXYZ"
		W = Party 1 Movement
		X = Party 1 Direction
		Y = Party 2 Movement
		Z = Party 2 Direction
	*/
	var valid = {
		//For "HEAD-ON"
		"A": [
			"BNZW",
			"BWEE",
			//NEW COMBOS ABOVE THIS LINE
			"AEAW",
			"AEBN",
			"AEBS",
			"AEBW",
			"AECN",
			"AECS",
			"AECW",
			"AEDE",
			"AEDN",
			"AEDS",
			"AEDW",
			"AEEE",
			"AEEN",
			"AEES",
			"AEEW",
			"AEON",
			"AEOS",
			"AEOW",
			"ANAE",
			"ANAS",
			"ANAW",
			"ANBE",
			"ANBS",
			"ANBW",
			"ANCE",
			"ANCS",
			"ANCW",
			"ANDE",
			"ANDN",
			"ANDS",
			"ANDW",
			"ANEE",
			"ANEN",
			"ANES",
			"ANEW",
			"ANOE",
			"ANOS",
			"ANOW",
			"ASAE",
			"ASAW",
			"ASBE",
			"ASBN",
			"ASBW",
			"ASCE",
			"ASCN",
			"ASCW",
			"ASDE",
			"ASDN",
			"ASDS",
			"ASDW",
			"ASEE",
			"ASEN",
			"ASES",
			"ASEW",
			"ASOE",
			"ASON",
			"ASOW",
			"AWBE",
			"AWBN",
			"AWBS",
			"AWCE",
			"AWCN",
			"AWCS",
			"AWDE",
			"AWDN",
			"AWDS",
			"AWDW",
			"AWEE",
			"AWEN",
			"AWES",
			"AWEW",
			"AWOE",
			"AWON",
			"AWOS",
			"BEBW",
			"BECN",
			"BECS",
			"BECW",
			"BEDN",
			"BEDS",
			"BEDW",
			"BEEN",
			"BEES",
			"BEEW",
			"BEON",
			"BEOS",
			"BEOW",
			"BNBE",
			"BNBS",
			"BNBW",
			"BNCE",
			"BNCS",
			"BNCW",
			"BNDE",
			"BNDS",
			"BNDW",
			"BNEE",
			"BNEN",
			"BNES",
			"BNEW",
			"BNOE",
			"BNOS",
			"BNOW",
			"BSBE",
			"BSBW",
			"BSCE",
			"BSCN",
			"BSCW",
			"BSDE",
			"BSDN",
			"BSDS",
			"BSDW",
			"BSEE",
			"BSEN",
			"BSES",
			"BSEW",
			"BSOE",
			"BSON",
			"BSOW",
			"BWCE",
			"BWCN",
			"BWCS",
			"BWDE",
			"BWDN",
			"BWDS",
			"BWEE",
			"BWEN",
			"BWES",
			"BWEW",
			"BWOE",
			"BWON",
			"BWOS",
			"CECW",
			"CEDE",
			"CEDN",
			"CEDS",
			"CEDW",
			"CEEE",
			"CEEN",
			"CEES",
			"CEEW",
			"CEON",
			"CEOS",
			"CEOW",
			"CNCE",
			"CNCS",
			"CNCW",
			"CNDE",
			"CNDN",
			"CNDS",
			"CNDW",
			"CNEE",
			"CNEN",
			"CNES",
			"CNEW",
			"CNOE",
			"CNOS",
			"CNOW",
			"CSCE",
			"CSCW",
			"CSDE",
			"CSDN",
			"CSDS",
			"CSDW",
			"CSEE",
			"CSEN",
			"CSES",
			"CSEW",
			"CSOE",
			"CSON",
			"CSOW",
			"CWDE",
			"CWDN",
			"CWDS",
			"CWDW",
			"CWEE",
			"CWEN",
			"CWES",
			"CWEW",
			"CWOE",
			"CWON",
			"CWOS",
			"DEOE",
			"DEON",
			"DEOS",
			"DEOW",
			"DNOE",
			"DNON",
			"DNOS",
			"DNOW",
			"DSOE",
			"DSON",
			"DSOS",
			"DSOW",
			"DWOE",
			"DWON",
			"DWOS",
			"DWOW",
			"EEOE",
			"EEON",
			"EEOS",
			"EEOW",
			"ENOE",
			"ENON",
			"ENOS",
			"ENOW",
			"ESOE",
			"ESON",
			"ESOS",
			"ESOW",
			"EWOE",
			"EWON",
			"EWOS",
			"EWOW",
			"OEOW",
			"ONOE",
			"ONOS",
			"ONOW",
			"OSOE",
			"OSOW"
		],
		//For "SIDEWSWIPE"
		"B": [
			"DEEE",
			//NEW COMBOS ABOVE THIS LINE
			"AEAW",
			"AEAE",
			"AEAW",
			"AEBE",
			"AEBW",
			"AECE",
			"AECW",
			"AEDE",
			"AEDN",//
			"AEDS",//
			"AEDW",
			"AEEE",
			"AEEN",//
			"AEES",//
			"AEEW",
			"AEOE",
			"AEOW",
			"ANAN",
			"ANAS",
			"ANBN",
			"ANBS",
			"ANCN",
			"ANCS",
			"ANDE",//
			"ANDN",
			"ANDS",
			"ANDW",//
			"ANEE",//
			"ANEN",
			"ANES",
			"ANEW",//
			"ANON",
			"ANOS",
			"ASAS",
			"ASBN",
			"ASBS",
			"ASCN",
			"ASCS",
			"ASDE",//
			"ASDN",
			"ASDS",
			"ASDW",//
			"ASEE",//
			"ASEN",
			"ASES",
			"ASEW",//
			"ASON",
			"ASOS",
			"AWAW",
			"AWBE",
			"AWBW",
			"AWCE",
			"AWCW",
			"AWDE",
			"AWDN",//
			"AWDS",//
			"AWDW",
			"AWEE",
			"AWEN",//
			"AWES",//
			"AWEW",
			"AWOE",
			"AWOW",
			"BEBE",
			"BEBW",
			"BECE",
			"BECW",
			"BEDE",
			"BEDN",//
			"BEDS",//
			"BEDW",
			"BEEE",
			"BEEN",//
			"BEES",//
			"BEEW",
			"BEOE",
			"BEOW",
			"BNBN",
			"BNBS",
			"BNCN",
			"BNCS",
			"BNDE",//
			"BNDN",
			"BNDS",
			"BNDW",//
			"BNEE",//
			"BNEN",
			"BNES",
			"BNEW",//
			"BNON",
			"BNOS",
			"BSBS",
			"BSCN",
			"BSCS",
			"BSDE",//
			"BSDN",
			"BSDS",
			"BSDW",//
			"BSEE",//
			"BSEN",
			"BSES",
			"BSEW",//
			"BSON",
			"BSOS",
			"BWBW",
			"BWCE",
			"BWCW",
			"BWDE",
			"BWDN",//
			"BWDS",//
			"BWDW",
			"BWEE",
			"BWEN",//
			"BWES",//
			"BWEW",
			"BWOE",
			"BWOW",
			"CECE",
			"CECW",
			"CEDE",
			"CEDN",//
			"CEDS",//
			"CEDW",
			"CEEE",
			"CEEN",//
			"CEES",//
			"CEEW",
			"CEOE",
			"CEOW",
			"CNCN",
			"CNCS",
			"CNDE",//
			"CNDN",
			"CNDS",
			"CNDW",//
			"CNEE",//
			"CNEN",
			"CNES",
			"CNEW",//
			"CNON",
			"CNOS",
			"CSCS",
			"CSDE",//
			"CSDN",
			"CSDS",
			"CSDW",//
			"CSEE",//
			"CSEN",
			"CSES",
			"CSEW",//
			"CSON",
			"CSOS",
			"CWCW",
			"CWDE",
			"CWDN",//
			"CWDS",//
			"CWDW",
			"CWEE",
			"CWEN",//
			"CWES",//
			"CWEW",
			"CWOE",
			"CWOW",
			"DEOE",
			"DEON",//
			"DEOS",//
			"DEOW",
			"DNOE",//
			"DNON",
			"DNOS",
			"DNOW",
			"DSOE",//
			"DSON",
			"DSOS",
			"DSOW",//
			"DWOE",
			"DWON",//
			"DWOS",//
			"DWOW",
			"EEOE",
			"EEON",//
			"EEOS",//
			"EEOW",
			"ENOE",//
			"ENON",
			"ENOS",
			"ENOW",//
			"ESOE",//
			"ESON",
			"ESOS",
			"ESOW",//
			"EWOE",
			"EWON",//
			"EWOS",//
			"EWOW",
			"OEOE",
			"OEOW",
			"ONON",
			"ONOS",
			"OSOS",
			"OWOW"
		],
		//For "REAR-END"
		"C": [
			"BWDS",
			"ESBE",
			"ESBW",
			//NEW COMBOS ABOVE THIS LINE
			"AEAW",
			"AEAE",
			"AEBE",
			"AEBN",
			"AEBS",
			"AECE",
			"AECN",
			"AECS",
			"AEDE",
			"AEEE",
			"AEOE",
			"AEON",
			"AEOS",
			"ANAE",
			"ANAN",
			"ANAW",
			"ANBE",
			"ANBN",
			"ANBW",
			"ANCE",
			"ANCN",
			"ANCW",
			"ANDN",
			"ANEN",
			"ANOE",
			"ANON",
			"ANOW",
			"ASAE",
			"ASAS",
			"ASAW",
			"ASBE",
			"ASBS",
			"ASBW",
			"ASCE",
			"ASCS",
			"ASCW",
			"ASDS",
			"ASES",
			"ASOE",
			"ASOS",
			"ASOW",
			"AWAW",
			"AWBN",
			"AWBS",
			"AWBW",
			"AWCN",
			"AWCS",
			"AWCW",
			"AWDW",
			"AWEW",
			"AWON",
			"AWOS",
			"AWOW",
			"BEBE",
			"BECE",
			"BECN",
			"BECS",
			"BEDE",
			"BEEE",
			"BEOE",
			"BEON",
			"BEOS",
			"BNBE",
			"BNBN",
			"BNBW",
			"BNCE",
			"BNCN",
			"BNCW",
			"BNDN",
			"BNEN",
			"BNOE",
			"BNON",
			"BNOW",
			"BSBE",
			"BSBS",
			"BSBW",
			"BSCE",
			"BSCS",
			"BSCW",
			"BSDS",
			"BSES",
			"BSOE",
			"BSOS",
			"BSOW",
			"BWBW",
			"BWCN",
			"BWCS",
			"BWCW",
			"BWDW",
			"BWEW",
			"BWON",
			"BWOS",
			"BWOW",
			"CECE",
			"CEDE",
			"CEEE",
			"CEOE",
			"CEON",
			"CEOS",
			"CNCE",
			"CNCN",
			"CNCW",
			"CNDN",
			"CNEN",
			"CNOE",
			"CNON",
			"CNOW",
			"CSCE",
			"CSCS",
			"CSCW",
			"CSDS",
			"CSES",
			"CSOE",
			"CSOS",
			"CSOW",
			"CWCW",
			"CWDW",
			"CWEW",
			"CWON",
			"CWOS",
			"CWOW",
			"DEOE",
			"DNON",
			"DSOS",
			"DWOW",
			"EEOE",
			"ENON",
			"ESOS",
			"EWOW",
			"OEOE",
			"ONOE",
			"ONON",
			"ONOW",
			"OSOE",
			"OSOS",
			"OSOW",
			"OWOW"
		],
		//For "BROADSIDE"
		"D": [
			"ESAE",
			"EEDS",
			"DEEW",
			"AEDS",
			//NEW COMBOS ABOVE THIS LINE
			"AEAW",
			"AEBN",
			"AEBS",
			"AECN",
			"AECS",
			"AEON",
			"AEOS",
			"ANAE",
			"ANAW",
			"ANBE",
			"ANBW",
			"ANCE",
			"ANCW",
			"ANOE",
			"ANOW",
			"ASAE",
			"ASAW",
			"ASBE",
			"ASBW",
			"ASCE",
			"ASCW",
			"ASOE",
			"ASOW",
			"AWBN",
			"AWBS",
			"AWCN",
			"AWCS",
			"AWON",
			"AWOS",
			"BECN",
			"BECS",
			"BEDE",
			"BEDN",
			"BEDS",
			"BEDW",
			"BEEE",
			"BEEN",
			"BEES",
			"BEEW",
			"BEON",
			"BEOS",
			"BNBE",
			"BNBW",
			"BNCE",
			"BNCW",
			"BNDE",
			"BNDN",
			"BNDS",
			"BNDW",
			"BNEE",
			"BNEN",
			"BNES",
			"BNEW",
			"BNOE",
			"BNOW",
			"BSBE",
			"BSBW",
			"BSCE",
			"BSCW",
			"BSDE",
			"BSDN",
			"BSDS",
			"BSDW",
			"BSEE",
			"BSEN",
			"BSES",
			"BSEW",
			"BSOE",
			"BSOW",
			"BWCN",
			"BWCS",
			"BWDE",
			"BWDN",
			"BWDS",
			"BWDW",
			"BWEE",
			"BWEN",
			"BWES",
			"BWEW",
			"BWON",
			"BWOS",
			"CEDE",
			"CEDN",
			"CEDS",
			"CEDW",
			"CEEE",
			"CEEN",
			"CEES",
			"CEEW",
			"CEON",
			"CEOS",
			"CNCE",
			"CNCW",
			"CNDE",
			"CNDN",
			"CNDS",
			"CNDW",
			"CNEE",
			"CNEN",
			"CNES",
			"CNEW",
			"CNOE",
			"CNOW",
			"CSCE",
			"CSCW",
			"CSDE",
			"CSDN",
			"CSDS",
			"CSDW",
			"CSEE",
			"CSEN",
			"CSES",
			"CSEW",
			"CSOE",
			"CSOW",
			"CWDE",
			"CWDN",
			"CWDS",
			"CWDW",
			"CWEE",
			"CWEN",
			"CWES",
			"CWEW",
			"CWON",
			"CWOS",
			"ONOE",
			"ONOW",
			"OSOE",
			"OSOW"
		],
		//For "HIT OBJECT"
		"E": [
			"ALL"
		],
		//For "VEHICLE/PEDESTRIAN"
		"G": [
			"ALL"
		],
		//For "OTHER"
		"H": [
			"ALL"
		],
		//For "NOT STATED"
		"I": [
			"ALL"
		]
	}; 
	var indexTest;
	if (isIE()) {
		indexTest = ie.findIndex(code, valid[type]);
	} else {
		indexTest = valid[type].indexOf(code);
	}
	if (indexTest >= 0) {
		return true;
	} else if ( valid[type][0] == "ALL" ) {
		return true;
	} else {
		return false;
	}
}