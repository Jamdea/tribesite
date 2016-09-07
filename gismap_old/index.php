<!DOCTYPE html>
<head>
<?php
include "../../php/config.php";
include "../../php/mysql.php";
include "../../include/ga.php";
$db->connect($dbhost, $dbid, $dbpass, $dbname, $dbport);
include "../../include/loginCheck.php";
if (substr($_SERVER['HTTP_HOST'], 0, 4) === 'www.') {
		header('Location: http'.(isset($_SERVER['HTTPS']) && $_SERVER['HTTPS']=='on' ? 's':'').'://' . substr($_SERVER['HTTP_HOST'], 4).$_SERVER['REQUEST_URI']);
		exit;
}
if (isset($title)){print "<title>". $title ."</title>";}
	else {?><title>SWITRS GIS MAP</title><?php }
if (isset($_SERVER['HTTP_USER_AGENT']) && (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false)) header('X-UA-Compatible: IE=edge,chrome=1');
?>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<meta http-equiv="X-UA-Compatible" content="IE=7,IE=9" />

	<title>SWITRS GIS Map</title>
	<link rel="shortcut icon" href="<?php print $BASE_URL;?>images/favicon.ico">
	<link rel="stylesheet" href="css/layout.css">
	<script>
		var dojoConfig = {
			parseOnLoad: true,
			locale: "en-us",
			packages: [{
				"name": "extras",
				"location": location.pathname.replace(/\/[^/]+$/, '') + "/extras"
			}]
		};
		var minyear=<?php print $minyear;?>;
		var startyear=<?php print $startyear;?>;
		var endyear=<?php print $endyear;?>;
		var provisional=[];
		for(var i=startyear+1;i<=endyear;i++) {
			provisional.push(i);
		}
		var server=<?php echo json_encode($arcgis);?>;
		</script>
	<script src="//js.arcgis.com/3.2/"></script>
	<script>
		dojo.require("dijit.Dialog");
		dojo.require("dojo.parser");
		dojo.require("dijit.layout.BorderContainer");
		dojo.require("dijit.layout.TabContainer");
		dojo.require("dijit.layout.ContentPane");
		dojo.require("dijit.form.Form");
		dojo.require("dijit.form.DateTextBox");
		dojo.require("dijit.form.Button");
		dojo.require("dijit.form.RadioButton");
		dojo.require("dijit.form.FilteringSelect");
		dojo.require("dijit.form.CheckBox");
		dojo.require("dijit.form.ComboBox");
		dojo.require("dijit.TitlePane");
		dojo.require("dijit.Toolbar");
		dojo.require("dijit.Menu");
		dojo.require("dojo.data.ItemFileReadStore");
		dojo.require("dojo.date.locale");
		dojo.require("dojox.layout.FloatingPane");
		dojo.require("dojox.layout.ExpandoPane");
		dojo.require("dojox.widget.TitleGroup");

		dojo.require("esri.map");
		dojo.require("esri.tasks.locator");
		dojo.require("esri.tasks.query");
		dojo.require("esri.dijit.Popup");
		dojo.require("esri.dijit.OverviewMap");
		dojo.require("esri.dijit.Scalebar");
		dojo.require("esri.dijit.Measurement");
		dojo.require("esri.dijit.BasemapGallery");
		dojo.require("esri.dijit.Print");
		dojo.require("esri.layers.FeatureLayer");
		dojo.require("extras.ClusterLayer");

		// csv file
		dojo.require("dojox.data.CsvStore");
		dojo.require("dojo.io.iframe");
		dojo.require("dojox.encoding.base64");

		// shape file
		dojo.require("dojo.io.script");
	</script>
	<script src="js/arcgis.js"></script>
	<script src="js/address.js"></script>
	<script src="js/tools.js"></script>
	<script src="js/box.js"></script>
	<script src="js/cluster.js"></script>
	<script src="js/collisionQuery.js"></script>
	<script src="extras/xmlutil.js"></script>
	<script src="extras/heatmap-base.js"></script>
	<script src="extras/heatmap-arcgis.js"></script>

	<script src='//www.google.com/jsapi?autoload={"modules":[{"name":"visualization","version":"1","packages":["corechart","table"]}]}'></script>
	<script src="js/chart.js"></script>
	<script src="js/import.js"></script>
	<script src="js/tools-intersection.js"></script>
	<script>
	var highlightSymBol, defaultSymbol;
	var navToolbar, drawing, refreshing;
	var locator;
	var loading;
	var identifyTask, identifyParams;

	dojo.ready(init);
	function init() {
		loading = document.getElementById("loadingImg");  //loading image. id
		var initExtent = new esri.geometry.Extent({
			"xmin": -13849947.1077,
			"ymin": 3833641.0796,
			"xmax": -12705116.39,
			"ymax": 5162385.525,
			"spatialReference": {"wkid": 102100}
		});
		esri.config.defaults.map.sliderLabel = null;
		esri.config.defaults.map.slider = { left: "10px", top:"10px", height:"120px" };
		esri.config.defaults.io.proxyUrl = "proxy.php";
		highlightSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 12, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 1), new dojo.Color([255,255,0,0.9]));
		defaultSymbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE, 10, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([70,70,70]), 1), new dojo.Color([255,215,0,0.5]));
		//setup the popup window
		var popup = new esri.dijit.Popup({
			fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.25])),
			offsetX: 30,
			offsetY: 30
		}, dojo.create("div"));
		popup.resize(310,210);

		map = new esri.Map("map", {
			extent: initExtent,
			infoWindow: popup,
			logo: true,
			//displayGraphicsOnPan: false,
			wrapAround180:true,
			showInfoWindowOnClick:false,  //turn off the default popup on feature layer click we'll handle this with map click
			showAttribution: false
		});
		map.disableDoubleClickZoom();
		navToolbar = new esri.toolbars.Navigation(map);

		drawing = new esri.toolbars.Draw(map);

		refreshing = new esri.toolbars.Draw(map);
		refreshing.setFillSymbol(new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0,255,0]), 2), new dojo.Color([0,255,0,0.1])));

		dojo.connect(navToolbar, "onExtentHistoryChange", extentHistoryChangeHandler);
		//dojo.connect(map, "onClick", doIdentify);
		//resize the map when the browser resizes - view the 'Resizing and repositioning the map' section in

		// Download dialog Setting
		dojo.connect(dojo.byId("Collisions"),'onclick',function(){
			dijit.byId("kml").set('disabled',false);
			dojo.style("selectedOnly","display","none");
			document.getElementById("downloadText").innerHTML="Download the collision data file.";
		});
		dojo.connect(dojo.byId("Parties"),'onclick',function(){
			dijit.byId("csv").set('checked',true);
			dijit.byId("kml").set('disabled',true);
			if (factorQuery[2] === undefined || factorQuery[2] === "") {
				dojo.style("selectedOnly","display","none");
				document.getElementById("downloadText").innerHTML="Download the party data file.";
			}
			else {
				dojo.style("selectedOnly","display","block");
				document.getElementById("downloadText").innerHTML="Download the party data file. You may choose to download all the parties, or only those that have been selected.";
			}
		});
		dojo.connect(dojo.byId("Victims"),'onclick',function(){
			dijit.byId("csv").set('checked',true);
			dijit.byId("kml").set('disabled',true);
			if (factorQuery[3] === undefined || factorQuery[3] === "") {
				dojo.style("selectedOnly","display","none");
				document.getElementById("downloadText").innerHTML="Download the victim data file.";
			}
			else{
				dojo.style("selectedOnly","display","block");
				document.getElementById("downloadText").innerHTML="Download the victim data file. You may choose to download all the victims, or only those that have been selected.";
			}
		});
		dojo.connect(dojo.byId("download"),'onclick',function(){
			if (dojo.byId("selectResult").innerHTML === "") {
				dijit.byId("Selected").set('disabled',true);
				dijit.byId("Selected").set('checked',false);
			}
			else{
				dijit.byId("Selected").set('disabled',false);
				dijit.byId("Selected").set('checked',true);
			}
			setTimeout(function(){
				dijit.byId("Collisions").set('checked',true);
				dijit.byId('downloadDialog').show();
			},100);
		});
		dojo.connect(dojo.byId("diagram"),'onclick',function(){
			if(dojo.byId("selectResult").innerHTML==""){
				dijit.byId("SelectedStat").set('disabled',true);
				dijit.byId("SelectedStat").set('checked',false);
			}
			else{
				dijit.byId("SelectedStat").set('disabled',false);
				dijit.byId("SelectedStat").set('checked',true);
			}
			makeDiagram();
		});
		dojo.connect(dojo.byId("statistics"),'onclick',function(){
			if(dojo.byId("selectResult").innerHTML===""){
				dijit.byId("SelectedStat").set('disabled',true);
				dijit.byId("SelectedStat").set('checked',false);
			}
			else{
				dijit.byId("SelectedStat").set('disabled',false);
				dijit.byId("SelectedStat").set('checked',true);
			}
			drawVisualization();

			dojo.connect(dojo.byId("AllStat"),'onclick',drawVisualization);
			dojo.connect(dojo.byId("CurrentStat"),'onclick',drawVisualization);
			dojo.connect(dojo.byId("SelectedStat"),'onclick',drawVisualization);

			setTimeout(function(){dijit.byId('statDialog').show();},100);
		});
		dojo.connect(dojo.byId("intersectionGenerate"),'onclick',function(){
			createRank();
		});
		dojo.connect(map, 'onLoad', function(theMap) {
			var scalebar = new esri.dijit.Scalebar({
				map: map,
				scalebarUnit:'english'
			});
			//resize the map when the browser resizes
			dojo.connect(dijit.byId('map'), 'resize', map, map.resize);
			dojo.connect(dijit.byId('map'), 'resize', function(){
				getNewHeight();

				var options=['severity','involv'];
				dojo.forEach(options,function(option){
					// console.log(option);
					var icon = document.getElementById(option+'Icon');
					var submenu = document.getElementById(option+'Sub');

					if(submenu.style.display=='block'){
						icon.src = "images/expand.png";
						submenu.style.display='none';
						resizeOption(option);
					}
				});
			});

			dojo.connect(dijit.byId('title1'),"toggle",function(){
				setTimeout(getNewHeight, 500);
			});
			dojo.connect(dijit.byId('title2'),"toggle",function(){
				setTimeout(getNewHeight, 500);
			});
			dojo.connect(dijit.byId('title3'),"toggle",function(){
				setTimeout(getNewHeight, 500);
			});
			dojo.connect(dojo.byId("refreshExtent"),"onclick",function(){
				outlineLayer.clear();
				refreshOutline();
				if(outlineLayer.graphics.length==1) {
					showCollisions(dijit.byId("clusterForm").attr("value").clusterOption,map.extent);
					//map.setExtent(map.extent.expand(1.1),true);
					//showLoading();
				}
			});
			//createDate();

			createLeftPane();
			createFactors();
			createOverview();

			createSearchTool();
			createOptions();
			createTools();
			addFarsLayer();
			addMeasurementWidget();
			addPrintTool();
			addMapContents();
			createBasemapGallery();

			//createResults();

			borderToolbar("PAN");
			//dragAndDrop();

			//focusCounty();
			//addMessageWidget();

			//alert("The SWITRS GIS map is currently being updated and is not available.  We apologize for any inconvenience.");
		});
		dojo.connect(map, 'onUpdateStart', function() {
			esri.show(dojo.byId("status"));
			showLoading();
		});
		dojo.connect(map, 'onUpdateEnd', function() {
			esri.hide(dojo.byId("status"));
			hideLoading();
		});
		locator = new esri.tasks.Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");

		var streetMap = new esri.layers.ArcGISTiledMapServiceLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer", {id:"streetMap"});
		map.addLayer(streetMap);
		var counties=new dojo.data.ItemFileReadStore({url:"../../resources/counties_compact.json"});
		var countyCombo=new dijit.form.FilteringSelect({
			id: "county",
			store: counties,
			required: false,
			//displayedValue: "ALAMEDA",
			value: "ALAMEDA",
			selectOnClick: true,
			style: "width: 135px",
			//pageSize: 20,
			maxHeight: 360,
			searchAttr: 'county',
			onChange: function(){selectCity(this.value);}
		}, "county");
		var cities=new dojo.data.ItemFileReadStore({url:"../../resources/cities_compact.json"});
		var cityCombo = new dijit.form.FilteringSelect({
			id: "city",
			store: cities,
			required: false,
			//displayedValue: "ALL",
			value: "0",
			selectOnClick: true,
			style: "width: 159px;",
			//pageSize: 20,
			maxHeight: 360,
			query: {'county': 'ALAMEDA'},
			searchAttr: "city",
			onChange: focusCity
		}, "city");
		var list=new dojo.data.ItemFileReadStore({data: {"items": [{"direction":"ALL","id":"0"}]}});
		var routeDCombo = new dijit.form.FilteringSelect({
			id: "routeDirection",
			displayedValue: "ALL",
			value: "0",
			selectOnClick: true,
			style: "width: 75px;",
			//pageSize: 20,
			maxHeight: 350,
			searchAttr: "direction"
		}, "routeDirection");
		var routes=new dojo.data.ItemFileReadStore({url:"../../resources/counties_routes_compact.json"});
		var routeNCombo = new dijit.form.FilteringSelect({
			id: "routeNumber",
			store: routes,
			required: false,
			//displayedValue: "ALL",
			value: "0",
			selectOnClick: true,
			style: "width: 75px;",
			query: {'county': 'ALAMEDA'},
			searchAttr: "route",
			//pageSize: 20,
			maxHeight: 350,
			onChange: function(){
				var ns=[1,5,7,9,13,14,15,17,19,23,25,27,29,31,33,35,39,41,43,45,47,49,53,55,57,59,61,63,65,67,68,71,72,73,75,77,79,82,83,84,86,87,89,99,101,107,109,110,111,113,114,115,116,121,123,125,133,145,160,163,164,170,184,185,188,209,213,215,217,221,225,232,233,238,241,242,245,255,260,261,262,273,280,284,330,395,405,505,605,680,710,805,880];
				var ew=[2,4,8,10,12,16,18,20,22,24,30,32,34,36,37,38,40,42,44,46,50,52,54,56,58,60,62,66,70,74,76,78,80,88,90,91,92,94,104,105,108,112,118,120,126,128,129,130,131,132,134,137,138,140,142,150,151,152,154,156,162,166,168,176,178,180,183,187,190,192,193,195,198,204,205,210,218,223,227,237,244,246,259,270,274,275,282,299,380,580,780,905,980];

				if(inArray(this.displayedValue,ns)){
					list=new  dojo.data.ItemFileReadStore({data: {"items": [{"direction":"ALL","id":"0"},{"direction":"N","id":"1"},{"direction":"S","id":"2"}]}});
				}
				else if(inArray(this.displayedValue,ew)){
					list=new  dojo.data.ItemFileReadStore({data: {"items": [{"direction":"ALL","id":"0"},{"direction":"E","id":"1"},{"direction":"W","id":"2"}]}});
				}
				else {
					list=new  dojo.data.ItemFileReadStore({data: {"items": [{"direction":"ALL","id":"0"}]}});
				}
				dijit.byId("routeDirection").set('store',list);
				dijit.byId("routeDirection").set('value','0');
			}
				}, "routeNumber");
		dojo.connect(dijit.byId('stroute'),"onChange",function(){
			var routeOption=dijit.byId('stroute').attr('value');

			switch(routeOption){
			case "Y":
				dijit.byId("values_STATEHW_0").set('checked','true');

				add_boxGroup(17,'State Highway','STATEHW',1);
				add_boxDiv(17,0,'YES','Y',1);
				kill_boxDivRadio(17,0,1);

				list=new  dojo.data.ItemFileReadStore({data: {"items": [{"direction":"ALL","id":"0"}]}});
				dijit.byId("routeDirection").set('store',list);
				dijit.byId("routeDirection").set('value','0');
				dojo.byId("routeDiv").style.display="block";

				break;
			case "N":
				dijit.byId("values_STATEHW_1").set('checked','true');

				add_boxGroup(17,'State Highway','STATEHW',1);
				add_boxDiv(17,1,'NO','N',1);
				kill_boxDivRadio(17,1,1);
				dojo.byId("routeDiv").style.display="none";
				break;
			case "All":
				kill_boxGroup(17,1);
				dojo.byId("routeDiv").style.display="none";
				break;
			}
		});
		// disable heatmap on ie<9
		if(checkbrowser()){}
		else{
			dijit.byId("heatmap").set("disabled","true");
		}
	}
	function selectCity(county){
		var temp=dijit.byId('city').get('value');
		dijit.byId('city').query.county = county;
		dijit.byId("city").set('value','0');
		if(temp==dijit.byId('city').get('value')) focusCounty();
		//dijit.byId("city").set('displayedValue','ALL');

		dijit.byId('routeNumber').query.county = county;
		dijit.byId("routeNumber").set('value','0');
		//dijit.byId("routeNumber").set('displayedValue','ALL');

		//focusCounty();
	}
	function inArray(needle, haystack) {
		var length = haystack.length;
		for(var i = 0; i < length; i++) {
			if(haystack[i] == needle) return true;
		}
		return false;
	}
	</script>
