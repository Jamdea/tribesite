<?php 
function getDetailsLand() { 
	global $BASE_URL; 
	?>
	<div id="details_land" data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region:'left',splitter:true" >
		<div id="accord_land" data-dojo-type="dijit.layout.ContentPane"  data-dojo-props="title:'Manual Input',showTitle:true">
			<div id="pageHeader">
				<div id="pageTitle" class="pageTitle">Collision Diagram</div>
				<div id="pageButtons">
					<button id="toggleButton" type="button"></button>
					<button id="printPreviewButton" type="button"></button>  
					<!--<button id="saveButton" type="button"></button>-->
				</div>
			</div>
			<div id="pageBottom">
				<div class="col_land" data-dojo-type="dijit.TitlePane" id="detailsInfo_land" data-dojo-props="title:'Map Information',open:true">
					<div>Primary Street:</div><!--placeholder="Enter Primary St"-->
					<input type="text" name="primary" id="primary" class="input_entry_new"><br>
					<div>Secondary Street:</div>
					<input type="text" name="secondary" id="secondary" class="input_entry_new"><br>
					<div>Time Period:</div>
					<input type="text" name="period" id="period" class="input_entry_new"><br> 
					<div>Agency Name:</div>
					<input type="text" name="agency" id="agency" class="input_entry_new"><br>
				</div>
				<?php
					$extension = 'png';
					//Define our columns
					$folder = "images/".$extension."/";
				
					$legend = array(
						0 => array(
							//array('class' => 'header', 'title' => 'Vehicular Movement'),
							array('class' => 'row', 'img' => $folder.'Straight.'.$extension, 'title' => 'Straight', 'percent' => '100'),
							array('class' => 'row', 'img' => $folder.'Left.'.$extension, 'title' => 'Left Turn', 'percent' => '100'),
							array('class' => 'row', 'img' => $folder.'Right.'.$extension, 'title' => 'Right Turn', 'percent' => '100'),
							array('class' => 'row', 'img' => $folder.'UTurn.'.$extension, 'title' => 'U-Turn', 'percent' => '100'),
							array('class' => 'row', 'img' => $folder.'Overturn.'.$extension, 'title' => 'Overturned', 'percent' => '100'),
							array('class' => 'row', 'img' => $folder.'RoR.'.$extension, 'title' => 'Ran Off Road', 'percent' => '100'),
							array('class' => 'row', 'img' => $folder.'Stopped.'.$extension, 'title' => 'Stopped', 'percent' => '100'),
							array('class' => 'row', 'img' => $folder.'Parked.'.$extension, 'title' => 'Parked', 'percent' => '100'),
						),
						1 => array(
							//array('class' => 'header', 'title' => 'Non-Vehicle Parties'), 
							array('class' => 'row', 'img' => $folder.'Pedestrian.'.$extension, 'title' => 'Pedestrian', 'percent' => '100'),
							array('class' => 'row', 'img' => $folder.'Bicycle.'.$extension, 'title' => 'Bicycle', 'percent' => '100'), 
							array('class' => 'row', 'img' => $folder.'Object.'.$extension, 'title' => 'Object', 'percent' => '100'),
							//array('class' => 'header', 'title' => 'Crash Type'), 
							array('class' => 'row', 'img' => $folder.'red_dot_icon.'.$extension, 'title' => 'Fatal Crash', 'percent' => '35'),
							array('class' => 'row', 'img' => $folder.'white_dot_icon.'.$extension, 'title' => 'Injury Crash', 'percent' => '35'),
							array('class' => 'row', 'img' => $folder.'unmapped.'.$extension, 'title' => '>2 Party Crash', 'percent' => '35', 'extraStyle' => 'visibility: hidden;'),
							array('class' => 'row', 'title' => '', 'percent' => '100'),
						),
					);
					
				?>
				<div class="col_land" data-dojo-type="dijit.TitlePane" id="mapLegend" data-dojo-props="title:'Legend',open:false">
						<table style="font-size:0.90em">
						<?php

						foreach ($legend[0] as $x => $cols) {
							
							$height = floor(100/count($legend[0]));
							echo '
							<tr class="legend_row" style="height: '. $height .'%; overflow: hidden;">';
							
							for ($i = 0; $i <= 1; $i++) {
								$v = $legend[$i][$x];
								if($v['img']) {
									echo '<td class="legend_td" style="width: 14%; overflow: hidden; text-align:center; '.$legend[$i][$x]['extraStyle'].'" >';
									if ($v['percent'] < 100) {
										//Create a left margin, and a width
										//$imgStyle = 'style="width: '.$v['percent'].'%; margin-left: '. ((100 - $v['percent'])/2) .'%;"';
										$imgStyle = 'style="width: '.$v['percent'].'%;"';
									} else {
										//No style
										$imgStyle = 'style="width: 90%;"';
									}
									if ($extension == 'svg') {
										$type =  'type="image/svg+xml"';
										echo '<object class="legend_'. $extension .'" data="'.$v['img'].'" '.$imgStyle.' '.$type.'></object>';
									} else {
										$type = '';
										echo '<img class="legend_'. $extension .'" src="'.$v['img'].'" '.$imgStyle.' '.$type.'>';
									}
									echo '</td>';
								}
								if($v['value']) {
									echo '
									<td class="legend_td legend_span" style="'.$legend[$i][$x]['extraStyle'].'" id="'.$v['value'].'"></td>';
								}
								if($v['title']) {
									echo '
									<td class="legend_td" style="width: 36%; '.$legend[$i][$x]['extraStyle'].'">'.$v['title'].'</td>';
								}
							}
							echo '
							</tr>';
						}
						preg_match('/MSIE (.*?);/', $_SERVER['HTTP_USER_AGENT'], $matches);
						if (count($matches)>1 && $matches[1] = 8) {
						//if(1 == 1) {
							$extension = 'png';
						} else {
							$extension = 'svg';
						}
						?>
						</table>
				</div>
				<div class="col_land" data-dojo-type="dijit.TitlePane" data-dojo-props="title:'Mapping Summary',open:true">
					<div class="diagram_row">
						<div class="legend_title">Fatal Collision</div>
						<div class="legend_span" id="fatCount"></div>
					</div>
					<div class="diagram_row">
						<div class="legend_title">Injury Collision</div>
						<div class="legend_span" id="injCount"></div>
					</div>
					<hr>
					<div class="diagram_row">
						<div class="legend_title">Mapped</div>
						<div class="legend_span" id="mapCount"></div> 
					</div>
					<div class="diagram_row">
						<div class="legend_title">Not Drawn</div>
						<div class="legend_span" id="nonCount"></div>
					</div>
					<hr>
					<div class="diagram_row">
						<div class="legend_title">Total</div>
						<div class="legend_span" id="totCount"></div>
					</div>
				</div>
				<div class="col_land" data-dojo-type="dijit.TitlePane" data-dojo-props="title:'Collision Filtering',open:false">
					<div class="diagram_row">
						<input id="filterA"><label for="filterA">&nbsp;Head-On</label>
					</div>
					<div class="diagram_row">
						<input id="filterB"><label for="filterB">&nbsp;Sideswipe</label>
					</div>
					<div class="diagram_row">
						<input id="filterC"><label for="filterC">&nbsp;Rear End</label>
					</div>
					<div class="diagram_row">
						<input id="filterD"><label for="filterD">&nbsp;Broadside</label>
					</div>
					<div class="diagram_row">
						<input id="filterE"><label for="filterE">&nbsp;Hit Object</label>
					</div>
					<div class="diagram_row">
						<input id="filterF"><label for="filterF">&nbsp;Overturned</label>
					</div>
					<div class="diagram_row">
						<input id="filterG"><label for="filterG">&nbsp;Pedestrian Involved</label>
					</div>
					<div class="diagram_row">
						<input id="filterH"><label for="filterH">&nbsp;Other</label>
					</div>
					<div class="diagram_row">
						<input id="filterI"><label for="filterI">&nbsp;Not Stated</label>
					</div>
					
				</div>
				<div style="margin:5px; font-size:0.95em">&copy; UC Regents, 2014&nbsp;<a href="http:\\tims.berkeley.edu" target="_blank">TIMS</a>&nbsp;&nbsp;<a href="http:\\safetrec.berkeley.edu" target="_blank">SafeTREC</a></div>				
			</div>
			<div id="pageEnd"></div>
		</div>
	</div>
<?php } ?>