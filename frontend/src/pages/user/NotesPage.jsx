import useFetch from '../../hooks/useFetch';
import NoteCard from '../../components/notes/NoteCard';

const NotesPage = () => {
    const { data, loading, error } = useFetch('/api/notes');

    return (
        <div className="min-h-[80vh] bg-bg-subtle py-10 px-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-text-primary mb-2">Browse Notes</h1>
                <p className="text-text-secondary mb-8">
                    Community-shared study materials, verified and approved.
                </p>

                {loading && <p className="text-text-secondary">Loading notes...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {data?.notes?.length === 0 && (
                    <p className="text-text-secondary">No notes available yet.</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data?.notes?.map((note) => (
                        <NoteCard key={note._id} note={note} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotesPage;