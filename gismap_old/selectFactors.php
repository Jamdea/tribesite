<div id="factor0" data-dojo-type="dijit.Menu" style="display:none">
	<?php
		// For collision Factors
		$db->select("switrs_fields_info_new","distinct Item_Name, Field_Name");
		$db->close();
		$rows = $result;
		foreach($rows as $i => $row){
			if ($row['Field_Name'] == "VIOL") {
				// Skip Type of Violation
				continue;
			}
		?>
			<div id="fields_<?php echo $row['Field_Name']?>" data-dojo-type="dijit.PopupMenuItem" style="position:relative" value='<?php echo $row['Field_Name']?>'>
				<span><?php echo $row['Item_Name']?></span>
				<div class="factors" data-dojo-type="dijit.layout.ContentPane">
					<?php
						$factorID = $row['Field_Name'];
						$factorName = $row['Item_Name'];

						$db->select("switrs_fields_info_new", "distinct Value_ID, Field_Value", "Field_Name = ? ");
						$db->parameters( $factorID );
						$db->close();
						$result0 = $result;

						$radio_fields = array('PEDCOL', 'BICCOL', 'MCCOL', 'TRUCKCOL', 'ETOH');
						if(in_array($factorID, $radio_fields) ){
							foreach($result0 as $j => $row1){
							?>
								<div data-dojo-type="dijit.form.RadioButton" name="values_<?php echo $factorID?>[]" id="values_<?php echo $factorID?>_<?php echo $j?>" value="<?php echo $row1['Value_ID']?>">
									<script type="dojo/method" event="onClick" args="evt">
										add_boxGroup(<?php print $i.",'".$row['Item_Name']."','".$row['Field_Name']."',1";?>);
										add_boxDiv(<?php print $i.",".$j.",'".str_replace('"','\'',$row1['Field_Value'])."','".$row1['Value_ID']."',1";?>);
										kill_boxDivRadio(<?php print $i.",".$j.",1"?>);
									</script>
								</div>
								<label for="values_<?php echo $factorID?>_<?php echo $j?>">&nbsp;<?php echo $row1['Field_Value']?></label><br/>
							<?php }
						}
						else if($factorID=='STATEHW'){
							foreach($result0 as $j => $row1){
							?>
								<div data-dojo-type="dijit.form.RadioButton" name="values_<?php echo $factorID?>[]" id="values_<?php echo $factorID?>_<?php echo $j?>" value="<?php echo $row1['Value_ID']?>">
									<script type="dojo/method" event="onClick" args="evt">
										dijit.byId("stroute").set("value","<?php echo $row1['Value_ID']?>");
									</script>
								</div>
								<label for="values_<?php echo $factorID?>_<?php echo $j?>">&nbsp;<?php echo $row1['Field_Value']?></label><br/>
							<?php }
						}
						else{
							foreach($result0 as $j => $row1){
							?>
								<div data-dojo-type="dijit.form.CheckBox" id="values_<?php echo $factorID?>_<?php echo $j?>">
									<script type="dojo/method" event="onClick" args="evt">
										add_boxGroup(<?php print $i.",'".$row['Item_Name']."','".$row['Field_Name']."',1";?>);
										add_boxDiv(<?php print $i.",".$j.",'".str_replace('"','\'',$row1['Field_Value'])."','".$row1['Value_ID']."',1";?>);
									</script>
								</div>
								<label for="values_<?php echo $factorID?>_<?php echo $j?>">&nbsp;<?php echo $row1['Field_Value']?></label><br/>
							<?php
							}
							?>
							<hr />
							<table><tr><td>
							<button data-dojo-type="dijit.form.Button">
								Check All
								<script type="dojo/method" event="onClick" args="evt">
									kill_boxGroup(<?php print $i.",1"?>);
									checkAll('<?php echo $factorID?>',1);
									add_boxGroup(<?php print $i.",'".$row['Item_Name']."','".$row['Field_Name']."',1";?>);
									<?php foreach($result0 as $j => $row1){ ?>
										add_boxDiv(<?php print $i.",".$j.",'".str_replace('"','\'',$row1['Field_Value'])."','".$row1['Value_ID']."',1";?>);
									<?php }?>
								</script>
							</button>
							</td>
							<td>
							<button data-dojo-type="dijit.form.Button">
								Uncheck All
								<script type="dojo/method" event="onClick" args="evt">kill_boxGroup(<?php print $i.",1"?>);</script>
							</button>
							</td></tr></table>
							<?php
						}
						?>
				</div>
			</div>
		<?php }
	?>
