<?php
include "../../php/config.php";

foreach ($_POST as $key => $val) {
  $_SESSION[$key] = $val;
}
$gismap = true;
include "../../include/header_b.php";
include "../../include/loginCheck.php";
?>
  <!-- Calcite Bootstrap -->
  <link rel="stylesheet" href="//esri.github.io/calcite-bootstrap/assets/css/calcite-bootstrap-open.min.css">
  <link rel="stylesheet" href="//esri.github.io/calcite-maps/dist/vendor/dojo-bootstrap/assets/datepicker.css">
  <!-- Calcite Maps -->
  <link rel="stylesheet" href="//esri.github.io/calcite-maps/dist/css/calcite-maps-arcgis-4.x.min-v0.2.css">
  <!-- ArcGIS JS 4.0 -->
  <link rel="stylesheet" href="//js.arcgis.com/4.0/esri/css/main.css">
  <link rel="stylesheet" href="css/style-v0.2.css">
</head>

<body class="calcite-nav-top calcite-zoom-top-left calcite-layout-medium-title">
  <nav class="navbar calcite-navbar calcite-bg-custom calcite-text-light navbar-fixed-top berkeley-blue">
    <!-- Title -->
    <div class="calcite-title calcite-overflow-hidden">
      <span class="calcite-title-main calcite-title-custom" href="//tims.berkeley.edu" target="_blank">TIMS</span>
      <span class="calcite-title-divider"></span>
      <span class="calcite-title-sub">
        <div class="calcite-title-sub-custom"><a role="button" data-toggle="modal" data-target="#modalSplash"><strong>SWITRS GIS Map</strong></a></div>
        <div>By <a href="//safetrec.berkeley.edu" target="_blank">SafeTREC</a>, <a href="//www.berkeley.edu" target="_blank">UC Berkeley</a></div>
      </span>
    </div>
    <!-- Nav -->
    <ul class="calcite-nav nav navbar-nav">
      <li><a class="hidden-xs" data-toggle="modal" data-target="#modalQueryMain" role="button" aria-haspopup="true" data-tooltip="tip" data-original-title="Map SWITRS by date, location, and additional filters">Map SWITRS</a></li>
      <li class="dropdown calcite-nav-dropdown" role="presentation">
        <a class="dropdown-toggle hidden-xs" role="button" id="toolDropdown" aria-haspopup="true" aria-expanded="false">Tools <span class="glyphicon glyphicon-chevron-down"></span></a>
        <ul class="dropdown-menu" aria-labelledby="toolDropdown">
          <li><a role="button" data-target="#panelSelect" data-toggle="collapse" aria-haspopup="true"><span class="glyphicon glyphicon-screenshot"></span> Select Collisions</a></li>
          <li><a role="button" data-target="#panelRank" data-toggle="collapse" aria-haspopup="true"><span class="glyphicon glyphicon-sort-by-order"></span> Rank by Intersection</a></li>
          <li role="separator" class="divider"></li>
          <li><a role="button" data-target="#panelMeasure" data-toggle="collapse" aria-haspopup="true"><span class="glyphicon glyphicon-ruler"></span> Measure Distance</a></li>
        </ul>
      </li>
      <li><a class="hidden-xs" data-target="#panelOptions" role="button" data-toggle="collapse" aria-controls="panelOptions">Options</a></li>
      <li><a class="hidden-xs hidden-sm" data-target="#panelLayers" role="button" data-toggle="collapse" aria-controls="panelLayers">Layers</a></li>
      <li><a class="hidden-xs hidden-sm" data-target="#panelBasemaps" role="button" data-toggle="collapse" aria-controls="panelBasemaps">Basemaps</a></li>
      <li><a class="hidden-xs hidden-sm" data-target="#panelPrint" role="button" data-toggle="collapse" aria-controls="panelPrint">Print</a></li>
      <li><div class="hidden-xs calcite-navbar-search calcite-search-expander"><div id="searchNavDiv"></div></div></li>
    </ul>
    <!-- Menu -->
    <div class="dropdown calcite-dropdown calcite-bg-light calcite-text-dark" role="presentation">
      <a class="dropdown-toggle" role="button" id="menuDropdown" aria-haspopup="true" aria-expanded="false">
        <div class="calcite-dropdown-toggle">
          <span class="sr-only">Toggle dropdown menu</span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </a>
      <ul class="dropdown-menu calcite-menu-drawer" aria-labelledby="menuDropdown">
        <li><a role="button" data-toggle="modal" data-target="#modalSplash" aria-haspopup="true"><span class="glyphicon glyphicon-info-sign"></span> Info</a></li>
        <li><a role="button" data-toggle="modal" data-target="#modalQueryMain" aria-haspopup="true"><span class="glyphicon glyphicon-map-marker"></span> Map SWITRS</a></li>
        <li role="separator" class="divider"></li>
        <li class="dropdown-header">Tools</li>
        <li><a role="button" data-target="#panelSelect" data-toggle="collapse" aria-haspopup="true"><span class="glyphicon glyphicon-screenshot"></span> Select Collisions</a></li>
        <li><a role="button" data-target="#panelRank" data-toggle="collapse" aria-haspopup="true"><span class="glyphicon glyphicon-sort-by-order"></span> Rank by Intersection</a></li>
        <li><a role="button" data-target="#panelMeasure" data-toggle="collapse" aria-haspopup="true"><span class="glyphicon glyphicon-ruler"></span> Measure Distance</a></li>
        <li role="separator" class="divider"></li>
        <li><a role="button" data-target="#panelOptions" data-toggle="collapse" aria-controls="panelLayers"><span class="glyphicon glyphicon-cog"></span> Options</a></li>
        <li><a role="button" data-target="#panelLayers" data-toggle="collapse" aria-controls="panelLayers"><span class="glyphicon glyphicon-layer"></span> Layers</a></li>
        <li><a role="button" data-target="#panelBasemaps" data-toggle="collapse" aria-controls="panelBasemaps"><span class="glyphicon glyphicon-globe"></span> Basemaps</a></li>
        <li><a role="button" data-target="#panelPrint" data-toggle="collapse" aria-controls="panelPrint"><span class="glyphicon glyphicon-print"></span> Print</a></li>
      </ul>
    </div>
  </nav>
  <div class="modal" id="modalSplash" tabindex="-1" role="dialog" aria-labelledby="splashlModal">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title">Welcome to TIMS SWITRS GIS Map</h4>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="text-center">
              <p>The SWITRS Geographic Information Systems (GIS) style map provides a more map-centric approach to viewing and querying the SWITRS fatal and injury collision data.  Users select a county and then have the ability to perform the same query actions in the SWITRS Query & Map tool.  However, there are also options to symbolize the collisions by different types, show other spatial information layers (census tracts, traffic analysis zones, schools, etc.), and spatially select collisions to download using standard GIS operations.</p>
              <div class="form-inline">
                <div class="form-group">
                  <button type="button" class="btn btn-success btn-lg" data-dismiss="modal" data-toggle="modal" data-target="#modalQueryMain" >Get started</button>
                </div>
              </div>
              <br>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal" id="modalQueryMain" tabindex="-1" role="dialog" aria-labelledby="queryModalMain">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title">Map SWITRS collisions</h4>
        </div>
        <div class="modal-body">
          <h4>1. Please specify date and location.</h4>
          <form class="form-inline">
            <div class="form-group">
              <label for="startDate">Date</label>
              <input class="span2" size="16" type="text" value="01/01/<?php print $startyear;?>" id="startDate"> - <input class="span2" size="16" type="text" value="12/31/<?php print $startyear;?>" id="endDate">
            </div>
          </form>
          <form class="form-inline" id="location">
            <div class="form-group">
              <label for="county">County </label>
              <select class="form-control" id="county"></select>
            </div>
            <div class="form-group">
              <div class="form-group" id="radioGroup">
                <label class="radio"><input type="radio" name="cityORroute" id="cityRadio" value="city" checked> City</label>
                <label class="radio"><input type="radio" name="cityORroute" id="routeRadio" value="stroute"> State Highway</label>
              </div>
              <div class="form-group">
                <select class="form-control" id="city" multiple></select>
              </div>
              <div class="form-group">
                <select class="form-control" id="stroute" multiple></select>
              </div>
              <div class="form-group">
                <select class="form-control" id="direct" size="10"></select>
              </div>
            </div>
          </form>
          <h4>2. (OPTIONAL) Narrow down your results by adding specific filters to the query.</h4>
          <div class="panel-group" id="filtersPanel" role="tablist" aria-multiselectable="true">
            <div class="panel panel-default">
              <div class="panel-heading" role="tab" id="factor_switrs_header">
                <h4 class="panel-title">
                  <a role="button" data-toggle="collapse" data-parent="#filtersPanel" href="#factor_switrs" aria-expanded="true" aria-controls="factor_switrs">Collision filters<span id="factor_switrs-ex" class="factor-selected">All filters selected</span></a>
                </h4>
              </div>
              <div id="factor_switrs" class="panel-collapse collapse" role="tabpanel" aria-labelledby="factor_switrs_header">
                <div class="panel-body">
                  <p>Choose collision filters to query.</p>
                  <div class="list-group list-inline">
                  <?php
                    $db->select("switrs_fields_info_new","distinct Item_Name, Field_Name");
                    $db->close();
                    $rows = $result;
                    foreach($rows as $i => $row) {
                      if ($row['Field_Name'] == "VIOL") {
                        // Skip Type of Violation
                        continue;
                      }
                      $name = (strlen($row['Item_Name']) > 25 ? substr($row['Item_Name'], 0, 22)."..." : $row['Item_Name']);
                      ?>
                        <a href="#" class="list-group-item" id="fields_<?php echo $row['Field_Name']?>" title="<?php echo $row['Item_Name']?>" value="<?php echo $row['Field_Name']?>"><?php echo $name;?></a>
                      <?php
                    }
                  ?>
                  </div>
                </div>
              </div>
            </div>
            <div class="panel panel-default">
              <div class="panel-heading" role="tab" id="factor_party_header">
                <h4 class="panel-title">
                  <a role="button" data-toggle="collapse" data-parent="#filtersPanel" href="#factor_party" aria-expanded="true" aria-controls="factor_party">Party filters<span id="factor_party-ex" class="factor-selected">All filters selected</span></a>
                </h4>
              </div>
              <div id="factor_party" class="panel-collapse collapse" role="tabpanel" aria-labelledby="factor_party_header">
                <div class="panel-body">
                  <p>Choose party filters to query.</p>
                  <div class="list-group list-inline">
                  <?php
                    $db->select("party_fields_info","distinct Item_Name, Field_Name");
                    $db->close();
                    $rows = $result;
                    foreach($rows as $i => $row) {
                      $name = (strlen($row['Item_Name']) > 25 ? substr($row['Item_Name'], 0, 22)."..." : $row['Item_Name']);
                      ?>
                        <a href="#" class="list-group-item" id="fields_<?php echo $row['Field_Name']?>" title="<?php echo $row['Item_Name']?>" value="<?php echo $row['Field_Name']?>"><?php echo $name;?></a>
                      <?php
                    }
                  ?>
                  </div>
                </div>
              </div>
            </div>
            <div class="panel panel-default">
              <div class="panel-heading" role="tab" id="factor_victim_header">
                <h4 class="panel-title">
                  <a role="button" data-toggle="collapse" data-parent="#filtersPanel" href="#factor_victim" aria-expanded="true" aria-controls="factor_victim">Victim filters<span id="factor_victim-ex" class="factor-selected">All filters selected</span></a>
                </h4>
              </div>
              <div id="factor_victim" class="panel-collapse collapse" role="tabpanel" aria-labelledby="factor_victim_header">
                <div class="panel-body">
                  <p>Choose victim filters to query.</p>
                   <div class="list-group list-inline">
                  <?php
                    $db->select("victim_fields_info","distinct Item_Name, Field_Name");
                    $db->close();
                    $rows = $result;
                    foreach($rows as $i => $row) {
                      $name = (strlen($row['Item_Name']) > 25 ? substr($row['Item_Name'], 0, 22)."..." : $row['Item_Name']);
                      ?>
                        <a href="#" class="list-group-item" id="fields_<?php echo $row['Field_Name']?>" title="<?php echo $row['Item_Name']?>"  value="<?php echo $row['Field_Name']?>"><?php echo $name;?></a>
                      <?php
                    }
                  ?>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-success" id="showResult">Show Result</button>
          <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal" id="modalQuerySub" tabindex="-1" role="dialog" aria-labelledby="queryModalSub">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title"></h4>
        </div>
        <div class="modal-body">
          <h4></h4>
          <div id="querySubSelected"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
  <!-- Map Container  -->
  <div class="calcite-map calcite-map-absolute">
    <div id="mapViewDiv"></div>
  </div>
  <!-- end:container -->
  <!-- Panel Container -->
  <div class="calcite-panels panel-group calcite-bg-light calcite-text-dark calcite-panels-right" role="tablist" aria-multiselectable="true">
    <div id="panelSelect" class="panel collapse">
      <div id="headingSelect" class="panel-heading" role="tab">
        <div class="panel-title">
          <a class="panel-toggle" role="button" data-toggle="collapse" href="#collapseSelect" aria-expanded="false" aria-controls="collapseSelect"><span class="glyphicon glyphicon-screenshot" aria-hidden="true"></span><span class="panel-label">Select Collisions</span></a>
          <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelSelect"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a>
        </div>
      </div>
      <div id="collapseSelect" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingSelect">
        <div class="panel-body">
          Select
        </div>
      </div>
    </div>
    <div id="panelRank" class="panel collapse">
      <div id="headingRank" class="panel-heading" role="tab">
        <div class="panel-title">
          <a class="panel-toggle" role="button" data-toggle="collapse" href="#collapseRank" aria-expanded="false" aria-controls="collapseRank"><span class="glyphicon glyphicon-sort-by-order" aria-hidden="true"></span><span class="panel-label">Rank by Intersection</span></a>
          <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelRank"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a>
        </div>
      </div>
      <div id="collapseRank" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingRank">
        <div class="panel-body">
          Rank
        </div>
      </div>
    </div>
    <div id="panelMeasure" class="panel collapse">
      <div id="headingMeasure" class="panel-heading" role="tab">
        <div class="panel-title">
          <a class="panel-toggle" role="button" data-toggle="collapse" href="#collapseMeasure" aria-expanded="false" aria-controls="collapseMeasure"><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span><span class="panel-label">Measure Distance</span></a>
          <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelMeasure"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a>
        </div>
      </div>
      <div id="collapseMeasure" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingMeasure">
        <div class="panel-body">
          Measure
        </div>
      </div>
    </div>
    <div id="panelOptions" class="panel collapse">
      <div id="headingOptions" class="panel-heading" role="tab">
        <div class="panel-title">
          <a class="panel-toggle" role="button" data-toggle="collapse" href="#collapseOptions" aria-expanded="false" aria-controls="collapseOptions"><span class="glyphicon glyphicon-cog" aria-hidden="true"></span><span class="panel-label">Options</span></a>
          <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelOptions"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a>
        </div>
      </div>
      <div id="collapseOptions" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOptions">
        <div class="panel-body">
          Options
        </div>
      </div>
    </div>
    <div id="panelLayers" class="panel collapse">
      <div id="headingLayers" class="panel-heading" role="tab">
        <div class="panel-title">
          <a class="panel-toggle" role="button" data-toggle="collapse" href="#collapseLayers" aria-expanded="false" aria-controls="collapseLayers"><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span><span class="panel-label">Layers</span></a>
          <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelLayers"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a>
        </div>
      </div>
      <div id="collapseLayers" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingLayers">
        <div class="panel-body">
          Layers
        </div>
      </div>
    </div>
    <div id="panelBasemaps" class="panel collapse">
      <div id="headingBasemaps" class="panel-heading" role="tab">
        <div class="panel-title">
          <a class="panel-toggle" role="button" data-toggle="collapse" href="#collapseBasemaps" aria-expanded="false" aria-controls="collapseBasemaps"><span class="glyphicon glyphicon-th-large" aria-hidden="true"></span><span class="panel-label">Basemaps</span></a>
          <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelBasemaps"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a>
        </div>
      </div>
      <div id="collapseBasemaps" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingBasemaps">
        <div class="panel-body">
          <select id="selectBasemapPanel" class="form-control">
            <option value="streets" data-vector="streets-vector">Streets</option>
            <option value="satellite" data-vector="satellite">Satellite</option>
            <option value="hybrid" data-vector="hybrid">Hybrid</option>
            <option value="national-geographic" data-vector="national-geographic">National Geographic</option>
            <option value="topo" data-vector="topo-vector">Topographic</option>
            <option value="gray" data-vector="gray-vector" selected>Gray</option>
            <option value="dark-gray" data-vector="dark-gray-vector">Dark Gray</option>
            <option value="osm" data-vector="osm">Open Street Map</option>
            <option value="dark-gray" data-vector="streets-night-vector">Streets Night</option>
            <option value="streets" data-vector="streets-navigation-vector">Streets Navigation</option>
          </select>
        </div>
      </div>
    </div>
    <div id="panelPrint" class="panel collapse">
      <div id="headingPrint" class="panel-heading" role="tab">
        <div class="panel-title">
          <a class="panel-toggle" role="button" data-toggle="collapse" href="#collapsePrint" aria-expanded="false" aria-controls="collapsePrint"><span class="glyphicon glyphicon-print" aria-hidden="true"></span><span class="panel-label">Print</span></a>
          <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelPrint"><span class="esri-icon esri-icon-close" aria-hidden="true"></span></a>
        </div>
      </div>
      <div id="collapsePrint" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingPrint">
        <div class="panel-body">
          Print
        </div>
      </div>
    </div>
  </div> <!-- /.panel-container -->
  <script>
    var dojoConfig = {
      packages: [{
        name: "bootstrap",
        location: "https://esri.github.io/calcite-maps/dist/vendor/dojo-bootstrap"
      },
      // {
      //   name: "calcite-maps",
      //   location: "https://esri.github.io/calcite-maps/dist/js/dojo"
      // },
      {
        name: "extra",
        location: location.pathname.replace(/\/[^/]+$/, '') + "/extra"
      }]
    };
    var minyear = <?php print $minyear;?>;
    var startyear = <?php print $startyear;?>;
    var endyear = <?php print $endyear;?>;
    var arcgisOnline = "<?php print $arcgis;?>";
  </script>
  <script src="//js.arcgis.com/4.0/"></script>
  <script src="js/main-v0.2.js"></script>
</body>
</html>