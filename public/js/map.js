"use strict";
var map = new OpenLayers.Map("Map");
var mapnik = new OpenLayers.Layer.OSM();
map.addLayer(mapnik);

function setPosition(lat, lon) {

    var fromProjection = new OpenLayers.Projection("EPSG:4326"); // Transform from WGS 1984
    var toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
    var position = new OpenLayers.LonLat(lat, lon).transform(fromProjection, toProjection);

    return position;
}

function handler(position, message) {
    var popup = new OpenLayers.Popup.FramedCloud("Popup",
        position, null,
        message, null,
        true // <-- true if we want a close (X) button, false otherwise
    );
    map.addPopup(popup);
}

//Markers
var markers = new OpenLayers.Layer.Markers( "Markers" );
map.addLayer(markers);
var loc_button = document.getElementById("osm_map");
var position1 = setPosition(38.9953683,21.9877132);

loc_button.addEventListener("click", function(){

    if(longitude == null || latitude == null){
        document.getElementById("add_out").innerHTML = "Validate location first!";
        document.getElementById("add_out").style.color = "red";
        console.log("clicked show location with no lon/lat");
        return;
    }
    var position1=setPosition(longitude, latitude);
    var mar1=new OpenLayers.Marker(position1);
    markers.addMarker(mar1);
    mar1.events.register('mousedown', mar1, function(evt1) {
    handler(position1, "lon: "+longitude+" and lat: "+latitude)});
    var zoom = 8;
    map.setCenter(position1, zoom);
    console.log("clicked show location w/ lon:"+longitude+" and lat:"+latitude);
});