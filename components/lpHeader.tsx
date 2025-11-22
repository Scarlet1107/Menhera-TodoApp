"use client";

import Link from "next/link";
import Image from "next/image";

export default function LPHeader() {
    return (
        <header className="sticky top-0 z-50 h-14 w-full border-b bg-pink-50/90 dark:bg-stone-700/90 border-pink-200 dark:border-stone-900 px-4 shadow-sm backdrop-blur flex items-center">
            <Link href="/">
                <Image
                    src="/header-icon.png"
                    height={150}
                    width={180}
                    alt="Header-Icon"
                />
            </Link>
        </header>
    );
}
