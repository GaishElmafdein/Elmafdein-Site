"use client";
import React from "react";
import styles from "./EmberLogo.module.css";

type EmberLogoProps = {
  logoSrc: string;
  alt: string;
  size?: number;      // px
  logoScale?: number; // 0..1
  className?: string;
  onLogoError?: () => void;
};


/** EmberLogo (خيال النار) – شعار مع خلفية فيديو لهب واقعي */
export default function EmberLogo({
  logoSrc,
  alt,
  size = 520,
  logoScale = 0.68,
  className = "",
  onLogoError,
}: EmberLogoProps) {
  const borderRadius = Math.round(size * 0.12);
  const fireVideoSrc = "/fire-loop.mp4"; // ضع فيديو لهب حقيقي هنا
  const logoWidth = size * logoScale;
  const logoHeight = size * logoScale;
  const logoLeft = (size - logoWidth) / 2;
  const logoTop = (size - logoHeight) / 2;

  return (
    <div
      className={`${styles.emberLogoRoot} ${className}`}
      style={{
        ["--ember-logo-size" as any]: `${size}px`,
        ["--ember-logo-radius" as any]: `${borderRadius}px`,
        ["--ember-logo-img-width" as any]: `${logoWidth}px`,
        ["--ember-logo-img-height" as any]: `${logoHeight}px`,
        ["--ember-logo-img-left" as any]: `${logoLeft}px`,
        ["--ember-logo-img-top" as any]: `${logoTop}px`,
      }}
      aria-label={alt}
      role="img"
    >
      {/* خلفية فيديو لهب */}
      <video
        aria-hidden
        className={styles.emberLogoVideo}
        src={fireVideoSrc}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* الشعار */}
      <img
        src={logoSrc}
        alt={alt}
        onError={onLogoError}
        className={styles.emberLogoImg}
        draggable={false}
      />
    </div>
  );
}
