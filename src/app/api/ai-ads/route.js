export async function POST(req) {
  try {
    const {
      appName,
      description,
      platforms,
      adType,
      tone,
      cta,
      budget,
      country
    } = await req.json();

    // Validate required fields
    if (!appName || !description) {
      return new Response(
        JSON.stringify({ error: 'App name and description are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate AI ad content using template-based approach
    const generatedContent = generateAdContent({
      appName,
      description,
      platforms,
      adType,
      tone,
      cta,
      budget,
      country
    });

    return new Response(JSON.stringify(generatedContent), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('AI Ads generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate ads' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Template-based ad generation (will be replaced with real LLM later)
function generateAdContent({ appName, description, platforms, adType, tone, cta, budget, country }) {
  const platformText = platforms && platforms.length > 0
    ? platforms.join(', ')
    : 'social media';

  // Generate Primary Text based on tone
  const primaryText = generatePrimaryText({ appName, description, tone, cta, platformText });

  // Generate Hook Lines
  const hooks = generateHooks({ appName, description, tone, adType });

  // Generate Script Outline
  const script = generateScript({ appName, description, adType, cta });

  // Generate Variations
  const variations = generateVariations({ appName, description, tone, cta });

  return {
    primaryText,
    hooks,
    script,
    variations
  };
}

function generatePrimaryText({ appName, description, tone, cta, platformText }) {
  const ctaText = cta || 'Get Started';

  if (tone === 'High-energy Banglish') {
    return `🔥 Bro/Sis! ${appName} নিয়ে ready তো?

${description}

এখনই ${ctaText} করো আর দেখো কেমন মজা! Perfect solution খুঁজছিলে? এইতো আছে!

আর wait কেন? ${platformText}-এ আজই try করো! 💯

${ctaText} 👇`;
  } else if (tone === 'Simple Bangla (দাল-ভাত স্টাইল)') {
    return `${appName} দিয়ে আপনার কাজ হবে সহজ!

${description}

এখনই শুরু করুন - ${ctaText}

সহজ, দ্রুত আর কার্যকর। আর দেরি কেন?

${ctaText} 👉`;
  } else {
    // Professional English
    return `Introducing ${appName} - Your Ultimate Solution

${description}

Why choose ${appName}?
✅ Easy to use
✅ Fast and reliable
✅ Trusted by thousands

Ready to transform your experience? ${ctaText} today and see the difference!

${ctaText} 👇`;
  }
}

function generateHooks({ appName, description, tone, adType }) {
  const baseHooks = [
    `🔥 ${appName} will change how you work`,
    `💡 Stop wasting time - ${appName} has the solution`,
    `⚡ Get results 10x faster with ${appName}`,
    `🎯 Everything you need in one place`,
    `✨ The easiest way to achieve your goals`,
    `💪 Join thousands of happy users`,
    `🚀 Your success starts here`
  ];

  if (tone === 'High-energy Banglish') {
    return [
      `🔥 Bro/Sis! ${appName} দিয়ে জীবন হবে easy`,
      `💡 Problem solve করতে চাও? এইতো solution!`,
      `⚡ দ্রুত result চাও? ${appName} আছে না!`,
      `🎯 সব কিছু এক জায়গায় - মজা না?`,
      `✨ এত সহজ app আর খুঁজে পাবা না`,
      `💪 হাজার হাজার user already use করতেছে`,
      `🚀 Success এর shortcut খুঁজছো? এইতো!`
    ];
  } else if (tone === 'Simple Bangla (দাল-ভাত স্টাইল)') {
    return [
      `🔥 ${appName} দিয়ে কাজ হবে সহজ`,
      `💡 সমস্যার সমাধান পেয়ে গেছেন`,
      `⚡ দ্রুত ফলাফল চান? ${appName} ব্যবহার করুন`,
      `🎯 সব কিছু এক জায়গায়`,
      `✨ খুবই সহজ এবং কার্যকর`,
      `💪 হাজারেরও বেশি মানুষ ব্যবহার করছেন`,
      `🚀 আপনার সাফল্য শুরু হোক আজ থেকেই`
    ];
  }

  return baseHooks;
}

function generateScript({ appName, description, adType, cta }) {
  const ctaText = cta || 'Get Started';

  if (adType === 'UGC Script') {
    return `Scene 1: Problem Introduction (0-5s)
[User looking frustrated at their phone/computer]
"Ugh, I've been struggling with this for hours..."

Scene 2: Discovery (5-10s)
[User discovers the app]
"Wait... what's this? ${appName}?"

Scene 3: App Demo (10-20s)
[Quick screen recording showing key features]
"Wow, this actually works! Look at this - ${description}"

Scene 4: Results & CTA (20-30s)
[User looking happy and satisfied]
"I can't believe I didn't find this sooner! If you're dealing with the same problem, you NEED to try ${appName}. ${ctaText} now - link in bio!"`;
  } else if (adType === 'Short video ad') {
    return `Scene 1: Hook (0-3s)
[Fast-paced visuals, trending music]
Text overlay: "Stop doing it the hard way"

Scene 2: Problem (3-8s)
[Quick cuts showing common pain points]
Voiceover: "Tired of wasting time?"

Scene 3: Solution (8-15s)
[App interface demo with smooth transitions]
Voiceover: "${appName} makes it easy. ${description}"

Scene 4: Benefits (15-23s)
[Happy users, positive reviews, key features]
Text overlays: "✓ Fast", "✓ Easy", "✓ Reliable"

Scene 5: CTA (23-30s)
[App logo, download button animation]
Voiceover: "${ctaText} today!"`;
  } else {
    return `Scene 1: Attention Grabber (0-5s)
[Bold visual or surprising statement]
Hook the viewer immediately

Scene 2: Present the Problem (5-10s)
Show the pain point your audience faces

Scene 3: Introduce ${appName} (10-15s)
Demonstrate how the app solves the problem

Scene 4: Show Value (15-25s)
Highlight key features and benefits

Scene 5: Strong CTA (25-30s)
Clear call-to-action: ${ctaText}`;
  }
}

function generateVariations({ appName, description, tone, cta }) {
  const ctaText = cta || 'Try it now';

  if (tone === 'High-energy Banglish') {
    return [
      `${appName} ছাড়া আর কি লাগবে? ${description} - এখনই ${ctaText}! 🔥`,
      `Bro! এত দিন কোথায় ছিলা? ${appName} এর মধ্যে magic আছে! ${description} ${ctaText} করো আর দেখো! ⚡`,
      `${description} - হ্যাঁ ভাই, এত easy! ${appName} দিয়ে সব হবে! ${ctaText} 💪`
    ];
  } else if (tone === 'Simple Bangla (দাল-ভাত স্টাইল)') {
    return [
      `${appName} - ${description} সহজ সমাধান। ${ctaText}।`,
      `আপনার কাজ সহজ করতে ${appName}। ${description} এখনই শুরু করুন।`,
      `${description} ${appName} দিয়ে সবকিছু সহজ। ${ctaText}।`
    ];
  } else {
    return [
      `${appName}: ${description} ${ctaText} and experience the difference!`,
      `Looking for a better way? ${appName} delivers. ${description} ${ctaText}!`,
      `${description} With ${appName}, it's never been easier. ${ctaText} today!`
    ];
  }
}
