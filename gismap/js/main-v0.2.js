String.prototype.capitalize = function() {
  return this.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
  //return this.charAt(0).toUpperCase() + this.slice(1);
};
require([
  "esri/Map",
  "esri/views/MapView",
  "esri/geometry/Extent",
  "esri/widgets/Search",
  "esri/widgets/Home",
  "esri/widgets/Locate",
  "esri/renderers/SimpleRenderer",
  "esri/symbols/SimpleMarkerSymbol",

  "dojo/query",
  "dojo/on",
  "dojo/request/xhr",
  "dojo/_base/array",
  "dojo/dom-class",
  "dojo/Deferred",

  // Calcite-maps
  "extra/calcitemaps-v0.2.edit",

  // Bootstrap
  "bootstrap/Collapse",
  "bootstrap/Dropdown",
  "bootstrap/Tab",
  "bootstrap/Modal",
  "extra/Datepicker",

  "dojo/domReady!"
], function(
  Map, MapView, Extent, Search, Home, Locate, SimpleRenderer, SimpleMarkerSymbol,
  query, on, xhr, array, domClass, Deferred
) {
  // App
  var app = {
    initialExtent: new Extent({
      // exact california boundary
      "xmin": -13849947.1077, "ymin": 3803641.0796, "xmax": -12705116.39, "ymax": 5192385.525,
      "spatialReference": {"wkid": 102100}
    }),
    basemap: "streets-vector",
    viewPadding: {
      top: 60, bottom: 0
    },
    uiPadding: {
      top: 15, bottom: 15
    },
    mapView: null,
    searchWidgetNav: null,
    layers: {
      colLayer: null
    }
  };
  var filters = {
    "date": {
      "startDate": query("#startDate").val(),
      "endDate": query("#endDate").val()
    },
    "cityORroute": "city",
    "switrs": {},
    "party": {},
    "victim": {}
  };
  var dateToYMD = function(date) {
    var dateParts = date.split(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    return dateParts[3] + "-" + dateParts[1] + "-" + dateParts[2];
  };
  var initialize = function() {
    // Map
    var map = new Map({
      basemap: app.basemap
    });

    app.mapView = new MapView({
      container: "mapViewDiv",
      map: map,
      extent: app.initialExtent,
      padding: app.viewPadding,
      ui: {
        components: ["zoom", "attribution"],
        padding: app.uiPadding
      }
    });
    app.mapView.ui.add(new Home({view: app.mapView}), "top-left");
    var locateBtn = new Locate({view: app.mapView});
    locateBtn.startup();
    app.mapView.ui.add(locateBtn, "top-left");
    // Search Widgets
    app.searchWidgetNav = createSearchWidget("searchNavDiv");
    if (app.searchWidgetNav.selectedResult) {
      app.searchWidgetNav.search(app.searchWidgetNav.selectedResult.name);
    }
    app.mapView.popup.reposition();
    function createSearchWidget(parentId) {
      var search = new Search({
        viewModel: {
          view: app.mapView,
          highlightEnabled: false,
          popupEnabled: true,
          showPopupOnSelect: true
        }
      }, parentId);
      search.startup();
      return search;
    }
    // Nav Dropdown
    query(".calcite-nav-dropdown .dropdown-toggle").on('click', function (e) {
      query(this).parent().toggleClass("open");
      query("span", this).toggleClass("glyphicon-chevron-down");
      query("span", this).toggleClass("glyphicon-chevron-up");
    });
    // query(".calcite-nav-dropdown").on("hide.bs.dropdown", function () {
    //   query("> a span", this).removeClass("glyphicon-chevron-up").addClass("glyphicon-chevron-down");
    // });
    query(window).on("click", function (e) {
      var menu = query(".calcite-nav-dropdown.open")[0];
      if (menu) {
        if (query(e.target).closest(".calcite-nav-dropdown").length === 0) {
          on.emit(query(".calcite-nav-dropdown .dropdown-toggle")[0], "click", {
            bubbles: true,
            cancelable: true
          });
        }
      }
    });
    // Popup and Panel Events
    // Views - Listen to view size changes to show/hide panels
    app.mapView.watch("size", viewSizeChange);
    function viewSizeChange(screenSize) {
      if (app.screenWidth !== screenSize[0]) {
        app.screenWidth = screenSize[0];
        setPanelVisibility();
      }
    }
    // Popups - Listen to popup changes to show/hide panels
    app.mapView.popup.watch(["visible", "currentDockPosition"], setPanelVisibility);
    // Panels - Show/hide the panel when popup is docked
    function setPanelVisibility() {
      var isMobileScreen = app.mapView.widthBreakpoint === "xsmall" || app.mapView.widthBreakpoint === "small",
        isDockedVisible = app.mapView.popup.visible && app.mapView.popup.currentDockPosition,
        isDockedBottom = app.mapView.popup.currentDockPosition && app.mapView.popup.currentDockPosition.indexOf("bottom") > -1;
      // Mobile (xsmall/small)
      if (isMobileScreen) {
        if (isDockedVisible && isDockedBottom) {
          query(".calcite-panels").addClass("invisible");
        } else {
          query(".calcite-panels").removeClass("invisible");
        }
      } else { // Desktop (medium+)
        if (isDockedVisible) {
          query(".calcite-panels").addClass("invisible");
        } else {
          query(".calcite-panels").removeClass("invisible");
        }
      }
    }
    // Panels - Dock popup when panels show (desktop or mobile)
    query(".calcite-panels .panel").on("show.bs.collapse", function(e) {
      on.emit(window, "click", {
        bubbles: true,
        cancelable: true
      });
      if (app.mapView.popup.currentDockPosition || app.mapView.widthBreakpoint === "xsmall") {
        app.mapView.popup.dockEnabled = false;
      }
    });
    // Panels - Undock popup when panels hide (mobile only)
    query(".calcite-panels .panel").on("hide.bs.collapse", function(e) {
      if (app.mapView.widthBreakpoint === "xsmall") {
        app.mapView.popup.dockEnabled = true;
      }
    });
    // Basemap events
    query("#selectBasemapPanel").on("change", function(e) {
      app.mapView.map.basemap = e.target.options[e.target.selectedIndex].dataset.vector;
    });
    // Collapsible popup (optional)
    query(".esri-popup .esri-title").on("click", function(e){
      query(".esri-popup .esri-container").toggleClass("esri-popup-collapsed");
      app.mapView.popup.reposition();
    });
    // Toggle nav
    function closeMenu() {
      if (query(".calcite-dropdown.open")[0]) {
        query(".calcite-dropdown, .calcite-dropdown-toggle").removeClass("open");
      }
    }
    // Listen for clicks away from menu
    app.mapView.on("click", function(e) {
      closeMenu();
    });
  };
  var initMapSwitrs = function() {
    var initDatePicker = function() {
      query("#startDate, #endDate").datepicker({
        format: 'mm/dd/yyyy'
      }).on('changeDate', function(e) {
        // console.log('New date is ' + e.date);
        filters.date[this.id] = this.value;
      });
      // Arrow style override
      var arrow = {
        leftArrow: '&laquo;',
        rightArrow: '&raquo;'
      };
      query(".datepicker .prev").html(arrow.leftArrow);
      query(".datepicker .next").html(arrow.rightArrow);
    };
    var selectCityRoute = function() {
      var stroute = query("#stroute");
      var direct = query("#direct");
      var city = query("#city");

      var radio = query("input[name='cityORroute']:checked").val();
      filters.cityORroute = radio;
      if (radio == "stroute") {
        getRoute();

        city.parent().query("label").style("color", "rgba(0,0,0,0.5)");
        city.parent().style("display", "none");
        city.style("backgroundColor", "whitesmoke");

        stroute.parent().query("label").style("color", "black");
        stroute.parent().style("display", "inline-block");

        direct.parent().query("label").style("color", "black");
        direct.parent().style("display", "inline-block");
      }
      else {
        getCity();

        city.parent().query("label").style("color", "black");
        city.parent().style("display", "inline-block");

        stroute.parent().query("label").style("color", "rgba(0,0,0,0.5)");
        stroute.parent().style("display", "none");
        stroute.style("backgroundColor", "whitesmoke");

        direct.parent().query("label").style("color", "rgba(0,0,0,0.5)");
        direct.parent().style("display", "none");
        direct.style("backgroundColor", "whitesmoke");
      }
    };
    var getCity = function() {
      var city = query("#city");
      xhr("../../resources/cities_compact.json", {
        handleAs: "json"
      }).then(function(data) {
        var html = "";
        array.forEach(data.items, function(item) {
          if (item.county == query("#county option:checked").text().toUpperCase()) {
            html += "<option value='" + item.city_ID + "'>" + item.city.capitalize() + "</option>";
          }
        });
        city[0].innerHTML = html;
        city.style("backgroundColor", "white");
      });
    };
    var getRoute = function() {
      var stroute = query("#stroute");
      var direct = query("#direct");
      direct.empty();
      xhr("../../resources/counties_routes_compact.json", {
        handleAs: "json"
      }).then(function(data) {
        var html = "<option value='None'>None</option>";

        array.forEach(data.items, function(item) {
          if (item.county == query("#county option:checked").text()) {
            html += "<option value='" + item.route.capitalize() + "'>" + item.route + "</option>";
          }
        });
        stroute[0].innerHTML = html;
        stroute.style("backgroundColor", "white");
      });
      stroute.on("change", selectDirect);
    };
    var selectDirect = function() {
      var length = query("#stroute option:checked").length;
      var direct = query("#direct");
      var html = "<option value='All'>All</option>";
      if (length == 1) {
        var data = query("#stroute option:checked").text();

        var ns = [1,5,7,9,13,14,15,17,19,23,25,27,29,31,33,35,39,41,43,45,47,49,53,55,57,59,61,63,65,67,68,71,72,73,75,77,79,82,83,84,86,87,89,99,101,107,109,110,111,113,114,115,116,121,123,125,133,145,160,163,164,170,184,185,188,209,213,215,217,221,225,232,233,238,241,242,245,255,260,261,262,273,280,284,330,395,405,505,605,680,710,805,880];
        var ew = [2,4,8,10,12,16,18,20,22,24,30,32,34,36,37,38,40,42,44,46,50,52,54,56,58,60,62,66,70,74,76,78,80,88,90,91,92,94,104,105,108,112,118,120,126,128,129,130,131,132,134,137,138,140,142,150,151,152,154,156,162,166,168,176,178,180,183,187,190,192,193,195,198,204,205,210,218,223,227,237,244,246,259,270,274,275,282,299,380,580,780,905,980];

        if (array.indexOf(ns, data) > -1) {
          html += "<option value='N'>N</option>";
          html += "<option value='S'>S</option>";
        }
        else if (array.indexOf(ew, data) > -1) {
          html += "<option value='E'>E</option>";
          html += "<option value='w'>W</option>";
        }
        direct.style("backgroundColor", "white");
      }
      direct[0].innerHTML = html;
    };
    var getCounty = function() {
      xhr("../../resources/counties_compact.json", {
        handleAs: "json"
      }).then(function(data) {
        var html = "";
        array.forEach(data.items, function(item) {
          html += "<option value='" + item.county_ID + "'>" + item.county.capitalize() + "</option>";
        });
        document.getElementById("county").innerHTML = html;
        selectCityRoute();
      });
      query("#county, #cityRadio, #routeRadio").on("change", selectCityRoute);
    };
    var initFilters = function() {
      query("#filtersPanel .list-group > a").on("click", function(e) {
        var factorId = e.target.id;
        var radioArray = ["PEDCOL", "BICCOL", "MCCOL", "TRUCKCOL", "ETOH", "STATEHW", "ATFAULT"];
        var ageArray = ["PAGE", "VAGE"];
        var comboArray = ["PARNUM"];

        var type = query("#filtersPanel .in")[0].id.replace("factor_", "");
        var filter = factorId.replace("fields_", "");
        var option = (array.indexOf(radioArray, filter) > -1) ? "radio" : (array.indexOf(ageArray, filter) > -1) ? "age" : (array.indexOf(comboArray, filter) > -1) ? "combo" : "checkbox";

        var j;
        var max = 999;
        var content = "<div id='values_" + filter + "'>";
        xhr.post("../query/getFactors.php", {
          data: {"type": type, "value": filter},
          handleAs: "json"
        }).then(function(data) {
          switch (option) {
            case "checkbox":
            case "radio":
              for (j in data) {
                var name = data[j].Field_Value;
                var id = data[j].Value_ID;
                if (filters[type][filter]) {
                  var checked = array.some(filters[type][filter], function(item) {
                    return item == id;
                  });
                }
                var text = "";
                if (checked) {
                  text = " checked='checked'";
                }
                content += "<div class='" + option + "'><label><input type='" + option + "' name='" + filter + "' value='" + id + "'" + text + "> " + name + "</label></div>";
              }
              break;
            case "age":
              max = 125;
            case "combo":
              var start = 0;
              var end = max;
              if (filters[type][filter]) {
                start = filters[type][filter][0];
                end = filters[type][filter][1];
              }
              content += "<form class='form-inline'>";
              content += "<div class='form-group'><label>From&nbsp;<select class='form-contorl' id='st_" + filter + "'>";
              for (j = 0; j <= max; j++) {
                if (j == start) {
                  content += "<option value='" + j + "' selected='selected'>" + j + "</option>";
                }
                else {
                  content += "<option value='" + j + "'>" + j + "</option>";
                }
              }
              content += "</select></label></div>";
              content += "<div class='form-group'><label>&nbsp;to&nbsp;<select class='form-contorl' id='ed_" + filter + "'>";
              for (j = max; j >= 0; j--) {
                if (j == end) {
                  content +="<option value='" + j + "' selected='selected'>" + j + "</option>";
                }
                else {
                  content +="<option value='" + j + "'>" + j + "</option>";
                }
              }
              content += "</select></label></div>";
              content += "</form>";
              break;
          }
          content += "</div>";
          var container = query("#querySubSelected");
          container[0].innerHTML = content;
          container[0].value = type;

          var dialog = query("#modalQuerySub");
          dialog.query(".modal-title")[0].innerHTML = e.target.title;
          dialog.query(".modal-body > h4")[0].innerHTML = "Choose criteria of " + e.target.title;
          dialog.modal("show");
        });
      });
      query("#querySubSelected").on("input:click", function() {
        var container = query("#querySubSelected");
        var type = container.val();
        var filter = container.children()[0].id.replace("values_", "");
        var values = array.map(container.query("input:checked"), function(item) {
          return item.value;
        });
        var allChecked = false;
        if (container.query("input:not(:checked)").length === 0) {
          allChecked = true;
        }
        updateFilters(type, filter, values, allChecked);
      });
      query("#querySubSelected").on("select:change", function() {
        var container = query("#querySubSelected");
        var type = container.val();
        var filter = container.children()[0].id.replace("values_", "");
        var values = [query("#st_" + filter)[0].value, query("#ed_" + filter)[0].value];

        allChecked = false;
        if (values[0] === 0) {
          if (values[1] == 999 && filter == "PARNUM") {
            allChecked = true;
          }
          else if (values[1] == 125) {
            allChecked = true;
          }
        }
        updateFilters(type, filter, values, allChecked);
      });
      function updateFilters(type, filter, values, allChecked) {
        allChecked = allChecked || false;
        var factorId = "fields_" + filter;
        if (values.length && !allChecked) {
          filters[type][filter] = values;
          domClass.add(factorId, "active");
        }
        else {
          if (filters[type][filter]) {
            delete filters[type][filter];
          }
          domClass.remove(factorId, "active");
        }
        updatePanelText(type);
        function updatePanelText(type) {
          var length = Object.keys(filters[type]).length;
          var target = query("#factor_" + type + "_header .factor-selected")[0];
          if (length === 0) {
            target.innerHTML = "All filters selected";
          }
          else if (length == 1) {
            target.innerHTML = length + " filter selected";
          }
          else {
            target.innerHTML = length + " filters selected";
          }
        }
      }
      query("#showResult").on("click", function() {
        var deferred = queryCollisions();
        deferred.then(function() {
          query("#modalQueryMain").modal("hide");
        }, function(err) {
          // Do something when the process errors out
        });
      });
    };
    var generateRenderer = function(type) {
      type = type || "default";
      if (type == "default") {
        var colRenderer = new SimpleRenderer({
          symbol: new SimpleMarkerSymbol({
            size: 8,
            color: "#3b7ea1",
            outline: {
              width: 0.5,
              color: "white"
            }
          })
        });
      }
      return colRenderer;
    };
    var queryCollisions = function() {
      var deferred = new Deferred();
      app.mapView.map.remove(app.mapView.colLayer);
      app.mapView.colLayer = null;

      var baseQuery = createBaseQuery();
      console.log(baseQuery);

      if (baseQuery.length > 0) {
        xhr.post("getCaseids.php", {
          data: {
            "baseQuery": baseQuery,
            "switrs": JSON.stringify(filters.switrs),
            "party": JSON.stringify(filters.party),
            "victim": JSON.stringify(filters.victim)
          },
          handleAs: "json"
        }).then(function(caseids) {
          require([
            "esri/tasks/QueryTask", "esri/tasks/support/Query",
            "esri/layers/FeatureLayer",
            "esri/renderers/SimpleRenderer", "esri/symbols/SimpleMarkerSymbol"
          ], function(
            QueryTask, Query,
            FeatureLayer,
            SimpleRenderer, SimpleMarkerSymbol
          ) {
            var query = new Query();
            query.returnGeometry = true;
            query.outFields = ["CASEID","YEAR_","DATE_", "LOCATION","CRASHTYP","VIOLCAT", "KILLED", "INJURED", "CRASHSEV", "PEDCOL","BICCOL","MCCOL","TRUCKCOL","PRIMARYRD","SECONDRD","INTERSECT_","DISTANCE","DIRECT","INVOLVE"];
            query.where = "CASEID IN (" + caseids.join(",") + ")";

            var queryTask = new QueryTask({
              url: arcgisOnline + 1
            });
            queryTask.execute(query).then(function(results) {
              var option = {
                fields: results.fields,
                source: results.features,
                objectIdField: "CASEID",
                geometryType: "point",
                spatialReference: results.spatialReference,
                renderer: generateRenderer()
              };
              app.mapView.colLayer = new FeatureLayer(option);
              app.mapView.map.add(app.mapView.colLayer);
              deferred.resolve();
            });
          });
        });
      }
      else {
        deferred.reject();
        // document.getElementById("resultMsg").innerHTML="Error: Please go back to the first page and start new query.";
        // document.getElementById("loader").style.display="none";
      }
      return deferred.promise;
      function createBaseQuery() {
        var baseQuery = "DATE_ >= '" + dateToYMD(filters.date.startDate) + "' AND DATE_ <= '" + dateToYMD(filters.date.endDate) + "' AND ";
        var countyId = query("#county option:checked").val();
        var countyName = query("#county option:checked").text().toUpperCase();
        if (filters.cityORroute == "city") {
          var cities = array.map(query("#city option:checked"), function(item) {
            return item.value;
          });
          if (cities.length === 0 || cities[0] == "All") {
            baseQuery += "COUNTY = '" + countyName + "'";
          }
          else {
            var location = array.map(cities, function(city) {
              return countyId + city;
            });
            baseQuery += "LOCATION IN ('" + location.join("','") + "')";
          }
        }
        else {
          baseQuery += "COUNTY = '" + countyName + "' AND ";
          var routes = array.map(query("#stroute option:checked"), function(item) {
            return item.value;
          });
          var direct = array.map(query("#direct option:checked"), function(item) {
            return item.value;
          });
          switch (routes[0]) {
            case "All":
              baseQuery += "STROUTE != 0";
              break;
            case "None":
              baseQuery += "STROUTE = 0";
              break;
            default:
              baseQuery += "STROUTE IN (" + routes.join() + ")";
          }
          if (direct.length > 0) {
            if (direct[0] != "All") {
              baseQuery += " AND SIDEHW = '" + direct.join("','") + "'";
            }
          }
        }
        return baseQuery;
      }
    };
    initDatePicker();
    getCounty();
    initFilters();
  };
  initialize();
  initMapSwitrs();
});