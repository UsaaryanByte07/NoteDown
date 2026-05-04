import { useState, useEffect, useCallback } from "react";
import useChatApi from "../../hooks/useChatApi";
import useFetch from "../../hooks/useFetch";
import SessionSidebar from "../../components/chat/SessionSidebar";
import NoteSelector from "../../components/chat/NoteSelector";
import ChatWindow from "../../components/chat/ChatWindow";

const ChatPage = () => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [view, setView] = useState("sessions"); // "sessions" | "select-notes" | "chat"
  const [sessionsLoading, setSessionsLoading] = useState(true);

  const chatApi = useChatApi();

  // Fetch all available approved notes
  const { data: notesData } = useFetch("/api/notes");
  const availableNotes = notesData?.notes || [];

  // Fetch user's chat sessions 
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    const res = await chatApi.getSessions();
    if (res.success) {
      setSessions(res.data.sessions || []);
    }
    setSessionsLoading(false);
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Open an existing session
  const handleOpenSession = useCallback(async (sessionId) => {
    const res = await chatApi.getSession(sessionId);
    if (res.success) {
      setActiveSessionId(sessionId);
      setActiveSession(res.data.session);
      setMessages(res.data.messages || []);
      setView("chat");
    }
  }, []);

  // Create a new session
  const handleCreateSession = useCallback(async (noteIds) => {
    const res = await chatApi.createSession(noteIds);
    if (res.success) {
      await fetchSessions();
      await handleOpenSession(res.data.session._id);
    }
    return res;
  }, [fetchSessions, handleOpenSession]);

  // Delete a session
  const handleDeleteSession = useCallback(async (sessionId) => {
    const res = await chatApi.deleteSession(sessionId);
    if (res.success) {
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setActiveSession(null);
        setMessages([]);
        setView("sessions");
      }
      await fetchSessions();
    }
    return res;
  }, [activeSessionId, fetchSessions]);

  //Send a message
  const handleSendMessage = useCallback(async (message) => {
    const res = await chatApi.sendMessage(activeSessionId, message);
    if (res.success) {
      setMessages((prev) => [
        ...prev,
        res.data.userMessage,
        res.data.aiMessage,
      ]);
    }
    return res;
  }, [activeSessionId]);

  // Go back to session list
  const handleBack = useCallback(() => {
    setActiveSessionId(null);
    setActiveSession(null);
    setMessages([]);
    setView("sessions");
  }, []);

  return (
    <div className="min-h-[80vh] bg-bg-subtle">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-120px)]">
          {/* ── Sidebar: Session List ────────────────────── */}
           <div className={`${view === "chat" ? "hidden md:block" : ""}`}>
            <SessionSidebar
              sessions={sessions}
              activeSessionId={activeSessionId}
              loading={sessionsLoading}
              onOpenSession={handleOpenSession}
              onNewChat={() => setView("select-notes")}
              onDeleteSession={handleDeleteSession}
            />
          </div>
          
          {/* ── Main Content Area ────────────────────────── */}
          <div className="flex-1 flex flex-col min-h-0">
            {view === "sessions" && (
              <div className="flex-1 flex items-center justify-center bg-bg rounded-2xl border border-border">
                <div className="text-center text-text-secondary">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-lg font-medium">NoteDown AI Chat</p>
                  <p className="text-sm mt-1">
                    Select a session or create a new one to start chatting.
                  </p>
                  <button
                    onClick={() => setView("select-notes")}
                    className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                  >
                    + New Chat
                  </button>
                </div>
              </div>
            )}

            {view === "select-notes" && (
              <NoteSelector
                notes={availableNotes}
                onCreateSession={handleCreateSession}
                onCancel={() => setView("sessions")}
                loading={chatApi.loading}
              />
            )}

            {view === "chat" && activeSession && (
              <ChatWindow
                session={activeSession}
                messages={messages}
                onSendMessage={handleSendMessage}
                onBack={handleBack}
                loading={chatApi.loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;