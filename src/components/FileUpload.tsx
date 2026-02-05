import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage, uploadVideo } from '../lib/database';

interface FileUploadProps {
    type: 'photo' | 'video_walking' | 'video_milking';
    listingId?: string;
    onUploadComplete: (url: string, path: string) => void;
    onRemove?: () => void;
    maxSizeMB?: number;
    initialPreview?: string | null;
    accept?: string;
    label: string;
    bucket?: 'cow-photos' | 'vet-reports' | 'id-documents';
    folder?: string;
}

export function FileUpload({
    type,
    listingId,
    onUploadComplete,
    onRemove,
    maxSizeMB = 10,
    initialPreview = null,
    accept = 'image/*',
    label,
    bucket = 'cow-photos',
    folder
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(initialPreview);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSizeMB) {
            setError(`File size must be less than ${maxSizeMB}MB`);
            return;
        }

        setError(null);
        setUploading(true);

        try {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Generate unique filename
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(7);
            const extension = file.name.split('.').pop();
            const filename = `${timestamp}_${randomStr}.${extension}`;

            let result;

            if (type === 'photo') {
                const uploadFolder = folder || listingId || 'temp';
                const path = `${uploadFolder}/${filename}`;
                result = await uploadImage(file, bucket, path);
            } else {
                const videoType = type === 'video_walking' ? 'walking' : 'milking';
                result = await uploadVideo(file, listingId || 'temp', videoType);
            }

            if (result.error) {
                throw result.error;
            }

            if (result.data) {
                onUploadComplete(result.data.url, result.data.path);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const clearFile = () => {
        setPreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onRemove) {
            onRemove();
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                {label}
            </label>

            <div className="relative">
                {preview ? (
                    <div className="relative aspect-video bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200">
                        {type === 'photo' ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <video src={preview} className="w-full h-full object-cover" controls />
                        )}
                        <button
                            onClick={clearFile}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <label className="block aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl hover:border-emerald-500 transition-colors cursor-pointer">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={accept}
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                        />
                        <div className="h-full flex flex-col items-center justify-center text-slate-400">
                            {uploading ? (
                                <>
                                    <Loader2 size={32} className="animate-spin text-emerald-600 mb-2" />
                                    <p className="text-sm font-medium">Uploading...</p>
                                </>
                            ) : (
                                <>
                                    <Upload size={32} className="mb-2" />
                                    <p className="text-sm font-medium">Click to upload</p>
                                    <p className="text-xs mt-1">Max {maxSizeMB}MB</p>
                                </>
                            )}
                        </div>
                    </label>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600 font-medium">{error}</p>
            )}
        </div>
    );
}
