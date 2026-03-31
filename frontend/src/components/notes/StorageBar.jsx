const StorageBar = ({ storage }) => {
    if (!storage) return null;

    return (
        <div className="bg-bg border border-border rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm text-text-secondary mb-2">
                <span>Storage Used</span>
                <span>{storage.usedMB} MB / {storage.limitMB} MB</span>
            </div>
            <div className="w-full bg-bg-subtle rounded-full h-2">
                <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(storage.percentage, 100)}%` }}
                />
            </div>
        </div>
    );
};

export default StorageBar;