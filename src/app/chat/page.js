"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import TopNav from "@/components/TopNav";
import { onAuthChange } from "@/lib/firebase";
import {
  subscribeToConversations,
  subscribeToMessages,
  sendMessage,
  markMessagesAsRead,
} from "@/lib/firestore";

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [toast, setToast] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Load conversation from URL query
  useEffect(() => {
    const conversationId = searchParams.get("c");
    if (conversationId) {
      setActiveConversationId(conversationId);
    }
  }, [searchParams]);

  // Subscribe to conversations
  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      setLoadingConversations(false);
      return;
    }

    setLoadingConversations(true);

    const unsubscribe = subscribeToConversations(currentUser.uid, (convos) => {
      setConversations(convos);
      setLoadingConversations(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Subscribe to messages in active conversation
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);

    const unsubscribe = subscribeToMessages(activeConversationId, (msgs) => {
      setMessages(msgs);
      setLoadingMessages(false);

      // Mark messages as read
      if (currentUser) {
        markMessagesAsRead(activeConversationId, currentUser.uid).catch((err) =>
          console.error("Error marking messages as read:", err)
        );
      }
    });

    return () => unsubscribe();
  }, [activeConversationId, currentUser]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSelectConversation = (conversationId) => {
    setActiveConversationId(conversationId);
    router.push(`/chat?c=${conversationId}`, { scroll: false });
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();

    if (!messageText.trim() || !currentUser || !activeConversationId || isSending) {
      return;
    }

    setIsSending(true);

    try {
      await sendMessage(activeConversationId, currentUser.uid, messageText);
      setMessageText("");
      textareaRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      showToast("Failed to send message", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getOtherUser = (conversation) => {
    if (!currentUser || !conversation) return null;

    const otherUserId = conversation.participants.find(
      (uid) => uid !== currentUser.uid
    );

    return conversation.participantDetails?.[otherUserId] || null;
  };

  const hasUnreadMessages = (conversation) => {
    if (!currentUser) return false;

    // Check if last message is from other user and current user hasn't read it
    return (
      conversation.lastSenderId &&
      conversation.lastSenderId !== currentUser.uid &&
      messages.some(
        (msg) =>
          msg.senderId !== currentUser.uid &&
          (!msg.readBy || !msg.readBy.includes(currentUser.uid))
      )
    );
  };

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const otherUser = getOtherUser(activeConversation);

  // If not signed in
  if (!currentUser) {
    return (
      <main className="min-h-screen relative overflow-x-hidden">
        {/* Subtle Animated Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="bg-orb bg-orb-purple w-96 h-96 top-1/4 left-1/4 opacity-10"></div>
          <div className="bg-orb bg-orb-pink w-96 h-96 bottom-1/4 right-1/4 opacity-10" style={{animationDelay: '7s'}}></div>
        </div>

        <div className="relative z-10 py-8">
          <TopNav />
        </div>

        <div className="relative z-10 max-w-md mx-auto px-4 py-16">
          <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl p-12 text-center shadow-[inset_0_0_15px_rgba(255,255,255,0.1)]">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">💬</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Please Sign In</h2>
            <p className="text-white/70">Sign in to use Messenger and chat with other users</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-x-hidden">
      {/* Subtle Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="bg-orb bg-orb-purple w-96 h-96 top-1/4 left-1/4 opacity-10"></div>
        <div className="bg-orb bg-orb-pink w-96 h-96 bottom-1/4 right-1/4 opacity-10" style={{animationDelay: '7s'}}></div>
        <div className="bg-orb bg-orb-blue w-80 h-80 top-1/2 right-1/3 opacity-10" style={{animationDelay: '14s'}}></div>
      </div>

      {/* TopNav */}
      <div className="relative z-10 py-8">
        <TopNav />
      </div>

      {/* Page Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-8">
        {/* Page Header */}
        <div className="mb-6 animate-fade-up">
          <h1 className="text-4xl font-bold text-white mb-2">Messages</h1>
          <p className="text-white/70">Talk with builders and collaborators</p>
        </div>

        {/* Main Chat Container */}
        <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] overflow-hidden animate-fade-up delay-100">
          <div className="grid lg:grid-cols-[320px_1fr] h-[calc(100vh-280px)] min-h-[500px]">
            {/* LEFT: Conversations List */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 overflow-y-auto custom-scrollbar">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white">Conversations</h2>
              </div>

              <div className="divide-y divide-white/5">
                {loadingConversations ? (
                  // Loading skeleton
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-4 animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-white/10 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-white/10 rounded w-3/4"></div>
                          <div className="h-3 bg-white/10 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : conversations.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">💬</span>
                    </div>
                    <p className="text-white/60 text-sm">No conversations yet</p>
                    <p className="text-white/40 text-xs mt-1">
                      Click &quot;Message&quot; on a post to start chatting
                    </p>
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const other = getOtherUser(conversation);
                    const isActive = conversation.id === activeConversationId;
                    const hasUnread = hasUnreadMessages(conversation);

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation.id)}
                        className={`w-full p-4 text-left transition-colors ${
                          isActive
                            ? "bg-gradient-to-r from-purple-500/30 to-blue-500/30"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Avatar */}
                          {other?.photoURL ? (
                            <img
                              src={other.photoURL}
                              alt={other.displayName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                              <span className="text-white/70 text-lg">
                                {other?.displayName?.charAt(0).toUpperCase() || "?"}
                              </span>
                            </div>
                          )}

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-white font-semibold truncate">
                                {other?.displayName || "User"}
                              </h3>
                              {hasUnread && (
                                <div className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0"></div>
                              )}
                            </div>
                            <p className="text-white/60 text-sm truncate">
                              {conversation.lastMessage || "No messages yet"}
                            </p>
                            {conversation.updatedAt && (
                              <p className="text-white/40 text-xs mt-1">
                                {formatDistanceToNow(
                                  conversation.updatedAt.toDate
                                    ? conversation.updatedAt.toDate()
                                    : new Date(conversation.updatedAt),
                                  { addSuffix: true }
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT: Active Chat */}
            <div className="flex flex-col">
              {!activeConversationId ? (
                // Empty state
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center max-w-sm">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-6xl">👋</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-white/60">
                      Choose a conversation from the left to start chatting
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    {otherUser?.photoURL ? (
                      <img
                        src={otherUser.photoURL}
                        alt={otherUser.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="text-white/70">
                          {otherUser?.displayName?.charAt(0).toUpperCase() || "?"}
                        </span>
                      </div>
                    )}
                    <h3 className="text-white font-semibold">
                      {otherUser?.displayName || "User"}
                    </h3>
                  </div>

                  {/* Messages List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">💬</span>
                          </div>
                          <p className="text-white/60 text-sm">No messages yet</p>
                          <p className="text-white/40 text-xs mt-1">
                            Send a message to start the conversation
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const isMe = message.senderId === currentUser.uid;
                        const isLastMessage = index === messages.length - 1;
                        const isRead =
                          message.readBy &&
                          message.readBy.some((uid) => uid !== message.senderId);

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                                isMe
                                  ? "bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                                  : "bg-white/5 backdrop-blur-md text-white/90"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words">
                                {message.text}
                              </p>
                              <div
                                className={`text-xs mt-1 flex items-center gap-1 ${
                                  isMe ? "text-white/70 justify-end" : "text-white/50"
                                }`}
                              >
                                {message.createdAt && (
                                  <span>
                                    {formatDistanceToNow(
                                      message.createdAt.toDate
                                        ? message.createdAt.toDate()
                                        : new Date(message.createdAt),
                                      { addSuffix: true }
                                    )}
                                  </span>
                                )}
                                {isMe && isLastMessage && isRead && (
                                  <span>• ✓✓ Seen</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Composer */}
                  <div className="p-4 border-t border-white/10">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <textarea
                        ref={textareaRef}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message... (Shift+Enter for new line)"
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 custom-scrollbar"
                        rows={2}
                        maxLength={1000}
                        disabled={isSending}
                      />
                      <button
                        type="submit"
                        disabled={!messageText.trim() || isSending}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500/80 to-blue-500/80 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all self-end backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                      >
                        {isSending ? (
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          "Send"
                        )}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-8"></div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
          <div
            className={`px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              toast.type === "success"
                ? "bg-green-500/90 border-green-400/50 text-white"
                : "bg-red-500/90 border-red-400/50 text-white"
            }`}
          >
            <p className="font-semibold">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fade-up 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }

        .delay-100 {
          animation-delay: 100ms;
        }

        .delay-1000 {
          animation-delay: 1000ms;
        }

        .delay-2000 {
          animation-delay: 2000ms;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen relative overflow-x-hidden flex items-center justify-center">
        <div className="text-white text-lg">Loading chat...</div>
      </main>
    }>
      <ChatContent />
    </Suspense>
  );
}
