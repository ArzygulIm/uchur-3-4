import React from "react";
import "./WelcomeScreen.css";

export default function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="ws-wrap">
      <div className="ws-card">
        <h2 className="ws-title">Добро пожаловать на наше мероприятие! 🎉</h2>
        <p className="ws-text">
          Желаем вам удачи, внимательности и командного духа!  
          Пусть победит самая дружная и сообразительная команда!
        </p>

        {/* Можно добавить картинку в public/screens/welcome.png */}
        <img className="ws-img" src="/screens/welcome.png" alt="" />

        <button className="ws-btn" onClick={onNext}>Далее</button>
      </div>
    </div>
  );
}