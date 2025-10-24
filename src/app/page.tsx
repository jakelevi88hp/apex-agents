import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white">
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold">Apex Agents</div>
        <div className="space-x-4">
          <Link href="/login" className="px-4 py-2 rounded hover:bg-white/10">Login</Link>
          <Link href="/signup" className="px-6 py-2 bg-purple-600 rounded hover:bg-purple-700">Get Started</Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6">
            The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Autonomous AI</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Build intelligent agents that think, learn, and execute complex workflows autonomously.
            Powered by cutting-edge AI, verified results, and proprietary model fine-tuning.
          </p>
          <Link href="/signup" className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-lg font-semibold hover:shadow-2xl transition">
            Start Building Agents
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="p-6 bg-white/5 backdrop-blur rounded-lg">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold mb-2">Autonomous Agents</h3>
            <p className="text-gray-400">8 specialized agent types that think, plan, and execute independently</p>
          </div>
          <div className="p-6 bg-white/5 backdrop-blur rounded-lg">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Verified Results</h3>
            <p className="text-gray-400">Multi-layer fact-checking and source verification for trusted outputs</p>
          </div>
          <div className="p-6 bg-white/5 backdrop-blur rounded-lg">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-bold mb-2">Proprietary Models</h3>
            <p className="text-gray-400">Fine-tune AI on your data for unmatched performance</p>
          </div>
        </div>
      </main>
    </div>
  );
}

