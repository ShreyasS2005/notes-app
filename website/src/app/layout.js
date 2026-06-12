import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { AuthProvider } from "../hooks/useAuth";

export const metadata = {
  title: "SmartNotes AI | Your Second Brain",
  description: "Capture, organize, and enhance your thoughts with AI-powered note-taking.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white cyber-grid min-h-screen">
        <AuthProvider>
          <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-neonPurple/5 pointer-events-none" />
          <Navbar />
          <main className="relative pt-16">
            {children}
          </main>

          {/* Decorative elements */}
          <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-neonBlue/10 blur-[120px] rounded-full -z-10 animate-glow" />
          <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-neonPurple/10 blur-[120px] rounded-full -z-10 animate-glow" />
        </AuthProvider>
      </body>
    </html>
  );
}
