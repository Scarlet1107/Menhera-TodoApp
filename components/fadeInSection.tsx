"use client";

import { ReactNode } from "react";
import { motion, MotionProps } from "framer-motion";

interface FadeInSectionProps extends MotionProps {
    /** 表示を遅らせたい場合 */
    delay?: number;
    /** 追加のクラス名 */
    className?: string;
    children: ReactNode;
}

export default function FadeInSection({
    children,
    delay = 0.2,
    className = "",
    ...motionProps
}: FadeInSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay }}
            className={className}
            {...motionProps}
        >
            {children}
        </motion.div>
    );
}
