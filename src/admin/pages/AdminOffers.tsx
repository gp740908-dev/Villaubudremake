import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Copy,
    Trash2,
    Percent,
    DollarSign,
    Gift,
    Calendar,
    Tag,
    X,
    RefreshCw,
    BarChart3,
    Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/booking';
import { toast } from '@/hooks/use-toast';
import { useOfferStore } from '@/store/offerStore';
import type { Offer } from '@/lib/database.types';

// Offer Card Component
const OfferCard = ({
    offer,
    onEdit,
    onDuplicate,
    onDelete,
    onToggle,
}: {
    offer: Offer;
    onEdit: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
    onToggle: () => void;
}) => {
    const isExpired = offer.end_date ? new Date(offer.end_date) < new Date() : false;

    return (
        <div className={`admin-card overflow-hidden ${!offer.is_active || isExpired ? 'opacity-70' : ''}`}>
            {/* Banner */}
            <div className="relative h-32 bg-gradient-to-r from-[#778873] to-[#A1BC98]">
                {offer.banner_image ? (
                    <img src={offer.banner_image} alt={offer.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Gift size={48} className="text-white/50" />
                    </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${offer.discount_type === 'percentage'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                        }`}>
                        {offer.discount_type === 'percentage' ? <Percent size={12} className="inline mr-1" /> : <DollarSign size={12} className="inline mr-1" />}
                        {offer.discount_type === 'percentage' ? `${offer.discount_value}% OFF` : `IDR ${(offer.discount_value / 1000).toFixed(0)}K OFF`}
                    </span>
                </div>
                {isExpired && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        Expired
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <h3 className="font-semibold text-[#2d3a29]">{offer.title}</h3>
                        <p className="text-sm text-[#6b7c67] mt-1 line-clamp-2">{offer.description}</p>
                    </div>
                    <button
                        onClick={onToggle}
                        className={`relative w-12 h-6 rounded-full transition-colors ${offer.is_active && !isExpired ? 'bg-[#A1BC98]' : 'bg-gray-300'
                            }`}
                    >
                        <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${offer.is_active && !isExpired ? 'translate-x-7' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm mb-4">
                    {offer.start_date && offer.end_date && (
                        <div className="flex items-center gap-2 text-[#6b7c67]">
                            <Calendar size={14} />
                            <span>
                                {format(new Date(offer.start_date), 'MMM d')} - {format(new Date(offer.end_date), 'MMM d, yyyy')}
                            </span>
                        </div>
                    )}
                    {offer.promo_code && (
                        <div className="flex items-center gap-2">
                            <Tag size={14} className="text-[#778873]" />
                            <code className="bg-[#F1F3E0] px-2 py-1 rounded text-xs font-mono">{offer.promo_code}</code>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between py-3 border-t border-[#d4dbc8]">
                    <span className="text-sm text-[#6b7c67]">Used {offer.current_uses} times</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-[#d4dbc8]">
                    <button onClick={onEdit} className="flex-1 admin-btn admin-btn-outline py-2 text-sm">
                        <Edit2 size={14} />
                        Edit
                    </button>
                    <button onClick={onDuplicate} className="p-2 hover:bg-[#F1F3E0] rounded-lg text-[#778873]">
                        <Copy size={16} />
                    </button>
                    <button onClick={onDelete} className="p-2 hover:bg-red-50 rounded-lg text-red-500">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// Create/Edit Offer Modal
const OfferModal = ({
    offer,
    isOpen,
    onClose,
    onSave,
    isLoading,
}: {
    offer: Offer | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Offer>) => void;
    isLoading: boolean;
}) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount_type: 'percentage' as 'percentage' | 'fixed',
        discount_value: 10,
        start_date: '',
        end_date: '',
        promo_code: '',
        minimum_nights: 1,
        is_active: true,
        terms: '',
    });

    useEffect(() => {
        if (offer) {
            setFormData({
                title: offer.title,
                description: offer.description || '',
                discount_type: offer.discount_type,
                discount_value: offer.discount_value,
                start_date: offer.start_date || '',
                end_date: offer.end_date || '',
                promo_code: offer.promo_code || '',
                minimum_nights: offer.minimum_nights,
                is_active: offer.is_active,
                terms: offer.terms || '',
            });
        } else {
            setFormData({
                title: '',
                description: '',
                discount_type: 'percentage',
                discount_value: 10,
                start_date: '',
                end_date: '',
                promo_code: '',
                minimum_nights: 1,
                is_active: true,
                terms: '',
            });
        }
    }, [offer, isOpen]);

    if (!isOpen) return null;

    const generatePromoCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, promo_code: code });
    };

    const handleSave = () => {
        if (!formData.title) {
            toast({ title: 'Title required', variant: 'destructive' });
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-[#d4dbc8] flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#2d3a29]">
                        {offer ? 'Edit Offer' : 'Create New Offer'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#F1F3E0] rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#2d3a29] mb-2">Offer Title *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="admin-input"
                                placeholder="e.g., Early Bird Special"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#2d3a29] mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="admin-input"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[#d4dbc8]">
                        <h3 className="font-semibold text-[#2d3a29] mb-4">Discount</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Type</label>
                                <select
                                    value={formData.discount_type}
                                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as any })}
                                    className="admin-input"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (IDR)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Value</label>
                                <input
                                    type="number"
                                    value={formData.discount_value}
                                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                                    className="admin-input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Min. Nights</label>
                                <input
                                    type="number"
                                    value={formData.minimum_nights}
                                    onChange={(e) => setFormData({ ...formData, minimum_nights: Number(e.target.value) })}
                                    className="admin-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[#d4dbc8]">
                        <h3 className="font-semibold text-[#2d3a29] mb-4">Validity</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="admin-input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="admin-input"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-[#d4dbc8]">
                        <h3 className="font-semibold text-[#2d3a29] mb-4">Promo Code</h3>
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={formData.promo_code}
                                onChange={(e) => setFormData({ ...formData, promo_code: e.target.value.toUpperCase() })}
                                className="admin-input flex-1 font-mono"
                                placeholder="PROMOCODE"
                            />
                            <button onClick={generatePromoCode} className="admin-btn admin-btn-outline">
                                <RefreshCw size={16} />
                                Generate
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-[#2d3a29]">
                            Offer is active
                        </label>
                    </div>
                </div>

                <div className="p-6 border-t border-[#d4dbc8] flex justify-end gap-3">
                    <button onClick={onClose} className="admin-btn admin-btn-outline">Cancel</button>
                    <button onClick={handleSave} className="admin-btn admin-btn-primary" disabled={isLoading}>
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Offer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Offers Page
const AdminOffers = () => {
    const { offers, isLoading, fetchOffers, createOffer, updateOffer, deleteOffer } = useOfferStore();
    const [filter, setFilter] = useState<'active' | 'all' | 'expired'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    const filteredOffers = offers.filter((offer) => {
        const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase());
        const isExpired = offer.end_date ? new Date(offer.end_date) < new Date() : false;

        switch (filter) {
            case 'active':
                return matchesSearch && offer.is_active && !isExpired;
            case 'expired':
                return matchesSearch && isExpired;
            default:
                return matchesSearch;
        }
    });

    const handleEdit = (offer: Offer) => {
        setSelectedOffer(offer);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedOffer(null);
        setModalOpen(true);
    };

    const handleSave = async (data: Partial<Offer>) => {
        setIsSaving(true);
        try {
            if (selectedOffer) {
                await updateOffer(selectedOffer.id, data);
                toast({ title: 'Offer updated' });
            } else {
                await createOffer(data as any);
                toast({ title: 'Offer created' });
            }
            setModalOpen(false);
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to save offer', variant: 'destructive' });
        }
        setIsSaving(false);
    };

    const handleDuplicate = async (offer: Offer) => {
        const newOfferData = {
            ...offer,
            title: `${offer.title} (Copy)`,
            promo_code: offer.promo_code ? `${offer.promo_code}_COPY` : null,
        };
        delete (newOfferData as any).id;
        delete (newOfferData as any).created_at;
        delete (newOfferData as any).updated_at;
        delete (newOfferData as any).current_uses;

        await createOffer(newOfferData as any);
        toast({ title: 'Offer duplicated' });
    };

    const handleDelete = async (offer: Offer) => {
        if (window.confirm(`Delete "${offer.title}"?`)) {
            const success = await deleteOffer(offer.id);
            if (success) {
                toast({ title: 'Offer deleted' });
            }
        }
    };

    const handleToggle = async (offer: Offer) => {
        await updateOffer(offer.id, { is_active: !offer.is_active });
        toast({ title: offer.is_active ? 'Offer deactivated' : 'Offer activated' });
    };

    if (isLoading && offers.length === 0) {
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
                    <h1 className="text-2xl font-bold text-[#2d3a29]">Special Offers & Promotions</h1>
                    <p className="text-sm text-[#6b7c67]">Manage discounts ({offers.length} offers)</p>
                </div>
                <button onClick={handleCreate} className="admin-btn admin-btn-primary">
                    <Plus size={18} />
                    Create New Offer
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                    {[
                        { key: 'all', label: 'All Offers' },
                        { key: 'active', label: 'Active' },
                        { key: 'expired', label: 'Expired' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key as any)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === tab.key
                                ? 'bg-[#778873] text-white'
                                : 'bg-[#F1F3E0] text-[#2d3a29] hover:bg-[#D2DCB6]'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7c67]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search offers..."
                        className="admin-input pl-10"
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOffers.map((offer) => (
                    <OfferCard
                        key={offer.id}
                        offer={offer}
                        onEdit={() => handleEdit(offer)}
                        onDuplicate={() => handleDuplicate(offer)}
                        onDelete={() => handleDelete(offer)}
                        onToggle={() => handleToggle(offer)}
                    />
                ))}
            </div>

            {filteredOffers.length === 0 && !isLoading && (
                <div className="text-center py-12">
                    <Gift size={48} className="mx-auto text-[#d4dbc8] mb-4" />
                    <p className="text-[#6b7c67]">
                        {offers.length === 0 ? 'No offers found. Create your first offer!' : 'No offers match your filter.'}
                    </p>
                </div>
            )}

            <OfferModal
                offer={selectedOffer}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                isLoading={isSaving}
            />
        </div>
    );
};

export default AdminOffers;
