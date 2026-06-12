"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatInterface from "@/components/ChatInterface";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        <ChatInterface />
      </div>
    </ProtectedRoute>
  );
}
