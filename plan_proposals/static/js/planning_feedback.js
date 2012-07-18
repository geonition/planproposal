/*
 map settings
*/

var SHOW_PLAN = false;
var INITIAL_CENTER = {
    "x": 395035.9395,
    "y": 6704086.647
};

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

    //initialize the questionnaire
    gnt.questionnaire.init('#proposal-form',
                           '',
                           undefined,
                           proposal_area,
                           data_group,
                           function() {
        
        // Create a 'otherLayer' to collect public feedback from other users and add it to the map.
        //The layer also is added to the existing select feature control 'selectcontrol'
        var otherLayer = new OpenLayers.Layer.Vector("Others Layer",
                                                    {
                                                        styleMap: new OpenLayers.StyleMap({
                                                            'default': {
                                                                strokeWidth: 3,
                                                                strokeColor: '#aaaaff',
                                                                cursor: 'pointer',
                                                                fillColor: '#aaaaff',
                                                                fillOpacity: 0.3,
                                                                pointRadius: 5
                                                            },
                                                            'highlight': {
                                                                strokeWidth: 3,
                                                                strokeColor: '#555555',
                                                                cursor: 'pointer',
                                                                fillColor: '#555555',
                                                                fillOpacity: 0.3,
                                                                pointRadius: 5
                                                            }
                                                        })
                                                    });
        otherLayer.setVisibility(false);
        map.addLayer(otherLayer); 
        
        var all_layers = [];
        all_layers = map.layers;
        var new_select_control = map.getControl('selectcontrol');
        new_select_control.setLayer((new_select_control.layers).concat(otherLayer));
        
        var others_feature_collected = false
        
        //This function will get the feedback (features and properties) of the other users when he checks 
        //the checkbox to display 'others' feedback
        $('form.feedback input:checkbox').change(function (evt) {
            var other = map.getLayersByName('Others Layer')[0];
            //other.events.register("featureadded", null, featureFilter);
            if ( $(this).attr('checked') === 'checked' ) {
                if (others_feature_collected === false) {
                    gnt.geo.get_features('@others',
                                         data_group,
                                         '',
                        {
                            'success': function(data) {
                                if (data.features) {
                                    var gf = new OpenLayers.Format.GeoJSON();
                                    var user, comment;
                                    for(var i = 0; i < data.features.length; i++) {
                                        var feature = gf.parseFeature(data.features[i]);
                                        //add values losed in parsing should be added again
                                        feature['private'] = data.features[i]['private'];
                                        feature.lonlat = gnt.questionnaire.get_popup_lonlat(feature.geometry);
                                        other.addFeatures(feature);
                                        comment = feature.attributes.form_values[0]['value'];
                                        user = feature.attributes.user;
                                        
                                        // set the right content
                                        var anonymous_regexp = new RegExp( 'T[0-9]+.[0-9]+R[0-9]+.[0-9]+' );
                                        if( !anonymous_regexp.test( user ) ) {
                                            $( '#other .username' ).text( user );
                                        }
                                        $( '#other .comment' ).text( comment );
                                        
                                        //get the content
                                        var popupcontent = $('#other').html();
                                        
                                        //var popupcontent = user + " says " + comment;
                                        feature.popupClass = OpenLayers.Popup.FramedCloud;
                                        feature.popup = new OpenLayers.Popup.FramedCloud(
                                                   feature.id,
                                                   feature.lonlat,
                                                   null,
                                                   popupcontent,
                                                   null,
                                                   false);
                                    }
                                }
                           }
                       });
                    others_feature_collected = true;
                    other.setVisibility(true);
                } else if (others_feature_collected === true) {
                    other.setVisibility(true);
                }
            } else /*if ( $(this).attr('checked') === 'unchecked' )*/ {
                other.setVisibility(false);
            }            
        })
        
        function featureFilter(event) {
            var current_extent = map.getExtent();
            var onscreen_features = [];
            
            //var vector_layers = map.getLayersByName(('Others Layer'|'Route Layers'|green));
            var layer = map.getLayersByName('Others Layer')[0];
            var layer_features = layer.features;
            getOnScreenFeatures(layer_features);
            
            layer = map.getLayersByName('Route Layer')[0];
            layer_features = layer.features;
            getOnScreenFeatures(layer_features);
            
            layer = map.getLayersByName('Area Layer')[0];
            layer_features = layer.features;
            getOnScreenFeatures(layer_features);
            
            layer = map.getLayersByName('Point Layer')[0];
            layer_features = layer.features;
            getOnScreenFeatures(layer_features);
            
            
            function getOnScreenFeatures(layer_features) {
                for(i=0;i< layer_features.length;i++) {
                    var feature = layer_features[i];
                    if (feature.getVisibility() === true && 
                        feature.onScreen() === true) {
                        onscreen_features.push(feature)
                        }
                    
                    }
                }
            }
        
        map.events.register("moveend", null, featureFilter);
        
        // set on hover hightlight on others layer
        if( !Modernizr.touch ) {
            var highlightCtrl = new OpenLayers.Control.SelectFeature(
                map.getLayersByName('Others Layer')[0], {
                hover: true,
                highlightOnly: true,
                renderIntent: 'highlight',
                multiple: true,
                eventListeners: {
                    featurehighlighted: function(e) {
                        for(i = 0; i < e.feature.attributes.form_values.length; i++) {
                            if(e.feature.attributes.form_values[i].name == 'comment') {
                                var show_list_item = $('ul.feature_comments li.' + e.feature.id);
                                if(show_list_item.length === 0) {
                                    $('ul.feature_comments').prepend('<li class="' +
                                                                     e.feature.id +
                                                                     '">' +
                                                                     e.feature.attributes.form_values[i].value +
                                                                     '<br />' +
                                                                     $.datepicker.parseDate('yy-mm-dd', e.feature.attributes.time.create_time.split('T')[0]).toDateString() +
                                                                     '</li>');
                                    show_list_item = $('ul.feature_comments li.' + e.feature.id);
                                }
                                show_list_item.fadeIn(750);
                            }
                        }
                    },
                    featureunhighlighted: function(e) {
                                var hide_list_item = $('ul.feature_comments li.' + e.feature.id);
                                hide_list_item.fadeOut(750);
                            }
                }
            });
            map.addControl(highlightCtrl);
            highlightCtrl.activate();
        }
    
    });
    
    $(".free_comment_thanks").hide();
    $(".submit-evaluation").click(function(evt) {
        $(".free_comment_thanks").show();
        });
    
});

