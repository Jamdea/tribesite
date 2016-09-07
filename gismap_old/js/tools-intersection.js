/*
Intersection Collision Count Rank Tool
*/
function showIntersection(){
	createFactorList();

	var tab = document.getElementById("rankTab");
	if(tab !== null){
		var tabs = dijit.byId("intersectionTab");
		tabs.removeChild(dijit.byId("rankTab"));
		dijit.byId("rankTab").destroy();
	}
	dijit.byId("intersectionDialog").show();
	//dojo.style("intersectionDialog","background-color","#AAAAAA");
	var co = dojo.coords("map"); // element below which I want to display dialog

	dojo.style("intersectionDialog","top",(co.y + 25) + "px");
	dojo.style("intersectionDialog","left", (co.x + 25) + "px");
}
function createRank(){
	intersectionProcess(true);
	var county=dijit.byId("county").attr("value");
	var city=dijit.byId("city").attr("displayedValue");

	if(city=="ALL"){
		document.getElementById("interMsg").innerHTML = "You must first select a city or unincorporated area from the Map SWITRS menu.";
		intersectionProcess(false);
	}
	else{
		document.getElementById("interMsg").innerHTML = "";
		var temp="COUNTY='"+county+"' AND CITY='"+city+"'";

		// Query task setup for intersection layer
		var queryTask = new esri.tasks.QueryTask(server + "14");
		var query = new esri.tasks.Query();
		query.outSpatialReference = map.spatialReference;
		query.returnGeometry = true;
		query.where = temp;
		query.outFields = ["Names","POINT_X","POINT_Y"];
		// Buffer setup on intersection layer query result
		var distance =parseInt(document.getElementById("distanceIntersection").value, 10);

		var features;
		var countResult= [];
		queryTask.execute(query,function(fset){
			features=fset.features;
			var geometries=[];
			for(var i=0;i<features.length;i++){
				geometries.push(features[i].geometry);
			}

			var params = new esri.tasks.BufferParameters();
			params.distances = [distance];
			params.unit = eval("esri.tasks.GeometryService.UNIT_FOOT");
			params.outSpatialReference = map.spatialReference;

			params.geometries = geometries;
			params.unionResults=true;

			makequery(false); // update/create querystr variable

			gsvc.buffer(params, function(results){
				var query2 = new esri.tasks.Query();
				query2.where = querystr;
				query2.geometry=results[0];
				query2.outFields=["POINT_X","POINT_Y"];
				collFeatureLayer.queryFeatures(query2,function(fset){
					var colfeatures=fset.features;
					var count;
					for(i=0;i<features.length;i++){
						count=0;
						for(var j=0;j<colfeatures.length;j++){
							var diff=distanceDiff(features[i].attributes.POINT_Y,features[i].attributes.POINT_X,colfeatures[j].attributes.POINT_Y,colfeatures[j].attributes.POINT_X);

							if(diff<=distance){
								count++;
							}
						}
						if(count){
							countResult.push({
								name: features[i].attributes.Names,
								count: count,
								geometry: features[i].geometry
							});
						}
					}
					countResult.sort(function(a,b){
						return b.count-a.count;
					});
					//console.log(countResult);
					topChart(countResult);
				});
			});
		});
		var distanceDiff = function(lat1, lon1, lat2, lon2){ // Haversine Formula
			var dLon = (lon2-lon1)* Math.PI / 180;
			var dLat = (lat2-lat1)* Math.PI / 180;
			lat1 = lat1* Math.PI / 180;
			lat2 = lat2* Math.PI / 180;

			var a = 6378.137; // km
			var b = 6356.752; // km
			var e = Math.sqrt(1-(b*b)/(a*a));

			var R = a * Math.sqrt(1-e*e) / (1-e*e*Math.sin(lat1)*Math.sin(lat1)); // Earth radius on selected latitude

			a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			var d = R * c;
			return d*3280.839895; // Return as feet
		};
	}
}
function createFactorList(){
	var county=dijit.byId("county").attr("value");
	var city =dijit.byId("city").attr("displayedValue");
	var fromdate=dijit.byId("FromDate").get("value");
	var todate=dijit.byId("ToDate").get("value");

	var fromdateMDY=dojo.date.locale.format(fromdate, {datePattern: "MM/dd/yyyy", selector: "date"});
	var todateMDY=dojo.date.locale.format(todate, {datePattern: "MM/dd/yyyy", selector: "date"});

	var html = "<div><b>County</b>: " + county + "</div>";
	html += "<div><b>City</b>: " + city + "</div>";
	html += "<div><b>Date</b>: " + fromdateMDY + " to " + todateMDY + "</div>";

	var nodes = dojo.query("#query_box")[0].childNodes;
	dojo.forEach(nodes, function(node){
		var id = node.id.replace("group", "item");
		var items = node.childNodes;

		html += "<div>" + getNodeLabel(items) + ": ";
		dojo.forEach(items, function(item){
			if(item.id.indexOf(id) > -1){
				html += getNodeLabel(item.childNodes) + ", ";
			}
		});
		html = html.replace(/, $/,"");
		html += "</div>";
	});
	document.getElementById("interFactorList").innerHTML = html;

	function getNodeLabel(node){
		for(var i = 0; i < node.length; i++){
			if(node[i].tagName.toUpperCase() == "DIV"){
				return node[i].innerHTML;
			}
		}
	}
}
function topChart(countResult){
	var data = new google.visualization.DataTable();
	data.addColumn("number","Rank");
	data.addColumn("string","Intersection");
	data.addColumn("number","Collisions");

	var ranks=[];
	var top=10;
	ranks.push(1); // For first top rank intersection. it's always 1.
	for(var i=1;i<countResult.length;i++){ // start with second
		if(countResult[i].count==countResult[i-1].count){
			ranks.push(ranks[ranks.length-1]);
		}
		else {
			if (i+1 <= top){
				ranks.push(i+1);
			}
			else {
				i=countResult.length;
			}
		}
	}
	for(i=0; i < ranks.length; i++){
		//var html = "<a href='#' onclick='zoomToIntersection(" + countResult[i].geometry.x + "," + countResult[i].geometry.y + ")'>" + ranks[i],countResult[i].name + "</a>";
		var html = "<a href='#' onclick='zoomToIntersection(" + countResult[i].geometry.x + "," + countResult[i].geometry.y + ")'>" + countResult[i].name + "</a>";
		data.addRow([ranks[i], html, countResult[i].count]);
	}
	var tab = document.getElementById("rankTab");
	var tabs = dijit.byId("intersectionTab");
	if(tab === null){
    	var pane = new dijit.layout.ContentPane({
	    	id: "rankTab",
    		title:"Top 10 Intersections",
    		style: "height:300px; width: 500px;overflow:hidden"
   		});
    	tabs.addChild(pane);
    }
    tabs.selectChild(dijit.byId("rankTab"));
	var ac = new google.visualization.Table(document.getElementById("rankTab"));
	ac.draw(data, {
		allowHtml: true
	});
	intersectionProcess(false);
}
function zoomToIntersection(geo_x, geo_y){
	var point = new esri.geometry.Point([geo_x, geo_y]);
	map.centerAndZoom(point, 18);
}
function intersectionProcess(flag){
	if(flag){
		document.getElementById("intersectionLoadingImg").style.display = "block";
		dijit.byId("intersectionGenerate").setDisabled(true);
		dojo.style(dijit.byId("intersectionDialog").closeButtonNode,"display","none");
	}
	else{
		document.getElementById("intersectionLoadingImg").style.display = "none";
		dijit.byId("intersectionGenerate").setDisabled(false);
		dojo.style(dijit.byId("intersectionDialog").closeButtonNode,"display","inline");
	}
}