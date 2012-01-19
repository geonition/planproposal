/*{% load i18n %}*/
/*global dojo, dijit, djConfig, questionnaire, startAsTestUser, logout, createsubwindow,
  closesubwindow, submitsubwindow, create_session, create_session_callback, map, window
*/
/* init questionnaire object */

/*All the functions controlling the flow of the questionnaire*/
var applicationName = "pehmogis_test";

questionnaire.initial_extent = {
        "xmax": 384815.7703412073,
        "xmin": 375561.68516637024,
        "ymax": 6683016.504148674,
        "ymin": 6678690.028829058,
        "spatialReference": {
            "wkid": 3067
        }
};
questionnaire.residencePlaces = [];

questionnaire.sections = [];

questionnaire.infoTemplates = {
"default": {
    "confirm": "<p>${question}</p>" +
                "<div class='button saveLong' onclick='confirm(\"${id}\",true);map.infoWindow.hide()'>" +
                "<span class='saveText'>${positive}</span>" +
                "</div>" +
                "<p style='margin:0'>" +
                "<span style='color:#36A8D5;text-decoration:underline;' onclick='confirm(\"${id}\", false);map.infoWindow.hide()'>${negative}</span>" +
                "</p>",
    "confirmHeight": 150,
    "confirmWidth": 250,
    "info": "<div class='button saveShort' onclick='map.infoWindow.hide()'>" +
            "<span class='saveText'>${close}</span>" +
            "</div>" +
            "<p style='margin:0'>" +
            "<span style='color:#36A8D5;text-decoration:underline;' onclick='removeGraph(\"${id}\");map.infoWindow.hide()'>" +
            "${remove}</span></p>",
    "infoWidth": 250,
    "infoHeight": 150
},
"point": {
    "confirm": "<p>${question}</p>" +
                "<div class='button saveLong' onclick='confirm(\"${id}\",true);map.infoWindow.hide()'>" +
                "<span class='saveText'>${positive}</span>" +
                "</div>" +
                "<p style='margin:0'>" +
                "<span style='color:#36A8D5;text-decoration:underline;' onclick='confirm(\"${id}\", false);map.infoWindow.hide()'>${negative}</span>" +
                "</p>",
    "confirmHeight": 150,
    "confirmWidth": 250,
    "info": "<div class='button saveShort' onclick='map.infoWindow.hide()'>" +
            "<span class='saveText'>${close}</span>" +
            "</div>" +
            "<p style='margin:0'>" +
            "<span style='color:#36A8D5;text-decoration:underline;' onclick='removeGraph(\"${id}\");map.infoWindow.hide()'>" +
            "${remove}</span></p>",
    "infoWidth": 250,
    "infoHeight": 150
    },
"other": {
    "confirm":  "<form id='info'>" +
                "<p>${tellmore}</p>" +
                "<textarea id='itext' name='tellmore' cols='25' rows='4'></textarea>" +
                "<div class='button saveLong' onclick='confirm(\"${id}\",true);submitInfoForm(\"info\",\"${valuename}\");map.infoWindow.hide()'>"+
                "<span class='saveText'>${positive}</span>" +
                "</div>" +
                "</form>",
    "confirmHeight": 270,
    "confirmWidth": 250,
    "info":     "<form id='info'>" +
                "<p>${tellmore}</p>" +
                "<textarea id='itext' name='tellmore' cols='25' rows='4'></textarea>" +
                "<div class='button saveLong' onclick='confirm(\"${id}\",true);submitInfoForm(\"info\",\"${valuename}\");map.infoWindow.hide()'>"+
                "<span class='saveText'>${positive}</span>" +
                "</div>" +
                "</form>" +
                "<p style='margin:0'>" +
                "<span style='color:#36A8D5;text-decoration:underline;' onclick='removeGraph(\"${id}\");map.infoWindow.hide()'>" +
                "${remove}</span></p>",
    "infoWidth": 270,
    "infoHeight": 250,
    "formObjects": [
        {
        "type": "Form",
        "json": {},
        "node": "info"
        },
        {
        "type": "Textarea",
        "json": {
            "rows": "4",
            "cols": "25",
            "style": "width:auto;",
            "name": "tellmore"},
        "node": "itext"
        }
        ]
}
};

