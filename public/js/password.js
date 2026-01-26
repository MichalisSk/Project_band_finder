"use strict";

var pass = document.getElementById("password");
var SH_button = document.getElementById("show-pass");
var con_pass = document.getElementById("con_password");
var con_SH_button = document.getElementById("show-con-pass");
var subscribe_btn_user = document.getElementById("subscribe_user");
var subscribe_btn_band = document.getElementById("subscribe_band");

const dataObject1 = {};
const dataObject2 = {};

pass.addEventListener("keyup", () =>{
    verify();
});

pass.addEventListener("change", () =>{
    str_check();
});

con_pass.addEventListener("keyup", () =>{
    verify();
});

SH_button.addEventListener("click", function(){

    if(pass.type === "password"){
        pass.type = "text";
        SH_button.textContent = "Hide";
    }
    else{
        pass.type = "password";
        SH_button.textContent = "Show";
    }
});

con_SH_button.addEventListener("click", function(){

    if(con_pass.type === "password"){
        con_pass.type = "text";
        con_SH_button.textContent = "Hide";
    }
    else{
        con_pass.type = "password";
        con_SH_button.textContent = "Show";
    }
});

function verify(){

    var password1 = document.getElementById('password').value;
    var password2 = document.getElementById('con_password').value;
    var message = document.getElementById('pass_message');

    if(password1 == ''){
        ;
    }
    else if(password2 == ''){
        message.innerText = 'Please confirm password!';
        message.style.color = 'blue';
        message.style.textAlign = 'center';
    }
    else if(password1 != password2){
        message.innerText = 'Passwords do not match!';
        message.style.color = 'red';
        message.style.textAlign = 'center';
    }
    else if(password1 == password2){
        message.innerText = 'Passwords match!' ;
        message.style.color = 'green';  
        message.style.textAlign = 'center';
    }  
    return;
}

function isUpper(ch){
    if (/[A-Z]/.test(ch))
        return true;
    else
        return false;
}
function isLower(ch){
    if (/[a-z]/.test(ch))
        return true;
    else
        return false;
}
function isSpecial(ch){
    if (/[@$!%*?&]/.test(ch))
        return true;
    else
        return false;
}

function str_check(){

    var password = document.getElementById("password");
    var str_message = document.getElementById("strength_message");
    var pass_len = password.value.length;
    const illegal = /(band|music|mpanta|mousiki)/i;

    if(illegal.test(password.value)) {
        str_message.innerText = "Password contains illegal words!";
        str_message.style.color = "red";
        str_message.style.textAlign = 'center';
        if(subscribe_btn_user){
            subscribe_btn_user.disabled = true;
        }
        if(subscribe_btn_band){
            subscribe_btn_band.disabled = true;
        }
        return;
    }

    var numbers = 0;
    var charCounter = {};
    var Upper, Lower, Num, Special = 0;

    for(var i=0; i<pass_len; i++){

        const char = password.value.charAt(i);

        if(!isNaN(char)){
            numbers++;
            Num = 1;
        }
        else if(isUpper(char))
            Upper = 1;
        else if(isLower(char))
            Lower = 1;
        else if(isSpecial(char))
            Special = 1;

        charCounter[char] = (charCounter[char] || 0) + 1;
    }

    if ((numbers / pass_len) >= 0.4) {
        str_message.innerText = "Weak password!";
        str_message.style.color = "red";
        if(subscribe_btn_user){
            subscribe_btn_user.disabled = true;
        }
        if(subscribe_btn_band){
            subscribe_btn_band.disabled = true;
        }
        return;
    }

    for (var j in charCounter) {
        if (charCounter[j] / pass_len >= 0.5) {
            str_message.innerText = "Weak password!";
            str_message.style.color = "red";
            if(subscribe_btn_user){
                subscribe_btn_user.disabled = true;
            }
            if(subscribe_btn_band){
                subscribe_btn_band.disabled = true;
            }
            return;
        }
    }

    if(Upper==1 && Lower==1 && Num==1 && Special==1){

        str_message.innerText = "Strong password!!";
        str_message.style.color = "green";
        if(subscribe_btn_user){
            subscribe_btn_user.disabled = false;
        }
        if(subscribe_btn_band){
            subscribe_btn_band.disabled = false;
        }
            return;
    }
    
    str_message.innerText = "Medium password.";
    str_message.style.color = "orange";
    if(subscribe_btn_user){
        subscribe_btn_user.disabled = false;
    }
    if(subscribe_btn_band){
        subscribe_btn_band.disabled = false;
    }
}

const Uform = document.getElementById("user_form");
const Bform = document.getElementById("band_form");
const output = document.getElementById("output");

if(subscribe_btn_user){
    subscribe_btn_user.addEventListener("click", function(){

        SubscribeUserPost();    
    })
}

if(subscribe_btn_band){
    subscribe_btn_band.addEventListener("click", function(){

        SubscribeBandPost();    
    })
}