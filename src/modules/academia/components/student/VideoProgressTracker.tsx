"use client";

import { useRef, useEffect, useCallback } from "react";

interface VideoProgressTrackerProps {
  lessonId: string;
  videoUrl: string;
  className?: string;
}

const SAVE_INTERVAL_MS = 5000;
const MIN_PROGRESS_DELTA = 5;

export function VideoProgressTracker({ lessonId, videoUrl, className }: VideoProgressTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastSavedProgress = useRef(0);
  const lastSaveTimeRef = useRef<number | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const videoProgress = Math.min(100, Math.round((video.currentTime / video.duration) * 100) || 0);
    const now = Date.now();
    const timeDeltaSec = lastSaveTimeRef.current
      ? Math.round((now - lastSaveTimeRef.current) / 1000)
      : 0;

    if (Math.abs(videoProgress - lastSavedProgress.current) >= MIN_PROGRESS_DELTA || timeDeltaSec > 0) {
      lastSavedProgress.current = videoProgress;
      lastSaveTimeRef.current = now;
      fetch("/api/academy/progress/video", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          videoProgress,
          timeSpentSec: timeDeltaSec,
        }),
      }).catch(() => {});
    }
  }, [lessonId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      if (!lastSaveTimeRef.current) lastSaveTimeRef.current = Date.now();
    };

    const onTimeUpdate = () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(saveProgress, SAVE_INTERVAL_MS);
    };

    const onEnded = () => {
      saveProgress();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [saveProgress, videoUrl]);

  return (
    <div className={className}>
      <video ref={videoRef} src={videoUrl} controls className="w-full" />
    </div>
  );
}
