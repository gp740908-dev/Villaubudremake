import { getDashboardAnalytics } from "@/lib/admin-analytics";
import { getVisitorAnalytics } from "@/lib/visitor-analytics";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [dashboardData, visitorAnalytics] = await Promise.all([
            getDashboardAnalytics(),
            getVisitorAnalytics(),
        ]);

        if (!dashboardData || !visitorAnalytics) {
            return new NextResponse(
                JSON.stringify({ message: "Couldn't generate all analytics data" }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // FIX: Flatten the nested bookingAnalytics object to create a clean structure
        const bookingAnalytics = {
            ...dashboardData,
            ...dashboardData.bookingAnalytics, // Hoist nested properties to the top
        };
        delete bookingAnalytics.bookingAnalytics; // Remove the redundant nested object

        const combinedData = {
            bookingAnalytics,
            visitorAnalytics,
        };

        return NextResponse.json(combinedData);
    } catch (error: any) {
        console.error("Error in dashboard-analytics API route:", error);
        return new NextResponse(
            JSON.stringify({ message: error.message || "An internal server error occurred" }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
