// import React from "react";
import "./WelcomeScreen.css";

export default function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="ws-wrap">
      <div className="ws-card">
        <h2 className="ws-title">3-4-класстар арасында болуп жаткан викторина оюнубузга кош келиңиздер 🎉</h2>
        <p className="ws-text">
          Сиздерге ийгилик, зиректик жана биримдик каалайбыз! Жеңиш эң ынтымактуу жана эпчил команданыкы болсун!
        </p>

        {/* Можно добавить картинку в public/screens/welcome.png */}
        <img className="ws-img" src="/screens/welcome.png" alt="" />

        <button className="ws-btn" onClick={onNext}>Далее</button>
      </div>
    </div>
  );
}