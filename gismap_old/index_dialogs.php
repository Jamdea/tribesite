<div data-dojo-type="dijit.Dialog" id="downloadDialog" data-dojo-props="title: 'Download Collisions'">
	<div data-dojo-type="dijit.form.Form" id="downloadForm" enctype="multipart/form-data" action="download.php" method="post">
		<table class="download" style="width:450px;"><tr>
			<th>1. Choose Extent</th>
		</tr><tr>
			<td colspan="2">
				<input data-dojo-type="dijit.form.RadioButton" name="downOption1" id="All" value="All" checked="checked"><label for="All">All Mapped Collisions</label>		
				<input data-dojo-type="dijit.form.RadioButton" name="downOption1" id="Current" value="Current"><label for="Current">Current Extent</label>		
				<input data-dojo-type="dijit.form.RadioButton" name="downOption1" id="Selected" value="Selected"><label for="Selected">Selected Collisions</label>
			</td>
		</tr><tr>
			<th>2. Choose Data File</th>
		</tr><tr>
			<td style="width:270px;">
				<input data-dojo-type="dijit.form.RadioButton" name="downOption2" id="Collisions" value="Collisions" checked="checked"><label for="Collisions">Collisions</label>		
				<input data-dojo-type="dijit.form.RadioButton" name="downOption2" id="Parties" value="Parties"><label for="Parties">Parties</label>		
				<input data-dojo-type="dijit.form.RadioButton" name="downOption2" id="Victims" value="Victims"><label for="Victims">Victims</label>
			</td>
			<td>
				<div id="selectedOnly" style="display:none;">
					<select id="selectedOnlyValue" data-dojo-type="dijit.form.FilteringSelect" style="width:159px;">
						<option value="Selected" selected>Selected Only</option>
						<option value="All">ALL</option>
					</select>
				</div>
			</td>
		</tr><tr>
			<td colspan="2"><div id="downloadText">Download the collision data file.</div></td>
		</tr><tr>
			<th>3. Choose Output Format</th>
		</tr><tr>
			<td>
				<input data-dojo-type="dijit.form.RadioButton" name="downOption3" id="csv" value="csv" checked="checked"><label for="csv">CSV Table</label>		
				<input data-dojo-type="dijit.form.RadioButton" name="downOption3" id="kml" value="kml"><label for="kml">Google KML</label>		
			</td>
		</tr>
		</table>
		<input type="hidden" id="caseid" name="caseid">
		<input type="hidden" id="partyvictimQuery" name="partyvictimQuery">
		<div class="dijitDialogPaneActionBar">
			<button data-dojo-type="dijit.form.Button" id="downStart" onClick="startDownload();">Start Downloading</button>
		</div>
	</div>
</div>
<div data-dojo-type="dijit.Dialog" id="refreshDialog" data-dojo-props="title: 'Refresh Collisions'">
	<div data-dojo-type="dijit.form.Form" id="refreshForm">
		<table class="download" style="width:524px"><tr>
			<th colspan="2">Refresh by</th>
		</tr>
		<!--
		<tr>
			<td>
				<input data-dojo-type="dijit.form.RadioButton" name="refreshOption1" id="CurrentExtent" value="Current" checked="checked" data-dojo-props="onClick: function(){dojo.style('customExtent','display','none');}"><label for="CurrentExtent">Current Extent</label>	
			</td>
			<td>
				<input data-dojo-type="dijit.form.RadioButton" name="refreshOption1" id="DrawExtent" value="DrawExtent" data-dojo-props="onClick: function(){dojo.style('customExtent','display','block');}"><label for="DrawExtent">Custom Drawing Extent</label>
			</td>
		</tr><tr>
			<td></td>
			<td>
				<div id="customExtent" style="display:none;">
					<div id="refreshFREEHAND_POLYGON" data-dojo-type="dijit.form.ToggleButton" data-dojo-props="iconClass:'freegon',title:'Free Polygon',showLabel:false, onClick: function(){toggleSelectButton(this.id);}">
					</div><div id="refreshPOLYGON" data-dojo-type="dijit.form.ToggleButton" data-dojo-props="iconClass:'polygon',title:'Polygon',showLabel:false, onClick: function(){toggleSelectButton(this.id);}"></div>
				</div>
			</td>
		</tr>
		-->
		<tr>
			<td>
				<button data-dojo-type="dijit.form.Button" id="CurrentExtent" data-dojo-props="onClick: function(){startRefresh(this.id);}">Current Extent</button>	
			</td>
			<td>
				<button data-dojo-type="dijit.form.Button" id="DrawExtent" data-dojo-props="onClick: function(){toggleSelectButton();startRefresh(this.id);}">Custom Drawing Extent</button>
			</td>
		</tr>
		</table>
		<!--
		<div class="dijitDialogPaneActionBar">
			<button data-dojo-type="dijit.form.Button" id="refreshStart" onClick="startRefresh();">Start Refresh</button>
		</div>		
		-->
	</div>
