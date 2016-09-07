/*
Summary Statistics when using setDefinitionExpression as a query method

function drawVisualization(){
	var query = new esri.tasks.Query();
	//query.where = querystr;

	//console.log(query.where);
	var sd1 = new esri.tasks.StatisticDefinition();
	sd1.statisticType = "count";
	sd1.onStatisticField = "CASEID";
	sd1.outStatisticFieldName = "TotalCollisions";
	query.outStatistics = [sd1];

	var option2=dijit.byId("statForm").attr("value").statOption1;
	var caseids=[];
	switch(option2){
	case "All":
		break;
	case "Selected":
		dojo.forEach(collLayer.graphics, function(graphic){
			if(graphic.symbol==highlightSymbol){
				caseids.push(graphic.attributes['CASEID'].toString());
			}
		});
		query.where= "CASEID=" + caseids.join(" OR CASEID=");
		break;
	case "Current":
		dojo.forEach(collLayer.graphics, function(graphic){
			caseids.push(graphic.attributes['CASEID'].toString());
		});
		query.where= "CASEID=" + caseids.join(" OR CASEID=");
		break;
	}
	query.groupByFieldsForStatistics = ["CRASHSEV"];
	collLayer.queryFeatures(query,severityChart);

	query.groupByFieldsForStatistics = ["CRASHTYP"];
	collLayer.queryFeatures(query,crashtypChart);

	query.groupByFieldsForStatistics = ["VIOLCAT"];
	collLayer.queryFeatures(query,pcfTable);
}
*/
function drawVisualization(){
	var name;
	var tempLoading;
	var chart=["severityTab","pcfTab","coltypeTab","involveTab"];
	for(name in chart){
		tempLoading=dojo.clone(loading);
		dojo.place(tempLoading,dojo.byId(chart[name]));
		esri.show(tempLoading);
	}
	var query = new esri.tasks.Query();
	var sd1 = new esri.tasks.StatisticDefinition();
	sd1.statisticType = "count";
	sd1.onStatisticField = "CASEID";
	sd1.outStatisticFieldName = "TotalCollisions";
	query.outStatistics = [sd1];

	var option2=dijit.byId("statForm").attr("value").statOption1;
	//var option2=dijit.byId("statForm").value.statOption1; // This contains previous clicked information. not use!
	var caseids=[];
	switch(option2){
	case "All":
		dojo.forEach(collLayer.graphics, function(graphic){
			caseids.push(graphic.attributes['CASEID'].toString());
		});

		break;
	case "Selected":
		dojo.forEach(collLayer.graphics, function(graphic){
			if(graphic.symbol==highlightSymbol){
				caseids.push(graphic.attributes['CASEID'].toString());
			}
		});
		break;
	case "Current":
		dojo.forEach(collLayer.graphics, function(graphic){
			if(map.extent.contains(graphic.geometry)){
				caseids.push(graphic.attributes['CASEID'].toString());
			}
		});
		break;
	}
	document.getElementById("statTotal").innerHTML=caseids.length + " collisions in chosen extent.";

	query.where= querystr + " AND CASEID IN ('" + caseids.join("','")+ "')";

	query.groupByFieldsForStatistics = ["CRASHSEV"];
	collFeatureLayer.queryFeatures(query,severityChart);

	query.groupByFieldsForStatistics = ["CRASHTYP"];
	collFeatureLayer.queryFeatures(query,crashtypChart);

	query.groupByFieldsForStatistics = ["VIOLCAT"];
	collFeatureLayer.queryFeatures(query,pcfTable);

	query.groupByFieldsForStatistics = ["INVOLVE"];
	collFeatureLayer.queryFeatures(query,involveChart);

}
function severityChart(fset){
	var data = new google.visualization.DataTable();
	data.addColumn('string','Severity');
	data.addColumn('number','Number of Collisions');
	dojo.forEach(fset.features, function(feature){
		var sev = feature.attributes['CRASHSEV'];
		if (Number.isInteger(sev)) {
			sev = sev.toString(sev);
		}
		var severity = sev.replace("1","1 - Fatal").replace("2","2 - Injury (Severe)").replace("3","3 - Injury (Other Visible)").replace("4","4 - Injury (Complaint of Pain)");
		data.addRow([severity,feature.attributes['TotalCollisions']]);
	});
	var sevChart = new google.visualization.PieChart(document.getElementById('severityTab'));
	data.sort([{column:0}]);
	sevChart.draw(data, {
		//title : 'Number of Collisions by Severity',
		//titleTextStyle: {color: 'black', fontSize: 14},
		chartArea: {left: 10, top:20, bottom: 0, width: "85%", height: "85%"},
		backgroundColor: '#E0E0E0',
		pieSliceTextStyle: {fontSize: 14},
		height: 300,
		width: 500
	});

}
function crashtypChart(fset){
	var data = new google.visualization.DataTable();
	data.addColumn('string','Collision Type');
	data.addColumn('number','Number of Collisions');
	dojo.forEach(fset.features, function(feature){
		switch(feature.attributes['CRASHTYP']){
		case "A":
			var crashtyp="A - Head-On";
			break;
		case "B":
			var crashtyp="B - Sideswipe";
			break;
		case "C":
			var crashtyp="C - Rear End";
			break;
		case "D":
			var crashtyp="D - Broadside";
			break;
		case "E":
			var crashtyp="E - Hit Object";
			break;
		case "F":
			var crashtyp="F - Overturned";
			break;
		case "G":
			var crashtyp="G - Veh / Ped";
			break;
		case "H":
			var crashtyp="H - Other";
			break;
		default:
			var crashtyp="- - Not Stated";
		}
		data.addRow([crashtyp,feature.attributes['TotalCollisions']]);
	});
	data.sort([{column:0}]);
	var crashChart = new google.visualization.ColumnChart(document.getElementById('coltypeTab'));
	crashChart.draw(data, {
		//title: 'Number of Collisions by Collision Type',
		//titleTextStyle: {color: 'black', fontSize: 14},
		hAxis: {slantedText: true, slantedTextAngle: 40},
		chartArea: {left: 40, top:40, width:"90%", height:"60%"},
		backgroundColor: '#E0E0E0',
		height: 300,
		width: 500,
		legend: {position: 'none'}
	});
}
function pcfTable(fset){
	var data = new google.visualization.DataTable();
	data.addColumn('string','Primary Collision Factor');
	data.addColumn('number','Collisions');
	data.addColumn('number','Percentage');

	var total=0;
	dojo.forEach(fset.features, function(feature){
		total+=feature.attributes['TotalCollisions'];
	});
	dojo.forEach(fset.features, function(feature){
		switch(feature.attributes['VIOLCAT']){
		case "00":
			var violcat="00 - Unknown";
			break;
		case "01":
			var violcat="01 - Driving or Bicycling Under the Influence of Alcohol or Drug";
			break;
		case "02":
			var violcat="02 - Impeding Traffic";
			break;
		case "03":
			var violcat="03 - Unsafe Speed";
			break;
		case "04":
			var violcat="04 - Following Too Closely";
			break;
		case "05":
			var violcat="05 - Wrong Side of Road";
			break;
		case "06":
			var violcat="06 - Improper Passing";
			break;
		case "07":
			var violcat="07 - Unsafe Lane Change";
			break;
		case "08":
			var violcat="08 - Improper Turning";
			break;
		case "09":
			var violcat="09 - Automobile Right of Way";
			break;
		case "10":
			var violcat="10 - Pedestrian Right of Way";
			break;
		case "11":
			var violcat="11 - Pedestrian Violation";
			break;
		case "12":
			var violcat="12 - Traffic Signals and Signs";
			break;
		case "13":
			var violcat="13 - Hazardous Parking";
			break;
		case "14":
			var violcat="14 - Lights";
			break;
		case "15":
			var violcat="15 - Brakes";
			break;
		case "16":
			var violcat="16 - Other Equipment";
			break;
		case "17":
			var violcat="17 - Other Hazardous Violation";
			break;
		case "18":
			var violcat="18 - Other Than Driver (or Pedestrian)";
			break;
		case "19":
			var violcat="19 -";
			break;
		case "20":
			var violcat="20 -";
			break;
		case "21":
			var violcat="21 - Unsafe Starting or Backing";
			break;
		case "22":
			var violcat="22 - Other Improper Driving";
			break;
		case "23":
			var violcat="23 - Pedestrian or 'Other' Under the Influence of Alcohol or Drug";
			break;
		case "24":
			var violcat="24 - Fell Asleep";
			break;
		default:
			var violcat="- - Not Stated";
		}
		data.addRow([violcat,feature.attributes['TotalCollisions'],feature.attributes['TotalCollisions']/total]);
	});
	data.sort([{column:0}]);
	var formatter = new google.visualization.NumberFormat({
		pattern: '#.#%'
	});
	formatter.format(data, 2); // Apply formatter to second column
	var ac = new google.visualization.Table(document.getElementById('pcfTab'));
	ac.draw(data);
}
function involveChart(fset){
	var data = new google.visualization.DataTable();
	data.addColumn('string','Motor Vehicle Involved With');
	data.addColumn('number','Collisions');
	data.addColumn('number','Percentage');

	var total=0;
	dojo.forEach(fset.features, function(feature){
		total+=feature.attributes['TotalCollisions'];
	});
	dojo.forEach(fset.features, function(feature){
		switch(feature.attributes['INVOLVE']){
		case "A":
			var involve="A - Non-Collision";
			break;
		case "B":
			var involve="B - Pedestrian";
			break;
		case "C":
			var involve="C - Other Motor Vehicle";
			break;
		case "D":
			var involve="D - Motor Vehicle on Other Roadway";
			break;
		case "E":
			var involve="E - Parked Motor Vehicle";
			break;
		case "F":
			var involve="F - Train";
			break;
		case "G":
			var involve="G - Bicycle";
			break;
		case "H":
			var involve="H - Animal";
			break;
		case "I":
			var involve="I - Fixed Object";
			break;
		case "J":
			var involve="J - Other Object";
			break;
		default:
			var involve="- - Not Stated";
		}
		data.addRow([involve,feature.attributes['TotalCollisions'],feature.attributes['TotalCollisions']/total]);
	});
	data.sort([{column:0}]);
	var formatter = new google.visualization.NumberFormat({
		pattern: '#.#%'
	});
	formatter.format(data, 2); // Apply formatter to second column
	var ac = new google.visualization.Table(document.getElementById('involveTab'));
	ac.draw(data);
}
