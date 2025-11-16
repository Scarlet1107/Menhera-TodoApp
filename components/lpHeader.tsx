"use client";

import Link from "next/link";
import Image from "next/image";

export default function LPHeader() {
    return (
        <header className="w-full border-b bg-pink-50/80 dark:bg-stone-700/80 border-pink-200 dark:border-stone-900 px-4 shadow-sm h-14 flex items-center justify-between sm:py-8">
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
