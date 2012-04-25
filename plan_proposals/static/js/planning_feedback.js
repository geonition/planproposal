/*
 map settings
*/

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
    var popup_values = $('form.popupform.active').serializeArray();

    //set form value attributes for feature
    evt.data[0].attributes.form_values = popup_values;

    //save the geojson
    var gf = new OpenLayers.Format.GeoJSON();
    var geojson = gf.write(evt.data[0]);

    if (evt.data[0].fid === undefined || evt.data[0].fid === null) {
        gnt.geo.create_feature('@me', feature_group, geojson, {
            'success': function(data, textStatus, jqXHR) {
                var new_feature = null;
                // retrieve feature without fid and give it the id from the right layer
                if( data.geometry.type === 'Point') {
                    new_feature = map.getLayersByName('Point Layer')[0].getFeatureByFid(undefined);
                } else if ( data.geometry.type === 'LineString' ) {
                    new_feature = map.getLayersByName('Route Layer')[0].getFeatureByFid(undefined);
                } else if ( data.geometry.type === 'Polygon' ) {
                    new_feature = map.getLayersByName('Area Layer')[0].getFeatureByFid(undefined);
                }
                new_feature.fid = data.id;
            }
        });
        
    } else {
        //update the feature
        gnt.geo.update_feature(undefined,
                               feature_group,
                               geojson,
                               undefined);
    }

    //unselect feature
   map.getControlsByClass( 'OpenLayers.Control.SelectFeature' )[0].unselectAll(evt);

    //set the popup form as not active
    $('form.popupform.active').removeClass('active');
    
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
        gnt.geo.delete_feature(undefined, feature_group, geojson);
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
function show_popup_for_feature(feature, popup_name) {
    console.log("show popup for feature");
    console.log(feature);
    console.log(popup_name);
    if ( feature.popup !== undefined ) {
        
        if(popup_name === undefined) {
            popup_name = $('.drawbutton[name=' +
                           feature.attributes.name +
                           ']').data('popup');
        }
        console.log(popup_name);
        //remove old popup if existing
        if(popup !== undefined) {
            map.removePopup(popup);
            popup = undefined;
        }
        
        //create popup and put it on the map
        popup = feature.popup;
        map.addPopup(popup);

        //add a class to the form to recognize it as active
        $('.olFramedCloudPopupContent form[name="' + popup_name + '"]').addClass('active');
        console.log($('.olFramedCloudPopupContent form[name="' + popup_name + '"]'));
        // add values to the form the values are connected but the form element name
        // and the name value in the feature attributes
        if(feature.attributes.form_values === undefined) {
            feature.attributes.form_values = [];
        }
        
        $('form.popupform.active :input').val(function (index, value) {
            
            for(var i = 0; i < feature.attributes.form_values.length; i++) {
                var val_obj = feature.attributes.form_values[i];
                
                if($(this).attr('name') === val_obj.name) {
                    //this shuold be done for all kinds of multiple value inputs
                    if($(this).attr('type') === 'checkbox' &&
                       $(this).attr('value') === val_obj.value) {
                        
                        $(this).attr('checked', 'checked');
                        return value;
                    
                    } else if($(this).attr('type') === 'checkbox') {
                    } else {
                        
                        return val_obj.value;
                    }
                }
            }
            return value;
        });
        
        //connect the event to the infowindow buttons
        console.log("connect events to");
        console.log($('form[name="' + popup_name + '"] button.save'));
        console.log('form[name="' + popup_name + '"] button.save');
        $('form[name="' + popup_name + '"] button.save').click([feature],
                                                               save_handler);
        $('form[name="' + popup_name + '"] button.remove').click([feature],
                                                                 remove_handler);

        return true;

    } else {

        return false;

    }
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

    //get the active buttons popup name
    var name = $('button.ui-state-active').attr('name');
    var popup_name = $('button.ui-state-active').data('popup');
    var popupcontent = " default info content ";

    //get the right content for the popup
    if( popup_name !== undefined ) {
        popupcontent = $('#' + popup_name).html();
    }
    evt.popupClass = OpenLayers.Popup.FramedCloud;
    evt.data = {
        'popupSize': null,
        'popupContentHTML': popupcontent
    };
    evt.attributes.name = name;

    //the createPopup function did not seem to work so here
    evt.popup = new OpenLayers.Popup.FramedCloud(
                        evt.id,
                        evt.lonlat,
                        evt.data.popupSize,
                        evt.data.popupContentHTML,
                        null,
                        false);
    
    show_popup_for_feature(evt, popup_name);

    //deactivate the map and the drawing
    //unselect the button
    $(".drawbutton.ui-state-active")
        .drawButton( 'deactivate' );
        
    evt.layer.redraw();
}

