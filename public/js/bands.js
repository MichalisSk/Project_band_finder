"use strict";

let allBands = [];
let canLeaveReview = false;

function checkSessionForReview() {
  return fetch("/session/status")
    .then(res => res.json())
    .then(data => {
      // Only logged-in USERS can leave reviews
      canLeaveReview = data.loggedIn && data.role === "user";
    })
    .catch(() => {
      canLeaveReview = false;
    });
}

function fetchBands() {
  Promise.all([
    checkSessionForReview(),
    fetch("/bands").then(res => res.json())
  ])
    .then(([_, bands]) => {
      allBands = bands;
      renderBands(allBands);
    })
    .catch(() => {
      document.getElementById("bandsGrid").innerHTML =
        "<p style='color:red;'>Failed to load bands</p>";
    });
}

function renderBands(bands) {
  const grid = document.getElementById("bandsGrid");
  grid.innerHTML = "";

  bands.forEach(band => {
    grid.innerHTML += `
      <div class="card">
        <h3>${band.band_name}</h3>
        <p><strong>Genre:</strong> ${band.music_genres}</p>
        <p><strong>City:</strong> ${band.band_city}</p>
        <p><strong>Founded:</strong> ${band.foundedYear}</p>
        <p><strong>Members:</strong> ${band.members_number}</p>
        <p>${band.band_description || ""}</p>

        ${
          band.webpage
            ? `<a href="${band.webpage}" target="_blank">🌐 Website</a><br>`
            : ""
        }

        ${
          canLeaveReview
            ? `<button onclick="showReviewForm('${band.band_name}')">
                 ✍ Leave Review
               </button>`
            : ""
        }

        <div id="review-box-${band.band_name}" style="display:none; margin-top:10px;"></div>
      </div>
    `;
  });
}

/* band sorting */

function sortBands(criteria) {
  let sorted = [...allBands];

  if (criteria === "genre") {
    sorted.sort((a, b) => a.music_genres.localeCompare(b.music_genres));
  }

  if (criteria === "year") {
    sorted.sort((a, b) => (a.foundedYear || 0) - (b.foundedYear || 0));
  }

  if (criteria === "city") {
    sorted.sort((a, b) => a.band_city.localeCompare(b.band_city));
  }

  renderBands(sorted);
}

document.getElementById("sortSelect").addEventListener("change", e => {
  sortBands(e.target.value);
});

/* review UI */

function showReviewForm(bandName) {
  const box = document.getElementById(`review-box-${bandName}`);

  box.innerHTML = `
    <textarea id="review-text-${bandName}"
      rows="3"
      style="width:100%;"
      placeholder="Write your review..."></textarea>

    <label>Rating:</label>
    <select id="review-rating-${bandName}">
      <option value="5">5</option>
      <option value="4">4</option>
      <option value="3">3</option>
      <option value="2">2</option>
      <option value="1">1</option>
    </select>

    <br><br>
    <button onclick="submitReview('${bandName}')">Submit Review</button>
  `;

  box.style.display = "block";
}

/* review submission */

function submitReview(bandName) {
  const review = document
    .getElementById(`review-text-${bandName}`)
    .value.trim();

  const rating = document
    .getElementById(`review-rating-${bandName}`)
    .value;

  if (!review) {
    alert("Review cannot be empty");
    return;
  }

  fetch("/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      band_name: bandName,
      review: review,
      rating: rating
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        alert("REST API POST request was successfully created!!");
        document.getElementById(`review-box-${bandName}`).style.display = "none";
      }
    })
    .catch(() => {
      alert("Failed to submit review");
    });
}


window.onload = fetchBands;
