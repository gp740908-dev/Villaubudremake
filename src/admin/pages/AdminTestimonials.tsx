import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Star,
    X,
    Loader2,
    Quote,
    Globe,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTestimonialStore } from '@/store/testimonialStore';
import { useVillaStore } from '@/store/villaStore';
import type { Testimonial } from '@/lib/database.types';

const AdminTestimonials = () => {
    const { testimonials, isLoading, fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = useTestimonialStore();
    const { villas, fetchVillas } = useVillaStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        guest_name: '',
        guest_country: '',
        guest_avatar: '',
        villa_id: '',
        villa_name: '',
        rating: 5,
        review: '',
        host_response: '',
        is_featured: false,
    });

    useEffect(() => {
        fetchTestimonials();
        fetchVillas();
    }, []);

    useEffect(() => {
        if (selectedTestimonial) {
            setFormData({
                guest_name: selectedTestimonial.guest_name,
                guest_country: selectedTestimonial.guest_country || '',
                guest_avatar: selectedTestimonial.guest_avatar || '',
                villa_id: selectedTestimonial.villa_id || '',
                villa_name: selectedTestimonial.villa_name || '',
                rating: selectedTestimonial.rating,
                review: selectedTestimonial.review || '',
                host_response: selectedTestimonial.host_response || '',
                is_featured: selectedTestimonial.is_featured,
            });
        } else {
            setFormData({
                guest_name: '',
                guest_country: '',
                guest_avatar: '',
                villa_id: '',
                villa_name: '',
                rating: 5,
                review: '',
                host_response: '',
                is_featured: false,
            });
        }
    }, [selectedTestimonial, modalOpen]);

    const filteredTestimonials = testimonials.filter(t =>
        t.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.review?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSave = async () => {
        if (!formData.guest_name || !formData.review) {
            toast({ title: 'Required fields missing', variant: 'destructive' });
            return;
        }

        setIsSaving(true);
        try {
            if (selectedTestimonial) {
                await updateTestimonial(selectedTestimonial.id, formData);
                toast({ title: 'Testimonial updated' });
            } else {
                await createTestimonial(formData as any);
                toast({ title: 'Testimonial created' });
            }
            setModalOpen(false);
        } catch (err) {
            toast({ title: 'Error', variant: 'destructive' });
        }
        setIsSaving(false);
    };

    const handleDelete = async (t: Testimonial) => {
        if (window.confirm(`Delete testimonial from "${t.guest_name}"?`)) {
            await deleteTestimonial(t.id);
            toast({ title: 'Testimonial deleted' });
        }
    };

    if (isLoading && testimonials.length === 0) {
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
                    <h1 className="text-2xl font-bold text-[#2d3a29]">Testimonials</h1>
                    <p className="text-sm text-[#6b7c67]">Manage guest reviews ({testimonials.length})</p>
                </div>
                <button onClick={() => { setSelectedTestimonial(null); setModalOpen(true); }} className="admin-btn admin-btn-primary">
                    <Plus size={18} />
                    Add Testimonial
                </button>
            </div>

            <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7c67]" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search testimonials..."
                    className="admin-input pl-10"
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {filteredTestimonials.map((t) => (
                    <div key={t.id} className="admin-card p-4">
                        <div className="flex items-start gap-4">
                            <img
                                src={t.guest_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.guest_name)}&background=778873&color=fff`}
                                alt={t.guest_name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-[#2d3a29]">{t.guest_name}</h3>
                                        {t.guest_country && (
                                            <p className="text-sm text-[#6b7c67] flex items-center gap-1">
                                                <Globe size={12} />
                                                {t.guest_country}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                className={i < t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-[#6b7c67] mt-2 line-clamp-3">
                                    <Quote size={12} className="inline mr-1" />
                                    {t.review}
                                </p>
                                {t.villa_name && (
                                    <p className="text-xs text-[#778873] mt-2">Villa: {t.villa_name}</p>
                                )}
                                {t.is_featured && (
                                    <span className="inline-block mt-2 px-2 py-1 bg-[#A1BC98]/20 text-[#778873] text-xs rounded">Featured</span>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4 pt-4 border-t border-[#d4dbc8]">
                            <button onClick={() => { setSelectedTestimonial(t); setModalOpen(true); }} className="flex-1 admin-btn admin-btn-outline py-2 text-sm">
                                <Edit2 size={14} /> Edit
                            </button>
                            <button onClick={() => handleDelete(t)} className="p-2 hover:bg-red-50 rounded-lg text-red-500">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredTestimonials.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <Quote size={48} className="mx-auto text-[#d4dbc8] mb-4" />
                    <p className="text-[#6b7c67]">No testimonials found.</p>
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-[#d4dbc8] flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[#2d3a29]">
                                {selectedTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-[#F1F3E0] rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#2d3a29] mb-2">Guest Name *</label>
                                    <input type="text" value={formData.guest_name} onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })} className="admin-input" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#2d3a29] mb-2">Country</label>
                                    <input type="text" value={formData.guest_country} onChange={(e) => setFormData({ ...formData, guest_country: e.target.value })} className="admin-input" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Avatar URL</label>
                                <input type="text" value={formData.guest_avatar} onChange={(e) => setFormData({ ...formData, guest_avatar: e.target.value })} className="admin-input" placeholder="https://..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[#2d3a29] mb-2">Villa</label>
                                    <select value={formData.villa_id} onChange={(e) => { const v = villas.find(v => v.id === e.target.value); setFormData({ ...formData, villa_id: e.target.value, villa_name: v?.name || '' }); }} className="admin-input">
                                        <option value="">Select villa...</option>
                                        {villas.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#2d3a29] mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(r => (
                                            <button key={r} type="button" onClick={() => setFormData({ ...formData, rating: r })} className={`p-2 rounded ${formData.rating >= r ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                <Star size={24} className={formData.rating >= r ? 'fill-current' : ''} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Review *</label>
                                <textarea value={formData.review} onChange={(e) => setFormData({ ...formData, review: e.target.value })} className="admin-input" rows={4} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Host Response</label>
                                <textarea value={formData.host_response} onChange={(e) => setFormData({ ...formData, host_response: e.target.value })} className="admin-input" rows={2} />
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="featured" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="w-5 h-5" />
                                <label htmlFor="featured" className="text-sm font-medium text-[#2d3a29]">Featured testimonial</label>
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

export default AdminTestimonials;
