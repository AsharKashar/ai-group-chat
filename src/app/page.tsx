'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Expert Chat Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose your chat experience with AI-powered experts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Original Expert Chat */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Multi-Expert Chat
              </h2>
              <p className="text-gray-600">
                Chat with multiple specialized AI experts including DevOps, Frontend, Backend, 
                AI/ML, Database, Security, Architecture, and more.
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Features:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Multiple experts respond to each question</li>
                <li>• Advanced streaming responses</li>
                <li>• Expert selection based on keywords</li>
                <li>• Comprehensive technical coverage</li>
              </ul>
            </div>

            <Link
              href="/chat"
              className="block w-full bg-blue-600 text-white text-center py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Multi-Expert Chat
            </Link>
          </div>

          {/* Product Manager Chat with CopilotKit */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Product Manager Chat
              </h2>
              <p className="text-gray-600">
                Simple, focused chat with Sarah Chen, a Senior Product Manager. 
                Powered by CopilotKit for product strategy discussions.
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Features:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Product strategy & roadmap planning</li>
                <li>• User research & requirements gathering</li>
                <li>• Feature prioritization guidance</li>
                <li>• Clean, distraction-free chat interface</li>
              </ul>
            </div>

            <div className="mb-4">
              <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                🪁 Powered by CopilotKit
              </span>
            </div>

            <Link
              href="/product-manager"
              className="block w-full bg-purple-600 text-white text-center py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors"
            >
              Start Product Manager Chat
            </Link>
          </div>

          {/* Islamic Advisor Chat */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🕌</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Islamic Spiritual Advisor
              </h2>
              <p className="text-gray-600">
                Seek Islamic guidance from Sheikh Abdullah with compassion and authentic Islamic knowledge.
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Features:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Quran and Hadith wisdom</li>
                <li>• Islamic ethics and morality</li>
                <li>• Life counseling with safety features</li>
                <li>• Compassionate spiritual guidance</li>
              </ul>
            </div>

            <div className="mb-4">
              <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                🤲 With Safety Features
              </span>
            </div>

            <Link
              href="/islamic-advisor"
              className="block w-full bg-green-600 text-white text-center py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Seek Guidance
            </Link>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Both chat experiences use OpenAI's GPT models with specialized expert prompts
          </p>
        </div>
      </div>
    </div>
  );
}
