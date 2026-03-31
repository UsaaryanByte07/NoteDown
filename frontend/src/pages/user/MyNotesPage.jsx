import useFetch from '../../hooks/useFetch';
import NoteCard from '../../components/notes/NoteCard';
import StorageBar from '../../components/notes/StorageBar';

const MyNotesPage = () => {
    const { data, loading, error } = useFetch('/api/notes/my-notes');
    const storageData = useFetch('/api/notes/my-storage');

    return (
        <div className="min-h-[80vh] bg-bg-subtle py-10 px-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-text-primary mb-2">My Notes</h1>
                <p className="text-text-secondary mb-6">
                    Track the status of your uploaded notes.
                </p>

                {/* Storage Usage Bar */}
                <StorageBar storage={storageData.data?.storage} />

                {loading && <p className="text-text-secondary">Loading your notes...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {data?.notes?.length === 0 && (
                    <p className="text-text-secondary">You haven't uploaded any notes yet.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data?.notes?.map((note) => (
                        <NoteCard key={note._id} note={note} showStatus={true} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyNotesPage;