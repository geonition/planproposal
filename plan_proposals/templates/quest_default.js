/*{% load i18n %}*/
/*global dojo, djConfig
 */
//dojo.require("dojox.validate.regexp");
dojo.require("dojox.validate");


//define all the part names here
var questionnaire = {
"visited": [], //lists all the visited pages during one session
"graphics": {}, //list all the graphics that the user has added
"residencePlaces": [], // lists all places needed to be remembered in the questionnaire flow
"values": {}, //list all the values collected from the user in the questionnaire
"sections": [], //lists all the sections in the questionnaire
"pages": [], //lists all the pages in the questionnaire
"imageButton": {}, //contains all the imagebutton definition in the questionnaire
"subwindows": {}, //contains all the subwindow definitions in the questionnaire
"infoTemplates": {}, //contains all the infowindow templates made for this questionnaire.
"features": {}, // contains all the features of the questionnaire
"profileValues": {}, // contains all the profile values of the questionnaire
"debug": djConfig.isDebug,
"default_widgets": {}, // contains all the default widget definitions to be used
"special_widgets": {}, // contains definitions for widgets with specialities
"messages": {}, // All alert messages and other informative messages
"infotemplates_url": "", // URL to the additional infotemplates. These are loaded after the session is created
"closedhand_cursor_url": "{{ STATIC_URL }}cursors/closedhand.cur",
"openhand_cursor_url": "{{ STATIC_URL }}cursors/openhand.cur",
"initial_extent": {}, // Initial extent of the questionnaire, defined in quest_spec.js
"displayGraphicsOnPan": true,  // Map option to display graphics during pan
"contactForm_url": "" // Url to submit the contact form
};

/*Mapservice used */
var MAPSERVICE_URL = "https://pehmogis.tkk.fi/ArcGIS/rest/services/suomi/MapServer";

/* Mapservice for satellite map */
var SATELLITE_MAPSERVICE_URL = "https://pehmogis.tkk.fi/ArcGIS/rest/services/suomi-ilma/MapServer";

/*Mapservice for the overview map*/
var OVERVIEWMAP_URL = "https://pehmogis.tkk.fi/ArcGIS/rest/services/suomi/MapServer";

var softgis = {}; // Object to hold questionnaire name as an object e.g. softgis.children = {}

questionnaire.default_widgets = {
    "number": { //html 5 number input
        "constraints": {
            "min": 0,
            "max": 110
        }
    },
    "email": { //html5 email input
        "trim":true
    },
    "textarea": {
        "rows": 7,
        "cols": 60,
        "style": "width: auto;"
    },
    "filteringSelect": {
        "required": false
    },
    "range": {
        "minimum": 0,
        "maximum": 100,
        "discreteValues": 101,
        "intermediateChanges": true,
        "style": "width: 100%;",
        "value": 50.123
    },
    "select": {},
    
    "imagebutton": {
        "draw": "POINT",
        "buttontext": "",
        "xoffset": 0, //according to the placemarker
        "yoffset": 15, //according to the placemarker
        "xsize": 23, //according to image size for placemarker
        "ysize": 36,
        "classtype": "point", //added as a class, good for css rules
        "placeMark": "{{ STATIC_URL }}img/placemarks/pointorange.png",
        "cursorImg": "{{ STATIC_URL }}img/cursors/point.cur",
        "graphicAttr": {
            "id": "default",
            "infotype": "default",
            "valuename": "default",
            "max": 100,
            "rgb": [200,92,92]
            },
        "graphicStrings": {
            "header": "<h2>{% trans 'Paikka' %}</h2>",
            "question": "{% trans 'Menikö piste oikeaan kohtaan?' %}",
            "polylinequestion": "{% trans 'Menikö reitti oikeaan kohtaan?' %}",
            "positive": "{% trans 'Kyllä, tallenna kohde' %}",
            "polylinepositive": "{% trans 'Tallenna reitti' %}",
            "negative": "{% trans 'Ei, poista kohde' %}",
            "polylinenegative": "{% trans 'Poista reitti' %}",
            "remove": "{% trans 'Poista kohde' %}",
            "polylineremove": "{% trans 'Poista reitti' %}",
            "change": "{% trans 'Muuta kohteen paikkaa' %}",
            "close": "{% trans 'Sulje ikkuna' %}",
            "save": "{% trans 'Tallenna kohde' %}",
            "many": "{% trans 'Useammalla välineellä' %}",
            "tellmore": "{% trans 'Kerro lisää paikasta' %}:",
            "walk": "{% trans 'jalkaisin' %}",
            "bike": "{% trans 'pyöräillen' %}",
            "public": "{% trans 'Julkisilla' %}",
            "car": "{% trans 'Autolla' %}",
            "runorjog": "{% trans 'juosten tai hölkäten' %}",
            "skate": "{% trans 'rullaluistimilla' %}",
            "other": "{% trans 'muuten' %}",
            "comments": "{% trans 'Muuta kerrottavaa tästä reitistä?' %}"
        }
    }/* save this until the translations is done
"en": {
"header": "<h2>Place</h2>",
"question": "is the mark in the right place",
"positive": "Yes, save place",
"negative": "No, remove place",
"change": "Change place",
"close": "Close window"
},
"sv": {
"header": "<h2>Ställe</h2>",
"question": "Kom punkten på rätt ställe?",
"polylinequestion": "Kom rutten på rätt ställe?",
"positive": "Ja, spara objektet",
"polylinepositive": "Spara rutten",
"negative": "Nej, ta bort stället",
"polylinenegative": "Ta bort stället",
"remove": "Ta bort objektet",
"polylineremove": "Ta bort rutten",
"change": "Flytta på objektet",
"close": "Stäng fönstret",
"save": "Spara objektet",
"many": "Med flera medel",
"tellmore": "Berätta mer om stället:",
"walk": "Till fots",
"bike": "Med cykel",
"public": "Med kollektivtrafiken",
"car": "Med bil",
"comments": "Annat som du vill berätta om den här rutten?"
}
}*/
};

questionnaire.messages = {
    "not_located_home": "{% trans 'You have not marked your home yet' %}",
    "not_located_work": "{% trans 'You have not marked your workplace yet' %}",
    "not_located_school": "{% trans 'You have not marked your school yet' %}",
    "not_valid_password": "{% trans 'Wrong password' %}"
};

// Defaul extent, if not defined in quest_spec.js
questionnaire.initial_extent = {
    "xmin":369395,
    "ymin":6676188,
    "xmax":371562,
    "ymax":6677363,
    "spatialReference": {
        "wkid":3067
    }
};
