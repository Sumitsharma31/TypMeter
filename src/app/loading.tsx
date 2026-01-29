import KeyLoader from "@/components/KeyLoader";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm">
            <KeyLoader />
            <p className="mt-8 text-sm font-medium text-slate-500 animate-pulse tracking-widest uppercase">
                Loading system...
            </p>
        </div>
    );
}
