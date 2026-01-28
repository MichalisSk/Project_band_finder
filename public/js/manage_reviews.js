"use strict";

function loadAllReviews() {
  fetch("/admin/reviews")
    .then(res => {
      if (res.status === 403) {
        window.location.href = "login.html";
        return;
      }
      return res.json();
    })
    .then(reviews => renderReviews(reviews))
    .catch(() => {
      document.getElementById("reviewsContainer").innerHTML =
        "<p style='color:red;'>Failed to load reviews</p>";
    });
}

function renderReviews(reviews) {
  const container = document.getElementById("reviewsContainer");
  container.innerHTML = "";

  if (!reviews || reviews.length === 0) {
    container.innerHTML = "<p>No reviews found.</p>";
    return;
  }

  reviews.forEach(r => {
    container.innerHTML += `
      <div class="review-card">
        <p><strong>Band:</strong> ${r.band_name}</p>
        <p><strong>Sender:</strong> ${r.sender}</p>
        <p><strong>Rating:</strong> ⭐ ${r.rating}</p>
        <p><strong>Review:</strong> ${r.review}</p>
        <p><strong>Date:</strong> ${new Date(r.date_time).toLocaleString()}</p>

        <div class="review-actions">
          <select onchange="updateStatus(${r.review_id}, this.value)">
            <option value="pending" ${r.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="published" ${r.status === 'published' ? 'selected' : ''}>Published</option>
            <option value="rejected" ${r.status === 'rejected' ? 'selected' : ''}>Rejected</option>
          </select>

          <button onclick="deleteReview(${r.review_id})">🗑 Delete</button>
        </div>
      </div>
    `;
  });
}

function updateStatus(id, status) {
  fetch(`/reviewStatus/${id}/${status}`, { method: "PUT" })
    .then(res => res.json())
    .then(data => {
      if (data.error) alert(data.error);
    })
    .catch(() => alert("Failed to update status"));
}

function deleteReview(id) {
  if (!confirm("Delete this review?")) return;

  fetch(`/reviewDeletion/${id}`, { method: "DELETE" })
    .then(res => res.json())
    .then(data => {
      if (data.error) alert(data.error);
      else loadAllReviews();
    })
    .catch(() => alert("Failed to delete review"));
}

window.onload = loadAllReviews;
