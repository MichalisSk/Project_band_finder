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
            $("#profileContent").html(createTableFromJSON(JSON.parse(xhr.responseText)));
            //("#ajaxContent").html("Successful Login");
        } else if (xhr.status !== 200) {
            $("#profileContent").html("User does not exist or incorrect password");
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
                window.location.href = "main.html";
            } else if (xhr.status === 409) {
                //someone already logged in
                const response = JSON.parse(xhr.responseText);
                $("#profileContent").html(`<p style="color: red;">${response.error}</p>`);
            } else {
                $("#profileContent").html("User does not exist or incorrect password");
            }
        }
    };
    
    xhr.onerror = function() {
        $("#profileContent").html("Network error occurred");
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
            $("#profileContent").html("Logged out successfully");
            checkGlobalSession();
        } else {
            $("#profileContent").html("Logout failed");
        }
    };

    xhr.open('POST', '/users/logout');
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}

function showUserProfile(user) {
    const birthdate = user.birthdate ? 
        new Date(user.birthdate).toISOString().split('T')[0] : 
        '';
    
    const genderMale = user.gender === 'male' ? 'checked' : '';
    const genderFemale = user.gender === 'female' ? 'checked' : '';
    const genderOther = user.gender === 'other' ? 'checked' : '';
    
    $("#profileContent").html(`
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
                $("#profileContent").html("<p style='color: red;'>Please login first to view your profile</p>");
            } else if (xhr.status === 404) {
                $("#profileContent").html("<p style='color: red;'>User profile not found</p>");
            } else {
                $("#profileContent").html("<p style='color: red;'>Error loading profile</p>");
            }
        }
    };
    
    xhr.onerror = function() {
        $("#profileContent").html("<p style='color: red;'>Network error occurred</p>");
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

function getBandPost() {
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                window.location.href = "main.html";

            } else if (xhr.status === 409) {
                const response = JSON.parse(xhr.responseText);
                $("#profileContent").html(`<p style="color: red;">${response.error}</p>`);
            } else {
                $("#profileContent").html("Band does not exist or incorrect password");
            }
        }
    };

    xhr.onerror = function () {
        $("#profileContent").html("Network error occurred");
    };

    var data = $('#bandLoginForm').serialize();
    xhr.open('POST', '/bands/loginDetails');
    xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
    xhr.send(data);
}

function logoutBandPost() {
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#profileContent").html("Logged out successfully");
            checkGlobalSession();
        } else {
            $("#profileContent").html("Logout failed");
        }
    };

    xhr.open('POST', '/bands/logout');
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}

function loadBandProfile() {
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const band = JSON.parse(xhr.responseText);
            showBandProfile(band);
        } else {
            $("#profileContent").html("<p style='color:red;'>Error loading band profile</p>");
        }
    };

    xhr.open('GET', '/bands/profile');
    xhr.send();
}

function showBandProfile(band) {
    $("#profileContent").html(`
        <h2>Band Profile</h2>

        <label>Username:</label><br>
        <input type="text" value="${band.username}" disabled><br><br>

        <label>Email:</label><br>
        <input type="email" value="${band.email}" disabled><br><br>

        <label>Band Name:</label><br>
        <input type="text" id="band_name" value="${band.band_name || ''}"><br><br>

        <label>Music Genres:</label><br>
        <input type="text" id="music_genres" value="${band.music_genres || ''}"><br><br>

        <label>Description:</label><br>
        <textarea id="band_description" rows="4">${band.band_description || ''}</textarea><br><br>

        <label>Members:</label><br>
        <input type="number" id="members_number" min="1" max="10"
               value="${band.members_number || 1}"><br><br>

        <label>Founded Year:</label><br>
        <input type="number" id="foundedYear" min="1960" max="2025"
               value="${band.foundedYear || ''}"><br><br>

        <label>City:</label><br>
        <input type="text" id="band_city" value="${band.band_city || ''}"><br><br>

        <label>Telephone:</label><br>
        <input type="text" id="telephone" value="${band.telephone || ''}"><br><br>

        <label>Webpage:</label><br>
        <input type="url" id="webpage" value="${band.webpage || ''}"><br><br>

        <label>Photo URL:</label><br>
        <input type="url" id="photo" value="${band.photo || ''}"><br><br>

        <button onclick="updateBandProfile()">Save Changes</button>
    `);
}


function updateBandProfile() {
    const data = {
        band_name: document.getElementById("band_name").value,
        music_genres: document.getElementById("music_genres").value,
        band_description: document.getElementById("band_description").value,
        members_number: document.getElementById("members_number").value,
        foundedYear: document.getElementById("foundedYear").value,
        band_city: document.getElementById("band_city").value,
        telephone: document.getElementById("telephone").value,
        webpage: document.getElementById("webpage").value || null,
        photo: document.getElementById("photo").value || null
    };

    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.status === 200) {
            alert("Band profile updated successfully");
            loadBandProfile();
        } else {
            const response = JSON.parse(xhr.responseText);
            alert(response.error || "Update failed");
        }
    };

    xhr.open('POST', '/bands/profile/update');
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(data));
}


function getAdminPost() {
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                window.location.href = "main.html";

            } else {
                const response = JSON.parse(xhr.responseText);
                $("#profileContent").html(
                    `<p style="color: red;">${response.error || "Invalid admin credentials"}</p>`
                );
            }
        }
    };

    xhr.onerror = function () {
        $("#profileContent").html("Network error occurred");
    };

    const data = $('#adminLoginForm').serialize();

    xhr.open('POST', '/admin/loginDetails');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
}

function logoutAdminPost() {
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            $("#profileContent").html("Logged out successfully");
            checkGlobalSession();
        } else {
            $("#profileContent").html("Logout failed");
        }
    };

    xhr.open('POST', '/admin/logout');
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();
}

function loadProfilePage() {
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);

            if (!data.loggedIn) {
                window.location.href = 'login.html';
                return;
            }

            if (data.role === 'user') {
                loadUserProfile();
            }

            if (data.role === 'band') {
                loadBandProfile();
            }

            if (data.role === 'admin') {
                window.location.href = 'admin_dashboard.html';
            }
        }
    };

    xhr.open('GET', '/session/status');
    xhr.send();
}

function checkGlobalSession() {
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            updateGlobalSessionUI(data);
            updateLogStatusButton(data);
        }
    };

    xhr.open('GET', '/session/status');
    xhr.send();
}

function updateGlobalSessionUI(data) {
    const sessionStatus = document.getElementById("sessionStatus");
    const sessionCount = document.getElementById("sessionCount");

    if (!sessionStatus || !sessionCount) return;

    if (data.loggedIn) {
        sessionStatus.innerHTML = `Logged in as ${data.role}: ${data.username}`;
        sessionCount.innerHTML = `Active sessions: ${data.sessionCount}`;
    } else {
        if (data.sessionCount > 0) {
            sessionStatus.innerHTML =
                `${data.role} ${data.username} is currently logged in`;
        } else {
            sessionStatus.innerHTML = 'Not logged in';
        }
        sessionCount.innerHTML = `Active sessions: ${data.sessionCount}`;
    }
}


function updateLogStatusButton(data) {
    const log_status = document.getElementById("log_status");
    if (!log_status) return;

    if (data.loggedIn) {
        log_status.textContent = "Logout";
        log_status.href = "#";
        log_status.onclick = function () {
            logoutByRole(data.role);
        };
    } else {
        log_status.textContent = "Login";
        log_status.href = "login.html";
        log_status.onclick = null;
    }

    const registerBtn = document.getElementById("registerBtn");

    
    if (registerBtn) {
        registerBtn.style.display = data.loggedIn ? "none" : "inline-block";
    }

}

function logoutByRole(role) {
    let url = "";

    if (role === "user") url = "/users/logout";
    if (role === "band") url = "/bands/logout";
    if (role === "admin") url = "/admin/logout";

    if (!url) return;

    fetch(url, { method: "POST" })
        .then(res => res.json())
        .then(() => {
            window.location.href = "main.html";
        })
        .catch(() => {
            alert("Logout failed");
        });
}

function redirectIfLoggedIn() {
    var xhr = new XMLHttpRequest();

    xhr.onload = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);

            if (data.loggedIn) {
                window.location.href = "main.html";
            }
        }
    };

    xhr.open("GET", "/session/status");
    xhr.send();
}

window.onload = function () {
    checkGlobalSession();


    if (
        document.getElementById("loginForm") ||
        document.getElementById("bandLoginForm") ||
        document.getElementById("adminLoginForm")
    ) {
        redirectIfLoggedIn();
    }

    if (document.getElementById("profileContent")) {
        loadProfilePage();
    }

    if (document.getElementById("eventsList")) {
        loadPublicEventsPage();
    }

    setInterval(checkGlobalSession, 5000);
};

function loadPublicEventsPage() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/events/public'); // Prepare the request
    
    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const events = JSON.parse(xhr.responseText);
                console.log("Events loaded from DB:", events); // Debug log
                displayPublicEvents(events);
            } catch (e) {
                console.error("Error parsing JSON:", e);
                document.getElementById("eventsList").innerHTML = "<p style='color:red'>Error parsing event data.</p>";
            }
        } else {
            console.error("Server returned status:", xhr.status);
            document.getElementById("eventsList").innerHTML = `<p>Error loading events. Status: ${xhr.status}</p>`;
        }
    };

    xhr.onerror = function() {
        document.getElementById("eventsList").innerHTML = "<p>Network Error. Is the server running?</p>";
    };

    xhr.send(); // Send the request
}

function displayPublicEvents(events) {
    const container = document.getElementById("eventsList");
    
    // Safety check: ensure events is actually an array
    if (!Array.isArray(events) || events.length === 0) {
        container.innerHTML = "<p style='text-align:center;'>No upcoming public events found.</p>";
        return;
    }

    let html = '<div class="events-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; padding: 20px;">';

    events.forEach(event => {
        // Handle Date Formatting safely
        const dateObj = new Date(event.event_datetime); 
        const dateStr = !isNaN(dateObj) 
            ? dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            : "Date to be announced";

        // FIX: Added the missing '$' before {event.event_lat}
        const mapUrl = `http://maps.google.com/maps?q=${event.event_lat},${event.event_lon}`;

        html += `
            <div class="event-card" style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; background: #f9f9f9; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="margin-top: 0; color: #333;">${event.event_description}</h3>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 10px 0;">
                
                <p><strong>🎵 Type:</strong> ${event.event_type}</p>
                <p><strong>📅 Date:</strong> ${dateStr}</p>
                <p><strong>📍 City:</strong> ${event.event_city}</p>
                <p><strong>🏠 Address:</strong> ${event.event_address}</p>
                <p><strong>💰 Price:</strong> ${event.participants_price} €</p>
                
                <div style="margin-top: 15px; text-align: center;">
                    <a href="${mapUrl}" target="_blank" style="display: inline-block; padding: 8px 15px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 4px;">
                        View on Google Maps
                    </a>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function fetchAndDrawCityChart() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/stats/bands-by-city');
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                drawCityChart(data);
            } catch (e) {
                console.error("Error parsing stats:", e);
                document.getElementById('chart_div').innerHTML = "Error parsing data";
            }
        } else if (xhr.status === 403) {
             document.getElementById('chart_div').innerHTML = "<h3>Access Denied. Please login as Admin.</h3>";
        } else {
            console.error("Error loading stats:", xhr.status);
            document.getElementById('chart_div').innerHTML = "Error loading data";
        }
    };
    
    xhr.onerror = function() {
        document.getElementById('chart_div').innerHTML = "Network Error";
    };
    
    xhr.send();
}

function drawCityChart(apiData) {
    // 1. Convert API JSON data to Google Charts array format
    // Header row
    var chartDataArray = [['City', 'Number of Bands']];
    
    // Loop through DB results and add to array
    apiData.forEach(item => {
        chartDataArray.push([item.band_city, item.count]);
    });

    // 2. Convert to DataTable
    var data = google.visualization.arrayToDataTable(chartDataArray);

    // 3. Set Options
    var options = {
        title: 'Distribution of Bands by City',
        chartArea: {width: '50%'},
        hAxis: {
            title: 'Number of Bands',
            minValue: 0,
            format: '0' // Integer format
        },
        vAxis: {
            title: 'City'
        },
        bars: 'horizontal', // Required for Material Bar Charts, optional for corechart but good for long city names
        colors: ['#4285F4'],
        animation: {
            startup: true,
            duration: 1000,
            easing: 'out'
        }
    };

    // 4. Instantiate and draw
    var chart = new google.visualization.BarChart(document.getElementById('chart_div'));
    chart.draw(data, options);
}

function fetchAndDrawEventChart() {
    var xhr = new XMLHttpRequest();
    
    // UPDATED URL: Changed from /stats/... to /api/admin/...
    xhr.open('GET', '/api/admin/events-distribution');
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const data = JSON.parse(xhr.responseText);
                drawEventChart(data);
            } catch (e) {
                console.error("Error parsing event stats:", e);
                document.getElementById('piechart_div').innerHTML = "Error parsing data";
            }
        } else {
            console.error("Error loading event stats", xhr.responseText);
            document.getElementById('piechart_div').innerHTML = "Error loading data";
        }
    };
    xhr.send();
}

function drawEventChart(apiData) {
    // Prepare data for Google Charts
    var dataArray = [['Event Type', 'Count']];
    
    apiData.forEach(item => {
        dataArray.push([item.type, item.count]);
    });

    var data = google.visualization.arrayToDataTable(dataArray);

    var options = {
        title: 'Events Distribution (Public vs Private)',
        is3D: true,
        colors: ['#ff9900', '#dc3912'], // Distinct colors
        chartArea: {width: '90%', height: '80%'},
        legend: {position: 'right'}
    };

    var chart = new google.visualization.PieChart(document.getElementById('piechart_div'));
    chart.draw(data, options);
}