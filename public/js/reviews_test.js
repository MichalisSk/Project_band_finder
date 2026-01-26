"use strict";

function createReview() {
    const band_name = document.getElementById('band_name').value;
    const sender = document.getElementById('sender').value;
    const review = document.getElementById('review').value;
    const rating = document.getElementById('rating').value;

    const data = {
        band_name: band_name,
        sender: sender,
        review: review,
        rating: rating
    };

    fetch('/review', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('createResult').innerHTML =
                `<span class="success">Success!</span>\n${JSON.stringify(data, null, 2)}`;
        })
        .catch(error => {
            document.getElementById('createResult').innerHTML =
                `<span class="error">Error:</span> ${error.message}`;
        });
}

function getReviews() {
    const band_name = document.getElementById('getBandName').value || 'all';
    const ratingFrom = document.getElementById('ratingFrom').value;
    const ratingTo = document.getElementById('ratingTo').value;

    let url = `/reviews/${encodeURIComponent(band_name)}`;
    const params = [];

    if (ratingFrom) params.push(`ratingFrom=${ratingFrom}`);
    if (ratingTo) params.push(`ratingTo=${ratingTo}`);

    if (params.length > 0) {
        url += '?' + params.join('&');
    }

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('getResult').innerHTML =
                `<span class="success">Success!</span>\n${JSON.stringify(data, null, 2)}`;
        })
        .catch(error => {
            document.getElementById('getResult').innerHTML =
                `<span class="error">Error:</span> ${error.message}`;
        });
}

function updateReviewStatus() {
    const review_id = document.getElementById('reviewId').value;
    const status = document.getElementById('status').value;

    fetch(`/reviewStatus/${review_id}/${status}`, {
        method: 'PUT'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('updateResult').innerHTML =
                `<span class="success">Success!</span>\n${JSON.stringify(data, null, 2)}`;
        })
        .catch(error => {
            document.getElementById('updateResult').innerHTML =
                `<span class="error">Error:</span> ${error.message}`;
        });
}

function deleteReview() {
    const review_id = document.getElementById('deleteReviewId').value;

    fetch(`/reviewDeletion/${review_id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('deleteResult').innerHTML =
                `<span class="success">Success!</span>\n${JSON.stringify(data, null, 2)}`;
        })
        .catch(error => {
            document.getElementById('deleteResult').innerHTML =
                `<span class="error">Error:</span> ${error.message}`;
        });
}