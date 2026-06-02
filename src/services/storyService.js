export async function getStories() {
  const response = await fetch("http://localhost:5000/api/stories");

  if (!response.ok) {
    throw new Error("Failed to fetch stories");
  }

  return response.json();
}