</div>
<div data-dojo-type="dijit.Dialog" id="statDialog" data-dojo-props="title: 'Summary Statistics'">
	<div data-dojo-type="dijit.form.Form" id="statForm">
		<table class="download" style="width:524px"><tr>
			<th>Choose Extent</th>
		</tr><tr>
			<td>
				<input data-dojo-type="dijit.form.RadioButton" name="statOption1" id="AllStat" value="All" checked="checked"><label for="AllStat">All Mapped Collisions</label>		
				<input data-dojo-type="dijit.form.RadioButton" name="statOption1" id="CurrentStat" value="Current"><label for="CurrentStat">Current Extent</label>		
				<input data-dojo-type="dijit.form.RadioButton" name="statOption1" id="SelectedStat" value="Selected"><label for="SelectedStat">Selected Collisions</label>
			</td>
		</tr><tr>
			<td style="text-align:right">
				<div id="statTotal"></div>
			</td>
		</tr><tr>
			<td>
				<div id="statTab">
					<div data-dojo-type="dijit.layout.TabContainer" style="height:360px; width: 520px" doLayout="false">
						<div data-dojo-type="dijit.layout.ContentPane" id="severityTab" style="height:300px; width: 500px;overflow:hidden" title="Injury Severity" selected="true"></div>
						<div data-dojo-type="dijit.layout.ContentPane" id="coltypeTab" style="height:300px; width: 500px;overflow:hidden" title="Collision Type"></div>
						<div data-dojo-type="dijit.layout.ContentPane" id="pcfTab" style="height:300px; width: 500px;overflow:hidden" title="Primary Collision Factor"></div>
						<div data-dojo-type="dijit.layout.ContentPane" id="involveTab" style="height:300px; width: 500px;overflow:hidden" title="Involved With"></div>
					</div>
				</div>
			</td>
		</tr></table>
	</div>
</div>
<div data-dojo-type="dijit.Dialog" id="streetViewDialog" data-dojo-props="title: 'Street Preview'">
	<div id="streetViewImage"></div>
</div>
<div data-dojo-type="dijit.Dialog" id="pedOrbike" data-dojo-props="title: 'Pedestrian and Bicycle Collision Factors'">
	<p>Did you mean <ins>"Pedestrian Collisions <b style="color:red">OR</b> Bicycle Collisions"</ins><br>instead of "Pedestrian Collisions <b style="color:red">AND</b> Bicycle Collisions?"</p>
	<div class="dijitDialogPaneActionBar">
		<button data-dojo-type="dijit.form.Button" data-dojo-props="onClick:function(){dijit.byId('pedOrbike').hide();goPedOrbike();}">Yes: Ped or Bike</button>
		<button data-dojo-type="dijit.form.Button" data-dojo-props="onClick:function(){dijit.byId('pedOrbike').hide();createQueryStr(true);}">No: Ped and Bike</button>
    </div>
	<div id="showcollision" style="display:none"></div>
</div>
<div data-dojo-type="dijit.Dialog" id="intersectionDialog" data-dojo-props="title: 'Rank Collision Counts by Intersection'">
	<div data-dojo-type="dijit.form.Form" id="intersectionForm">
		<table class="download" style="width:524px"><tr>
			<td>
				<div style="float:left">Select distance from the intersection: 
					<select data-dojo-type="dijit.form.ComboBox" id="distanceIntersection" name="distanceIntersection" style="width:100px">
						<option value="50" selected="selected">50 ft</option>
						<option value="100">100 ft</option>
						<option value="200">200 ft</option>
						<option value="500">500 ft</option>
					</select>
					<button data-dojo-type="dijit.form.Button" type="button" id="intersectionGenerate">Calculate</button>
				</div>
			</td>
		</tr><tr>
			<td>
				<div data-dojo-type="dijit.layout.TabContainer"  id="intersectionTab" style="height:360px; width: 520px" doLayout="false">
					<img id="intersectionLoadingImg" src="images/loading.gif" style="position: absolute; top:49%; left:49%; z-index:1000;display:none" alt="Loading..."/>
					<div data-dojo-type="dijit.layout.ContentPane" id="factorsTab" style="height:300px; width: 500px;overflow:hidden" title="Selected Factors" selected="true">
						<div id="interFactorList"></div>
						<br>
						<div>* This tool ranks collision counts near intersections along primary or secondary roads and based on your selected location and factors. It does not include all intersections and results should only be used as a general starting point for any analysis.</div>
						<br>
						<div id="interMsg"></div>
					</div>
				</div>
			</td>
		</tr></table>
	</div>
</div>