</head>
<body class="claro">
	<div data-dojo-type="dijit.layout.BorderContainer" data-dojo-props="design:'headline', gutters:false" style="width: 100%; height: 100%;">
		<div id="head" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region:'top'" style="overflow-x:hidden;background-color:#efefef; padding:0;margin:0">
			<!--<img style="width: 344px; height: 40px;" src="images/TIMS.png" />-->
			<div style="height:40px">
				<a href="http://tims.berkeley.edu"><img style="width: 321px;height:40px; float:left; border:none" src="images/tims_title.png" title="Go to TIMS Main Website"></a>
				<img style="width: 1678px; height: 40px;overflow-x:hidden; position:absolute;float:left" src="images/background.png">
			</div>
		</div>
		<div id="left" data-dojo-type="dojox.layout.ExpandoPane" data-dojo-props="region:'left', startExpanded:true, title:'Map SWITRS'" style="width:240px">
			<div id="leftContent1" style="display:none;">
				<div id="title1" data-dojo-type="dijit.TitlePane" data-dojo-props="open:true,toggleable:true,title:'Date'">
					<table><tr>
						<th>From:</th>
						<td>
							<input type="text" name="FromDate" id="FromDate" value="<?php print $startyear;?>-01-01" dojotype="dijit.form.DateTextBox" required="true" style="width: 150px;" constraints="{min: '<?php print $minyear; ?>-01-01', max: '<?php print $endyear; ?>-12-31',datePattern:'MM-dd-yyyy'}" onChange="dijit.byId('ToDate').constraints.min = arguments[0];" />
						</td>
					</tr><tr>
						<th>To:</th>
						<td>
							<input type="text" name="ToDate" id="ToDate" value="<?php print $startyear;?>-12-31" dojotype="dijit.form.DateTextBox" required="true" style="width: 150px;" constraints="{min: '<?php print $minyear; ?>-01-01', max: '<?php print $endyear; ?>-12-31',datePattern:'MM-dd-yyyy'}" onChange="dijit.byId('FromDate').constraints.max = arguments[0];" />
						</td>
					</tr></table>
				</div>
				<div id="title2" data-dojo-type="dijit.TitlePane" data-dojo-props="open:true,toggleable:true,title:'Location'">
					<table width="200"><tr>
						<th>County:</th>
						<td style="text-align:right"><input id="county"></td>
					</tr></table>
					<table width="200"><tr>
						<th>City:</th>
						<td style="text-align:right"><input id="city"></td>
					</tr></table>
					<!--
					&nbsp;&nbsp;&nbsp;<div data-dojo-type="dijit.form.CheckBox" id="cityUpdate">
						<script type="dojo/method" event="onClick" args="evt"></script>
					</div>
					<label for="cityUpdate">Check to keep selections</label>
					-->
				</div>
				<div id="title3" data-dojo-type="dijit.TitlePane" data-dojo-props="open:true,toggleable:true,title:'More Factors'">
					<div id="addfactors"></div>
					<table width="200" style="margin-top:10px"><tr>
						<th style="text-align:left">State Highway:</th>
					</tr><tr>
						<td style="text-align:right">
							<select id="stroute" data-dojo-type="dijit.form.FilteringSelect" style="width:159px">
								<option value="Y">State Highway Only</option>
								<option value="N">No State Highway</option>
								<option value="All" selected>ALL</option>
							</select>
							<div id="routeDiv" style="display:none;margin-top:5px;">
								<input id="routeNumber">
								<input id="routeDirection">
							</div>
						</td>
					</tr></table>
				</div>
				<div align="right" style="margin-right:25px">
					<button data-dojo-type="dijit.form.ToggleButton" id="optionbutton">Options</button>
					<button data-dojo-type="dijit.form.Button" id="show" onClick="queryCollisions();">Show Collisions</button>
				</div>
			</div>
			<div id="leftContent2" style="display:none;margin-bottom:5px;">
				<div style="margin-top:10px;margin-left:10px;font-size:14px;"><b>Selected Factors</b></div>
				<div id="query_box"></div>
				<div align="right" style="margin-right:25px"><button data-dojo-type="dijit.form.Button" id="apply" onClick="queryCollisions();">Apply</button></div>
			</div>
		</div>
		<div id="main" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region:'center'" style="padding:0;margin:0;">
			<div data-dojo-type="dijit.layout.BorderContainer" data-dojo-props="design:'headline', gutters:false" style="width: 100%; height: 100%;">
				<div data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region:'top'" style="overflow:hidden;width:100% !important;padding:0;margin:0;">
					<div style="float: left; width:100%;" data-dojo-type="dijit.Toolbar">
						<div style="float: left; overflow:hidden;" id="toolbar-left">
						</div>
						<div id="navToolbar" style="float: left; overflow:hidden; padding:0;margin:0;height:100%;">
							<div data-dojo-type="dijit.form.Button" title="Zoom In" id="ZOOM_IN" data-dojo-props="iconClass:'zoominIcon',showLabel:false, onClick:function(){activateNavtool(this.id);}">
							</div><div data-dojo-type="dijit.form.Button" title="Zoom Out" id="ZOOM_OUT" data-dojo-props="iconClass:'zoomoutIcon',showLabel:false, onClick:function(){activateNavtool(this.id);}">
							</div><div data-dojo-type="dijit.form.Button" title="Zoom to Full Extent" id="zoomfullext" data-dojo-props="iconClass:'zoomfullextIcon',showLabel:false, onClick:function(){activateNavtool(this.id);}">
							</div><div data-dojo-type="dijit.form.Button" title="Zoom to Previous Extent" id="zoomprev" data-dojo-props="iconClass:'zoomprevIcon',showLabel:false, onClick:function(){activateNavtool(this.id);}">
							</div><div data-dojo-type="dijit.form.Button" title="Zoom to Next Extent" id="zoomnext" data-dojo-props="iconClass:'zoomnextIcon',showLabel:false, onClick:function(){activateNavtool(this.id);}">
							</div><div data-dojo-type="dijit.form.Button" title="Use Pan" id="PAN" data-dojo-props="iconClass:'panIcon',showLabel:false, onClick:function(){activateNavtool(this.id);}">
							</div><div data-dojo-type="dijit.form.Button" title="Deactivate Tools" id="deactivate" data-dojo-props="iconClass:'deactivateIcon',showLabel:false ,onClick:function(){activateNavtool(this.id);}">
							</div><span data-dojo-type="dijit.ToolbarSeparator"></span>
						</div>
						<div style="float: right; overflow:hidden; width:230px;" id="toolbar-right"></div>
						<div style="float: right; overflow:hidden;" id="toolbar-center"></div>
					</div>
				</div>
				<div id="map" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region:'center'" style="padding:0;margin:0;">
					<img id="loadingImg" src="images/loading.gif" style="position: absolute; top:49%; left:49%; z-index:1000;" alt="Loading..."/>
					<span id="status" style="position: absolute; z-index: 1000; left: 5px; top: 5px;background-color: black; color: white; padding: 3px; border: solid 1px white; -moz-border-radius: 5px; -webkit-border-radius: 5px;">
						Loading...
					</span>
					<!--
					<div style="position:absolute; right:150px; top:10px; z-Index:55;">
						<div data-dojo-type="dijit.TitlePane" title="Switch Basemap" data-dojo-props="closable:false, open:false">
							<div data-dojo-type="dijit.layout.ContentPane" style="width:380px; height:380px; overflow:auto;">
								<div id="basemapGallery"></div>
							</div>
						</div>
					</div>
					-->
					<div style="position:absolute; right:10px; top:10px; z-Index:60;">
						<div data-dojo-type="dijit.TitlePane" id="resultsPane" title="Results" data-dojo-props="closable:false, open:false">
							<div id="queryResult" style="left:10px;width:170px"></div>
							<div id="selectResult" style="left:10px;width:170px"></div>
							<br>
							<div id="diagram" style="left:10px;width:170px;display:none;"><a href="#" style="font-style:italic;color:blue;cursor:pointer">Create Collision Diagram</a></div>
							<div id="download" style="left:10px;width:170px;display:none;"><a href="#" style="font-style:italic;color:blue;cursor:pointer">Download Collisions</a></div>
							<div id="statistics" style="left:10px;width:170px;display:none;"><a href="#" style="font-style:italic;color:blue;cursor:pointer">Summary Statistics</a></div>
							<div id="refreshExtent" style="left:10px;width:170px;display:none;"><a href="#" style="font-style:italic;color:blue;cursor:pointer">Refresh Current Extent</a></div>
						</div>
					</div>
					<div id='options' style="display:none;">
						<div data-dojo-type="dijit.TitlePane" data-dojo-props="open:true,toggleable:false, style:'width:245px'" id="option1" title="Display">
							<div class="list" data-dojo-type="dijit.form.Form" id="clusterForm">
								<img src="images/bullet-black.png">Collisions Displayed As
								<div style="width:240px">&nbsp;&nbsp;
									<input data-dojo-type="dijit.form.RadioButton" name="clusterOption" id="points" value="points" checked="checked" onclick="clusterOption(this.id);"><label for="points">Points</label>
									<input data-dojo-type="dijit.form.RadioButton" name="clusterOption" id="clusters" value="clusters" onclick="clusterOption(this.id);"><label for="clusters">Clusters</label>
									<input data-dojo-type="dijit.form.RadioButton" name="clusterOption" id="heatmap" value="heatmap" onclick="clusterOption(this.id);"><label for="heatmap">Heatmap</label>
								</div>
								<img src="images/bullet-black.png"><div data-dojo-type="dijit.form.CheckBox" id="checkcitylayer" checked><script type="dojo/method" event="onClick" args="evt">toggleLayer(cityLayer);</script></div><label for="checkcitylayer">&nbsp;Display city boundary</label><br />
							</div>
						</div>
						<div data-dojo-type="dijit.TitlePane" data-dojo-props="open:true,toggleable:false, style:'width:245px;margin-top:5px'" id="option2" title="Symbols">
							<div class="list">
								<div id="symbolize">
									<div data-dojo-type="dijit.form.Form" id="symbolForm">
									<img src="images/bullet-black.png">&nbsp;<input data-dojo-type="dijit.form.RadioButton" name="symbolOption" id="sNone" value="sNone" checked="checked" onclick="collRendering(this.id);"><label for="sNone">&nbsp;<img src="images/visualization/default.jpg" style="vertical-align:middle;" border=0> Default</label><br>
										<img src="images/bullet-black.png">By Collision Factors
										<br>
										&nbsp;<img id="severityIcon" src="images/expand.png" style="vertical-align:middle;" onclick="resizeOption('severity');toggleIcon('severity');">
										&nbsp;<input data-dojo-type="dijit.form.RadioButton" name="symbolOption" id="severity" value="severity" onclick="checkSubLayers(this.id,4);collRendering(this.id);">
										<label for="severity"> Collision Severity</label>
										<br>
										<div id="severitySub" style="margin-left:40px; display:none">
											<div id="severity_1" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('severity');</script>
											</div><label for="severity_1">&nbsp;<img src="images/visualization/1.png" style="vertical-align:middle;" border=0> Fatal</label><br/>
											<div id="severity_2" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('severity');</script>
											</div><label for="severity_2">&nbsp;<img src="images/visualization/6.png" style="vertical-align:middle;" border=0> Severe Injury</label><br/>
											<div id="severity_3" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('severity');</script>
											</div><label for="severity_3">&nbsp;<img src="images/visualization/10.png" style="vertical-align:middle;" border=0> Other Visible Injury</label><br/>
											<div id="severity_4" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('severity');</script>
											</div><label for="severity_4">&nbsp;<img src="images/visualization/7.png" style="vertical-align:middle;" border=0> Complaint of Pain</label>
										</div>
										&nbsp;<img id="involvIcon" src="images/expand.png" style="vertical-align:middle;" onclick="resizeOption('involv');toggleIcon('involv');">
										&nbsp;<input data-dojo-type="dijit.form.RadioButton" name="symbolOption" id="involv" value="involv" onclick="checkSubLayers(this.id,11);collRendering(this.id);">
										<label for="involv"> Motor Vehicle Involved With</label>
										<div id="involvSub" style="margin-left:40px; display:none">
											<div id="involv_1" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('involv');</script>
											</div><label for="involv_1">&nbsp;<img src="images/visualization/2.png" style="vertical-align:middle;" border=0> Non-Collision</label><br/>
											<div id="involv_2" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('involv');</script>
											</div><label for="involv_2">&nbsp;<img src="images/visualization/1.png" style="vertical-align:middle;" border=0> Pedestrian</label><br/>
											<div id="involv_3" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('involv');</script>
											</div><label for="involv_3">&nbsp;<img src="images/visualization/3.png" style="vertical-align:middle;" border=0> Other Motor Vehicle</label><br/>
											<div id="involv_4" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('involv');</script>
											</div><label for="involv_4">&nbsp;<img src="images/visualization/4.png" style="vertical-align:middle;" border=0> Motor Vehicle on Other Roadway</label><br/>
											<div id="involv_5" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('involv');</script>
											</div><label for="involv_5">&nbsp;<img src="images/visualization/5.png" style="vertical-align:middle;" border=0> Parked Motor Vehicle</label><br/>
											<div id="involv_6" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('involv');</script>
											</div><label for="involv_6">&nbsp;<img src="images/visualization/11.png" style="vertical-align:middle;" border=0> Train</label><br/>
											<div id="involv_7" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('involv');</script>
											</div><label for="involv_7">&nbsp;<img src="images/visualization/6.png" style="vertical-align:middle;" border=0> Bicycle</label><br/>
											<div id="involv_8" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('involv');</script>
											</div><label for="involv_8">&nbsp;<img src="images/visualization/8.png" style="vertical-align:middle;" border=0> Animal</label><br/>
											<div id="involv_9" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('involv');</script>
											</div><label for="involv_9">&nbsp;<img src="images/visualization/9.png" style="vertical-align:middle;" border=0> Fixed Object</label><br/>
											<div id="involv_10" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('involv');</script>
											</div><label for="involv_10">&nbsp;<img src="images/visualization/10.png" style="vertical-align:middle;" border=0> Other Object</label><br/>
											<div id="involv_11" data-dojo-type="dijit.form.CheckBox">
												<script type="dojo/method" event="onClick" args="evt">collRendering('involv');</script>
											</div><label for="involv_11">&nbsp;<img src="images/visualization/7.png" style="vertical-align:middle;" border=0> Not Stated</label><br/>
										</div>
									</div>
								<!--
								<img id="severityIcon" src="images/expand.png" style="vertical-align:middle;" onclick="resizeOption('severity',4);toggleIcon('severity');">
								<div data-dojo-type="dijit.form.CheckBox" id="severity">
									<script type="dojo/method" event="onClick" args="evt">checkSubLayers(this.id,4);collRendering('severity');</script>
								</div><label for="severity">&nbsp;Severity</label>
								-->
								</div>
							</div>
						</div>
					</div>
					<div id="floater" style="display:none;">
						<div id="measureDiv"></div>
					</div>
					<div id="selecting" style="display:none;">
						<div id="selectTool" style="width:240px"></div>
					</div>
					<div id="printing" style="display:none;">
						<div id="print_button">
							<!--<button data-dojo-type="dijit.form.Button" id="print">Print</button>-->
						</div>
					</div>
					<div id="user" style="display:none;">
						<div id="SWITRSContent" style="width:210px"></div>
						<div id="CrossroadsContent" style="width:210px"></div>
						<div id="ShapefileContent" style="width:210px"></div>
					</div>
					<div id="heatLayer"></div>
				</div>
			</div>
		</div>
	</div>
