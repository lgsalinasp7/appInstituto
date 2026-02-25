import { useCurrentFrame, staticFile, Img, AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";

export const Robot: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Duration for each image (in frames)
    const durationPerImage = 60; // 2 seconds
    const fadeDuration = 15;   // 0.5 seconds fade

    // Logic for cross-fade
    const totalFrames = durationPerImage * 4;
    const currentLoopFrame = frame % totalFrames;
    const currentIndex = Math.floor(currentLoopFrame / durationPerImage);
    const nextIndex = (currentIndex + 1) % 4;
    const progress = currentLoopFrame % durationPerImage;

    const opacity = interpolate(
        progress,
        [durationPerImage - fadeDuration, durationPerImage],
        [1, 0],
        { extrapolateRight: "clamp" }
    );

    // Advanced movement: Floating + Breathing
    // 1. Vertical float (Levitación)
    const floatY = interpolate(
        Math.sin(frame / 25),
        [-1, 1],
        [-20, 20]
    );

    // 2. Subtle rotation (Inclinación)
    const rotateZ = interpolate(
        Math.cos(frame / 30),
        [-1, 1],
        [-2, 2]
    );

    // 3. Subtle scale (Respiración)
    const stretch = interpolate(
        Math.sin(frame / 20),
        [-1, 1],
        [1, 1.03]
    );

    // Dynamic Shadow on the "floor"
    const shadowOpacity = interpolate(floatY, [-20, 20], [0.4, 0.1]);
    const shadowScale = interpolate(floatY, [-20, 20], [0.8, 1.2]);

    const getImgSource = (index: number) => staticFile(`robot/${index + 1}.png`);

    return (
        <AbsoluteFill className="flex items-center justify-center overflow-hidden">
            {/* Ambient secondary glow (remains subtle and transparent) */}
            <div
                className="absolute w-[600px] h-[600px] rounded-full bg-blue-400/5 blur-[100px]"
                style={{
                    transform: `scale(${interpolate(Math.sin(frame / 40), [-1, 1], [0.9, 1.1])})`,
                }}
            />

            {/* Shadow on the floor */}
            <div
                className="absolute bottom-[20%] w-60 h-8 bg-black/40 blur-xl rounded-[100%]"
                style={{
                    opacity: shadowOpacity,
                    transform: `scale(${shadowScale})`,
                }}
            />

            <div
                className="relative"
                style={{
                    transform: `translateY(${floatY}px) rotateZ(${rotateZ}deg) scale(${stretch})`,
                    transformOrigin: "bottom center",
                }}
            >
                {/* Robot Container (Transparent, no solid background) */}
                <div className="relative">
                    <Img
                        src={getImgSource(currentIndex)}
                        className="w-[500px] h-[500px] object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
                        style={{ opacity: opacity }}
                    />

                    {/* Next Image (Incoming) */}
                    {progress >= durationPerImage - fadeDuration && (
                        <Img
                            src={getImgSource(nextIndex)}
                            className="absolute top-0 left-0 w-[500px] h-[500px] object-contain drop-shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
                            style={{ opacity: 1 - opacity }}
                        />
                    )}
                </div>
            </div>
        </AbsoluteFill>
    );
};
