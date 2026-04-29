import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — Apex Agents',
  description: 'Terms and conditions for using the Apex Agents platform.',
};

export default function TermsPage() {
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
          <h1 className="text-4xl font-black mb-4">Terms of Service</h1>
          <p className="text-gray-400">Last updated: April 29, 2026</p>
        </div>
        <div className="space-y-10 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Apex Agents, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Use of the Platform</h2>
            <p>You may use Apex Agents only for lawful purposes and in accordance with these Terms. You agree not to use the platform to send spam, harass individuals, violate any applicable laws, or attempt to gain unauthorized access to any part of the service.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Your Account</h2>
            <p>You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use at apexadvantagetrust@gmail.com.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Outreach and Compliance</h2>
            <p>When using Apex Agents to send outreach messages, you are solely responsible for compliance with all applicable laws including CAN-SPAM, TCPA, GDPR, and any other regulations governing electronic communications in your jurisdiction. Apex Agents provides tools; you are responsible for how you use them.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Intellectual Property</h2>
            <p>The Apex Agents platform, including its software, design, and content, is owned by Apex Advantage and protected by intellectual property laws. Content you create using the platform remains yours.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Limitation of Liability</h2>
            <p>Apex Agents is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform, including lost revenue or business opportunities.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Termination</h2>
            <p>We reserve the right to suspend or terminate your account if you violate these Terms. You may close your account at any time from your account settings.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Changes to Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the new Terms. We will notify registered users of material changes via email.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Contact</h2>
            <p>Questions about these Terms? Contact us at <a href="mailto:apexadvantagetrust@gmail.com" className="text-purple-400 hover:text-purple-300">apexadvantagetrust@gmail.com</a>.</p>
          </section>
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 flex items-center gap-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/" className="hover:text-white transition-colors">Back to Home</Link>
        </div>
      </main>
    </div>
  );
}
