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
        
        //This function will get the feedback (features and properties) of the current user when he checks 
        //the checkbox to display his 'own' feedback
        var otherLayer = new OpenLayers.Layer.Vector("Others Layer");
        otherLayer.setVisibility(false);
        map.addLayer(otherLayer);
        var all_layers = [];
        all_layers = map.layers;
        console.log(all_layers);
        var new_select_control = map.getControl('selectcontrol');
        new_select_control.setLayer((new_select_control.layers).concat(otherLayer));
        
        var others_feature_collected = false
        
        $('form.feedback input:checkbox').change(function (evt) {
            console.log('planproposals')
            console.log(evt);
            console.log($(this).attr('checked'));
            var other = map.getLayersByName('Others Layer')[0];
            if ( $(this).attr('checked') === 'checked' ) {
                console.log("checked");
                if (others_feature_collected === false) {
                    console.log('checkbox is now false.features will be added now to other layer');
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
                                        console.log(user +' '+ comment);
                                        var popupcontent = user + " says " + comment;
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
                    console.log('feature collected and added to other layer');
                    other.setVisibility(true);
                } else if (others_feature_collected === true) {
                    console.log('Features allready added.just displaying layer')
                    other.setVisibility(true);
                }
            } else /*if ( $(this).attr('checked') === 'unchecked' )*/ {
                console.log("unchecked");
                other.setVisibility(false);
            }            
        })
    });
                           
                           
                           
                           
    
    $(".free_comment_thanks").hide();
    $(".submit-evaluation").click(function(evt) {
        $(".free_comment_thanks").show();
    });
    
    

});

