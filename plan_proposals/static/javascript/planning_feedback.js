/*
 map settings
*/
var map;

var SHOW_PLAN = false;
var INITIAL_CENTER = {
                    "x":395524,
                    "y":6706710};

/*
 page specific events and other methods
*/
// increase the default animation speed to exaggerate the effect
$.fx.speeds._default = 500;

jQuery(document).ready(function(){
    $( "#dialog" ).dialog({
        autoOpen: false,
        show: "blind",
        width: 600
    });

    $( "#opener" ).click(function() {
        $( "#dialog" ).dialog( "open" );
        return false;
    });
    // Create target element for onHover titles
    $caption = $("<span/>");
    
     $("input.star").rating({
            callback: function(value, link){
                alert(value);

            }
     });

     // Make it available in DOM tree
     $caption.appendTo(".ratings");
     
     $(".submit-evaluation").click(function() {
            $(".red").html("Thank you for your feedback!");
            $(".submit-evaluation").attr("disabled", "disabled");
            $("#free-comment").attr("disabled", "disabled");
            
            $(".ui-stars-star").addClass("ui-stars-star-disabled");
            $(".ui-stars-cancel").css("opacity", 0);
            
            $('input.star').rating('readOnly',true) 
            
    });
     
    
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
    
    var arcgisLayer = new OpenLayers.Layer.ArcGIS93Rest(
        "ArcGIS Server Layer",
        "https://pehmogis.tkk.fi/ArcGIS/rest/services/suomi/MapServer/export",
        {layers: "show:0,7,43,79,115,150,151,187,222,258,294,330"},
        {isBaseLayer: true}
    );
    
    var pointLayer = new OpenLayers.Layer.Vector("Point Layer");
    var routeLayer = new OpenLayers.Layer.Vector("Route Layer");
    var areaLayer = new OpenLayers.Layer.Vector("Area Layer");
    map.addLayers([arcgisLayer, pointLayer, routeLayer, areaLayer]);
    
    var pointcontrol = new OpenLayers.Control.DrawFeature(pointLayer,
                                OpenLayers.Handler.Point,
                                {'id': 'pointcontrol'});
    var routecontrol = new OpenLayers.Control.DrawFeature(routeLayer,
                                OpenLayers.Handler.Path,
                                {'id': 'routecontrol'})
    var areacontrol = new OpenLayers.Control.DrawFeature(areaLayer,
                                OpenLayers.Handler.Polygon,
                                {'id': 'areacontrol'})
    
    map.addControls([pointcontrol, routecontrol, areacontrol ]);
    draw_controls = {
        'point': pointcontrol,
        'route': routecontrol,
        'area': areacontrol
        };
    map.setCenter(new OpenLayers.LonLat(INITIAL_CENTER.x,
                                        INITIAL_CENTER.y), 0);
    
    map.zoomToScale(3937278600);
    
    //draw buttons to activate drawing functionality
    $( "#point_feedback").drawButton({
        control: "pointcontrol"
        });
    $( "#route_feedback").drawButton({
        control: "routecontrol"
        });
    $( "#area_feedback").drawButton({
        control: "areacontrol"
        });
    
});