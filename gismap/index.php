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
  <link rel="stylesheet" href="//esri.github.io/calcite-maps/dist/css/calcite-bootstrap.min-v0.2.css">
  <!-- Calcite Maps -->
  <link rel="stylesheet" href="//esri.github.io/calcite-maps/dist/css/calcite-maps-arcgis-3.x.min-v0.2.css">
  <!-- ArcGIS JS 3.x -->
  <link rel="stylesheet" href="//js.arcgis.com/3.17/esri/themes/calcite/dijit/calcite.css">
  <link rel="stylesheet" href="//js.arcgis.com/3.17/esri/themes/calcite/esri/esri.css">
  <link rel="stylesheet" href="css/style-v0.2.css">
</head>

<body class="calcite-nav-top calcite-zoom-top-left calcite-layout-medium-title">
  <nav class="navbar calcite-navbar calcite-bg-custom calcite-text-light navbar-fixed-top berkeley-blue">
    <!-- Title -->
    <div class="calcite-title calcite-overflow-hidden">
      <span class="calcite-title-main">TIMS</span>
      <span class="calcite-title-divider hidden-xs"></span>
      <span class="calcite-title-sub hidden-xs">SWITRS GIS Map</span>
    </div>

    <!-- Nav -->
    <ul class="calcite-nav nav navbar-nav">
      <li><div class="calcite-navbar-search hidden-xs"><div id="searchNavDiv"></div></div></li>
    </ul>
    <div class="container-fluid">
      <div class="navbar-header">
        <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#mainNav" aria-expanded="false">
          <span class="sr-only">Toggle navigation</span>
          <span class="glyphicon glyphicon-th" aria-hidden="true"></span>
        </button>
        <a class="navbar-brand-custom" href="//tims.berkeley.edu" target="_blank">
          <span class="esri-icon">TIMS</span>
        </a>
        <div class="navbar-info">
          <div class="navbar-title text-overflow"><a role="button" data-toggle="modal" data-target="#modalSplash"><strong>SWITRS GIS Map</strong></a></div>
          <div class="navbar-subtitle text-overflow">By <a href="//safetrec.berkeley.edu" target="_blank">SafeTREC</a>, <a href="//www.berkeley.edu" target="_blank">UC Berkeley</a></div>
        </div>
      </div>
      <!-- Navbar collapse -->
      <div id="mainNav" class="collapse navbar-collapse" aria-expanded="false">
        <ul class="nav navbar-nav navbar-right">
          <li><a class="hidden-xs" data-toggle="modal" data-target="#modalQuery" role="button" aria-haspopup="true" data-tooltip="tip" data-original-title="Map SWITRS by date, location, and additional factors">Map SWITRS</a></li>
          <li class="dropdown" role="presentation">
            <a class="dropdown-toggle hidden-xs" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false">Tools <span class="glyphicon glyphicon-chevron-down"></span></a>
            <ul class="dropdown-menu">
              <li><a role="button" data-target="#panelSelect" aria-haspopup="true"><span class="glyphicon glyphicon-screenshot"></span> Select Collisions</a></li>
              <li><a role="button" data-target="#panelRank" aria-haspopup="true"><span class="glyphicon glyphicon-sort-by-order"></span> Rank by Intersection</a></li>
              <li><a role="button" data-target="#panelMeasure" aria-haspopup="true"><span class="glyphicon glyphicon-ruler"></span> Measure Distance</a></li>
            </ul>
          </li>
          <li><a class="hidden-xs" data-target="#panelOptions" role="button" aria-haspopup="true" data-tooltip="tip" data-original-title="Symbolize and Clustering Options">Options</a></li>
          <li><a class="hidden-xs hidden-sm" data-target="#panelLayers" role="button" aria-haspopup="true" data-tooltip="tip" data-original-title="Add/Remove additional layers">Layers</a></li>
          <li><a class="hidden-xs hidden-sm" data-target="#panelBasemaps" role="button" aria-haspopup="true" aria-controls="tools" data-tooltip="tip" data-original-title="Switch Basemaps">Basemaps</a></li>
          <li><a class="hidden-xs hidden-sm" data-target="#panelPrint" role="button" aria-haspopup="true">Print</a></li>
          <!-- Map and Scene -->
          <li><form id="searchNav" class="navbar-form navbar-search hidden-xs hidden-sm hidden-md visible-lg"><div id="searchNavDiv"></div></form></li>
          <!-- Options dropdown menu -->
          <li class="dropdown" role="presentation">
            <a class="dropdown-toggle hidden-xs" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="false"><span class="glyphicon glyphicon-th" aria-hidden="true"></span></a>
            <ul class="dropdown-menu">
              <li><a role="button" data-toggle="modal" data-target="#modalSplash" aria-haspopup="true"><span class="glyphicon glyphicon-info-sign"></span> Info</a></li>
              <li><a class="visible-xs visible-sm" role="button" data-target="#panelLayers" aria-haspopup="true"><span class="glyphicon glyphicon-map-marker"></span> Layers</a></li>
              <li><a class="visible-xs visible-sm" role="button" data-target="#panelBasemaps" aria-haspopup="true"><span class="glyphicon glyphicon-globe"></span> Basemaps</a></li>
              <li><a class="visible-xs visible-sm" role="button" data-target="#panelPrint" aria-haspopup="true"><span class="glyphicon glyphicon-print"></span> Print</a></li>
              <li><a class="visible-xs visible-sm visible-md" role="button" data-target="#panelSearch" aria-haspopup="true"><span class="glyphicon glyphicon-search"></span> Search</a></li>
            </ul>
          </li>
        </ul><!--/.nav -->
      </div><!--/.nav-collapse -->
    </div><!--/.container-fluid -->
  </nav>
  <div class="modal fade in" id="modalSplash" tabindex="-1" role="dialog" aria-labelledby="splashlModal">
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
                  <button type="button" class="btn btn-success btn-lg" data-dismiss="modal" data-toggle="modal" data-target="#modalQuery" >Get started</button>
                </div>
              </div>
              <br>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="modal fade in" id="modalQuery" tabindex="-1" role="dialog" aria-labelledby="queryModal">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title">Map SWITRS collisions</h4>
        </div>
        <div class="modal-body">
          <h4>Please specify date and location.</h4>
          <div class="row">
            <div class="form-inline">
              <div class="form-group">Date</div>
            </div>
          </div>
          <h4>Please specify date and location.</h4>
          <div class="row">
            <div class="form-inline">
              <div class="form-group">Date</div>
            </div>
          </div>
          <div class="row">
            <div class="form-inline">
              <div class="form-group">Location</div>
            </div>
          </div>
          <h4>(OPTIONAL) Narrow down your results by adding specific factors to the query.</h4>
          <div class="row">
            <div class="form-inline">
              <div class="form-group">collision</div>
            </div>
          </div>
          <div class="row">
            <div class="form-inline">
              <div class="form-group">party</div>
            </div>
          </div>
          <div class="row">
            <div class="form-inline">
              <div class="form-group">victim</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-success">Show Result</button>
        </div>
      </div>
    </div>
  </div>
  <!-- Container -->
  <div class="map-container">
    <div id="mapViewDiv" class="map-position-absolute">
      <div class="buttonDiv">
        <div id="HomeButton"></div>
        <div id="LocateButton"></div>
      </div>
    </div>
  </div>
  <!-- end:container -->
  <div class="panel-container">
    <div id="panelAccordion" class="panel-group" role="tablist" aria-multiselectable="true">
      <div id="panelSelect" class="panel panel-default collapse">
        <div id="headingSelect" class="panel-heading" role="tab">
          <div class="panel-title">
            <a class="panel-toggle collapsed" role="button" data-toggle="collapse" href="#collapseSelect" data-parent="#panelAccordion" aria-expanded="false" aria-controls="collapseSelect"><span class="glyphicon glyphicon-screenshot" aria-hidden="true"></span> Select Collisions</a>
            <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelSelect"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>
          </div>
        </div>
        <div id="collapseSelect" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingSelect">
          <div class="panel-body panel-overflow-visible">
            Select
          </div>
        </div>
      </div>
      <div id="panelRank" class="panel panel-default collapse">
        <div id="headingRank" class="panel-heading" role="tab">
          <div class="panel-title">
            <a class="panel-toggle collapsed" role="button" data-toggle="collapse" href="#collapseRank" data-parent="#panelAccordion" aria-expanded="false" aria-controls="collapseRank"><span class="glyphicon glyphicon-sort-by-order" aria-hidden="true"></span> Rank by Intersection</a>
            <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelRank"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>
          </div>
        </div>
        <div id="collapseRank" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingRank">
          <div class="panel-body panel-overflow-visible">
            Rank
          </div>
        </div>
      </div>
      <div id="panelMeasure" class="panel panel-default collapse">
        <div id="headingMeasure" class="panel-heading" role="tab">
          <div class="panel-title">
            <a class="panel-toggle collapsed" role="button" data-toggle="collapse" href="#collapseMeasure" data-parent="#panelAccordion" aria-expanded="false" aria-controls="collapseMeasure"><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span> Measure Distance</a>
            <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelMeasure"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>
          </div>
        </div>
        <div id="collapseMeasure" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingMeasure">
          <div class="panel-body panel-overflow-visible">
            Measure
          </div>
        </div>
      </div>
      <div id="panelOptions" class="panel panel-default collapse">
        <div id="headingOptions" class="panel-heading" role="tab">
          <div class="panel-title">
            <a class="panel-toggle collapsed" role="button" data-toggle="collapse" href="#collapseOptions" data-parent="#panelAccordion" aria-expanded="false" aria-controls="collapseOptions"><span class="glyphicon glyphicon-wrench" aria-hidden="true"></span> Options</a>
            <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelOptions"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>
          </div>
        </div>
        <div id="collapseOptions" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingOptions">
          <div class="panel-body panel-overflow-visible">
            Options
          </div>
        </div>
      </div>

      <div id="panelLayers" class="panel panel-default collapse">
        <div id="headingLayers" class="panel-heading" role="tab">
          <div class="panel-title">
            <a class="panel-toggle collapsed" role="button" data-toggle="collapse" href="#collapseLayers" data-parent="#panelAccordion" aria-expanded="false" aria-controls="collapseLayers"><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span> Layers</a>
            <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelLayers"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>
          </div>
        </div>
        <div id="collapseLayers" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingLayers">
          <div class="panel-body panel-overflow-visible">
            Layers
          </div>
        </div>
      </div>
      <div id="panelBasemaps" class="panel panel-default collapse">
        <div id="headingBasemaps" class="panel-heading" role="tab">
          <div class="panel-title">
            <a class="panel-toggle collapsed" role="button" data-toggle="collapse" href="#collapseBasemaps" aria-expanded="false" data-parent="#panelAccordion"  aria-controls="collapseBasemaps"><span class="glyphicon glyphicon-th-large" aria-hidden="true"></span> Basemaps</a>
            <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelBasemaps"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>
          </div>
        </div>
        <div id="collapseBasemaps" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingBasemaps">
          <div class="panel-body">
            <select id="selectBasemapPanel" class="form-control">
              <option value="streets" data-vector="streets-vector">Streets</option>
              <option value="na" data-vector="streets-navigation-vector">Streets (Navigation)</option>
              <option value="na" data-vector="streets-night-vector">Streets (Night)</option>
              <option value="hybrid">Satellite</option>
              <option value="terrain">Terrain</option>
              <option value="gray" data-vector="gray-vector">Gray</option>
              <option value="dark-gray" data-vector="dark-gray-vector">Dark Gray</option>
              <option value="topo" data-vector="topo-vector">Topographic</option>
              <option value="osm">Open Street Map</option>
              <option value="national-geographic">National Geographic</option>
            </select>
            <div class="checkbox"><label><input type="checkbox" id="vectorBasemap"> Use Vector Basemap</label></div>
            <p id="vectorAlert" class="hidden"><span class="glyphicon glyphicon-alert"></span> <em>Vector Basemap</em> has the best performance on machines with newer hardware. Please turn off <em>Vector Basemap</em> if you have a performance issue.</p>
          </div>
        </div>
      </div>
      <div id="panelPrint" class="panel panel-default collapse">
        <div id="headingPrint" class="panel-heading" role="tab">
          <div class="panel-title">
            <a class="panel-toggle collapsed" role="button" data-toggle="collapse" href="#collapsePrint" data-parent="#panelAccordion" aria-expanded="false" aria-controls="collapsePrint"><span class="glyphicon glyphicon-print" aria-hidden="true"></span> Print</a>
            <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelPrint"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>
          </div>
        </div>
        <div id="collapsePrint" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingPrint">
          <div class="panel-body panel-overflow-visible">
            Print
          </div>
        </div>
      </div>
      <div id="panelSearch" class="panel panel-default collapse hidden-lg">
        <div id="headingSearch" class="panel-heading" role="tab">
          <div class="panel-title">
            <a class="panel-toggle collapsed" role="button" data-toggle="collapse" href="#collapseSearch" data-parent="#panelAccordion" aria-expanded="false" aria-controls="collapseSearch"><span class="glyphicon glyphicon-search" aria-hidden="true"></span> Search</a>
            <a class="panel-close" role="button" data-toggle="collapse" data-target="#panelSearch"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a>
          </div>
        </div>
        <div id="collapseSearch" class="panel-collapse collapse" role="tabpanel" aria-labelledby="headingSearch">
          <div class="panel-body panel-overflow-visible">
            <div id="searchPanelDiv"></div>
          </div>
        </div>
      </div>
    </div> <!-- /.panel-group -->
  </div> <!-- /.panel-container -->
  <script>
    var dojoConfig = {
      packages: [{
        name: "bootstrap",
        location: "https://esri.github.io/calcite-maps/dist/vendor/dojo-bootstrap"
      },
      {
        name: "calcite-maps",
        location: "https://esri.github.io/calcite-maps/dist/js/dojo"
      }]
    };
  </script>
  <script src="//js.arcgis.com/3.17/"></script>
  <script src="js/main.js"></script>
</body>
</html>