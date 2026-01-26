"use strict";

function createTableFromJSON(data) {
    var html = "<table><tr><th>Category</th><th>Value</th></tr>";
    for (const x in data) {
        var category = x;
        var value = data[x];
        html += "<tr><td>" + category + "</td><td>" + value + "</td></tr>";
    }
    html += "</table>";
    return html;

}

function getUser() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#ajaxContent").html(createTableFromJSON(JSON.parse(xhr.responseText)));
            //("#ajaxContent").html("Successful Login");
        } else if (xhr.status !== 200) {
            $("#ajaxContent").html("User does not exist or incorrect password");
        }
    };
    var data = $('#loginForm').serialize();
    xhr.open('GET', 'users/details?'+data);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.send();
}

function initDB() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
              $("#ajaxContent").html("Successful Initialization");
        } else if (xhr.status !== 200) {
             $("#ajaxContent").html("Error Occured");
        }
    };

    xhr.open('GET', '/initdb');
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send();
}

function insertDB() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
              $("#ajaxContent").html("Successful Insertion");
        } else if (xhr.status !== 200) {
             $("#ajaxContent").html("Error Occured");
        }
    };

    xhr.open('GET', '/insertRecords');
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send();
}


function deleteDB() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
              $("#ajaxContent").html("Successful Deletion");
        } else if (xhr.status !== 200) {
             $("#ajaxContent").html("Error Occured");
        }
    };

    xhr.open('GET', '/dropdb');
    xhr.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    xhr.send();
}

function SubscribeUserPost(){
    const form = document.getElementById("user_form");
    const formData = new FormData(form);

    var userData = {};
    formData.forEach((value, key) => {
        userData[key] = value;
    });

    userData.lat = latitude;
    userData.lon = longitude;

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if( xhr.readyState == 4 && xhr.status === 200){

            const responseData = JSON.parse(xhr.responseText);
            document.getElementById("output").innerHTML = "Successful Subscription";

        }else if (xhr.status !== 200) {
            const err = JSON.parse(xhr.responseText).error;
            document.getElementById("output").innerHTML = err;
        }
    }
    xhr.open('POST','/subscribeUser');
    xhr.setRequestHeader("Content-type","application/json");
    xhr.send(JSON.stringify(userData));
}

function SubscribeBandPost(){
    const form = document.getElementById("band_form");
    const formData = new FormData(form);

    var bandData = {};
    formData.forEach((value, key) => {
        bandData[key] = value;
    });

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if( xhr.readyState == 4 && xhr.status === 200){

            const responseData = JSON.parse(xhr.responseText);
            document.getElementById("output").innerHTML = "Successful Subscription";

        }else if (xhr.status !== 200) {
            const err = JSON.parse(xhr.responseText).error;
            document.getElementById("output").innerHTML = err;
        }
    }
    xhr.open('POST','/subscribeBand');
    xhr.setRequestHeader("Content-type","application/json");
    xhr.send(JSON.stringify(bandData));
}

function getUserPost() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                $("#ajaxContent").html(`<p style="color: green;">${response.message}</p>`);
                checkSession(); // Update session status
            } else if (xhr.status === 409) {
                //someone already logged in
                const response = JSON.parse(xhr.responseText);
                $("#ajaxContent").html(`<p style="color: red;">${response.error}</p>`);
            } else {
                $("#ajaxContent").html("User does not exist or incorrect password");
            }
        }
    };
    
    xhr.onerror = function() {
        $("#ajaxContent").html("Network error occurred");
    };
    
    var data = $('#loginForm').serialize();
    xhr.open('POST', '/users/loginDetails');
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhr.send(data);
}

function logoutUserPost() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#ajaxContent").html("Logged out successfully");
            checkSession(); // Update status
        } else {
            $("#ajaxContent").html("Logout failed");
        }
    };

    xhr.open('POST', '/users/logout');
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}

function checkSession() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let data = JSON.parse(xhr.responseText);
            updateSessionStatus(data);
        }
    };
    xhr.open('GET', '/users/userSession');
    xhr.send();
}

function updateSessionStatus(data) {
    if (data.logIn) {
        $('#sessionStatus').html(`✓ Logged in as: ${data.user.username}`);
        $('#sessionCount').html(`Active sessions: ${data.sessionCount || 0}`);
        $('button[onclick="getUserPost()"]').prop('disabled', true);
        $('#loginForm')[0].reset(); //Clear fields
    } else {
        if (data.sessionCount > 0) {
            $('#sessionStatus').html(`✗ Not logged in (Someone else is logged in)`);
        } else {
            $('#sessionStatus').html('✗ Not logged in');
        }
        $('#sessionCount').html(`Active sessions: ${data.sessionCount || 0}`);
        $('button[onclick="getUserPost()"]').prop('disabled', data.sessionCount > 0);
    }
}

