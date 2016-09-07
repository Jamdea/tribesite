var app;
require([
  // ArcGIS
  "esri/map",
  "esri/geometry/Extent",
  "esri/dijit/Search", "esri/dijit/Scalebar", "esri/dijit/HomeButton", "esri/dijit/LocateButton",

  // Dojo
  "dojo/query",

  // Bootstrap
  "bootstrap/Collapse", "bootstrap/Dropdown", "bootstrap/Tab", "bootstrap/Modal",
// Calcite Maps
  "calcite-maps/calcitemaps-v0.2",
  "dojo/domReady!"
], function(
  Map, Extent, Search, Scalebar, HomeButton, LocateButton,
  query
) {
  // App
  app = {
    map: null,
    basemap: "streets",
    initialExtent: new Extent({
      // exact california boundary
      "xmin": -13849947.1077, "ymin": 3803641.0796, "xmax": -12705116.39, "ymax": 5192385.525,
      "spatialReference": {"wkid": 102100}
    }),
    searchWidgetNav: null,
    searchWidgetPanel: null,
  }
  // Map
  app.map = new Map("mapViewDiv", {
    basemap: app.basemap,
    extent: app.initialExtent
  });
  app.map.on("load", function(){
    app.initialExtent = app.map.extent;
  })

  // Search
  app.searchDivNav = createSearchWidget("searchNavDiv");
  app.searchWidgetPanel = createSearchWidget("searchPanelDiv");
  function createSearchWidget(parentId) {
    var search = new Search({
      map: app.map,
      enableHighlight: false
    }, parentId);
    search.startup();
    return search;
  }
  var scalebar = new Scalebar({
    map: app.map,
    scalebarUnit: "dual"
  });
  var home = new HomeButton({
    map: app.map
  }, "HomeButton");
  home.startup();
  var geoLocate = new LocateButton({
    map: app.map
  }, "LocateButton");
  geoLocate.startup();
  // Basemaps
  query("#selectBasemapPanel").on("change", function(e){
    app.map.setBasemap(e.target.options[e.target.selectedIndex].value);
  });
  // Home
  query(".calcite-navbar .navbar-brand").on("click", function(e) {
    app.map.setExtent(app.initialExtent);
  })
});