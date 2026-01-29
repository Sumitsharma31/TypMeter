import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-slate-200 dark:border-white/5 py-8 mt-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">© 2026 TypMeter. Open source.</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="https://github.com" className="text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                        <iconify-icon icon="solar:code-circle-linear" width="20"></iconify-icon>
                    </Link>
                    <Link href="/privacy" className="text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                        <iconify-icon icon="solar:shield-warning-linear" width="20"></iconify-icon>
                    </Link>
                    <Link href="/contact" className="text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                        <iconify-icon icon="solar:mailbox-linear" width="20"></iconify-icon>
                    </Link>
                </div>
            </div>
        </footer>
    );
}
