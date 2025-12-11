import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-3",
};

const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => {
    return (
        <div
            className={cn(
                "animate-spin rounded-full border-primary border-t-transparent",
                sizeClasses[size],
                className
            )}
            role="status"
            aria-label="Loading"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};

export default LoadingSpinner;
