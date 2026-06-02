import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStories } from "./services/storyService";
import Navbar from "./components/Navbar";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function loadStories() {
      try {
        const data = await getStories();
        console.log("API response:", data);

        const storiesArray = Array.isArray(data)
          ? data
          : Array.isArray(data.stories)
          ? data.stories
          : [];

        setStories(storiesArray);
        setFilteredStories(storiesArray);
      } catch (err) {
        console.error("Failed to load stories:", err);
        setError("Failed to load stories");
      } finally {
        setLoading(false);
      }
    }

    loadStories();
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredStories(stories);
    } else {
      const filtered = stories.filter(
        (story) => story.category === selectedCategory
      );
      setFilteredStories(filtered);
    }
  }, [selectedCategory, stories]);

  const categories = [
    "All",
    ...new Set(
      Array.isArray(stories)
        ? stories.map((story) => story.category).filter(Boolean)
        : []
    ),
  ];

  if (loading) {
    return <div className="p-6 text-lg">Loading stories...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

 return (
  <div className="min-h-screen bg-white">
    <Navbar />

    <div className="pt-24 px-6 lg:px-10 pb-10">
      <p className="text-sm uppercase tracking-wide text-teal-600 font-semibold mb-2">
        Reading library
      </p>

      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Stories
      </h1>

      <div className="mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-300"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {filteredStories.length === 0 ? (
        <p className="text-gray-600">No stories found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStories.map((story) => (
            <div
              key={story._id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {story.title}
              </h2>

              <p className="text-sm text-gray-600 mb-3">
                Level: {story.level} | Category: {story.category}
              </p>

              <p className="text-sm text-gray-500 mb-5 leading-6">
                {story.summary ||
                  (story.content
                    ? story.content.slice(0, 120) + "..."
                    : "")}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/reader", { state: { story } })}
                  className="bg-teal-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-teal-700 transition"
                >
                  Read Story
                </button>

                <button
                  onClick={() =>
                    navigate("/voice-practice", { state: { story } })
                  }
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Voice Practice
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
}