import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Apex Agents',
  description: 'How Apex Agents collects, uses, and protects your information.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-white/5 bg-gray-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold">A</div>
            <span className="font-bold">Apex Agents</span>
          </Link>
          <Link href="/signup" className="text-sm px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 transition-colors font-semibold">
            Get Started
          </Link>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-purple-400 text-sm font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-black mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: April 29, 2026</p>
        </div>
        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <p>When you create an account we collect your name, email address, and password (stored as a secure hash). We also collect data about agents, workflows, and knowledge base entries you create, plus usage data such as pages visited and features used.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide, maintain, and improve Apex Agents; send important service updates; respond to support requests; and analyze usage patterns. We do not sell your personal data to third parties.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data Storage and Security</h2>
            <p>Your data is stored securely using industry-standard encryption over HTTPS. Authentication tokens are stored locally in your browser and only used to verify your identity with our servers.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Third-Party Services</h2>
            <p>We use Vercel (hosting), Anthropic and OpenAI APIs (AI inference — prompts may be processed subject to their privacy policies), and Sentry (error monitoring).</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time. You can delete your account from account settings, permanently removing your data within 30 days.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Cookies</h2>
            <p>We use only essential cookies and local storage to maintain your login session and preferences. We do not use tracking or advertising cookies.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contact Us</h2>
            <p>Questions? Email us at <a href="mailto:apexadvantagetrust@gmail.com" className="text-purple-400 hover:text-purple-300">apexadvantagetrust@gmail.com</a>.</p>
          </section>
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 flex items-center gap-6 text-sm text-gray-500">
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-white transition-colors">Back to Home</Link>
        </div>
      </main>
    </div>
  );
}
