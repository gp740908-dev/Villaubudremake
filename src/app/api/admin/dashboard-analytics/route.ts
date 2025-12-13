import { getDashboardAnalytics } from "@/lib/admin-analytics";
import { getVisitorAnalytics } from "@/lib/visitor-analytics";
import { NextResponse } from "next/server";

// Ensure this route is always dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch both booking and visitor analytics in parallel
        const [bookingAnalytics, visitorAnalytics] = await Promise.all([
            getDashboardAnalytics(),
            getVisitorAnalytics(),
        ]);

        if (!bookingAnalytics || !visitorAnalytics) {
            return new NextResponse(
                JSON.stringify({ message: "Couldn't generate all analytics data" }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Combine the data into a single response object
        const combinedData = {
            bookingAnalytics,
            visitorAnalytics,
        };

        return NextResponse.json(combinedData);
    } catch (error: any) {
        return new NextResponse(
            JSON.stringify({ message: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
