"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const ROBOT_IMAGES = [
    "/robot/1.webp",
    "/robot/2.webp",
    "/robot/3.webp",
    "/robot/4.webp",
];

export function HeroRobot() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % ROBOT_IMAGES.length);
        }, 4000); // 4 seconds per image (durationPerImage in Robot.tsx was 60 frames @ 30fps = 2s, but user mentioned 4 images)
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center">
            {/* Ambient secondary glow */}
            <motion.div
                className="absolute w-[120%] h-[120%] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none"
                animate={{
                    scale: [0.9, 1.1, 0.9],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Shadow on the floor */}
            <motion.div
                className="absolute bottom-[10%] w-[60%] h-[5%] bg-black/40 blur-xl rounded-[100%] pointer-events-none"
                animate={{
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.4, 0.1, 0.4],
                }}
                transition={{
                    duration: 3, // approximately Matching floatY cycle
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Robot Container */}
            <motion.div
                className="relative z-10 w-full h-full"
                animate={{
                    y: [-20, 20, -20],
                    rotateZ: [-2, 2, -2],
                    scale: [1, 1.03, 1],
                }}
                transition={{
                    y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                    rotateZ: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                    scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                }}
                style={{ transformOrigin: "bottom center" }}
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={index}
                        src={ROBOT_IMAGES[index]}
                        alt="Agente Kaled AI"
                        className="w-full h-full object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }} // 1 second cross-fade
                    />
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
