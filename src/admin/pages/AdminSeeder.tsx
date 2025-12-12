import { useState } from 'react';
import { seedVillas, seedBookings } from '@/lib/seed';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

const AdminSeeder = () => {
    const [isSeedingVillas, setIsSeedingVillas] = useState(false);
    const [isSeedingBookings, setIsSeedingBookings] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSeedVillas = async () => {
        setIsSeedingVillas(true);
        setError(null);
        setSuccess(null);
        try {
            await seedVillas();
            setSuccess('Villas have been successfully seeded!');
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred while seeding villas.');
        } finally {
            setIsSeedingVillas(false);
        }
    };

    const handleSeedBookings = async () => {
        setIsSeedingBookings(true);
        setError(null);
        setSuccess(null);
        try {
            await seedBookings();
            setSuccess('Bookings have been successfully seeded!');
        } catch (e: any) {
            setError(e.message || 'An unexpected error occurred while seeding bookings.');
        } finally {
            setIsSeedingBookings(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#2d3a29]">Database Seeder</h1>
                <p className="text-sm text-[#6b7c67]">
                    Use these tools to populate your database with initial data. This is useful for development and testing.
                </p>
            </div>

            <div className="admin-card p-6 space-y-4">
                <div className="flex items-center justify-between p-4 border border-yellow-300 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                        <AlertTriangle className="h-6 w-6 text-yellow-500 mr-3" />
                        <div>
                            <h3 className="font-bold text-yellow-800">Warning: Destructive Action</h3>
                            <p className="text-sm text-yellow-700">
                                Seeding will first <span className="font-bold">delete all existing data</span> in the target table(s) before inserting the new data.
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-800">
                        <p><span className="font-bold">Error:</span> {error}</p>
                    </div>
                )}

                {success && (
                    <div className="p-4 border border-green-300 bg-green-50 rounded-lg text-green-800 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2"/>
                        <p>{success}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    {/* Seed Villas */}
                    <div className="border p-4 rounded-lg">
                        <h3 className="font-semibold text-lg text-[#2d3a29]">Seed Villas</h3>
                        <p className="text-sm text-[#6b7c67] mt-1 mb-4">
                            This will delete all existing villas and insert 4 new sample villas.
                        </p>
                        <button
                            onClick={handleSeedVillas}
                            disabled={isSeedingVillas || isSeedingBookings}
                            className="admin-btn admin-btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full"
                        >
                            {isSeedingVillas ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Seeding...</>
                            ) : (
                                'Seed Villas'
                            )}
                        </button>
                    </div>

                    {/* Seed Bookings */}
                    <div className="border p-4 rounded-lg">
                        <h3 className="font-semibold text-lg text-[#2d3a29]">Seed Bookings</h3>
                        <p className="text-sm text-[#6b7c67] mt-1 mb-4">
                           This will delete all existing bookings and insert 50 new random bookings for the seeded villas. Requires villas to be seeded first.
                        </p>
                        <button
                            onClick={handleSeedBookings}
                            disabled={isSeedingVillas || isSeedingBookings}
                            className="admin-btn admin-btn-secondary disabled:opacity-50 disabled:cursor-not-allowed w-full"
                        >
                            {isSeedingBookings ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Seeding...</>
                            ) : (
                                'Seed Bookings'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSeeder;
