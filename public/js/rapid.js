"use strict";

var obj = null;
var latitude = null;
var longitude = null;

function loadDoc() {
    const data = null;

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {

            const obj = JSON.parse(xhr.responseText);

            if(!Array.isArray(obj) || obj.length === 0){
                document.getElementById("add_out").innerHTML = "No such location.";
                document.getElementById("add_out").style.color = "red";
            }
            else if(country != "Greece"){
                document.getElementById("add_out").innerHTML = "Service temporally not available outside of Greece";
                document.getElementById("add_out").style.color = "orange";
            }
            else {
                document.getElementById("add_out").innerHTML = "Location exists.";
                document.getElementById("add_out").style.color = "blue";
                latitude = obj[0].lat;
                longitude = obj[0].lon;
                console.log("lattitude is " + latitude + "\nlongitute is " + longitude);
                console.log(obj);
            }
        }
    });


    var address = document.getElementById("address").value;
    var city = document.getElementById("city").value;
    var countryOBJ = document.getElementById("country");
    var country = countryOBJ.options[countryOBJ.selectedIndex].text;
    address = address + " " + city + " " + country;

    xhr.open("GET", "https://forward-reversegeocoding.p.rapidapi.com/v1/search?q="+address+"&accept-language=en&polygon_threshold=0.0");
    xhr.setRequestHeader('x-rapidapi-key', 'fb86681039msh890928b37afa66ap1925f4jsn45bf3c417299');
    xhr.setRequestHeader('x-rapidapi-host', 'forward-reverse-geocoding.p.rapidapi.com');

    xhr.send(data);
}

var button = document.getElementById("run_rapid");

button.addEventListener("click", () =>{
    loadDoc();
});