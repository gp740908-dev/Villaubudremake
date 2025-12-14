import { useState, useEffect } from 'react';
import {
    Save,
    Settings,
    Loader2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSettingsStore } from '@/store/settingsStore';

const AdminSettings = () => {
    const { settings, isLoading, fetchSettings, updateSetting } = useSettingsStore();
    const [isSaving, setIsSaving] = useState(false);

    // Local state for form fields
    const [localSettings, setLocalSettings] = useState<Record<string, any>>({
        site_name: '',
        site_description: '',
        contact_email: '',
        contact_phone: '',
        contact_address: '',
        booking_email: '',
        social_instagram: '',
        social_facebook: '',
        social_whatsapp: '',
    });

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    useEffect(() => {
        // Populate local state when settings are loaded
        if (Object.keys(settings).length > 0) {
            setLocalSettings(prev => ({
                ...prev,
                ...settings
            }));
        }
    }, [settings]);

    const handleChange = (key: string, value: string) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save each setting
            const promises = Object.entries(localSettings).map(([key, value]) =>
                updateSetting(key, value)
            );

            await Promise.all(promises);
            toast({ title: 'Settings saved successfully' });
        } catch (err) {
            toast({ title: 'Failed to save settings', variant: 'destructive' });
        }
        setIsSaving(false);
    };

    if (isLoading && Object.keys(settings).length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-[#778873]" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#2d3a29]">Site Settings</h1>
                    <p className="text-sm text-[#6b7c67]">Manage general website configuration</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="admin-btn admin-btn-primary"
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Changes
                </button>
            </div>

            <div className="grid gap-6">
                {/* General Info */}
                <div className="admin-card p-6">
                    <h2 className="text-lg font-semibold text-[#2d3a29] mb-4 flex items-center gap-2">
                        <Settings size={20} className="text-[#778873]" />
                        General Information
                    </h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Site Name</label>
                                <input
                                    type="text"
                                    value={localSettings.site_name}
                                    onChange={(e) => handleChange('site_name', e.target.value)}
                                    className="admin-input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Site Description</label>
                                <input
                                    type="text"
                                    value={localSettings.site_description}
                                    onChange={(e) => handleChange('site_description', e.target.value)}
                                    className="admin-input"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="admin-card p-6">
                    <h2 className="text-lg font-semibold text-[#2d3a29] mb-4">Contact Information</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Contact Email</label>
                                <input
                                    type="email"
                                    value={localSettings.contact_email}
                                    onChange={(e) => handleChange('contact_email', e.target.value)}
                                    className="admin-input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#2d3a29] mb-2">Phone Number</label>
                                <input
                                    type="text"
                                    value={localSettings.contact_phone}
                                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                                    className="admin-input"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#2d3a29] mb-2">Address</label>
                            <textarea
                                value={localSettings.contact_address}
                                onChange={(e) => handleChange('contact_address', e.target.value)}
                                className="admin-input"
                                rows={3}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#2d3a29] mb-2">Booking Notification Email</label>
                            <input
                                type="email"
                                value={localSettings.booking_email}
                                onChange={(e) => handleChange('booking_email', e.target.value)}
                                className="admin-input"
                                placeholder="Where booking notifications will be sent"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="admin-.card p-6">
                    <h2 className="text-lg font-semibold text-[#2d3a29] mb-4">Social Media</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[#2d3a29] mb-2">Instagram URL</label>
                            <input
                                type="text"
                                value={localSettings.social_instagram}
                                onChange={(e) => handleChange('social_instagram', e.target.value)}
                                className="admin-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#2d3a29] mb-2">Facebook URL</label>
                            <input
                                type="text"
                                value={localSettings.social_facebook}
                                onChange={(e) => handleChange('social_facebook', e.target.value)}
                                className="admin-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#2d3a29] mb-2">WhatsApp Number</label>
                            <input
                                type="text"
                                value={localSettings.social_whatsapp}
                                onChange={(e) => handleChange('social_whatsapp', e.target.value)}
                                className="admin-input"
                                placeholder="Include country code (e.g., 62...)"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
