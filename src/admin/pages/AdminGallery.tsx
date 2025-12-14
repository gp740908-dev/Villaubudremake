import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    X,
    Loader2,
    Image as ImageIcon,
    Star,
    Grid,
    List,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useGalleryStore } from '@/store/galleryStore';
import { useVillaStore } from '@/store/villaStore';
import type { GalleryImage } from '@/lib/database.types';
import ImageUpload from '@/components/ui/ImageUpload';

const categories = ['Villa', 'Pool', 'Interior', 'Exterior', 'Dining', 'Spa', 'Garden', 'View'];

const AdminGallery = () => {
    const { images, isLoading, fetchImages, createImage, updateImage, deleteImage } = useGalleryStore();
    const { villas, fetchVillas } = useVillaStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        image_url: '',
        category: 'Villa',
        villa_id: '',
        is_featured: false,
        sort_order: 0,
    });

    useEffect(() => {
        fetchImages();
        fetchVillas();
    }, [fetchImages, fetchVillas]);

    useEffect(() => {
        if (selectedImage) {
            setFormData({
                title: selectedImage.title || '',
                description: selectedImage.description || '',
                image_url: selectedImage.image_url,
                category: selectedImage.category,
                villa_id: selectedImage.villa_id || '',
                is_featured: selectedImage.is_featured,
                sort_order: selectedImage.sort_order,
            });
        } else {
            setFormData({
                title: '',
                description: '',
                image_url: '',
                category: 'Villa',
                villa_id: '',
                is_featured: false,
                sort_order: images.length,
            });
        }
    }, [selectedImage, modalOpen, images.length]);

    const filteredImages = images.filter(img => {
        const matchesSearch = img.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            img.category?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || img.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleSave = async () => {
        if (!formData.image_url) {
            toast({ title: 'Image URL required', variant: 'destructive' });
            return;
        }

        setIsSaving(true);
        try {
            if (selectedImage) {
                await updateImage(selectedImage.id, formData);
                toast({ title: 'Image updated' });
            } else {
                await createImage(formData as any);
                toast({ title: 'Image added' });
            }
            setModalOpen(false);
        } catch (err) {
            toast({ title: 'Error', variant: 'destructive' });
        }
        setIsSaving(false);
    };

    const handleDelete = async (img: GalleryImage) => {
        if (window.confirm('Delete this image?')) {
            await deleteImage(img.id);
            toast({ title: 'Image deleted' });
        }
    };

    const toggleFeatured = async (img: GalleryImage) => {
        await updateImage(img.id, { is_featured: !img.is_featured });
        toast({ title: img.is_featured ? 'Removed from featured' : 'Added to featured' });
    };

    if (isLoading && images.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-[#778873]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#2d3a29]">Gallery Management</h1>
                    <p className="text-sm text-[#6b7c67]">Manage website gallery ({images.length} images)</p>
                </div>
                <button onClick={() => { setSelectedImage(null); setModalOpen(true); }} className="admin-btn admin-btn-primary">
                    <Plus size={18} />
                    Add Image
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7c67]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search images..."
                        className="admin-input pl-10"
                    />
                </div>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="admin-input w-40">
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex gap-1 p-1 bg-[#F1F3E0] rounded-lg">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}>
                        <Grid size={18} />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}>
                        <List size={18} />
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredImages.map((img) => (
                        <div key={img.id} className="admin-card overflow-hidden group relative">
                            <img src={img.image_url} alt={img.title || ''} className="w-full h-40 object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button onClick={() => { setSelectedImage(img); setModalOpen(true); }} className="p-2 bg-white rounded-full text-[#778873]">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => toggleFeatured(img)} className={`p-2 bg-white rounded-full ${img.is_featured ? 'text-yellow-500' : 'text-gray-400'}`}>
                                    <Star size={16} className={img.is_featured ? 'fill-current' : ''} />
                                </button>
                                <button onClick={() => handleDelete(img)} className="p-2 bg-white rounded-full text-red-500">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            {img.is_featured && (
                                <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-400 text-white text-xs rounded">Featured</span>
                            )}
                            <div className="p-3">
                                <p className="font-medium text-sm text-[#2d3a29] truncate">{img.title || 'Untitled'}</p>
                                <p className="text-xs text-[#6b7c67]">{img.category}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="admin-card overflow-hidden">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th className="w-20">Image</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Featured</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredImages.map((img) => (
                                <tr key={img.id}>
                                    <td>
                                        <img src={img.image_url} alt="" className="w-16 h-12 object-cover rounded" />
                                    </td>
                                    <td className="font-medium text-[#2d3a29]">{img.title || 'Untitled'}</td>
                                    <td><span className="px-2 py-1 bg-[#F1F3E0] rounded text-xs">{img.category}</span></td>
                                    <td>
                                        <button onClick={() => toggleFeatured(img)}>
                                            <Star size={18} className={img.is_featured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                                        </button>
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button onClick={() => { setSelectedImage(img); setModalOpen(true); }} className="p-2 hover:bg-[#F1F3E0] rounded text-[#778873]">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(img)} className="p-2 hover:bg-red-50 rounded text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {filteredImages.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <ImageIcon size={48} className="mx-auto text-[#d4dbc8] mb-4" />
                    <p className="text-[#6b7c67]">No images found.</p>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-[#d4dbc8] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#2d3a29]">
                                {selectedImage ? 'Edit Image' : 'Add Image'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-[#F1F3E0] rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Image *</label>
                                <ImageUpload
                                    value={formData.image_url}
                                    onChange={(url) => setFormData({ ...formData, image_url: url as string })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Title</label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="admin-input" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="admin-input" rows={2} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#2d3a29] mb-2">Category</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="admin-input">
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#2d3a29] mb-2">Villa</label>
                                    <select value={formData.villa_id} onChange={(e) => setFormData({ ...formData, villa_id: e.target.value })} className="admin-input">
                                        <option value="">None</option>
                                        {villas.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="featured" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-5 h-5" />
                                <label htmlFor="featured" className="text-sm font-medium text-[#2d3a29]">Featured image</label>
                            </div>
                        </div>
                        <div className="p-6 border-t border-[#d4dbc8] flex justify-end gap-3">
                            <button onClick={() => setModalOpen(false)} className="admin-btn admin-btn-outline">Cancel</button>
                            <button onClick={handleSave} className="admin-btn admin-btn-primary" disabled={isSaving}>
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGallery;
