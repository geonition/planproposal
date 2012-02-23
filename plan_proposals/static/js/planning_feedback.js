/*
 map settings
*/
var map;

var SHOW_PLAN = false;
var INITIAL_CENTER = {
    "x": 395035.9395,
    "y": 6704086.647
};

var popup; //only one popup at the time

/*
This is a helper function that returns
a OpenLayers LonLat object according
to the geometry that is given to it.

This function should bring some consistency
on where to show a popup for each feature.
*/
function get_popup_lonlat(geometry) {
    var lonlat;
    if ( geometry.id.contains("Point") ) {
        lonlat = new OpenLayers.LonLat(
                        geometry.x,
                        geometry.y);
    } else if ( geometry.id.contains("LineString") ) {
        lonlat = new OpenLayers.LonLat(
                        geometry.components[geometry.components.length - 1].x,
                        geometry.components[geometry.components.length - 1].y);
    } else if ( geometry.id.contains("Polygon") ) {
        lonlat = new OpenLayers.LonLat(
                        geometry.components[0].components[0].x,
                        geometry.components[0].components[0].y);
    }
    return lonlat;
}


/*
 popup save feature event handler
 connected to the save button in the popup form
*/
function save_handler(evt) {

    //get the form data
    var popup_values = $('form[name=popupform].active').serializeArray();

    //set the popup form as not active
    $('form[name=popupform]').removeClass('active');

    //build new attributes for the features
    var new_attributes = {};
    for(var val in popup_values) {
        new_attributes[popup_values[val]['name']] =
            popup_values[val]['value'];
    }

    evt.data[0].attributes = new_attributes;

    //save the geojson
    var gf = new OpenLayers.Format.GeoJSON();
    var geojson = gf.write(evt.data[0]);

    if (evt.data[0].fid === undefined || evt.data[0].fid === null) {

        gnt.geo.create_feature(geojson, function(event) {
            var new_feature = null;
            // retrieve feature without fid and give it the id from the right layer
            if( event.geometry.type === 'Point') {
                new_feature = map.getLayersByName('Point Layer')[0].getFeatureByFid(undefined);
            } else if ( event.geometry.type === 'LineString' ) {
                new_feature = map.getLayersByName('Route Layer')[0].getFeatureByFid(undefined);
            } else if ( event.geometry.type === 'Polygon' ) {
                new_feature = map.getLayersByName('Area Layer')[0].getFeatureByFid(undefined);
            }
            new_feature.fid = event.id;
        });

    } else {
        //update the feature
        gnt.geo.update_feature(geojson);
    }

    //unselect feature
    map.getControlsByClass( 'OpenLayers.Control.SelectFeature' )[0].unselectAll(evt);

    //remove popup from map
    if(popup !== undefined) {
        map.removePopup(popup);
        popup = undefined;
    }
}

/*
 popup remove feature event handler,
 connected to the remove button in the popup form.
*/
function remove_handler(evt) {

    evt.data[0].layer.removeFeatures([evt.data[0]]);
    //unselect feature
    map.getControlsByClass( 'OpenLayers.Control.SelectFeature' )[0].unselectAll();

    //if fid found then delete otherwise do nothing
    var gf = new OpenLayers.Format.GeoJSON();
    var geojson = gf.write(evt.data[0]);

    if (evt.data[0].fid !== undefined && evt.data[0].fid !== null) {
        gnt.geo.delete_feature(geojson);
    }

    if(popup !== undefined) {
        map.removePopup(popup);
        popup = undefined;
    }
}

/*
This function makes the popup and shows it for the feature given.

Expects there to be a feature.popup created
that can be called.
*/
function show_popup_for_feature(feature) {

    if ( feature.popup !== undefined ) {

        //remove old popup if existing
        if(popup !== undefined) {
            map.removePopup(popup);
            popup = undefined;
        }

        //create popup and put it on the map
        popup = feature.popup;
        map.addPopup(popup);

        //add a class to the form to recognize it as active
        $('div[id="' + feature.id + '"] form[name="popupform"]').addClass('active');

        // add values to the form the values are connected but the form element name
        // and the name value in the feature attributes
        var input_elements = $('div[id="' + feature.id + '"] form[name="popupform"] :input');
        input_elements.each(function() {
            $(this).val( feature.attributes[ $(this).attr( 'name' ) ] );
        });

        //connect the event to the infowindow buttons
        $('div[id="' + feature.id + '"] .save_feature').click([feature],
                                                      save_handler);
        $('div[id="' + feature.id + '"] .remove_feature').click([feature],
                                                        remove_handler);

        return true;

    } else {

        return false;

    }
}

/*
This function handles the on feature select
where it shows the popup with the correct
values from the feature attributes.
*/
function on_feature_select_handler(evt) {
    show_popup_for_feature(evt);
}

