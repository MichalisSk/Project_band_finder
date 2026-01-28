function sendAIQuery() {
  const input = document.getElementById("chatInput");
  const output = document.getElementById("chatOutput");

  const question = input.value.trim();
  if (!question) return;

  // Show user message
  output.innerHTML += `<p><strong>You:</strong> ${question}</p>`;
  input.value = "";

  fetch('/ai/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        output.innerHTML += `<p style="color:red;">${data.error}</p>`;
        return;
      }

      // ✅ Expect ONLY band names now
      if (!data.bands || data.bands.length === 0) {
        output.innerHTML += `<p><em>No bands found.</em></p>`;
        return;
      }

      output.innerHTML += `<p><strong>AI:</strong></p>`;
      data.bands.forEach(name => {
        output.innerHTML += `<p>🎸 ${name}</p>`;
      });

      output.scrollTop = output.scrollHeight;
    })
    .catch(() => {
      output.innerHTML += `<p style="color:red;">AI error</p>`;
    });
}
