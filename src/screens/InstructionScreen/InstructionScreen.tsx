import React from "react";
import "./InstructionScreen.css";

export default function InstructionScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="ins-wrap">
      <div className="ins-card">
        <h2 className="ins-title">Сегодня вас ждёт:</h2>

        <div className="ins-list">
          <div className="ins-item">
            <b>Раунд 1:</b> Ат чабыш на умножение/деление
          </div>
          <div className="ins-item">
            <b>Раунд 2:</b> Тест — кто быстрее ответит
          </div>
          <div className="ins-item">
            <b>Раунд 3:</b> Викторина с табло (200–1000)
          </div>
        </div>

        <img className="ins-img" src="/screens/preview.png" alt="" />

        <button className="ins-btn" onClick={onNext}>Понятно, дальше</button>
      </div>
    </div>
  );
}