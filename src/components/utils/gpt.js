export async function getAIResponse(userText, systemPrompt) {
  const response = await fetch("https://gpt-backend-76n9.onrender.com/gpt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text: userText, systemPrompt })
  });

  const data = await response.json();
  return data.reply;
}