questionnaire.imageButton = {
"defaultbutton": { //sets all the default values here,
    "draw": "POINT",
    "buttontext": {
        "en":"",
        "fi":"",
        "sv":""
        },
    "xoffset": 0, //according to the placemarker
    "yoffset": 15, //according to the placemarker
    "xsize": 23, //according to image size for placemarker
    "ysize": 36,
    "classtype": "point", //added as a class, good for css rules and outlook
    "placeMark": "{{ MEDIA_URL }}img/placemarks/pointorange.png",
    "cursorImg":"{{ MEDIA_URL }}img/cursors/point.cur",
    "graphicAttr": {
        "id": "default",
        "infotype": "default",
        "valuename": "default",
        "max": 3,
        "rgb": [200,92,92]
        },
    "graphicStrings": {
        "fi": {
            "header": "<h2>Paikka</h2>",
            "question": "Menikö piste oikeaan kohtaan?",
            "polylinequestion": "Menikö reitti oikeaan kohtaan?",
            "positive": "Kyllä, tallenna kohde",
            "polylinepositive": "Tallenna reitti",
            "negative": "Ei, poista kohde",
            "polylinenegative": "Poista reitti",
            "remove": "Poista kohde",
            "polylineremove": "Poista reitti",
            "change": "Muuta kohteen paikkaa",
            "close": "Sulje ikkuna",
            "save": "Tallenna kohde",
            "many": "Useammalla välineellä",
            "tellmore": "Kerro lisää paikasta:",
            "walk": "jalkaisin",
            "bike": "pyöräillen",
            "public": "Julkisilla",
            "car": "Autolla",
            "runorjog": "juosten tai hölkäten",
            "skate": "rullaluistimilla",
            "other": "muuten",
            "comments": "Muuta kerrottavaa tästä reitistä?"
            },
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
        }
},
"point_feedback": {
        "buttontext": "",
        "classtype": "point",
        "placeMark": "{{ STATIC_URL }}images/placemarks/point_positive.png",
        "cursorImg":"{{ STATIC_URL }}images/cursors/point.cur",
        "graphicAttr": {
                    "id": "point_feedback",
                    "valuename": "point_feedback",
                    "infotype": "other",
                    "max": 1000
        },
        "graphicStrings": {
                    "header": "<h2>{% trans 'Comment on place' %}</h2>"
        }
},
"route_feedback": {
        "buttontext": "",
        "classtype": "route",
        "cursorImg":"{{ STATIC_URL }}images/cursors/route.cur",
        "graphicAttr": {
                    "id": "route_feedback",
                    "valuename": "route_feedback",
                    "infotype": "other",
                    "max": 1000
        },
        "graphicStrings": {
                    "header": "<h2>{% trans 'Comment on route' %}</h2>"
        }}};

//pages order saved in questionnaire object, Array in the order which the pages are shown.
questionnaire.pages =[];

//subwindows is not in any particular order and can be search by name
questionnaire.subwindows = {};

var tooltiphelp = {
    "fi": {
        "firstedge":"Aloita piirtäminen napsauttamalla karttaa.",
        "nextedge":"Napsauta karttaa jatkaaksesi reitin piirtoa<br />tai<br />lopeta reitin piirto kaksoisklikkauksella."
        },
    "en": {
        "firstedge":"Click on the map to draw the route.",
        "nextedge":"Click on the map to continue the route<br />or<br />end the route with a doubleclick."
        },
    "sv": {
        "firstedge":"Klicka på kartan för att rita rutten.",
        "nextedge":"Klicka på kartan för att fortsätta rutten<br /> eller<br />sluta rita rutten med en dubbelklick."
        }
};

questionnaire.special_widgets = {};
