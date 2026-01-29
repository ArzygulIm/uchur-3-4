// import React from "react";
import "./RoundIntro.css";

export default function RoundIntro({
  title,
  subtitle,
  imageSrc,
  onStart,
}: {
  title: string;
  subtitle: string;
  imageSrc?: string;
  onStart: () => void;
}) {
  return (
    <div className="ri-wrap">
      <div className="ri-card">
        <h2 className="ri-title">{title}</h2>
        <p className="ri-sub">{subtitle}</p>

        {imageSrc ? <img className="ri-img" src={imageSrc} alt="" /> : null}

        <button className="ri-btn" onClick={onStart}>
          Начать
        </button>
      </div>
    </div>
  );
}