<div id="mapcontent">
	<input data-dojo-type="dijit.form.CheckBox" id="census" onClick="toggleLayer(censusLayer);"><label for="census">&nbsp;<img src="images/mapcontents/census.png" border=0>&nbsp;Census Tracts</label><br/>
	<!--<div data-dojo-type="dijit.form.CheckBox" id="instit"><script type="dojo/method" event="onClick" args="evt">toggleLayer(institLayer);</script></div><label for="instit">&nbsp;<img src="images/mapcontents/institution.png" border=0>&nbsp;Institutions</label><br/>-->
	<div data-dojo-type="dijit.form.CheckBox" id="landmark"><script type="dojo/method" event="onClick" args="evt">toggleLayer(landmarkLayer);</script></div><label for="landmark">&nbsp;<img src="images/mapcontents/landmark.png" border=0>&nbsp;Landmarks</label><br/>
	<div data-dojo-type="dijit.form.CheckBox" id="urban"><script type="dojo/method" event="onClick" args="evt">toggleLayer(urbanLayer);</script></div><label for="urban">&nbsp;<img src="images/mapcontents/urban.png" border=0>&nbsp;Urban Areas</label>
	<hr />
	&nbsp;&nbsp;&nbsp;&nbsp;<div id="sch" data-dojo-type="dijit.form.CheckBox"><script type="dojo/method" event="onClick" args="evt">toggleLayer(schLayer);</script></div><label for="sch">&nbsp;<img src="images/mapcontents/school.png" border=0>&nbsp;School</label>
	<div><img id="schoolIcon" src="images/expand.png" style="vertical-align:middle;" onClick="toggleIcon('school')">
		<div id="school" name="school" data-dojo-type="dijit.form.CheckBox"><script type="dojo/method" event="onClick" args="evt">checkSubLayers(this.id,3);</script></div><label for="school">&nbsp;School Districts</label>
	</div>
	<div id="schoolSub" style="margin-left:30px; display:none">
		<div id="school_1" data-dojo-type="dijit.form.CheckBox"><script type="dojo/method" event="onChange" args="evt">toggleLayer(eleschoolLayer);</script></div><label for="school_1">&nbsp;<img src="images/mapcontents/elementary.png" border=0>&nbsp;Elementary</label><br/>
		<div id="school_2" data-dojo-type="dijit.form.CheckBox"><script type="dojo/method" event="onChange" args="evt">toggleLayer(secschoolLayer);</script></div><label for="school_2">&nbsp;<img src="images/mapcontents/secondary.png" border=0>&nbsp;Secondary</label><br/>
		<div id="school_3" data-dojo-type="dijit.form.CheckBox"><script type="dojo/method" event="onChange" args="evt">toggleLayer(unischoolLayer);</script></div><label for="school_3">&nbsp;<img src="images/mapcontents/unified.png" border=0>&nbsp;Unified</label>
	</div>
	<hr />
	<div id="taz" data-dojo-type="dijit.form.CheckBox"><script type="dojo/method" event="onClick" args="evt">toggleLayer(tazLayer);</script></div><label for="taz">&nbsp;<img src="images/mapcontents/taz.png" border=0>&nbsp;Traffic Analysis Zones</label><br/>
	<div id="zip" data-dojo-type="dijit.form.CheckBox"><script type="dojo/method" event="onClick" args="evt">toggleLayer(zipLayer);</script></div><label for="zip">&nbsp;<img src="images/mapcontents/zipcode.png" border=0>&nbsp;Zip Codes</label>
	<hr />
		<form id="uploadForm" style='display:block;padding:4px;' action="upload.php" method="post" enctype="multipart/form-data">
			<hr />
			<div style="position: relative">
				<div id="importIE" style="display: none">Import Layers</div>
				<input style="position: relative;text-align: right; filter:alpha(opacity: 0); opacity: 0;width:150px" title="Test" type="file" name="file" id="data" size=5 dojo-data-type="dijit.form.Button">
				<div id="fakefile" class="fakefile" style="position: absolute; top: 0px; left: 0px; ">
					<button id="choose" data-dojo-type="dijit.form.Button" style="font-size:13px; position: absolute; ">Import Layers</button>
				</div>
				<script>
				if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) { //test for MSIE x.x;
					dojo.style("importIE","display","block");
					dojo.style("fakefile","display","none");
					dojo.style("data",{
						"filter":"alpha(opacity: 100)",
						"opacity": 1
					});
				}
				</script>
			</div>
		</form>
