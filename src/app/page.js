"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import BetaRibbon from "@/components/BetaRibbon";
import PreBetaNotice from "@/components/PreBetaNotice";
import Footer from "@/components/Footer";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Beta Ribbon */}
      <BetaRibbon />

      {/* Pre-Beta Notice Banner */}
      <PreBetaNotice />

      {/* Subtle Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-[600px] h-[600px] top-1/4 left-1/4 opacity-12"></div>
        <div className="bg-orb bg-orb-pink w-[500px] h-[500px] bottom-1/4 right-1/4 opacity-12" style={{animationDelay: '7s'}}></div>
        <div className="bg-orb bg-orb-blue w-[400px] h-[400px] top-1/2 right-1/3 opacity-10" style={{animationDelay: '14s'}}></div>
      </div>

      {/* TopNav */}
      <div className="relative z-10 pt-16 pb-8">
        <TopNav />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 text-center mt-24 px-4 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          {/* Pre-Beta Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-full px-5 py-2.5 mb-6 backdrop-blur-sm">
            <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]"></span>
            <span className="text-yellow-200 font-bold text-sm tracking-wide">PRE-BETA VERSION</span>
          </div>

          {/* Main Headline */}
          <h1 className="h1 mb-6">
            Build Real Apps with <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400">AI</span>
          </h1>

          <p className="sub max-w-3xl mx-auto mb-8">
            Transform your app ideas into full-stack applications. Just describe what you want—we handle the code, database, auth, and deployment.
          </p>

          {/* Pre-Beta Development Status */}
          <div className="max-w-3xl mx-auto mb-12 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-purple-500/10 border-2 border-purple-500/30 rounded-3xl p-8 backdrop-blur-md shadow-2xl shadow-purple-500/20">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center">
                <span className="text-3xl">🚧</span>
              </div>
              <div className="text-left flex-1">
                <h3 className="text-white font-bold text-lg mb-2">Pre-Beta Development Status</h3>
                <p className="text-white/70 text-sm leading-relaxed mb-4">
                  VibeBuild.AI is under <strong className="text-purple-300">heavy development</strong>. We're building the future of AI-powered app creation.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⚡</span>
                  <h4 className="text-white font-semibold text-sm">Current Features</h4>
                </div>
                <ul className="space-y-1.5 text-white/60 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Limited trial builds (3/day)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Web Apps only</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Basic AI assistance</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🔮</span>
                  <h4 className="text-white font-semibold text-sm">Coming in Full Beta</h4>
                </div>
                <ul className="space-y-1.5 text-white/60 text-xs">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">→</span>
                    <span>Unlimited builds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">→</span>
                    <span>iOS & Android apps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">→</span>
                    <span>Store publishing</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => router.push('/early-access')}
                className="px-8 py-3.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
              >
                Apply for Full Early Access →
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-all duration-300 border border-white/20"
              >
                View Pricing Plans
              </button>
            </div>
          </div>

          {/* Prompt Box */}
          <div className="glass-section max-w-3xl mx-auto mb-20">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && prompt.trim()) {
                    router.push(`/build?prompt=${encodeURIComponent(prompt)}`);
                  }
                }}
                placeholder="E.g., Finance tracker with charts, user auth, Stripe payments, real-time database..."
                className="flex-1 bg-white/5 text-white placeholder-white/40 px-5 py-4 rounded-2xl outline-none border border-white/10 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/30 transition-all"
              />
              <button
                onClick={() => prompt.trim() && router.push(`/build?prompt=${encodeURIComponent(prompt)}`)}
                className="gradient-btn px-8 py-4 whitespace-nowrap font-bold text-lg"
              >
                Build App ✨
              </button>
            </div>

            {/* Quick Tips */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-white/50 text-xs mb-2">💡 <strong className="text-white/60">Pro tips:</strong></p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-white/40">
                <div>• Mention specific screens</div>
                <div>• Include database needs</div>
                <div>• Specify auth & payments</div>
              </div>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
            {[
              "🌐 Web Apps Only (Beta)",
              "🔐 Built-in Auth",
              "📊 Real-time Database",
              "📱 Mobile Responsive",
              "⚡ Deploy-Ready"
            ].map((feature, i) => (
              <div key={i} className="pill px-4 py-2 text-sm">
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How VibelyBuild.AI Works */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 animate-fade-in">
        <div className="text-center mb-16">
          <h2 className="h2 mb-4">How VibelyBuild.AI Works</h2>
          <p className="sub max-w-2xl mx-auto">
            From idea to production-ready app in minutes
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              num: "1",
              icon: "✍️",
              title: "Describe Your App",
              desc: "Tell us your app idea with screens, features, database structure, auth requirements, and payment integration"
            },
            {
              num: "2",
              icon: "⚙️",
              title: "AI Builds Full Stack",
              desc: "Watch AI generate complete frontend, backend, database schema, and authentication in real-time"
            },
            {
              num: "3",
              icon: "👁️",
              title: "Preview & Remix",
              desc: "See your app live instantly, test it, and refine with new prompts until it's perfect"
            },
            {
              num: "4",
              icon: "🚀",
              title: "Publish to Store",
              desc: "Deploy to Vibe Store, share with the community, and let others discover your creation"
            }
          ].map((step, i) => (
            <div key={i} className="glass-card p-6 text-center relative hover:scale-105 transition-transform duration-300 group">
              <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                {step.num}
              </div>
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all">
                <span className="text-4xl">{step.icon}</span>
              </div>
              <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What You Can Build */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20 animate-fade-in">
        <div className="text-center mb-16">
          <h2 className="h2 mb-4">What You Can Build</h2>
          <p className="sub max-w-2xl mx-auto">
            Full-stack apps with auth, database, payments, and more
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { icon: "📊", title: "Dashboards", desc: "Analytics & KPIs" },
            { icon: "💼", title: "SaaS Tools", desc: "Business software" },
            { icon: "🛍️", title: "E-commerce", desc: "Online stores" },
            { icon: "📱", title: "Social Apps", desc: "Communities" },
            { icon: "🎓", title: "Learning Platforms", desc: "Courses & quizzes" },
            { icon: "🏥", title: "Healthcare", desc: "Patient portals" },
            { icon: "💰", title: "FinTech", desc: "Payment apps" },
            { icon: "🎨", title: "Creative Tools", desc: "Portfolios" },
            { icon: "📝", title: "Client Portals", desc: "Agency tools" },
            { icon: "📢", title: "Marketing Tools", desc: "Campaign managers" }
          ].map((category, i) => (
            <div key={i} className="glass-card p-4 hover:bg-white/10 transition-all group text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {category.icon}
              </div>
              <h4 className="text-white font-bold text-sm mb-1">{category.title}</h4>
              <p className="text-white/40 text-xs">
                {category.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 py-20 mb-16 animate-fade-in">
        <div className="glass-section text-center p-12">
          <h2 className="h2 mb-4">Ready to Build?</h2>
          <p className="sub max-w-2xl mx-auto mb-8">
            Join thousands of builders creating apps with AI. No coding required.
          </p>
          <button
            onClick={() => router.push('/build')}
            className="gradient-btn px-10 py-5 text-lg font-bold"
          >
            Start Building Free →
          </button>
          <p className="text-white/40 text-sm mt-6">
            No credit card required • Pre-Beta Access • Web Apps Only
          </p>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
