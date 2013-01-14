/*global  JQuery*/
/*
 map settings
*/

var SHOW_PLAN = false;
var INITIAL_CENTER = {
    "x": 395035.9395,
    "y": 6704086.647
};

jQuery(document).ready(function () {
    $("#more_info").dialog({
        autoOpen: false,
        show: "blind",
        width: 800,
        height: 600,
        modal: true
    });
    $(".image.dialog").dialog({
        autoOpen: false,
        show: "blind",
        width: 800,
        maxHeight: 600,
        resizable: false,
        modal: true
    });

    $("#more_info_link").click(function () {
        $("#more_info").dialog("open");
        return false;
    });

    $(".carousel-inner .item").click(function (event) {
        $("." + $(event.currentTarget).attr('id')).dialog("open");
        return false;
    });

    //initialize the questionnaire
    gnt.questionnaire.init('#proposal-form',
                           '',
                           undefined,
                           proposal_area,
                           data_group,
                           function () {
            // Create a 'otherLayer' to collect public feedback from other users and add it to the map.
            //The layer also is added to the existing select feature control 'selectcontrol'
            var i,
                highlightCtrl,
                select_control,
                others_feature_collected = false,
                otherLayer = new OpenLayers.Layer.Vector("Others Layer", {
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
            //map.events.register("moveend", null, featureFilter);

            /*
            //This function collects all the onscreen features currently visible
            function featureFilter(event) {
                var onscreen_features = [];
                function getOnScreenFeatures(layer_features) {
                    for (var i = 0; i < layer_features.length; i++) {
                        var feature = layer_features[i];
                        if (feature.getVisibility() === true && feature.onScreen() === true) {
                            onscreen_features.push(feature);
                        }
                    }
                }
                //var vector_layers = map.getLayersByName(('Others Layer'|'Route Layers'|green));
                var layer = map.getLayersByName('Route Layer')[0],
                    layer_features = layer.features;
                getOnScreenFeatures(layer_features);
                layer = map.getLayersByName('Area Layer')[0];
                layer_features = layer.features;
                getOnScreenFeatures(layer_features);
                layer = map.getLayersByName('Point Layer')[0];
                layer_features = layer.features;
                getOnScreenFeatures(layer_features);
                layer = map.getLayersByName('Others Layer')[0];
                layer_features = layer.features;
                getOnScreenFeatures(layer_features);
            }
            */
            //This function will get the feedback (features and properties) of the other users when he checks 
            //the checkbox to display 'others' feedback
            $('form.feedback input:checkbox').change(function () {
                var other = map.getLayersByName('Others Layer')[0];
                //add the other layer to
                if ($(this).attr('checked') === 'checked') {
                    if (others_feature_collected === false) {
                        gnt.geo.get_features('@others',
                                             data_group,
                                             '',
                            {
                                'success': function (data) {
                                    if (data.features) {
                                        var gf = new OpenLayers.Format.GeoJSON(),
                                            user,
                                            comment,
                                            i,
                                            feature,
                                            anonymous_regexp,
                                            popupcontent;
                                        for (i = 0; i < data.features.length; i += 1) {
                                            feature = gf.parseFeature(data.features[i]);
                                            //add values losed in parsing should be added again
                                            feature['private'] = data.features[i]['private'];
                                            feature.lonlat = gnt.questionnaire.get_popup_lonlat(feature.geometry);
                                            other.addFeatures(feature);
                                            comment = feature.attributes.form_values[0].value;
                                            user = feature.attributes.user;
                                            // set the right content
                                            anonymous_regexp = new RegExp('T[0-9]+.[0-9]+R[0-9]+.[0-9]+');
                                            if (!anonymous_regexp.test(user)) {
                                                $('#other .username').text(user);
                                            }
                                            $('#other .comment').text(comment);
                                            //get the content
                                            popupcontent = $('#other').html();
                                            feature.popupClass = OpenLayers.Popup.FramedCloud;
                                            feature.popup = new OpenLayers.Popup.FramedCloud(
                                                feature.id,
                                                feature.lonlat,
                                                null,
                                                popupcontent,
                                                null,
                                                false
                                            );
                                        }
                                    }
                                }
                            });
                        others_feature_collected = true;
                        other.setVisibility(true);
                        //featureFilter();
                    } else if (others_feature_collected === true) {
                        other.setVisibility(true);
                        //featureFilter();
                    }
                } else {
                    other.setVisibility(false);
                    //featureFilter();
                }
            });
            // set on hover hightlight on others layer
            if ($('html').hasClass('no-touch')) {
                highlightCtrl = new OpenLayers.Control.SelectFeature(
                    map.getControl('selectcontrol').layers.concat(map.getLayersByName('Others Layer')[0]),
                    {
                        hover: true,
                        highlightOnly: true,
                        multiple: true,
                        renderIntent: 'highlight',
                        eventListeners: {
                            featurehighlighted: function (e) {
                                //fix for unhighlight in OpenLayers not always triggering
                                $('ul.feature_comments li:visible').fadeOut(500);
                                for (i = 0; i < e.feature.attributes.form_values.length; i += 1) {
                                    if (e.feature.attributes.form_values[i].name === 'comment') {
                                        var create_time_string,
                                            username,
                                            anonymous_regexp,
                                            show_list_item = $('ul.feature_comments li.' + e.feature.id);
                                        if (show_list_item.length === 0) {
                                            username = e.feature.attributes.user;
                                            anonymous_regexp = new RegExp('T[0-9]+.[0-9]+R[0-9]+.[0-9]+');
                                            if (anonymous_regexp.test(username) || username === undefined) {
                                                username = '';
                                            }
                                            create_time_string = '';
                                            if (e.feature.attributes.time !== undefined) {
                                                create_time_string = $.datepicker.formatDate('D, d M yy',
                                                                                         $.datepicker.parseDate('yy-mm-dd', e.feature.attributes.time.create_time.split('T')[0]));
                                            }
                                            $('ul.feature_comments').prepend('<li class="' +
                                                                         e.feature.id +
                                                                         '"><span class="comment">' +
                                                                         e.feature.attributes.form_values[i].value +
                                                                         '</span><br />' +
                                                                         username +
                                                                         ' ' +
                                                                         create_time_string +
                                                                         '</li>');
                                            show_list_item = $('ul.feature_comments li.' + e.feature.id);
                                        } else if ($('ul.feature_comments li.' + e.feature.id + ' span.comment').text() !== e.feature.attributes.form_values[i].value) {
                                            $('ul.feature_comments li.' + e.feature.id + ' span.comment').text(e.feature.attributes.form_values[i].value);
                                        }
                                        show_list_item.stop(true, true);
                                        show_list_item.fadeIn(500);
                                    }
                                }
                            },
                            featureunhighlighted: function (e) {
                                var hide_list_item = $('ul.feature_comments li.' + e.feature.id);
                                hide_list_item.stop(true, true);
                                hide_list_item.fadeOut(500);
                            }
                        }
                    }
                );
                map.addControl(highlightCtrl);
                highlightCtrl.activate();
                // The select_control needs to be deactivated and activated to make
                // hover and select on different layers to work together (done by setLayer)
                select_control = map.getControl('selectcontrol');
                select_control.setLayer((select_control.layers).concat(otherLayer));
            }
        });
    $(".free_comment_thanks").hide();
    $(".submit-evaluation").click(function () {
        $(".free_comment_thanks").show();
    });
});

