/*
 map settings
*/
var map;
var layer;

var SHOW_PLAN = false;
var INITIAL_CENTER = {
                    "x":395524,
                    "y":6706710};

function init() {
    /* Openlayers */
    var mapOptions = {
        maxExtent: new OpenLayers.Bounds(89949.504,
                                         6502687.508,
                                         502203.000,
                                         7137049.802),
        projection: "EPSG:3067",
        maxResolution: 50
    };
    map = new OpenLayers.Map('map', mapOptions);
    
    layer = new OpenLayers.Layer.ArcGIS93Rest(
        "ArcGIS Server Layer",
        "https://pehmogis.tkk.fi/ArcGIS/rest/services/suomi/MapServer/export",
        {layers: "show:0,7,43,79,115,150,151,187,222,258,294,330"},
        {isBaseLayer: true}
    );
    
    map.addLayer(layer);
    map.addControl( new OpenLayers.Control.MousePosition() );
    map.setCenter(new OpenLayers.LonLat(INITIAL_CENTER.x,
                                        INITIAL_CENTER.y), 0);
    
    map.zoomToScale(3937278600);
}

/*
 add the events and initialize widgets
*/
jQuery(document).ready(function(){
    $("#accordion").accordion({
            'collapsible': true,
            'autoHeight': false,
            'active': false
        });
                
        
    $( "#more_info" ).dialog({
            'autoOpen': false,
            'show': "blind",
            'width': 600
        });
        
    $( "#opener" ).click(function() {
        $( "#more_info" ).dialog( "open" );
            return false;
        });
    
    init();
});
