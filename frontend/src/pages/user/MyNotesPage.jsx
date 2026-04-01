import { useState, useEffect } from "react";
import useFetch from "../../hooks/useFetch";
import NoteCard from "../../components/notes/NoteCard";
import StorageBar from "../../components/notes/StorageBar";
import Spinner from "../../components/Spinner";
import useApi from "../../hooks/useApi";

const MyNotesPage = () => {
  const { data, loading, error, refetch } = useFetch("/api/notes/my-notes");
  const storageData = useFetch("/api/notes/my-storage");
  const { executeRequest } = useApi();
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Poll for status updates if there are pending/scanning notes
  useEffect(() => {
    let interval;
    const hasPendingNotes = data?.notes?.some(
      (note) => note.status === "scanning" || note.status === "pending"
    );

    if (hasPendingNotes) {
      // Poll every 5 seconds without showing the global loading spinner
      interval = setInterval(() => {
        if (refetch) refetch(false);
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [data, refetch]);

  const handleDelete = async (noteId) => {
    setDeleteLoading(noteId);
    try {
      const result = await executeRequest(`/api/notes/my-notes/${noteId}`, {
        method: "DELETE",
      });
      if (result.success) {
        if (refetch) refetch();
        if (storageData.refetch) storageData.refetch(); // Refresh storage bar too
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="min-h-[80vh] bg-bg-subtle py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-2">My Notes</h1>
        <p className="text-text-secondary mb-6">
          Track the status of your uploaded notes.
        </p>

        {/* Storage Usage Bar */}
        <StorageBar storage={storageData.data?.storage} />

        {loading && <Spinner size="lg" />}
        {error && <p className="text-danger">{error}</p>}

        {data?.notes?.length === 0 && (
          <p className="text-text-secondary">
            You haven't uploaded any notes yet.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.notes?.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              showStatus={true}
              showDelete={true}
              onDelete={handleDelete}
              deleteLoading={deleteLoading === note._id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyNotesPage;