</div>
<div id="factor1" data-dojo-type="dijit.Menu" style="display:none">
	<?php
		// For party Factors
		$db->select("party_fields_info","distinct Item_Name, Field_Name");
		$db->close();
		$rows = $result;
		foreach($rows as $i => $row){
		?>
			<div id="fields_<?php echo $row['Field_Name']?>" data-dojo-type="dijit.PopupMenuItem" style="position:relative" value='<?php echo $row['Field_Name']?>'>
				<span><?php echo $row['Item_Name']?></span>
				<div class="factors" data-dojo-type="dijit.layout.ContentPane">
					<?php
						$factorID = $row['Field_Name'];
						$factorName = $row['Item_Name'];

						$db->select("party_fields_info", "distinct Value_ID, Field_Value", "Field_Name = ? ");
						$db->parameters( $factorID );
						$db->close();
						$result1 = $result;

						if($factorID == 'PAGE'){
							?>
							<input type="hidden" name="values_<?php echo $factorID?>[]" id="values_<?php echo $factorID?>" value="PAGE">
							From:&nbsp;
							<select name="stpage" id="stpage" onchange="check_numChange(this.id,<?php print $i.",'".$row['Item_Name']."','".$row['Field_Name']."',2";?>);">
								<?php for($j=0 ; $j<=125; $j++){?>
									<option value="<?php echo $j?>"><?php echo $j?></option>
								<?php } ?>
							</select>&nbsp;
							To:&nbsp;
							<select name="edpage" id="edpage" onchange="check_numChange(this.id,<?php print $i.",'".$row['Item_Name']."','".$row['Field_Name']."',2";?>);">
								<?php for($j=125 ; $j>=0; $j--){?>
									<option value="<?php echo $j?>"><?php echo $j?></option>
								<?php  } ?>
							</select>
							<?php
						}
						else if($factorID=='ATFAULT'){
							foreach($result1 as $j => $row1){
							?>
								<div data-dojo-type="dijit.form.RadioButton" name="values_<?php echo $factorID?>[]" id="values_<?php echo $factorID?>_<?php echo $j?>" value="<?php echo $row1['Value_ID']?>">
									<script type="dojo/method" event="onClick" args="evt">
										add_boxGroup(<?php print $i.",'".$row['Item_Name']."','".$row['Field_Name']."',2";?>);
										add_boxDiv(<?php print $i.",".$j.",'".str_replace('"','\'',$row1['Field_Value'])."','".$row1['Value_ID']."',2";?>);
										kill_boxDivRadio(<?php print $i.",".$j.",2"?>);
									</script>
								</div>
								<label for="values_<?php echo $factorID?>_<?php echo $j?>">&nbsp;<?php echo $row1['Field_Value']?></label><br/>
							<?php }
						}
						else{
							foreach($result1 as $j => $row1){
							?>
								<div class='factor' type="checkbox" data-dojo-type="dijit.form.CheckBox" id="values_<?php echo $factorID?>_<?php echo $j?>">
									<script type="dojo/method" event="onClick" args="evt">
										add_boxGroup(<?php print $i.",'".$row['Item_Name']."','".$row['Field_Name']."',2";?>);
										add_boxDiv(<?php print $i.",".$j.",'".str_replace('"','\'',$row1['Field_Value'])."','".$row1['Value_ID']."',2";?>);
									</script>
								</div>
								<label for="values_<?php echo $factorID?>_<?php echo $j?>">&nbsp;<?php echo $row1['Field_Value']?></label><br/>
							<?php
							}
							?>
							<hr />
							<table><tr><td>
							<button data-dojo-type="dijit.form.Button">
								Check All
								<script type="dojo/method" event="onClick" args="evt">
									kill_boxGroup(<?php print $i.",2"?>);
									checkAll('<?php echo $factorID?>',1);
									add_boxGroup(<?php print $i.",'".$row['Item_Name']."','".$row['Field_Name']."',2";?>);
									<?php foreach($result1 as $j => $row1){ ?>
										add_boxDiv(<?php print $i.",".$j.",'".str_replace('"','\'',$row1['Field_Value'])."','".$row1['Value_ID']."',2";?>);
									<?php }?>
								</script>
							</button>
							</td>
							<td>
							<button data-dojo-type="dijit.form.Button">
								Uncheck All
								<script type="dojo/method" event="onClick" args="evt">kill_boxGroup(<?php print $i.",2"?>);</script>
							</button>
							</td></tr></table>
							<?php
						}
						?>
				</div>
			</div>
		<?php }
	?>
