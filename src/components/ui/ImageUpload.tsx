import { useState, useRef, useEffect } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
    value?: string | string[];
    onChange: (url: string | string[]) => void;
    multiple?: boolean;
    bucket?:  string;
    folder?: string;
    className?: string;
}

const ImageUpload = ({
    value = '',
    onChange,
    multiple = false,
    bucket = 'images',
    folder = 'uploads',
    className = '',
}: ImageUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [bucketError, setBucketError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Normalize value to array for easier handling
    const currentImages = Array.isArray(value) ? value : value ? [value] : [];

    // ✅ Verify bucket exists on mount
    useEffect(() => {
        const checkBucket = async () => {
            try {
                const { data: buckets, error } = await supabase. storage. listBuckets();
                
                if (error) {
                    setBucketError(`Error checking buckets: ${error.message}`);
                    return;
                }

                const bucketExists = buckets?.some(b => b.id === bucket);
                
                if (!bucketExists) {
                    setBucketError(
                        `❌ Bucket "${bucket}" tidak ditemukan. Silakan buat bucket di Supabase Storage terlebih dahulu.`
                    );
                } else {
                    setBucketError(null);
                }
            } catch (err:  any) {
                console.error('Bucket check error:', err);
                setBucketError(`Gagal mengecek bucket: ${err.message}`);
            }
        };

        checkBucket();
    }, [bucket]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Check bucket exists before uploading
        if (bucketError) {
            toast({
                title: 'Bucket Error',
                description: bucketError,
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        const newUrls: string[] = [];
        let successCount = 0;

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    toast({
                        title: 'File tidak valid',
                        description: `${file.name} bukan file gambar`,
                        variant: 'destructive',
                    });
                    continue;
                }

                // Validate file size (5MB)
                const maxSize = 5 * 1024 * 1024;
                if (file.size > maxSize) {
                    toast({
                        title: 'File terlalu besar',
                        description: `${file.name} lebih dari 5MB`,
                        variant: 'destructive',
                    });
                    continue;
                }

                try {
                    const fileExt = file.name.split('.').pop()?. toLowerCase() || 'jpg';
                    const timestamp = Date.now();
                    const randomId = Math.random().toString(36).substring(2, 9);
                    const fileName = `${folder}/${randomId}-${timestamp}.${fileExt}`;

                    console.log(`📤 Uploading to ${bucket}/${fileName}...`);

                    // Upload file
                    const { data, error:  uploadError } = await supabase.storage
                        .from(bucket)
                        .upload(fileName, file, {
                            cacheControl: '3600',
                            upsert: false,
                        });

                    if (uploadError) {
                        console.error(`Upload error for ${file.name}:`, uploadError);
                        
                        // Detailed error message
                        let errorMsg = uploadError.message;
                        
                        if (uploadError.message.includes('row level security')) {
                            errorMsg = 'RLS policy tidak mengizinkan upload.  Admin perlu fix RLS policies.';
                        } else if (uploadError.message.includes('not found')) {
                            errorMsg = `Bucket "${bucket}" tidak ditemukan di Supabase`;
                        }
                        
                        toast({
                            title: 'Upload gagal',
                            description: `${file.name}:  ${errorMsg}`,
                            variant: 'destructive',
                        });
                        continue;
                    }

                    if (data) {
                        // Get public URL
                        const { data: urlData } = supabase.storage
                            . from(bucket)
                            . getPublicUrl(fileName);

                        if (urlData?. publicUrl) {
                            newUrls.push(urlData. publicUrl);
                            successCount++;
                            console.log(`✅ Uploaded:  ${urlData.publicUrl}`);
                        }
                    }

                    setUploadProgress(((i + 1) / files.length) * 100);
                } catch (err: any) {
                    console.error(`Error uploading ${file.name}: `, err);
                    toast({
                        title: 'Upload error',
                        description: err.message || 'Gagal upload file',
                        variant: 'destructive',
                    });
                }
            }

            if (successCount === 0) {
                throw new Error('Tidak ada file yang berhasil diupload');
            }

            // Update images
            if (multiple) {
                onChange([...currentImages, ...newUrls]);
            } else {
                onChange(newUrls[0]);
            }

            toast({
                title: '✅ Sukses',
                description: `${successCount} gambar berhasil diupload`,
            });
        } catch (error:  any) {
            console.error('Upload process error:', error);
            toast({
                title: 'Error',
                description: error.message || 'Gagal upload gambar',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current. value = '';
            }
        }
    };

    const removeImage = (urlToRemove:  string) => {
        if (multiple) {
            onChange(currentImages.filter(url => url !== urlToRemove));
        } else {
            onChange('');
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Error Alert */}
            {bucketError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-800">Bucket Error</p>
                        <p className="text-sm text-red-700 mt-1">{bucketError}</p>
                    </div>
                </div>
            )}

            {/* Image Preview Grid */}
            {currentImages. length > 0 && (
                <div className={`grid gap-4 ${multiple ? 'grid-cols-2 sm: grid-cols-3 md:grid-cols-4' :  'grid-cols-1'}`}>
                    {currentImages.map((url, index) => (
                        <div
                            key={index}
                            className="relative group aspect-square rounded-xl overflow-hidden border border-[#d4dbc8] hover:border-[#778873] transition-colors"
                        >
                            <img
                                src={url}
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    console.error('Image failed to load:', url);
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22. 3em%22 fill=%22%23999%22 font-size=%2216%22%3EImage not found%3C/text%3E%3C/svg%3E';
                                }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => removeImage(url)}
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Featured indicator */}
                            {index === 0 && (
                                <span className="absolute top-2 left-2 text-xs bg-[#778873] text-white px-2 py-1 rounded">
                                    Featured
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {(multiple || currentImages.length === 0) && (
                <div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || !!bucketError}
                        className="w-full p-4 border-2 border-dashed border-[#A1BC98] rounded-xl hover:border-[#778873] hover:bg-[#F1F3E0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Upload size={24} className="text-[#778873]" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-[#2d3a29]">
                                    {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Klik untuk upload gambar'}
                                </p>
                                <p className="text-xs text-[#6b7c67]">
                                    {multiple ? 'Bisa upload multiple' : 'Max 5MB per file'}
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Progress Bar */}
                    {isUploading && uploadProgress > 0 && (
                        <div className="mt-3 w-full bg-[#d4dbc8] rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-[#778873] h-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple={multiple}
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading || !! bucketError}
                        className="hidden"
                    />
                </div>
            )}

            {/* Debug Info (Development) */}
            {process. env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700">
                    <p>Bucket: {bucket}</p>
                    <p>Folder: {folder}</p>
                    <p>Images: {currentImages.length}</p>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
