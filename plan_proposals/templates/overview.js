dojo.require("esri.map");
dojo.require("esri.geometry");
dojo.require("dojo.dnd.Moveable");

var ovmap;
//var map;
var psize = 200;
var ovlayer;
var zoomevnt;
var mousevntdown;
var mousevntup;
var mousevntout;
var mousevntmove;
var panevent;
var nl;
var focus;
var gtop;
var gbottom;
var gleft;
var gright;

function pos(top, right, bottom, left) {
            //alert(top + " " + right + " " + bottom + " " + left);
            var width = psize - left - right;
            var height = psize - bottom - top;
            var node = dojo.byId("ovfocus");
            var temp;

            if (top > 0 && top < psize - height) {
                node.style.top = top + "px";
                gtop = top;
            } else if (top <= 0) {
                node.style.top = "0px";
                gtop = 0;
            } else {
                temp = psize - height;
                node.style.top =  temp + "px";
                gtop = temp;
            }
            
            if (left > 0 && left < psize - width) {
                node.style.left = left + "px";
                gleft = left;
            } else if (left <= 0) {
                node.style.left = "0px";
                gleft = 0;
            } else {
                temp = psize - width;
                node.style.left =  temp + "px";
                gleft = temp;
            }

            if(right > 0 && right < psize - width) {
                node.style.width = width + "px";
                gright = right;
            } else if (right <= 0) {
                node.style.width = psize - left + "px";
                gright = 0;
            } else {
                temp = psize - width;
                node.style.right =  temp + "px";
                gright = temp;
            }
            if (bottom > 0 && bottom < psize - height) {
                node.style.height = height + "px";
                gbottom = bottom;
            }
            else 
                if (bottom <= 0) {
                    node.style.bottom = psize - top + "px";
                    gbottom = 0;
                }
                else {
                    temp = psize - height;
                    node.style.bottom = temp + "px";
                    gbottom = temp;
                }
            /*
            if(right > 0 && right < psize - width) {
                node.style.right = right + "px";
                gright = right;
            } else if (right <= 0) {
                node.style.right = "0px";
                gright = 0;
            } else {
                temp = psize - width;
                node.style.right =  temp + "px";
                gright = temp;
            }
            
            if(bottom > 0 && bottom < psize - height) {
                node.style.bottom = bottom + "px";
                gbottom = bottom;
            } else if (bottom <= 0) {
                node.style.bottom = "0px";
                gbottom = 0;
            } else {
                temp = psize - height;
                node.style.bottom =  temp + "px";
                gbottom = temp;
            }*/
}

function updatepos() {
        var awidth = screen.availWidth;
        var aheight = screen.availHeight;
        var relw = aheight/awidth;
        var height = 60;
        
        gtop = Math.round(height);
        gbottom = Math.round(height);
        gleft = Math.round(relw*height);
        gright = Math.round(relw*height);
        
        pos(gtop, gright, gbottom, gleft);
}

/*
corrects the overviewpmap extent if the pmap extent is changed
*/
function ovzoom(extent, zoomFactor, anchor, level) {
    nl = level - 3;
    if (nl < 0) {
        nl = 0;
    } else if (nl > 8) {
        nl = 8;
    }
    ovmap.centerAndZoom(map.extent.getCenter(),nl);
}

function ovpan(extent, delta) {
    var center = extent.getCenter();
    ovmap.centerAt(center);
}

function toggleovwin() {
    var anim = dojox.fx.toggleClass("ov", "open" );
    dojo.connect(anim, "onEnd", function() {
                    dojo.toggleClass(dojo.byId("hidetext"), "tyhja");
                    dojo.toggleClass(dojo.byId("showtext"), "tyhja");
                    });
    anim.play();
}

function centerMap(event) {
    var clientPoint = new esri.geometry.Point(event.clientX,event.clientY);
    clientPoint = ovmap.toMap(clientPoint);
    map.centerAt(clientPoint);
}

var startx;
var starty;
var moving = false;
var firstMove = true;

function startMove(event) {
    startx = event.screenX;
    starty = event.screenY;
    moving = true;
    //TESTING
    dojo.byId("ovfocus").style.cursor = "url({{ STATIC_URL }}img/cursors/closedhand.cur), auto";
}


function endMove(event) {
    if(moving) {
        var tpointe = new esri.geometry.Point(event.screenX,event.screenY);
        var tpoints = new esri.geometry.Point(startx,starty);
        tpointe = ovmap.toMap(tpointe);
        tpoints = ovmap.toMap(tpoints);
        
        var center = map.extent.getCenter();
        center = center.offset(tpointe.x - tpoints.x, tpointe.y - tpoints.y);
        map.centerAt(center);
    }
    moving = false;
    firstMove = true;
    updatepos();
    //TESTING
    dojo.byId("ovfocus").style.cursor = "url({{ STATIC_URL }}img/cursors/openhand.cur), auto";

}

var ox;
var oy;

function moveDiv(event) {
    if (moving && firstMove) {
        ox = event.screenX;
        oy = event.screenY;
        firstMove = false;
    }
    else if (moving) {
        var node = dojo.byId("ovfocus");
        gtop = gtop + (event.screenY - oy);
        gbottom = gbottom - (event.screenY - oy);
        gleft = gleft + (event.screenX - ox);
        gright = gright - (event.screenX - ox);
        pos(gtop,gright,gbottom,gleft);
        oy = event.screenY;
        ox = event.screenX;
    }
}

//overview pmap with 1 zoom level and a suitable LOD
function createOverview(m, ovlayer) {
        ovmap = new esri.Map("ovmap", {"slider": false, "nav": false, "logo": false});
        
        ovmap.addLayer(ovlayer);
        ovmap.disableMapNavigation();
        ovmap.disableScrollWheelZoom();
        //change the extent for ovmap
        ovpan(map.extent);
        
        zoomevnt = dojo.connect(map, "onZoomEnd", ovzoom);
        panevent = dojo.connect(map, "onPanEnd", ovpan);
        updatepos();
        //moving of the focus area
        mousevntdown = dojo.connect(dojo.byId("ovfocus"), "onmousedown", startMove);
        mousevntup = dojo.connect(dojo.byId("ovfocus"), "onmouseup", endMove);
        mousevntout = dojo.connect(dojo.byId("ovfocus"), "onmouseout", endMove);
        mousevntmove = dojo.connect(dojo.byId("ovfocus"),"onmousemove",moveDiv);
        //should be put to variables -->
        dojo.connect(dojo.byId("ovtransparent"), "onmousedown", startMove);
        dojo.connect(dojo.byId("ovtransparent"), "onmouseup", endMove);
        dojo.connect(dojo.byId("ovtransparent"), "onmouseout", endMove);
        dojo.connect(dojo.byId("ovtransparent"),"onmousemove",moveDiv);
        dojo.byId("ovfocus").style.cursor = "url({{ STATIC_URL }}img/cursors/openhand.cur), auto";
        
        // TAMMISALO SPECIAL
        toggleovwin();
        //TAMMISALO SPECIAL END

}

function overviewMapShow(){
    // If user returns to page where ovmap is visible, have to check that ovmap is loaded before it can be panned
    /*if(ovmap !== undefined && ovmap.loaded) {
        ovpan(map.extent);
    }*/
    var divi = dojo.byId("ovcont");
    if(ovlayer !== undefined) {
        ovlayer.show();
    }
    divi.style.visibility = "visible";
}

function overviewMapHide(){

    var divi = dojo.byId("ovcont");
    if(ovlayer !== undefined) {
        ovlayer.hide();
    }
    divi.style.visibility = "hidden";
}