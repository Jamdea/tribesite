//Retrieve the SVG settings
function getSVG(move, parameters) {
	var arrows = {
		//Stopped
		"A": [
			{//The arrow-head
				"points": [
					{"type": "M", "xy": [36, 16]},
					{"type": "L", "xy": [27, 16]},
					{"type": "L", "xy": [36, 0]},
					{"type": "L", "xy": [45, 16]},
					{"type": "L", "xy": [36, 16]},
					{"type": "Z"}
				],
				"properties": {
					"anchor": parameters.origin,
					"fillColor": "black",
					"fillOpacity": 1,
					"strokeOpacity": 0,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			},
			{//Line (multiplie striaght lines)
				"points": [
					{"type": "M", "xy": [36, 54]}, //Vertical straight line
					{"type": "L", "xy": [36, 16]},
					{"type": "M", "xy": [27, 42]}, //First horizontal line
					{"type": "L", "xy": [45, 42]},
					{"type": "M", "xy": [27, 48]}, //Second horizontal line
					{"type": "L", "xy": [45, 48]}
				],
				"properties": {
					"anchor": parameters.origin,
					"strokeWeight": 1.5*parameters.weight,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			}
		],
		
		
		//Straight
		"B": [
			{//Arrow-head
				"points": [
					{"type": "M", "xy": [36, 16]},
					{"type": "L", "xy": [27, 16]},
					{"type": "L", "xy": [36, 0]},
					{"type": "L", "xy": [45, 16]},
					{"type": "L", "xy": [36, 16]},
					{"type": "Z"}
				],
				"properties": {
					"anchor": parameters.origin,
					"fillColor": "black",
					"fillOpacity": 1,
					"strokeOpacity": 0,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			},
			{//Line (straight)
				"points": [
					{"type": "M", "xy": [36, 54]},
					{"type": "L", "xy": [36, 16]}
				],
				"properties": {
					"anchor": parameters.origin,
					"strokeWeight": 1.5*parameters.weight,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			}
		],
		
		
		//RoR
		"C": [
			{//Arrow-head
				"points": [
					{"type": "M", "xy": [36, 16]},
					{"type": "L", "xy": [27, 16]},
					{"type": "L", "xy": [36, 0]},
					{"type": "L", "xy": [45, 16]},
					{"type": "L", "xy": [36, 16]},
					{"type": "Z"}
				],
				"properties": {
					"anchor": parameters.origin,
					"fillColor": "black",
					"fillOpacity": 1,
					"strokeOpacity": 0,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			},
			{//Line (jagged)
				"points": [
					{"type": "M", "xy": [36, 54]},
					{"type": "L", "xy": [36, 48]},
					{"type": "L", "xy": [45, 24]},
					{"type": "L", "xy": [36, 24]},
					{"type": "L", "xy": [36, 16]}
				],
				"properties": {
					"anchor": parameters.origin,
					"strokeWeight": 1.5*parameters.weight,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			}
		],
		
		
		//Right  -- offset by 10pt
		"D": [
			{//Arrow-head (pointing right)
				"points": [
					{"type": "M", "xy": [54, 9]},
					{"type": "L", "xy": [54, 0]},
					{"type": "L", "xy": [70, 9]},
					{"type": "L", "xy": [54, 18]},
					{"type": "Z"}
				],
				"properties": {
					"anchor": parameters.origin,
					"fillColor": "black",
					"fillOpacity": 1,
					"strokeOpacity": 0,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			},
			{//Line (curved)
				"points": [
					{"type": "M", "xy": [54, 9]},
					{"type": "Q", "xy": [36, 9, 36, 27]},
					{"type": "L", "xy": [36, 54]}
				],
				"properties": {
					"anchor": parameters.origin,
					"strokeWeight": 1.5*parameters.weight,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			}
		],
		
		
		//Left  -- offset by 10pt
		"E": [
			{//Arrow-head (pointing left)
				"points": [
					{"type": "M", "xy": [18, 9]},
					{"type": "L", "xy": [18, 0]},
					{"type": "L", "xy": [2, 9]},
					{"type": "L", "xy": [18, 18]},
					{"type": "Z"}
				],
				"properties": {
					"anchor": parameters.origin,
					"fillColor": "black",
					"fillOpacity": 1,
					"strokeOpacity": 0,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			},
			{//Line (curved)
				"points": [
					{"type": "M", "xy": [18, 9]},
					{"type": "Q", "xy": [36, 9, 36, 27]},
					{"type": "L", "xy": [36, 54]}
				],
				"properties": {
					"anchor": parameters.origin,
					"strokeWeight": 1.5*parameters.weight,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			}
		],
		
		
		//U-Turn  -- offset by 10pt
		"F": [
			{//Arrow-head (pointing away from center)
				"points": [
					{"type": "M", "xy": [10, 18]},
					{"type": "L", "xy": [19, 18]},
					{"type": "L", "xy": [10, 34]}, 
					{"type": "L", "xy": [1, 18]},
					{"type": "Z"}
				],
				"properties": {
					"anchor": parameters.origin,
					"fillColor": "black",
					"fillOpacity": 1,
					"strokeOpacity": 0,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			},
			{//Line (curved)
				"points": [
					{"type": "M", "xy": [10, 18]},
					{"type": "Q", "xy": [10, 0, 23, 0]},
					{"type": "Q", "xy": [36, 0, 36, 18]},
					{"type": "L", "xy": [36, 54]}
				],
				"properties": {
					"anchor": parameters.origin,
					"strokeWeight": 1.5*parameters.weight,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			}
		],
		
		
		//Parked
		"O": [
			{//The arrow-head
				"points": [
					{"type": "M", "xy": [36, 16]},
					{"type": "L", "xy": [27, 16]},
					{"type": "L", "xy": [36, 0]},
					{"type": "L", "xy": [45, 16]},
					{"type": "L", "xy": [36, 16]},
					{"type": "Z"}
				],
				"properties": {
					"anchor": parameters.origin,
					"fillColor": "black",
					"fillOpacity": 1,
					"strokeOpacity": 0,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			},
			{//Lines (multiple criss-crossing)
				"points": [
					{"type": "M", "xy": [36, 54]}, //Standard vertical straight line
					{"type": "L", "xy": [36, 16]},
					{"type": "M", "xy": [27, 24]}, //Box
					{"type": "L", "xy": [27, 48]},
					{"type": "L", "xy": [45, 48]},
					{"type": "L", "xy": [45, 24]},
					{"type": "L", "xy": [27, 24]},
					{"type": "M", "xy": [27, 24]}, //Left slash
					{"type": "L", "xy": [45, 48]},
					{"type": "M", "xy": [45, 24]}, //Right slash
					{"type": "L", "xy": [27, 48]}
				],
				"properties": {
					"anchor": parameters.origin,
					"strokeWeight": 1.5*parameters.weight,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			}
		],
		
		
		//Overturned -- note that this is not a native movement type; it is a psuedo-type for head-on crashes of crashtype "F"
		"X": [
			{//Arrow-head
				"points": [
					{"type": "M", "xy": [36, 16]},
					{"type": "L", "xy": [27, 16]},
					{"type": "L", "xy": [36, 0]},
					{"type": "L", "xy": [45, 16]},
					{"type": "L", "xy": [36, 16]},
					{"type": "Z"}
				],
				"properties": {
					"anchor": parameters.origin,
					"fillColor": "black",
					"fillOpacity": 1,
					"strokeOpacity": 0,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			},
			{//Line (looped)
				"points": [
					{"type": "M", "xy": [36, 54]}, //Top part of the loop
					{"type": "L", "xy": [41, 35]},
					{"type": "C", "xy": [41, 28, 31, 28, 31, 35]},
					{"type": "M", "xy": [36, 16]}, //Bottom part of the loop
					{"type": "L", "xy": [31, 35]},
					{"type": "C", "xy": [31, 42, 41, 42, 41, 35]}
				],
				"properties": {
					"anchor": parameters.origin,
					"strokeWeight": 1.5*parameters.weight,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			}
		],
		
		
		//Object
		"OBJ": [
			{//Box
				"points": [
					{"type": "M", "xy": [27, 0]}, //Outline of box
					{"type": "L", "xy": [45, 0]},
					{"type": "L", "xy": [45, 24]},
					{"type": "L", "xy": [27, 24]},
					{"type": "L", "xy": [27, 0]},
					{"type": "M", "xy": [45, 0]}, //Left slash
					{"type": "L", "xy": [27, 24]},
					{"type": "M", "xy": [45, 24]}, //Right slash
					{"type": "L", "xy": [27, 0]}
				],
				"properties": {
					"anchor": parameters.origin,
					"strokeWeight": 1.2*parameters.weight,
					"scale": parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			}
		],
		
		
		//Bicycle
		"BIC": [
			{//Frame
				"points": [
					{"type": "M", "xy": [37.8, 16.5]}, //Main frame
					{"type": "L", "xy": [37.8, 23.3]},
					{"type": "L", "xy": [32.4, 18.2]},
					{"type": "L", "xy": [32.4, 8.1]},
					{"type": "L", "xy": [37.8, 16.5]},
					{"type": "L", "xy": [30.2, 18.9]},
					{"type": "L", "xy": [30.2, 16.2]},
					{"type": "M", "xy": [28.8, 11.2]}, //Handle bars
					{"type": "L", "xy": [28.8, 9.2]},
					{"type": "L", "xy": [37.8, 6.4]},
					{"type": "M", "xy": [32.8, 3.4]}, //Front wheel
					{"type": "Q", "xy": [32.8, 8.4, 37.8 , 8.4]},
					{"type": "Q", "xy": [42.8, 8.4, 42.8 , 3.4]},
					{"type": "Q", "xy": [42.8, -2.4, 37.8 , -2.4]},
					{"type": "Q", "xy": [32.8, -2.4, 32.8 , 3.4]},
					{"type": "M", "xy": [32.8, 23.3]}, //Back wheel
					{"type": "Q", "xy": [32.8, 28.3, 37.8 , 28.3]},
					{"type": "Q", "xy": [42.8, 28.3, 42.8 , 23.3]},
					{"type": "Q", "xy": [42.8, 18.3, 37.8 , 18.3]},
					{"type": "Q", "xy": [32.8, 18.3, 32.8 , 23.3]}
				],
				"properties": {
					"anchor": parameters.origin,
					"strokeWeight": 1*parameters.weight,
					"scale": 1.6*parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": false
				}
			}
		],
		
		"PED": [
			{//Body
				"points": [
					{"type": "M", "xy": [46.8, 13.97]}, //Shoulders
					{"type": "L", "xy": [40.89, 10.32]},
					{"type": "C", "xy": [40.89, 10.32, 40.03, 7.8, 39.17, 6]},
					{"type": "C", "xy": [36.33, 4.5, 34.19, 5.47, 32.64, 5.96]},
					{"type": "C", "xy": [31.09, 6.45, 27.02, 7.81, 27.02, 7.8]},
					{"type": "M", "xy": [46.8, 13.97]}, //Rest of body
					{"type": "L", "xy": [45.49, 14.93]},
					{"type": "L", "xy": [39.64, 12.89]},
					{"type": "L", "xy": [38.21, 11.11]},
					{"type": "L", "xy": [36.32, 14.24]},
					{"type": "L", "xy": [39.53, 19.47]},
					{"type": "L", "xy": [41.63, 27.73]},
					{"type": "L", "xy": [38.46, 28.44]},
					{"type": "L", "xy": [35.97, 20.84]},
					{"type": "L", "xy": [33.69, 18.37]},
					{"type": "L", "xy": [27.48, 28.44]},
					{"type": "L", "xy": [25.2, 26.92]},
					{"type": "L", "xy": [33.78, 8.3]},
					{"type": "L", "xy": [29.82, 8.55]},
					{"type": "L", "xy": [28.05, 14.44]},
					{"type": "L", "xy": [26.39, 14.44]},
					{"type": "L", "xy": [27.02, 7.8]}
				],
				"properties": {
					"anchor": parameters.origin,
					"strokeWeight": 1*parameters.weight,
					"scale": 1.2*parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": {x: 36, y: 12}
				}
			},
			{//Head - need a new icon because we use a slightly different strokeWeight
				"points": [
					{"type": "M", "xy": [41.75, 3.55]},
					{"type": "C", "xy": [41.89, 2.47, 40.89, 1.54, 39.49, 1.45]},
					{"type": "C", "xy": [38.09, 1.35, 36.88, 2.11, 36.75, 3.19]},
					{"type": "C", "xy": [36.62, 4.27, 37.61, 5.2, 39.01, 5.29]},
					{"type": "C", "xy": [40.41, 5.39, 41.62, 4.63, 41.75, 3.55]}
				],
				"properties": {
					"anchor": parameters.origin,
					"strokeWeight": 1.4*parameters.weight,
					"scale": 1.2*parameters.scale,
					"rotation": parameters.angle
				},
				"settings": {
					"vertical": {x: 36, y: 12}
				}
			}
		]
	};
	
	return arrows[move];
}