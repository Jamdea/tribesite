
//Now, create an array for all the actual selections; it will be filled as we go
var select = new Object;
	select[1] = new Object; select[2] = new Object; select[3] = new Object;
var factors = new Object;
	factors[1] = []; factors[2] = []; factors[3] = [];
var fields = [];
	fields[1] = "coll"; fields[2] = "party"; fields[3] = "victim";

function add_boxDiv(group, id, name, value, type) {
	parseFloat(group);
	parseFloat(id);
	
	if(select[type][group][id]) {
		kill_boxDiv(group, id, type);
	} else {
		//Add a new element to our array
		//For the name, if it's longer than 20 characters, truncate it
		var fullname=name;
		if (name.length > 30) name = name.substring(0,31)+'...'; 
		if(value) select[type][group][id]=value;
		else select[type][group][id]="Blank";
		//Create the new div
		var newDiv = document.createElement(fields[type]+'_item_'+group+'_'+id);
		//newDiv.style.width = '210px';
		newDiv.setAttribute('class', 'query_item');
		newDiv.setAttribute('id', fields[type]+'_item_'+group+'_'+id);
		newDiv.setAttribute('onMouseOver', 'getElementById("'+fields[type]+'_img_'+group+'_'+id+'").style.visibility = "visible";');
		newDiv.setAttribute('onMouseOut', 'getElementById("'+fields[type]+'_img_'+group+'_'+id+'").style.visibility = "hidden";');
		newDiv.innerHTML = '<img id="'+fields[type]+'_img_'+group+'_'+id+'" border="0" src="images/small-x.png" class="query_close" onMouseDown=\'this.src="images/mini-x.png";\' onMouseUp=\'this.src="images/small-x.png";\' onClick=\'kill_boxDiv('+group+','+id+','+type+');\'>';
		newDiv.innerHTML += '<div style="float: left;" title="'+fullname+'">'+name+'</div><br>';
		document.getElementById(fields[type]+'_group_'+group).appendChild(newDiv);
		getNewHeight();
	}
}
function getNewHeight(){
	var total=dojo.style(dojo.query(".dojoxExpandoContent")[0],"height");
	var top=dojo.style("leftContent1","height");
	var bottom=dojo.style("leftContent2","height");

	var newHeight=total-top-70;
	dojo.style("query_box","maxHeight",newHeight + "px");
		//alert(dojo.style(dojo.query(".dojoxExpandoContent")[0],"height") + " " + dojo.style("leftContent1","height") + " " + dojo.style("leftContent2","height") + " " + dojo.style("query_box","height") + " " + dojo.style("query_box","max-height"));	
}
function kill_boxDivRadio(group, id, type){
	if(id) id=0;
	else id=1;
	
	delete select[type][group][id];
	var ids = document.getElementById(fields[type]+'_item_'+group+'_'+id);
	if(ids!=null) ids.parentNode.removeChild(ids);
	//Uncheck the box
	dijit.byId('values_'+factors[type][group]+'_'+id).set("checked",false);
	getNewHeight();
}
function kill_boxDiv(group, id, type) {
	if(select[type][group][id]){
		delete select[type][group][id];
		var ids = document.getElementById(fields[type]+'_item_'+group+'_'+id);
		ids.parentNode.removeChild(ids);
		//Uncheck the box
		dijit.byId('values_'+factors[type][group]+'_'+id).set("checked",false);
		var flag=0;
		dojo.query('[id^="values_'+factors[type][group]+'_"]').forEach(function(checkbox){
			if(dijit.getEnclosingWidget(checkbox).attr("checked")==true) flag=1;
		});
		if(!flag) kill_boxGroup(group, type);
		//document.getElementById(fields[type]+'_fields_'+group+'['+id+']').checked = false;
		getNewHeight();
	}
}

