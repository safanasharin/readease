export default function Features() {
  const features = [
    {
      title: "Guided Reading",
      description: "Follow along with highlighted text to improve your reading focus and pace.",
      icon: "📖",
    },
    {
      title: "Voice Practice",
      description: "Read aloud and get real-time feedback to build your reading confidence.",
      icon: "🎙️",
    },
    {
      title: "Visual Tools",
      description: "Customize fonts, colors, and spacing to reduce visual stress and dyslexia symptoms.",
      icon: "👁️",
    },
    {
      title: "Progress Tracking",
      description: "Monitor your reading journey with detailed analytics and regular milestone celebrations.",
      icon: "📈",
    },
  ];

  return (
    <section id="features" className="py-20 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Features designed for you</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to improve reading fluency and comprehension, built with accessibility at its core.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 hover:-translate-y-1 duration-200">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
