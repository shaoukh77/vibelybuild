"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Subtle Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-[600px] h-[600px] top-1/4 left-1/4 opacity-12"></div>
        <div className="bg-orb bg-orb-pink w-[500px] h-[500px] bottom-1/4 right-1/4 opacity-12" style={{animationDelay: '7s'}}></div>
        <div className="bg-orb bg-orb-blue w-[400px] h-[400px] top-1/2 right-1/3 opacity-10" style={{animationDelay: '14s'}}></div>
      </div>

      {/* TopNav */}
      <div className="relative z-10 py-8">
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

          {/* Beta Development Notice */}
          <div className="max-w-2xl mx-auto mb-12 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-orange-400 text-sm">⚠️</span>
              </div>
              <div className="text-left flex-1">
                <h3 className="text-orange-200 font-bold text-sm mb-1.5">Active Development Notice</h3>
                <p className="text-orange-100/80 text-xs leading-relaxed">
                  VibeBuild.AI is still under active development. Features may be unstable. Full Beta is launching soon. Currently supporting <strong>Web Apps only</strong>.
                </p>
              </div>
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

      {/* Footer Spacer */}
      <div className="h-20"></div>
    </main>
  );
}