/*
This function handles the on feature unselect
where it closes the popup.
*/
function on_feature_unselect_handler(evt) {

    //remove popup from map
    map.removePopup(popup);
    popup = undefined;
}

/*
 confirm and save the feature

 The feature popup content and is connected
 with the name of the button that was used
 to draw it on the map. The button name is
 the same as the popup id that is supposed
 to be shown as the content in popup.
*/
function feature_added(evt) {

    //get the right lonlat for the popup position
    evt.lonlat = get_popup_lonlat(evt.geometry);

    //get the active button name = infowindow name
    var draw_button_name = $('button.ui-state-active').attr('name');
    var popupcontent = " default info content ";

    //get the right content for the popup
    if( draw_button_name !== undefined ) {
        popupcontent = $('#' + draw_button_name).html();
    }
    evt.popupClass = OpenLayers.Popup.FramedCloud;
    evt.data = {
        popupSize: null,
        popupContentHTML: popupcontent
    };

    //the createPopup function did not seem to work so here
    evt.popup = new OpenLayers.Popup.FramedCloud(
                        evt.id,
                        evt.lonlat,
                        evt.data.popupSize,
                        evt.data.popupContentHTML,
                        null,
                        false);

    show_popup_for_feature(evt);

    //deactivate the map and the drawing
    //unselect the button
    $(".drawbutton.ui-state-active")
        .drawButton( 'deactivate' );
}



/*
 page specific events and other methods
*/
// increase the default animation speed to exaggerate the effect
$.fx.speeds._default = 500;

