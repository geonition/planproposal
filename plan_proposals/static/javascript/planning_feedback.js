/*
 map settings
*/
var map;

var SHOW_PLAN = false;
var INITIAL_CENTER = {
                    "x":395524,
                    "y":6706710};

var popup; //only one popup at the time

/*
 popup save feature event handler
*/
function save_handler(evt) {
    console.log("save handler");
    console.log(evt);
    console.log(evt.data[0]);
    //get the form data
    console.log($('form[name=popupform].active').serializeArray());
    var popup_values = $('form[name=popupform].active').serializeArray();
    $('form[name=popupform]').removeClass('active');
    var new_attributes = {};
    console.log(popup_values);
    for(var val in popup_values) {
        console.log(val);
        new_attributes[popup_values[val]['name']] =
            popup_values[val]['value'];
    }
    console.log(new_attributes);
    evt.data[0].attributes = new_attributes;
    //save the geojson
    var gf = new OpenLayers.Format.GeoJSON();
    console.log(gf);
    var geojson = gf.write(evt.data[0]);
    console.log(geojson);
    map.removePopup(popup);
    popup = undefined;
    
    //unselect the button
    $(".drawbutton.ui-state-active")
        .drawButton( 'deactivate' );
}

/*
 popup remove feature event handler
*/
function remove_handler(evt) {
    console.log("remove handler");
    console.log(evt);
    console.log(evt.data[0]);
    evt.data[0].layer.removeFeatures([evt.data[0]]);
    map.removePopup(popup);
    popup = undefined;
    
    //unselect the button
    $(".drawbutton.ui-state-active")
        .drawButton( 'deactivate' );
}

/*
 confirm and save the feature
*/
function feature_added(evt) {
    console.log(evt);
    
    //get the right lonlat for the popup position
    var lonlat;
    if( evt.geometry.id.contains( "Point" ) ) {
        lonlat = new OpenLayers.LonLat(
                        evt.geometry.x,
                        evt.geometry.y);
    } else if ( evt.geometry.id.contains( "LineString" ) ) {
        lonlat = evt.geometry
            .components[evt.geometry.components.length - 1]
            .bounds.getCenterLonLat();
    } else if ( evt.geometry.id.contains( "Polygon" ) ) {
        lonlat = evt.geometry.bounds.getCenterLonLat();
    }
    
    
    //get the active button name = infowindow name
    var infowindow_name = $('button.ui-state-active').attr('name');
    var infocontent = " default info content ";
    
    //get the right content for the popup
    if( infowindow_name !== undefined ) {
        infocontent = $('#' + infowindow_name).html();
    }
    
    
    //remove old popup if existing
    if(popup !== undefined) {
        map.removePopup(popup);
        popup = undefined;
    }
    //create popup and put it on the map
    popup = new OpenLayers.Popup.FramedCloud(
                    evt.id,
                    lonlat,
                    null,
                    infocontent,
                    null,
                    false);

    map.addPopup(popup);
    //add a class to the form to recognize it as active
    $('div[id="' + evt.id + '"] form[name="popupform"]').addClass('active');
    
    //connect the event to the infowindow buttons
    $('div[id="' + evt.id + '"] .save_feature').click([evt],
                                                      save_handler);
    $('div[id="' + evt.id + '"] .remove_feature').click([evt],
                                                        remove_handler);
}

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
        {layers: "show:0,7,43,79,115,150,151,187,222,258,294,330",
        format: "png24"},
        {isBaseLayer: true}
    );
    
    //this is for testing modify later
    var imageLayer = new OpenLayers.Layer.Image(
        "Image layer test",
        "http://localhost:8000/static/images/test/test.png",
        new OpenLayers.Bounds(391411.5,
                            6703897.5,
                            399636.5,
                            6709522.5),
        new OpenLayers.Size(208, 334),
        {isBaseLayer: false}
    );
    
    var pointLayer = new OpenLayers.Layer.Vector("Point Layer");
    var routeLayer = new OpenLayers.Layer.Vector("Route Layer");
    var areaLayer = new OpenLayers.Layer.Vector("Area Layer");
    map.addLayers([arcgisLayer, imageLayer, pointLayer, routeLayer, areaLayer]);
    
    var pointcontrol = new OpenLayers.Control.DrawFeature(pointLayer,
                                OpenLayers.Handler.Point,
                                {'id': 'pointcontrol',
                                'featureAdded': feature_added});
    var routecontrol = new OpenLayers.Control.DrawFeature(routeLayer,
                                OpenLayers.Handler.Path,
                                {'id': 'routecontrol',
                                'featureAdded': feature_added})
    var areacontrol = new OpenLayers.Control.DrawFeature(areaLayer,
                                OpenLayers.Handler.Polygon,
                                {'id': 'areacontrol',
                                'featureAdded': feature_added})
    
    map.addControls([pointcontrol, routecontrol, areacontrol ]);
    map.addControl(new OpenLayers.Control.LayerSwitcher());

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
    
    //hide all popups as default
    $('.popup').hide();
    
    //create session for use
    //gnt.auth.create_session();
});