import { getDashboardAnalytics } from "@/lib/admin-analytics";
import { getVisitorAnalytics } from "@/lib/visitor-analytics";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Fetch data from the analytics modules
        const [dashboardAnalytics, visitorAnalytics] = await Promise.all([
            getDashboardAnalytics(),
            getVisitorAnalytics(),
        ]);

        // Check if data fetching was successful
        if (!dashboardAnalytics || !visitorAnalytics) {
            return new NextResponse(
                JSON.stringify({ message: "Couldn't fetch all required analytics data" }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Combine the analytics data into a single, clean object
        const combinedData = {
            dashboardAnalytics,
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