jQuery(document).ready(function(){

    $( "#more_info" ).dialog({
        autoOpen: false,
        show: "blind",
        width: 800,
        height: 600
    });
    $( "#pic1" ).dialog({
        autoOpen: false,
        show: "blind",
        width: 800,
        maxHeight: 600,
        resizable: false
    });
    $( "#pic2" ).dialog({
        autoOpen: false,
        show: "blind",
        width: 800,
        maxHeight: 600,
        resizable: false
    });
    $( "#pic3" ).dialog({
        autoOpen: false,
        show: "blind",
        width: 800,
        maxHeight: 600,
        resizable: false
    });
    $( "#streetview" ).dialog({
        autoOpen: false,
        show: "blind",
        width: 800,
        maxHeight: 600,
        resizable: false
    });

    $( "#more_info_link" ).click(function() {
        $( "#more_info" ).dialog( "open" );
        return false;
    });
    $( "#pic1_link" ).click(function() {
        $( "#pic1" ).dialog( "open" );
        return false;
    });
    $( "#pic2_link" ).click(function() {
        $( "#pic2" ).dialog( "open" );
        return false;
    });
    $( "#pic3_link" ).click(function() {
        $( "#pic3" ).dialog( "open" );
        return false;
    });
    $( "#streetview_link" ).click(function() {
        $( "#streetview" ).dialog( "open" );
        return false;
    });

    /* geonition data */
    gnt.auth.create_session();

    $("#proposal1-form").submit(function(event) {
        event.preventDefault();
        var value = $( this ).serializeArray()[0];
        $("#free_comment").attr("disabled", "disabled");
        $(".submit-evaluation").attr("disabled", "disabled");
        $(".free_comment_thanks").show();
        gnt.opensocial_people.update_person('@me',
                            {'free_comment': value['value']});
        });

    /* Openlayers */

    // set language
    OpenLayers.Lang.setCode('fi');
    var mapOptions = {
        maxExtent: new OpenLayers.Bounds(89949.504,
                                         6502687.508,
                                         502203.000,
                                         7137049.802),
        projection: "EPSG:3067",
        maxResolution: 50,
        numZoomLevels: 10,
        tileSize: new OpenLayers.Size(512, 512)
    };
    map = new OpenLayers.Map('map', mapOptions);

    var arcgisLayer = new OpenLayers.Layer.ArcGIS93Rest(
        "kartta",
        "https://pehmogis.tkk.fi/ArcGIS/rest/services/suomi/MapServer/export",
        {layers: "show:0,7,43,79,115,150,151,187,222,258,294,330",
        format: "png24"},
        {isBaseLayer: true,
        maxExtent: new OpenLayers.Bounds(
            390523.0685,
            6700070.816,
            399368.006,
            6709752.84725),
        buffer: 0}
    );

    //this is for testing modify later
    /*
    var imageLayer = new OpenLayers.Layer.Image(
        "Image layer test",
        "https://softgis.org.aalto.fi/jarvenpaa/static/images/test/test.png",
        new OpenLayers.Bounds(394738.512,
                            6709404.6945,
                            395377.5745,
                            6709881.257),
        new OpenLayers.Size(208, 334),
        {isBaseLayer: false,
        visibility: false}
    );*/

    var proposalLayer = new OpenLayers.Layer.ArcGIS93Rest(
        "Ehdotus",
        "https://pehmogis.tkk.fi/ArcGIS/rest/services/Suunnittelu/MapServer/export",
        {layers: "show:0",
        format: "png24",
        transparent: true},
        {isBaseLayer: false,
        maxExtent: new OpenLayers.Bounds(
            394523.0685,
            6703070.816,
            395368.006,
            6704752.84725),
        buffer: 0}
    );
    /*
     new OpenLayers.Style(null, {
                        rules: [
                            new OpenLayers.Rule({
                                symbolizer: {
                                    graphic: false,
                                    label: "Label for invisible point",
                                    labelSelect: true,
                                    fontStyle: "italic"
                                },
                                filter: new OpenLayers.Filter.Comparison({
                                    type: "==",
                                    property: "topic",
                                    value: "point_invisible"
                                })
                            }),
    */

    var pointLayer = new OpenLayers.Layer.Vector(
                "Point Layer",
                {
                    styleMap: new OpenLayers.StyleMap({
                        'default': {
                            externalGraphic: "/images/needle?color=ee9900",
                            graphicHeight: 36,
                            graphicWidth: 23,
                            graphicYOffset: -30,
                            cursor: 'pointer'
                        },
                        'temporary': {
                            externalGraphic: "/images/needle?color=ee9900",
                            graphicHeight: 36,
                            graphicWidth: 23,
                            graphicYOffset: -30
                        }
                    })
                });
    var routeLayer = new OpenLayers.Layer.Vector(
                "Route Layer",
                {
                    styleMap: new OpenLayers.StyleMap({
                        'default': {
                            strokeWidth: 2,
                            strokeColor: '#ee9900',
                            cursor: 'pointer'
                        }
                    })
                });
    var areaLayer = new OpenLayers.Layer.Vector(
                "Area Layer",
                {
                    styleMap: new OpenLayers.StyleMap({
                        'default': {
                            strokeWidth: 2,
                            strokeColor: '#ee9900',
                            cursor: 'pointer',
                            fillColor: '#ee9900',
                            fillOpacity: 0.3
                        }
                    })
                });
    map.addLayers([arcgisLayer, proposalLayer, areaLayer, routeLayer, pointLayer ]);

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
    //map.addControl(new OpenLayers.Control.LayerSwitcher());

    //select feature control
    var select_feature_control = new OpenLayers.Control.SelectFeature(
            [pointLayer, routeLayer, areaLayer],
            {
            id: 'selectcontrol',
            onSelect: on_feature_select_handler,
            onUnselect: on_feature_unselect_handler,
            toggle: false,
            clickout: true,
            multiple: false,
            hover: false
            });
    map.addControl(select_feature_control);
    select_feature_control.activate();


    map.setCenter(new OpenLayers.LonLat(INITIAL_CENTER.x,
                                        INITIAL_CENTER.y), 0);

    map.zoomToScale(492159825);

    //draw buttons to activate drawing functionality
    $( "#point_feedback").drawButton({
        drawcontrol: "pointcontrol"
    });
    $( "#route_feedback").drawButton({
        drawcontrol: "routecontrol"
    });
    $( "#area_feedback").drawButton({
        drawcontrol: "areacontrol"
    });

    //hide all popups as default
    $('.popup').hide();

    //get the users feature if any
    gnt.geo.get_features('?time__now=true', function(event) {

        if (event.features) {
            var pl = map.getLayersByName('Point Layer')[0];
            var rl = map.getLayersByName('Route Layer')[0];
            var al = map.getLayersByName('Area Layer')[0];
            var gf = new OpenLayers.Format.GeoJSON();
            var popupcontent = " default content ";

            for(var i = 0; i < event.features.length; i++) {
                var feature = gf.parseFeature(event.features[i]);
                feature.lonlat = get_popup_lonlat(feature.geometry);


                if(feature.geometry.id.contains( "Point" )) {
                    pl.addFeatures(feature);
                    popupcontent = $('#place').html();
                } else if(feature.geometry.id.contains( "LineString" )) {
                    rl.addFeatures(feature);
                    popupcontent = $('#route').html();
                } else if(feature.geometry.id.contains( "Polygon" )) {
                    al.addFeatures(feature);
                    popupcontent = $('#area').html();
                }

                feature.popupClass = OpenLayers.Popup.FramedCloud;
                feature.data = {
                    popupSize: null,
                    popupContentHTML: popupcontent
                };

                //the createPopup function did not seem to work so here
                feature.popup = new OpenLayers.Popup.FramedCloud(
                                    feature.id,
                                    feature.lonlat,
                                    feature.data.popupSize,
                                    feature.data.popupContentHTML,
                                    null,
                                    false);

            }
        }
    });
});

//delete the session on unload
$(window).unload(function(event) {
    console.log(event);
    gnt.auth.delete_session();
    });