</div>
<div id="factor2" data-dojo-type="dijit.Menu" style="display:none">
	<?php
		// For victim Factors
		$db->select("victim_fields_info","distinct Item_Name, Field_Name");
		$db->close();
		$rows = $result;
		foreach($rows as $i => $row){
		?>
			<div id="fields_<?php echo $row['Field_Name']?>" data-dojo-type="dijit.PopupMenuItem" style="position:relative" value='<?php echo $row['Field_Name']?>'>
				<span><?php echo $row['Item_Name']?></span>
				<div class="factors" data-dojo-type="dijit.layout.ContentPane">
					<?php
						$factorID = $row['Field_Name'];
						$factorName = $row['Item_Name'];

						$db->select("victim_fields_info", "distinct Value_ID, Field_Value", "Field_Name = ? ");
						$db->parameters( $factorID );
						$db->close();
						$result2 = $result;

						if($factorID == 'VAGE'){
							?>
							<input type="hidden" name="values_<?php echo $factorID?>[]" id="values_<?php echo $factorID?>" value="VAGE">
							From:&nbsp;
							<select name="stvage" id="stvage" onchange="check_numChange(this.id,<?php print $i.",'".$row['Item_Name']."','".$row['Field_Name']."',3";?>);">
								<?php for($j=0 ; $j<=125; $j++){?>
									<option value="<?php echo $j?>"><?php echo $j?></option>
								<?php } ?>
							</select>&nbsp;
							To:&nbsp;
							<select name="edvage" id="edvage" onchange="check_numChange(this.id,<?php print $i.",'".$row['Item_Name']."','".$row['Field_Name']."',3";?>);">
								<?php for($j=125 ; $j>=0; $j--){?>
									<option value="<?php echo $j?>"><?php echo $j?></option>
								<?php  } ?>
							</select>
							<?php
						}
						elseif($factorID == 'PARNUM'){
							?>
							<input type="hidden" name="values_<?php echo $factorID?>[]" id="values_<?php echo $factorID?>" value="PARNUM">
							From:&nbsp;
							<select name="stparnum" id="stparnum" onchange="check_numChange(this.id,<?php print $i.",'".$row['Item_Name']."','".$row['Field_Name']."',2";?>);">
								<?php for($j=0 ; $j<=999; $j++){?>
									<option value="<?php echo $j?>"><?php echo $j?></option>
								<?php } ?>
							</select>&nbsp;
							To:&nbsp;
							<select name="edparnum" id="edparnum" onchange="check_numChange(this.id,<?php print $i.",'".$row['Item_Name']."','".$row['Field_Name']."',2";?>);">
								<?php for($j=999 ; $j>=0; $j--){?>
									<option value="<?php echo $j?>" <?php if($fieldsVars[$factorID]){if($j == $fieldsVars[$factorID][1]) echo "selected";}?>><?php echo $j?></option>
								<?php  } ?>
							</select>
							<?php
						}
						else{
							foreach($result2 as $j => $row1){
							?>
								<div class='factor' type="checkbox" data-dojo-type="dijit.form.CheckBox" id="values_<?php echo $factorID?>_<?php echo $j?>">
									<script type="dojo/method" event="onClick" args="evt">
										add_boxGroup(<?php print $i.",'".$row['Item_Name']."','".$row['Field_Name']."',3";?>);
										add_boxDiv(<?php print $i.",".$j.",'".str_replace('"','\'',$row1['Field_Value'])."','".$row1['Value_ID']."',3";?>);
									</script>
								</div>
								<label for="values_<?php echo $factorID?>_<?php echo $j?>">&nbsp;<?php echo $row1['Field_Value']?></label><br/>
							<?php
							}
							?>
							<hr />
							<table><tr><td>
							<button data-dojo-type="dijit.form.Button">
								Check All
								<script type="dojo/method" event="onClick" args="evt">
									kill_boxGroup(<?php print $i.",3"?>);
									checkAll('<?php echo $factorID?>',1);
									add_boxGroup(<?php print $i.",'".$row['Item_Name']."','".$row['Field_Name']."',3";?>);
									<?php foreach($result2 as $j => $row1){ ?>
										add_boxDiv(<?php print $i.",".$j.",'".str_replace('"','\'',$row1['Field_Value'])."','".$row1['Value_ID']."',3";?>);
									<?php }?>
								</script>
							</button>
							</td>
							<td>
							<button data-dojo-type="dijit.form.Button">
								Uncheck All
								<script type="dojo/method" event="onClick" args="evt">kill_boxGroup(<?php print $i.",3"?>);</script>
							</button>
							</td></tr></table>
							<?php
						}
						?>
				</div>
			</div>
		<?php }
	?>
</div>