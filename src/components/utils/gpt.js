export async function getAIResponse(text) {
  const response = await fetch("https://gpt-backend-9coh.onrender.com/gpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  const data = await response.json();
  return data.reply;
}
