"use strict";

let allBands = [];

function fetchBands() {
  fetch('/bands')
    .then(res => res.json())
    .then(data => {
      allBands = data;
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
            ? `<a href="${band.webpage}" target="_blank">🌐 Website</a>`
            : ""
        }
      </div>
    `;
  });
}

function sortBands(criteria) {
  let sorted = [...allBands];

  if (criteria === "genre") {
    sorted.sort((a, b) =>
      a.music_genres.localeCompare(b.music_genres)
    );
  }

  if (criteria === "year") {
    sorted.sort((a, b) =>
      (a.foundedYear || 0) - (b.foundedYear || 0)
    );
  }

  if (criteria === "city") {
    sorted.sort((a, b) =>
      a.band_city.localeCompare(b.band_city)
    );
  }

  renderBands(sorted);
}

document.getElementById("sortSelect").addEventListener("change", e => {
  sortBands(e.target.value);
});

window.onload = fetchBands;
