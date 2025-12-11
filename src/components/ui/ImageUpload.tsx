import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
    value?: string | string[];
    onChange: (url: string | string[]) => void;
    multiple?: boolean;
    bucket?: string;
    folder?: string;
    className?: string;
}

const ImageUpload = ({
    value = '',
    onChange,
    multiple = false,
    bucket = 'images',
    folder = '',
    className = '',
}: ImageUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Normalize value to array for easier handling
    const currentImages = Array.isArray(value) ? value : value ? [value] : [];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const newUrls: string[] = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileExt = file.name.split('.').pop();
                const fileName = `${folder ? folder + '/' : ''}${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

                const { data, error } = await supabase.storage
                    .from(bucket)
                    .upload(fileName, file);

                if (error) throw error;

                if (data) {
                    const { data: { publicUrl } } = supabase.storage
                        .from(bucket)
                        .getPublicUrl(fileName);
                    newUrls.push(publicUrl);
                }
            }

            if (multiple) {
                onChange([...currentImages, ...newUrls]);
            } else {
                onChange(newUrls[0]);
            }

            toast({ title: 'Image uploaded successfully' });
        } catch (error: any) {
            console.error('Upload error:', error);
            toast({
                title: 'Upload failed',
                description: error.message || 'Please try again',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const removeImage = (urlToRemove: string) => {
        if (multiple) {
            onChange(currentImages.filter(url => url !== urlToRemove));
        } else {
            onChange('');
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Image Preview Grid */}
            {currentImages.length > 0 && (
                <div className={`grid gap-4 ${multiple ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1'}`}>
                    {currentImages.map((url, index) => (
                        <div key={index} className="relative group aspect-video rounded-xl overflow-hidden border border-input">
                            <img
                                src={url}
                                alt="Uploaded"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => removeImage(url)}
                                    className="p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {(multiple || currentImages.length === 0) && (
                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple={multiple}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full h-32 border-2 border-dashed border-input hover:border-primary rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-all cursor-pointer"
                    >
                        {isUploading ? (
                            <Loader2 size={24} className="animate-spin" />
                        ) : (
                            <Upload size={24} />
                        )}
                        <span className="text-sm font-medium">
                            {isUploading ? 'Uploading...' : `Click to upload ${multiple ? 'images' : 'image'}`}
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