function showUserProfile(user) {
    const birthdate = user.birthdate ? 
        new Date(user.birthdate).toISOString().split('T')[0] : 
        '';
    
    const genderMale = user.gender === 'male' ? 'checked' : '';
    const genderFemale = user.gender === 'female' ? 'checked' : '';
    const genderOther = user.gender === 'other' ? 'checked' : '';
    
    $("#ajaxContent").html(`
        <h2>Your Profile</h2>
        <form id="profileForm">
            <label>Username:</label><br>
            <input type="text" value="${user.username || ''}" disabled><br><br>

            <label>Email:</label><br>
            <input type="email" value="${user.email || ''}" disabled><br><br>

            <label>First Name:</label><br>
            <input type="text" id="firstname" value="${user.firstname || ''}" minlength="3" maxlength="30"><br><br>

            <label>Last Name:</label><br>
            <input type="text" id="lastname" value="${user.lastname || ''}" minlength="3" maxlength="30"><br><br>

            <label>Date of Birth:</label><br>
            <input type="date" id="birthdate" name="birthdate" value="${birthdate}" min="1920-01-01" max="2011-12-31"><br><br>

            <label>Gender:</label><br>
            <div style="margin-bottom: 10px;">
                <input type="radio" id="male" name="gender" value="male" ${genderMale}>
                <label for="male">Male</label>
                
                <input type="radio" id="female" name="gender" value="female" ${genderFemale}>
                <label for="female">Female</label>
                
                <input type="radio" id="other" name="gender" value="other" ${genderOther}>
                <label for="other">Other</label>
            </div>

            <label>Country:</label><br>
            <select id="country" name="country" disabled>
                <option value="">Select a country</option>
                <option value="GR" ${user.country === 'GR' ? 'selected' : ''}>Greece</option>
                <option value="US" ${user.country === 'US' ? 'selected' : ''}>United States</option>
                <option value="GB" ${user.country === 'GB' ? 'selected' : ''}>United Kingdom</option>
                <option value="DE" ${user.country === 'DE' ? 'selected' : ''}>Germany</option>
                <option value="FR" ${user.country === 'FR' ? 'selected' : ''}>France</option>
                <option value="IT" ${user.country === 'IT' ? 'selected' : ''}>Italy</option>
                <option value="ES" ${user.country === 'ES' ? 'selected' : ''}>Spain</option>
            </select><br><br>

            <label>City:</label><br>
            <input type="text" id="city" value="${user.city || ''}" minlength="3" maxlength="30"><br><br>

            <label>Address:</label><br>
            <input type="text" id="address" value="${user.address || ''}" minlength="10" maxlength="150"><br><br>

            <label>Telephone:</label><br>
            <input type="text" id="telephone" value="${user.telephone || ''}" minlength="10" maxlength="14" pattern="[0-9]{10,14}"><br><br>

            <button type="button" onclick="updateProfile()">Save Changes</button>
            <button type="button" onclick="loadUserProfile()">Cancel</button>
        </form>
    `);
}

function loadUserProfile() {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const userData = JSON.parse(xhr.responseText);
                showUserProfile(userData);
            } else if (xhr.status === 401) {
                $("#ajaxContent").html("<p style='color: red;'>Please login first to view your profile</p>");
            } else if (xhr.status === 404) {
                $("#ajaxContent").html("<p style='color: red;'>User profile not found</p>");
            } else {
                $("#ajaxContent").html("<p style='color: red;'>Error loading profile</p>");
            }
        }
    };
    
    xhr.onerror = function() {
        $("#ajaxContent").html("<p style='color: red;'>Network error occurred</p>");
    };
    
    xhr.open('GET', '/users/profile');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send();
}

function updateProfile() {
    var xhr = new XMLHttpRequest();
    
    // Get gender value from radio buttons
    const genderElements = document.getElementsByName('gender');
    let selectedGender = '';
    for (const element of genderElements) {
        if (element.checked) {
            selectedGender = element.value;
            break;
        }
    }
    
    let data = {
        firstname: document.getElementById("firstname").value,
        lastname: document.getElementById("lastname").value,
        birthdate: document.getElementById("birthdate").value,
        gender: selectedGender,
        country: document.getElementById("country").value,
        city: document.getElementById("city").value,
        address: document.getElementById("address").value,
        telephone: document.getElementById("telephone").value,
    };

    xhr.onload = function() {
        if (xhr.status === 200) {
            alert("Profile updated successfully!");
            loadUserProfile();  // Reload view with new values
        } else if (xhr.status === 401) {
            alert("Please login first");
        } else {
            const response = JSON.parse(xhr.responseText);
            alert("Error: " + (response.error || "Failed to update profile"));
        }
    };
    
    xhr.onerror = function() {
        alert("Network error occurred");
    };

    xhr.open("POST", "/users/profile/update");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}

// Auto-refresh session status every 5 seconds
setInterval(checkSession, 5000);

window.onload = function() {
    checkSession();
};


// mA!@#45as