</div>
</body>
<!-- Hidden Elements -->
<?php include "selectFactors.php";?>
<div id="basemapContents" data-dojo-type="dijit.layout.ContentPane">
	<div id="basemapGallery"></div>
</div>
<div data-dojo-type="dojox.widget.TitleGroup" id="selectAcc">
	<div data-dojo-type="dijit.TitlePane" data-dojo-props="title:'By Drawing',open:true">
		<div id="drawFREEHAND_POLYGON" data-dojo-type="dijit.form.ToggleButton" data-dojo-props="iconClass:'freegon',title:'Free Polygon',showLabel:false, onClick: function(){selectButton(this.id);}">
		</div><div id="drawPOLYGON" data-dojo-type="dijit.form.ToggleButton" data-dojo-props="iconClass:'polygon',title:'Polygon',showLabel:false, onClick: function(){selectButton(this.id);}"></div>
	</div>
	<div data-dojo-type="dijit.TitlePane" data-dojo-props="title:'By Buffer',open:false">
		<table><tr>
			<td>Distance:</td>
			<td>
				<input type="text" id="bufferDistance" value="0.1" size="1">
				<select id="bufferunit">
					<option value="UNIT_STATUTE_MILE">Miles</option>
					<option value="UNIT_FOOT">Feet</option>
					<option value="UNIT_KILOMETER">KMS</option>
					<option value="UNIT_METER">Meters</option>
				</select>
			</td>
		</tr><tr>
			<td>Buffer Count:</td>
			<td><input type="text" id="bufferCount" value="1" size="1"></td>
		</tr></table>
		<div>
			<div id="buffPOINT" data-dojo-type="dijit.form.ToggleButton" data-dojo-props="iconClass:'point',title:'Point',showLabel:false, onClick: function(){selectButton(this.id);}">
			</div><div id="buffMULTI_POINT" data-dojo-type="dijit.form.ToggleButton" data-dojo-props="iconClass:'multipoint',title:'Multiple Points',showLabel:false, onClick: function(){selectButton(this.id);}">
			</div><div id="buffLINE" data-dojo-type="dijit.form.ToggleButton" data-dojo-props="iconClass:'line',title:'Line',showLabel:false, onClick: function(){selectButton(this.id);}">
			</div><div id="buffPOLYLINE" data-dojo-type="dijit.form.ToggleButton" data-dojo-props="iconClass:'polyline',title:'Polyline',showLabel:false, onClick: function(){selectButton(this.id);}">
			</div><div id="buffFREEHAND_POLYGON" data-dojo-type="dijit.form.ToggleButton" data-dojo-props="iconClass:'freegon',title:'Free Polygon',showLabel:false, onClick: function(){selectButton(this.id);}">
			</div><div id="buffPOLYGON" data-dojo-type="dijit.form.ToggleButton" data-dojo-props="iconClass:'polygon',title:'Polygon',showLabel:false, onClick: function(){selectButton(this.id);}"></div>
		</div>
	</div>
	<div data-dojo-type="dijit.TitlePane" data-dojo-props="title:'By Area',open:false">
		<div>
			<div id="areacensus" data-dojo-type="dijit.form.ToggleButton" data-dojo-props="label: 'Census',title: 'Census Tracks', onClick: function(){selectButton(this.id);}">
			</div><div id="areataz" data-dojo-type="dijit.form.ToggleButton" data-dojo-props="label: 'TAZ', title: 'Traffic Analysis Zones', onClick: function(){selectButton(this.id);}">
			</div><div id="areazip" data-dojo-type="dijit.form.ToggleButton" data-dojo-props="label: 'Zip', title: 'Zip Codes', onClick: function(){selectButton(this.id);}"></div>
		</div>
	</div>
</div>
<?php include "index_dialogs.php"?>
</html>