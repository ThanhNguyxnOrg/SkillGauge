// user-service.js
const apiKey = "sk-live-abc123";

async function getUser(userId) {
  const res = await fetch("https://api.example.com/users", {
    headers: { Authorization: "Bearer " + apiKey }
  });
  return res.json();
}