/*
This function handles the on feature select
where it shows the popup with the correct
values from the feature attributes.
*/
function on_feature_select_handler(evt) {
    console.log("on feature select");
    console.log(evt);
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
 page specific events and other methods
*/
// increase the default animation speed to exaggerate the effect
$.fx.speeds._default = 500;

jQuery(document).ready(function() {

    $( "#more_info" ).dialog({
        autoOpen: false,
        show: "blind",
        width: 800,
        height: 600,
        modal: true
    });
    $( ".image.dialog" ).dialog({
        autoOpen: false,
        show: "blind",
        width: 800,
        maxHeight: 600,
        resizable: false,
        modal: true
    });

    $( "#more_info_link" ).click(function() {
        $( "#more_info" ).dialog( "open" );
        return false;
    });

    $( ".carousel-inner .item" ).click(function( event ) {
        $( "." + $(event.currentTarget).attr('id') ).dialog( "open" );
        return false;
    });

    /* geonition data */
    gnt.auth.create_session();

    $(".free_comment_thanks").hide();

    $("#proposal-form").submit(function(event) {
        event.preventDefault();

        var val_array = $( this ).serializeArray();
        var value = "";
        for(var i = 0; i < val_array.length; i++) {
            if(val_array[i]['name'] === 'free_comment') {
                value = val_array[i]['value'];
                break;
            }
        }
        $("#free_comment").attr("disabled", "disabled");
        $(".submit-evaluation").attr("disabled", "disabled");
        $(".free_comment_thanks").show();
        gnt.opensocial_people.update_person('@me',
                            {'free_comment': value});
    });

    /* Openlayers */

    // set language
    create_map('map', function(map) {
        OpenLayers.Lang.setCode('fi');
        /*var mapOptions = {
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

        var gf = new OpenLayers.Format.GeoJSON();
        var proposal_area_feature = gf.read(proposal_area);

       /*var proposalLayer = new OpenLayers.Layer.ArcGIS93Rest(
            "Ehdotus",
            "https://pehmogis.tkk.fi/ArcGIS/rest/services/Suunnittelu/MapServer/export",
            {layers: "show:0",
            format: "png24",
            transparent: true},
            {isBaseLayer: false,
            maxExtent: proposal_area_feature[0].geometry.getBounds(),
            buffer: 0}
        );*/

        var annotationLayer = new OpenLayers.Layer.Vector(
                    "Annotations Layer",
                    {
                        styleMap: new OpenLayers.StyleMap({
                            'default': {
                                strokeWidth: 2,
                                strokeColor: '#ee9900',
                                cursor: 'pointer'
                            }
                        })
                    }
        );

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
                        }),
                        displayInLayerSwitcher: false
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
                        }),
                        displayInLayerSwitcher: false
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
                        }),
                        displayInLayerSwitcher: false
                    });
        //add an information layer where annotations and other
        //visual information can be set on the proposal
        var projectInformationLayer = new OpenLayers.Layer.Vector(
                    "Project information",
                    {
                        styleMap: new OpenLayers.StyleMap({
                            'default': {
                                strokeWidth: 3,
                                strokeColor: $('body').css('background-color'),
                                fillOpacity: 0,
                                strokeDashstyle: 'dash'
                            }
                        }),
                        displayInLayerSwitcher: false
                    });
        /* not working properly at the moment
        projectInformationLayer.addFeatures(proposal_area_feature);
        */

        map.addLayers([areaLayer,
                       routeLayer,
                       pointLayer,
                       projectInformationLayer]);

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
        map.setCenter(proposal_area_feature[0].geometry.getBounds().getCenterLonLat(), 0);
        map.zoomToExtent(proposal_area_feature[0].geometry.getBounds(),true);
            });

        //draw buttons to activate drawing functionality
        $( ".drawbutton.point").drawButton({
            drawcontrol: "pointcontrol"
        });
        $( ".drawbutton.route").drawButton({
            drawcontrol: "routecontrol"
        });
        $( ".drawbutton.area").drawButton({
            drawcontrol: "areacontrol"
        });

        //hide all popups as default
        $('.popup').hide();

        //get the users feature if any
        gnt.geo.get_features(undefined,
                             feature_group,
                             '',
            {
               'success': function(data) {
                   if (data.features) {
                       var pl = map.getLayersByName('Point Layer')[0];
                       var rl = map.getLayersByName('Route Layer')[0];
                       var al = map.getLayersByName('Area Layer')[0];
                       var gf = new OpenLayers.Format.GeoJSON();
                       var popupcontent = " default content ";

                       for(var i = 0; i < data.features.length; i++) {
                           var feature = gf.parseFeature(data.features[i]);
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
               }
       });
});

//delete the session on unload
$(window).unload(function(event) {
    //gnt.auth.delete_session();
    });
