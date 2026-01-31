"use client";

import { ClerkProvider } from "@clerk/clerk-react";
import { useRouter } from "next/navigation";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
    throw new Error("Missing Publishable Key");
}

export default function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    return (
        <ClerkProvider
            publishableKey={publishableKey!}
            routerPush={(to: string) => router.push(to)}
            routerReplace={(to: string) => router.replace(to)}
        >
            {children}
        </ClerkProvider>
    );
}
