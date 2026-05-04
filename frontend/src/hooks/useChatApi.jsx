import useApi from "./useApi";

const useChatApi = () => {
  const { error, loading, executeRequest } = useApi();

  const getSessions = () => executeRequest("/api/chat/sessions");

  const getSession = (sessionId) =>
    executeRequest(`/api/chat/sessions/${sessionId}`);

  const createSession = (noteIds) =>
    executeRequest("/api/chat/sessions", {
      method: "POST",
      body: JSON.stringify({ noteIds }),
    });

  const deleteSession = (sessionId) =>
    executeRequest(`/api/chat/sessions/${sessionId}`, {
      method: "DELETE",
    });

  const sendMessage = (sessionId, message) =>
    executeRequest(`/api/chat/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });

  return {
    error,
    loading,
    getSessions,
    getSession,
    createSession,
    deleteSession,
    sendMessage,
  };
};

export default useChatApi;