function add_boxGroup(group, name, title, type, started) {
	parseFloat(group);
	if(select[type][group]) {
		// edit
		//kill_boxGroup(group, type); 
	} else {
		//Add the new group to our array
		factors[type][group] = title;
		select[type][group] = [];
		select[type][group]['name'] = name;
		//Check the box, open the tab
		// edit
		/*
		if (started != 1) {
			if (type == 1) {
				triggerCollFacVal(title);
			} else if (type==2) {
				triggerPartyVal(title);
			} else if (type==3) {
				triggerVictimVal(title);
			}
		}
		*/
		//Create the new div
		var newDiv = document.createElement(fields[type]+'_group_'+group);
		//newDiv.style.width = '210px';
		newDiv.setAttribute('id', fields[type]+'_group_'+group);
		newDiv.setAttribute('onMouseOver', 'getElementById("'+fields[type]+'_img_'+group+'").style.visibility = "visible";');
		newDiv.setAttribute('onMouseOut', 'getElementById("'+fields[type]+'_img_'+group+'").style.visibility = "hidden";');
		newDiv.innerHTML = '<img id="'+fields[type]+'_img_'+group+'" border="0" src="images/small-x.png" class="query_close" onMouseDown=\'this.src="images/mini-x.png";\' onMouseUp=\'this.src="images/small-x.png";\' onClick=\'kill_boxGroup('+group+',"'+type+'");\'>';
		newDiv.innerHTML += '<div style="float: left;"><b>'+name+'</b></div><br>';
		//Now, use Appendchild to place this group in the right order, and we're done
		document.getElementById('query_box').appendChild(newDiv);
		newDiv.setAttribute('class', 'query_group');
	}
}
//Remove the group, and all of its contents, from the list
function kill_boxGroup(group, type) {
	//Remove the group from the array
	if(select[type][group]){
		delete select[type][group];
		var groups = document.getElementById(fields[type]+'_group_'+group);
		groups.parentNode.removeChild(groups);
		//Hide everything and uncheck the box
		checkAll(factors[type][group],0);
		//document.getElementById(fields[type]+'_fields['+group+']').checked = false;
		/*
		if (type == 1) {
			triggerCollFacVal(factors[type][group]);
		} else if (type==2) {
			triggerPartyVal(factors[type][group]);
		} else if (type==3) {
			triggerVictimVal(factors[type][group]);
		}
		*/
		delete factors[type][group];
		getNewHeight();
		// special case for state highway
		if(group==17 && type==1) dijit.byId("stroute").set("value","All");
		
	}
}
function check_numChange(fieldtype, group, name, title, type ){
	var label;
	switch(fieldtype){
		case "stpage":
		case "edpage":
			if(dojo.byId("stpage").value==0 && dojo.byId("edpage").value==125) label="";
			else if(parseInt(dojo.byId("stpage").value)>parseInt(dojo.byId("edpage").value)) createError();
			else label=dojo.byId("stpage").value + " to " + dojo.byId("edpage").value;
			break;
		case "stvage":
		case "edvage":
			if(dojo.byId("stvage").value==0 && dojo.byId("edvage").value==125) label="";
			else if(parseInt(dojo.byId("stvage").value)>parseInt(dojo.byId("edvage").value)) createError();
			else label=dojo.byId("stvage").value + " to " + dojo.byId("edvage").value;
			break;
		case "stparnum":
		case "edparnum":
			if(dojo.byId("stparnum").value==0 && dojo.byId("edparnum").value==999) label="";
			else if(parseInt(dojo.byId("stparnum").value)>parseInt(dojo.byId("edparnum").value)) createError();
			else label=dojo.byId("stparnum").value + " to " + dojo.byId("edparnum").value;
			break;
	}
	if(label==undefined){
	} else if(label.length){
		add_boxGroupNum(group, name, title, type, fieldtype);
		add_boxDivNum(group, 0, label, type, fieldtype);
	}
	else {
		kill_boxGroupNum(group,type,fieldtype);
	}
}
function add_boxGroupNum(group, name, title, type, fieldtype, started) {
	parseFloat(group);
	if(select[type][group]) {
		// edit
		//kill_boxGroup(group, type); 
	} else {
		//Add the new group to our array
		factors[type][group] = title;
		select[type][group] = [];
		select[type][group]['name'] = name;
		//Check the box, open the tab
		// edit
		/*
		if (started != 1) {
			if (type == 1) {
				triggerCollFacVal(title);
			} else if (type==2) {
				triggerPartyVal(title);
			} else if (type==3) {
				triggerVictimVal(title);
			}
		}
		*/
		//Create the new div
		var newDiv = document.createElement(fields[type]+'_group_'+group);
		//newDiv.style.width = '210px';
		newDiv.setAttribute('id', fields[type]+'_group_'+group);
		newDiv.setAttribute('onMouseOver', 'getElementById("'+fields[type]+'_img_'+group+'").style.visibility = "visible";');
		newDiv.setAttribute('onMouseOut', 'getElementById("'+fields[type]+'_img_'+group+'").style.visibility = "hidden";');
		newDiv.innerHTML = '<img id="'+fields[type]+'_img_'+group+'" border="0" src="images/small-x.png" class="query_close" onMouseDown=\'this.src="images/mini-x.png";\' onMouseUp=\'this.src="images/small-x.png";\' onClick=\'kill_boxGroupNum('+group+',"'+type+'","'+fieldtype+'");\'>';
		newDiv.innerHTML += '<div style="float: left;"><b>'+name+'</b></div><br>';
		//Now, use Appendchild to place this group in the right order, and we're done
		document.getElementById('query_box').appendChild(newDiv);
		newDiv.setAttribute('class', 'query_group');
		getNewHeight();
	}
}
function kill_boxGroupNum(group, type, fieldtype) {
	//Remove the group from the array
	if(select[type][group]){
		delete select[type][group];
		var groups = document.getElementById(fields[type]+'_group_'+group);
		groups.parentNode.removeChild(groups);
		//Hide everything and uncheck the box
		switch(fieldtype){
		case "stpage":
		case "edpage":
			dojo.byId("stpage").value=0;
			dojo.byId("edpage").value=125;
			kill_boxGroup(group, type);
			break;
		case "stvage":
		case "edvage":
			dojo.byId("stpage").value=0;
			dojo.byId("edpage").value=125;
			kill_boxGroup(group, type);
			break;
		case "stparnum":
		case "edparnum":
			dojo.byId("stparnum").value=0;
			dojo.byId("edparnum").value=999;
			kill_boxGroup(group, type);
			break;
		}

		//document.getElementById(fields[type]+'_fields['+group+']').checked = false;
		/*
		if (type == 1) {
			triggerCollFacVal(factors[type][group]);
		} else if (type==2) {
			triggerPartyVal(factors[type][group]);
		} else if (type==3) {
			triggerVictimVal(factors[type][group]);
		}
		*/
		delete factors[type][group];
		getNewHeight();
	}
}
function add_boxDivNum(group, id, name, type, fieldtype) {
	parseFloat(group);
	parseFloat(id);
	
	if(select[type][group][id]) {
		kill_boxDivNum(group, id, type);
	} 
		//Add a new element to our array
		//For the name, if it's longer than 30 characters, truncate it
		var fullname=name;
		if (name.length > 30) name = name.substring(0,31)+'...'; 
		select[type][group][id] = name;
		//Create the new div
		var newDiv = document.createElement(fields[type]+'_item_'+group+'_'+id);
		//newDiv.style.width = '210px';
		newDiv.setAttribute('id', fields[type]+'_item_'+group+'_'+id);
		newDiv.setAttribute('onMouseOver', 'getElementById("'+fields[type]+'_img_'+group+'_'+id+'").style.visibility = "visible";');
		newDiv.setAttribute('onMouseOut', 'getElementById("'+fields[type]+'_img_'+group+'_'+id+'").style.visibility = "hidden";');
		newDiv.innerHTML = '<img id="'+fields[type]+'_img_'+group+'_'+id+'" border="0" src="images/small-x.png" class="query_close" onMouseDown=\'this.src="images/mini-x.png";\' onMouseUp=\'this.src="images/small-x.png";\' onClick=\'kill_boxGroupNum('+group+','+type+',"'+fieldtype+'");\'>';
		newDiv.innerHTML += '<div style="float: left;" title="'+fullname+'">'+name+'</div><br>';
		document.getElementById(fields[type]+'_group_'+group).appendChild(newDiv);
		newDiv.setAttribute('class', 'query_item');
		getNewHeight();
}
function kill_boxDivNum(group, id, type, fieldtype) {
	if(select[type][group][id]){
		delete select[type][group][id];
		var ids = document.getElementById(fields[type]+'_item_'+group+'_'+id);
		ids.parentNode.removeChild(ids);
		//Uncheck the box
		switch(fieldtype){
		case "stpage":
		case "edpage":
			dojo.byId("stpage").value=0;
			dojo.byId("edpage").value=125;
			break;
		case "stvage":
		case "edvage":
			dojo.byId("stpage").value=0;
			dojo.byId("edpage").value=125;
			break;
		case "stparnum":
		case "edparnum":
			dojo.byId("stparnum").value=0;
			dojo.byId("edparnum").value==999;
			break;
		}
	}
}