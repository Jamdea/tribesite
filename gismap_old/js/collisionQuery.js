function clearMap() {
	//map.graphics.clear();
	map.infoWindow.hide();
	selectionLayer.clear();
	outlineLayer.clear();
	if(heatLayer){
		map.removeLayer(heatLayer);
	}
}
var querystr;
var start=0;
function queryCollisions(){
	//console.log(new Date().getTime());

  // The parameters to pass to xhrGet, the url, how to handle it, and the callbacks.
  var xhrArgs = {
    url: "../../include/loginCheck.php",
    handleAs: "text"
  };
  // Call the asynchronous xhrGet
  var deferred = dojo.xhrGet(xhrArgs);
	deferred.then(function(){
		start=1;
		showLoading();
		clearMap();
		makequery(true);
	});
}
var queryLimit=1000;
var totalCount;
var fquery;
function showCollisions(type, geometry){
	showLoading();
	queryWait();
	activateNavtool("deactivate");
	//collFeatureLayer.setDefinitionExpression(querystr);
	//the database(SQL server) uses INTERSECT and the amazonservice uses INTERSECT_  (g is global option)
	/*
	if(querystr.search("INTERSECT=")>=0) querystr=querystr.replace(/INTERSECT=/g,"INTERSECT_=");
	if(querystr.search("DATE=")>=0) querystr=querystr.replace(/DATE=/g," DATE_=");
	if(querystr.search("MONTH=")>=0) querystr=querystr.replace(/MONTH=/g,"MONTH_=");
	if(querystr.search("TIME=")>=0) querystr=querystr.replace(/TIME=/g,"TIME_=");
	*/
	if(type==undefined){
		type=dijit.byId("clusterForm").attr("value").clusterOption;
	}
	collLayer.hide();
	//collFeatureLayer.setDefinitionExpression(querystr);

	// Make a limit as setting of the layer
	var query = new esri.tasks.Query();
	query.returnGeometry = true;
	query.where = querystr;
	if(geometry!=undefined) {
		query.geometry=geometry; // for refresh collisions
		document.getElementById("refreshExtent").style.display="block";
	}
	else{
		document.getElementById("refreshExtent").style.display="none";
	}
	query.outFields = ["CASEID","YEAR_","DATE_", "LOCATION","CRASHTYP","VIOLCAT", "KILLED", "INJURED", "CRASHSEV", "PEDCOL","BICCOL","MCCOL","TRUCKCOL","PRIMARYRD","SECONDRD","INTERSECT_","DISTANCE","DIRECT","INVOLVE"];
	collFeatureLayer.queryCount(query,function(count){
		showLoading();
		totalCount=count;
		// Save query history
		var temp=dijit.byId('city').item;
		var form_data = {
			total: totalCount,
			county: temp.county_ID[0],
			city: temp.city_ID[0],
			cityORroute: capitalize(routeNumber.value) == "All" ? "city" : "stroute",
			stroute: typeof(routeNumber) != "undefined" ? capitalize(routeNumber.value) : null,
			direct: typeof(routeDirection) != "undefined" ? capitalize(routeDirection.value) : null,
			stDate: fromdateYMD,
			edDate: todateYMD,
			factors: typeof(factors) != "undefined" ? JSON.stringify(factors) : null,
			select: typeof(select) != "undefined" ? JSON.stringify(select) : null,
			special: null
		};
		function capitalize (text) {
			return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
		}
		dojo.xhrPost({
			url: "query_history.php",
			timeout: 40000,
			content: form_data,
			error: function(error) {alert(error);}
		});
		switch(type){
		case "points":
			if(clusterLayer){
				map.removeLayer(clusterLayer);
			}
			if(heatLayer){
				map.removeLayer(heatLayer);
			}
			collFeatureLayer.queryFeatures(query,function(fset){
				var features=fset.features;
				collLayer.clear();
				for (var i=0, il=features.length; i<il; i++) {
					collLayer.add(features[i]);
				}
				queryResults(features.length);
				collLayer.show();
				hideLoading();
				//console.log(new Date().getTime());
			},function(error){alert(error);});

			// No limit method : collLayer mode:MODE_ONDEMAND
			//collLayer.setDefinitionExpression(querystr);

			//collLayer.queryCount(querystr,function(count){
			//	queryResults(count);
			//	collLayer.show();
			//	hideLoading();
			//});

			break;
		case "clusters":
			if(heatLayer){
				map.removeLayer(heatLayer);
			}
			addClusters(query);
			break;
		case "heatmap":
			if(clusterLayer){
				map.removeLayer(clusterLayer);
			}
			heatMap(query);
			break;
		}
	},function(error){alert(error);});

	// FarsLayer
  //farsLayer.setDefinitionExpression(farsquery);
  fquery = new esri.tasks.Query();
  fquery.returnGeometry = true;
  fquery.where = farsquery;
  if(geometry!=undefined) {
    fquery.geometry=geometry; // for refresh collisions
  }
  if(farsLayer.visible){
    farsLayer.selectFeatures(fquery);
	}
}
function queryWait(){
	document.getElementById('queryResult').innerHTML="<img src='images/loading.gif'><br>Please wait.<br>";
	document.getElementById('download').style.display="none";
	document.getElementById('statistics').style.display="none";
}
function queryResults(num){
	if(totalCount>queryLimit){
		document.getElementById('queryResult').innerHTML="<img src='images/warning-icon.png'><br>Only " + num + " out of " + totalCount +" collisions were mapped. <br>";
		document.getElementById('queryResult').innerHTML+= 'Please zoom in and <br><a id="refreshCollision" href="#" style="font-style:italic;color:blue;cursor:pointer">Refresh Collisions</a>';
		document.getElementById('diagram').style.display="none";
		document.getElementById('download').style.display="none";
		document.getElementById('statistics').style.display="none";
	}
	else{
		document.getElementById('queryResult').innerHTML= num + " collisions mapped.";
		document.getElementById('diagram').style.display="none";
		document.getElementById('download').style.display="block";
		document.getElementById('statistics').style.display="block";
	}
	checkProvisionalData();
	document.getElementById('selectResult').innerHTML= "";
	if(dijit.byId('resultsPane').open==false) {
		dijit.byId('resultsPane').toggle();
	}
	if(totalCount>queryLimit){
		dojo.connect(document.getElementById("refreshCollision"),'onclick',function(){
			setTimeout(function(){dijit.byId('refreshDialog').show();},100);
		});
	}
}
function checkProvisionalData(){
	var text = "";
	for(var year = Number(fromdateYMD.substring(0,4)); year <= Number(todateYMD.substring(0,4)); year++){
		if (inArray(year, provisional)) {
			text = year.toString();
			if (year == Number(todateYMD.substring(0,4))) {
				break;
			}
			else {
				text = text + " - " + todateYMD.substring(0,4);
				break;
			}
		}
	}
	if (text.length) {
		text="Warning: "+text+" data is provisional and incomplete.";
		document.getElementById('queryResult').innerHTML+="<div style='color:red'>"+text+"</div>";
	}
}
var basequery;
var mysqlquery;
var fromdateYMD;
var todateYMD;
var farsquery;
function createBaseQuery(){
	var county=dijit.byId('county').attr('value');
	var city =dijit.byId('city').attr('displayedValue');
	var fromdate=dijit.byId('FromDate').get('value');
	var todate=dijit.byId('ToDate').get('value');

	if(fromdate && todate) {
		// Date format yyyy-MM-dd works for both servers. A datetextbox returns a string in MM/dd/yyyy format. Format change is required.
		fromdateYMD=dojo.date.locale.format(fromdate, {datePattern: "yyyy-MM-dd", selector: "date"});
		todateYMD=dojo.date.locale.format(todate, {datePattern: "yyyy-MM-dd", selector: "date"});
		basequery = "DATE_>='" + fromdateYMD + "' AND DATE_<='" + todateYMD + " 01:00:00'" ;
		//farsquery = "(CONVERT(DATETIME, CONVERT(CHAR(4), YEAR) + RIGHT('0' + CONVERT(VARCHAR(2), MONTH),2) + RIGHT('0' + CONVERT(VARCHAR(2), DAY),2)) BETWEEN '" + fromdateYMD + "' AND '" + todateYMD + "')";
	}
	if(basequery != "") {
		basequery += " AND ";
		//farsquery += " AND ";
	}
	// For mysql query, city should be changed to location
	var temp=dijit.byId('city').item;
	if(temp.city_ID[0]=="All"){
		mysqlquery=basequery + "COUNTY='"+county+"'";
	}
	else{
		var location=temp.county_ID[0]+temp.city_ID[0];
		mysqlquery=basequery + "LOCATION='" + location + "'";
	}
	// following is for arcgis server
	if(city == "UNINCORPORATED"){
		basequery += "COUNTY='"+county+"'"+ " AND " +"CITY='"+city+"'";
		//farsquery += "COUNTY_C='"+county+"'"+ " AND " +"City_Name='"+city+"'";
	}
	else if(city != "" && temp.city_ID[0] != "All"){
		basequery += "CITY='"+city+"'";
		//farsquery += "City_Name='"+city+"'";
	}
	else if(county){
		basequery += "COUNTY='"+county+"'";
		//farsquery += "COUNTY_C='"+county+"'"
	}
  farsquery = basequery.replace("COUNTY='", "COUNTY_1='");
  farsquery = farsquery.replace("CITY='", "NAME='");
}
var factorQuery=[];
function makequery (showcollision){
	createBaseQuery();
	// check if factors are added
	if(document.getElementById('query_box').innerHTML==""){
		querystr=basequery;
		if(showcollision) showCollisions();
	}
	else {
		var quotation = "'";

		showLoading();
		// Check for the collision factors
		for(var type=1;type<=3;type++){
			factorQuery[type]="";
			if(factors[type]!=""){
				//alert(factors[1]+"collision Factors");
				for(var group in factors[type]){
					if(group!=undefined) {
						var factor=factors[type][group];
						//alert(factors[type][group]);
						var factorvalue=select[type][group];

						factorQuery[type] +=" AND (";

						var tag=0;
						for(var ii in factorvalue){
							if(ii!=undefined && ii!="name") {
								if(tag == 1) factorQuery[type] += " OR ";

								// special case in collision factors
								if(factor=="YEAR_" || factor=="TIMECAT" || factor=="MONTH" || factor=="KILLED" || factor=="INJURED" ) quotation = "";
								else quotation = "'";
								if ((factor=="KILLED" || factor=="INJURED") && factorvalue[ii]=="3"){
									factorQuery[type] += factor + ">=" + factorvalue[ii];
								}
								// special case in party, victim factors (combobox)
								else if(factor=="PAGE" || factor=="PARNUM" || factor=="VAGE"){
									var range=factorvalue[ii].split(" to ");
									factorQuery[type] += factor + ">=" + range[0] + " AND " + factor + "<=" + range[1];
								}
								// General factors
								else if (factorvalue[ii]=="- or blank"){
									factorQuery[type] += factor + "=" + quotation + "-" + quotation + " OR " + factor + "=" + quotation + "" + quotation;
								}
								else {
									factorQuery[type] += factor + "=" + quotation + factorvalue[ii] + quotation;
								}
								tag=1;
							}
						}
						factorQuery[type] += ")";
					}
				}
				//alert(type + ": " + factorQuery[type]);
			}
		}
		// option for (ped and bike) or (ped or bike)
		if(factorQuery[1].search("PEDCOL='Y'")>=0 && factorQuery[1].search("BICCOL='Y'")>=0){
			document.getElementById("showcollision").value=showcollision;
			dijit.byId('pedOrbike').show();
		}
		else {
			createQueryStr(showcollision);
		}
	}
}
function goPedOrbike(){
	factorQuery[1]=factorQuery[1].replace("AND (PEDCOL='Y')","");
	factorQuery[1]=factorQuery[1].replace("AND (BICCOL='Y')","");
	factorQuery[1]=factorQuery[1]+" AND (PEDCOL='Y' OR BICCOL='Y')";

	var showcollision=document.getElementById("showcollision").value;
	createQueryStr(showcollision);
}
function createQueryStr(showcollision){
	basequery+=factorQuery[1];// collision factors

	// stroute check
	if(dijit.byId('stroute').attr('value')=="Y" && dijit.byId("routeNumber").attr('displayedValue')!=="ALL"){
		basequery+=" AND (STROUTE=" + dijit.byId("routeNumber").attr('displayedValue') + ")";

		if(dijit.byId("routeDirection").attr('displayedValue')!=="ALL"){
			basequery+=" AND (SIDEHW='" + dijit.byId("routeDirection").attr('displayedValue') + "')";
		}
	}
	if(factorQuery[2].length>0 || factorQuery[3].length>0){
		// Get caseids from MySQL database
		mysqlquery+=factorQuery[1];
		var queryUrl = "queryajax.php?basequery="+encodeURIComponent(mysqlquery.replace(/=''/g," IS NULL"));

		if(factorQuery[2].length>0) { // party factor
			factorQuery[2]=factorQuery[2].substr(5); // remove first ' and '
			queryUrl += "&queryParty=" + encodeURIComponent(factorQuery[2]);
		}
		if(factorQuery[3].length>0) { // victim factor
			factorQuery[3]=factorQuery[3].substr(5); // remove first ' and '
			queryUrl += "&queryVictim=" + encodeURIComponent(factorQuery[3]);
		}
		dojo.xhrGet({
			url: queryUrl,
			timeout: 40000,
			load: function(result) {
				hideLoading();
				if(result) {
					var newQuery = " AND CASEID IN (" + result + ")";
					querystr=basequery+newQuery;
				}
				else{
					querystr=basequery;
				}
				if(showcollision) showCollisions();
			},
			error: function(error) {alert(error);}
		});
	}
	else{
		querystr=basequery;
		if(showcollision) showCollisions();
	}
}