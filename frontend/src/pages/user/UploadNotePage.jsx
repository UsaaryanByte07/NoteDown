import { useAuth } from '../../context/auth/authContext';
import UploadForm from '../../components/notes/UploadForm';

const UploadNotePage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-[80vh] bg-bg-subtle py-10 px-6">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-text-primary mb-2">
                    Upload Notes
                </h1>
                <p className="text-text-secondary mb-8">
                    Share your study materials. Uploaded files are scanned for safety 
                    and reviewed by admins before being visible to others.
                </p>

                <UploadForm />
            </div>
        </div>
    );
};

export default UploadNotePage;