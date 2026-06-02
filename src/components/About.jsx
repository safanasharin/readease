export default function About() {
  return (
    <section id="about" className="py-20 bg-teal-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">About Readease</h2>
            <p className="text-lg text-gray-600 mb-4 leading-relaxed">
              Readease was created with a singular mission: to make reading accessible, enjoyable, and rewarding for everyone, especially those with dyslexia and other reading challenges.
            </p>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Our AI-powered platform provides a supportive environment that adapts to your unique needs, helping you build confidence and fluency at your own pace.
            </p>
            <div className="flex gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
                <h4 className="text-2xl font-bold text-teal-600 mb-1">10k+</h4>
                <p className="text-sm text-gray-500">Active Learners</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
                <h4 className="text-2xl font-bold text-teal-600 mb-1">98%</h4>
                <p className="text-sm text-gray-500">Improved Fluency</p>
              </div>
            </div>
          </div>
          <div className="flex-1 relative w-full">
            <div className="aspect-square bg-teal-200 rounded-3xl overflow-hidden shadow-lg relative z-10 flex items-center justify-center">
               <div className="text-center p-8 bg-white/80 backdrop-blur m-6 rounded-2xl">
                 <h3 className="text-2xl font-bold text-teal-700 mb-2">Our Vision</h3>
                 <p className="text-gray-700">A world where reading barriers are removed, and every student has the tools they need to succeed.</p>
               </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-yellow-200 rounded-full z-0 hidden md:block"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-teal-100 rounded-full z-0 hidden md:block"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
