/*global esri, dojo, dijit, dojox, djConfig, console */
dojo.require("esri.map");

/*Mapservice used */
var MAPSERVICE_URL = "http://pehmogis.tkk.fi/ArcGIS/rest/services/suomi/MapServer";

var PLANNING_URL = "http://pehmogis.tkk.fi/ArcGIS/rest/services/Suunnittelu/MapServer";

/* Mapservice for satellite map */
var SATELLITE_MAPSERVICE_URL = "http://pehmogis.tkk.fi/ArcGIS/rest/services/suomi-ilma/MapServer";


var map; // the map variable has to be global


var resize_timer;
var reposition_timer;
var tiledMapServiceLayer;
var imageServiceLayer;
var pool;
var tb;
var ihd;



/*
post map create
*/
function postmapcreate() {
   tb = new esri.toolbars.Draw(map);
   ihd = dojo.connect(map.infoWindow, "onShow", function (evt) {setTimeout(function (evt) { createInfo(evt);}, 0); });
}

/*
init is called when the user enters the site
*/
function init() {
    //load the map
    map = new esri.Map("map", {
        extent: new esri.geometry.Extent(INITIAL_EXTENT)
        });

    
    try {
        tiledMapServiceLayer = new esri.layers.ArcGISTiledMapServiceLayer(MAPSERVICE_URL);
    }
    catch(err){
        console.log(dojo.toJson(err));
    }
    //image service layer for the sattelite view
    try {
        planServiceLayer = new esri.layers.ArcGISTiledMapServiceLayer(PLANNING_URL);
    }
    catch(error){
        console.log(dojo.toJson(error));
    }

    map.addLayer(tiledMapServiceLayer);
    if(SHOW_PLAN) {
        map.addLayer(planServiceLayer);
    }
    

    //connect to window's resize event
    dojo.connect(window, "onresize", function() {
        //clear any existing resize timer
        clearTimeout(resize_timer);
        //create new resize timer with delay of 500 milliseconds
        resize_timer = setTimeout(function() {map.resize();}, 500);
        });
		
    //connect to window's onscroll event(there might not be such event in all browsers check this)
    dojo.connect(window, "onscroll", function() {
        //clear any existing resize timer
        clearTimeout(reposition_timer);
        //create new resize timer with delay of 500 milliseconds
        reposition_timer = setTimeout(function() {map.reposition();}, 500);
        });
   
   //pool for imagebuttons
   pool = new ButtonPool();
   
    if(map.loaded) {
        postmapcreate();
    }
    else {
        dojo.connect(map, "onLoad", postmapcreate);
    }
    
    if(widgets_initialization !== undefined) {
    
       widgets_initialization();
   }
}

$(document).ready(function(){
        //dialog window created for feedback 
        $( "#feedback_window" ).dialog({
            autoOpen: false,
            show: "blind",
            width: 600
        }); 
         
        //open feedback form as info window
        $( "#feedback_link" ).click(function() {
            $( "#feedback_window" ).dialog( "open" );
            return false;
        });
        
        //help window
        $( "#help_window" ).dialog({
            autoOpen: false,
            show: "blind",
            width: 600
        }); 
        
        //open help window
        $( "#help_link" ).click(function() {
            $( "#help_window" ).dialog( "open" );
            return false;
        });
        
    
});        
