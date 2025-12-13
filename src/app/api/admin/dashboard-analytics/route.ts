eeesimport { getDashboardAnalytics } from "@/lib/admin-analytics";
import { NextResponse } from "next/server";

// Ensure this route is always dynamic
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const analytics = await getDashboardAnalytics();
        if (!analytics) {
            return new NextResponse(
                JSON.stringify({ message: "Couldn't generate analytics" }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }
        return NextResponse.json(analytics);
    } catch (error: any) {
        return new NextResponse(
            JSON.stringify({ message: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
