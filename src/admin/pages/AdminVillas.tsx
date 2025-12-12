const handleSave = async (data:  Partial<Villa>) => {
    setIsSaving(true);
    try {
        // Validate data before saving
        if (!data.name || data.name.trim().length === 0) {
            toast({ 
                title: 'Validation Error', 
                description:  'Villa name is required',
                variant: 'destructive' 
            });
            setIsSaving(false);
            return;
        }

        if (!data.price_per_night || data.price_per_night <= 0) {
            toast({ 
                title: 'Validation Error', 
                description:  'Price per night must be greater than 0',
                variant:  'destructive' 
            });
            setIsSaving(false);
            return;
        }

        // Ensure images is an array
        const validImages = Array.isArray(data.images) 
            ? data.images. filter(img => typeof img === 'string' && img.length > 0)
            : [];

        // Prepare data for save
        const saveData = {
            ... data,
            images: validImages,
            amenities: Array.isArray(data.amenities) ? data.amenities : [],
            coordinates: data.coordinates || { lat: -8.5069, lng: 115.2625 }, // Default Ubud coordinates
        };

        if (selectedVilla) {
            console.log('🔄 Updating villa:', selectedVilla.id, saveData);
            const success = await updateVilla(selectedVilla.id, saveData);
            
            if (success) {
                toast({ 
                    title: '✅ Villa updated', 
                    description: 'Villa details have been saved successfully.' 
                });
            } else {
                toast({ 
                    title: '❌ Update failed', 
                    description:  error || 'Failed to update villa',
                    variant: 'destructive'
                });
            }
        } else {
            console.log('➕ Creating new villa:', saveData);
            const newVilla = await createVilla(saveData as any);
            
            if (newVilla) {
                toast({ 
                    title: '✅ Villa created', 
                    description: 'New villa has been added successfully.' 
                });
            } else {
                toast({ 
                    title: '❌ Create failed', 
                    description:  error || 'Failed to create villa',
                    variant: 'destructive'
                });
            }
        }
        
        setEditModalOpen(false);
    } catch (err:  any) {
        console.error('Save error:', err);
        toast({ 
            title: '❌ Error', 
            description: err.message || 'Failed to save villa',
            variant: 'destructive' 
        });
    }
    setIsSaving(false);
};
