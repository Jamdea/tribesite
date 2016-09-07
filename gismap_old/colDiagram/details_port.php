<?php 
function getDetailsPort() { 
	global $BASE_URL; 
	?>
	<div id="details_port"  data-dojo-type="dijit.layout.ContentPane" data-dojo-props="region:'top',splitter:false" >
		<div data-dojo-type="dijit.layout.ContentPane" style="float:left;width:50%;padding-top:0;padding-bottom:0">
			<div class="pageTitle" style="padding:0">Collision Diagram</div>
		</div>

		<?php
			/*
			preg_match('/MSIE (.*?);/', $_SERVER['HTTP_USER_AGENT'], $matches);
			$buffer = 0;
			if (count($matches)>1 && $matches[1] = 8) {
			//if(1 == 1) {
				$extension = 'png';
			} else {
				if(strlen(strstr($_SERVER['HTTP_USER_AGENT'],"Firefox")) > 0 ){ 
					$buffer = 2;
				}
				$extension = 'svg';
			}
			*/
			//Define our columns
			$extension = 'png';
			$folder = "images/".$extension."/";
		
			$legend = array(
				0 => array(
					//array('class' => 'header', 'title' => 'Vehicular Movement'),
					array('class' => 'row', 'img' => $folder.'Straight.'.$extension, 'title' => 'Straight', 'percent' => '100'),
					array('class' => 'row', 'img' => $folder.'Left.'.$extension, 'title' => 'Left Turn', 'percent' => '100'),
					array('class' => 'row', 'img' => $folder.'Right.'.$extension, 'title' => 'Right Turn', 'percent' => '100'),
					array('class' => 'row', 'img' => $folder.'UTurn.'.$extension, 'title' => 'U-Turn', 'percent' => '100'),
					array('class' => 'row', 'img' => $folder.'Pedestrian.'.$extension, 'title' => 'Pedestrian', 'percent' => '100'),
					array('class' => 'row', 'img' => $folder.'Object.'.$extension, 'title' => 'Object', 'percent' => '100'),
					array('class' => 'row', 'img' => $folder.'red_dot_icon.'.$extension, 'title' => 'Fatal Crash', 'percent' => '35'),
				),
				1 => array(
					array('class' => 'row', 'img' => $folder.'Overturn.'.$extension, 'title' => 'Overturned', 'percent' => '100'),
					array('class' => 'row', 'img' => $folder.'RoR.'.$extension, 'title' => 'Ran Off Road', 'percent' => '100'),
					array('class' => 'row', 'img' => $folder.'Stopped.'.$extension, 'title' => 'Stopped', 'percent' => '100'),
					array('class' => 'row', 'img' => $folder.'Parked.'.$extension, 'title' => 'Parked', 'percent' => '100'),
					array('class' => 'row', 'img' => $folder.'Bicycle.'.$extension, 'title' => 'Bicycle', 'percent' => '100'), 
					array('class' => 'row', 'img' => $folder.'white_dot_icon.'.$extension, 'title' => 'Injury Crash', 'percent' => '35'),
					array('class' => 'row', 'title' => '', 'percent' => '100'),
				),
			);
			
		?>
		<div id="mapLegend_port" class="addBorder" data-dojo-type="dijit.layout.ContentPane"  style="float: right; width: 40%; background-color: #F1F1F1; overflow:hidden;">
			<table>
				<?php

						foreach ($legend[0] as $x => $cols) {
							
							$height = floor(100/count($legend[0]));
							echo '
							<tr class="legend_row" style="height: '. $height .'%; overflow: hidden;">';
							
							for ($i = 0; $i <= 1; $i++) {
								$v = $legend[$i][$x];
								if($v['img']) {
									echo '<td class="legend_td" style="width: 11%; overflow: hidden; text-align:center; '.$legend[$i][$x]['extraStyle'].'" >';
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
									<td class="legend_td" style="width: 39%; '.$legend[$i][$x]['extraStyle'].'">'.$v['title'].'</td>';
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
		<div data-dojo-type="dijit.layout.ContentPane" style="float:left;width:28%">
			<div>
				<div>Primary Street:</div><!--placeholder="Enter Primary St"-->
				<input type="text" name="primary_print" id="primary_print" class="input_entry_new_port"><br>
				<div>Secondary Street:</div>
				<input type="text" name="secondary_print" id="secondary_print" class="input_entry_new_port"><br>
				<div>Time Period:</div>
				<input type="text" name="period_print" id="period_print" class="input_entry_new_port"><br> 
				<div>Agency Name:</div>
				<input type="text" name="agency_print" id="agency_print" class="input_entry_new_port"><br>
			</div>
		</div>
		<div data-dojo-type="dijit.layout.ContentPane" style="float:left;width:24%">
			<div>
				<div class="diagram_row_port" style="height:25px;margin-bottom:5px;">
					<div class="addBorder" style="text-align:center;font-size:1.1em;background-color:#F1F1F1;padding:3px">Mapping Summary</div>
				</div>
				<div class="diagram_row_port">
					<div class="legend_title">Fatal Collision</div>
					<div class="legend_span" id="fatCount_port"></div>
				</div>
				<div class="diagram_row_port">
					<div class="legend_title">Injury Collision</div>
					<div class="legend_span" id="injCount_port"></div>
				</div>
				<hr>
				<div class="diagram_row_port">
					<div class="legend_title">Mapped</div>
					<div class="legend_span" id="mapCount_port"></div> 
				</div>
				<div class="diagram_row_port">
					<div class="legend_title">Not Drawn</div>
					<div class="legend_span" id="nonCount_port"></div>
				</div>
				<hr>
				<div class="diagram_row_port">
					<div class="legend_title">Total</div>
					<div class="legend_span" id="totCount_port"></div>
				</div>
			</div>
		</div>		
	</div>
<?php } ?>