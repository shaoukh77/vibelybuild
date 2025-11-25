import "./globals.css";

export const metadata = {
  title: "VibelyBuild.AI",
  description: "VIBE-CODE ecosystem - AI-powered app builder"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
