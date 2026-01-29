// import React from "react";
import "./InstructionScreen.css";

export default function InstructionScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="ins-wrap">
      <div className="ins-card">
        <h2 className="ins-title">Бүгүн биз төмөнкү оюндар боюнча жарышабыз:</h2>

        <div className="ins-list">
          <div className="ins-item">
            <b>Раунд 1:</b> Ат чабыш на көбөйтүү/бөлүү темаларына
          </div>
          
        <img className="ins-img" src="/screens/preview.png" alt="" />
          <div className="ins-item">
            <b>Раунд 2:</b> Тест — ким шамдагайыраак
          </div>
          <div className="ins-item">
            <b>Раунд 3:</b> Викторина
          </div>
        </div>

        <button className="ins-btn" onClick={onNext}>Анда оюнду баштайлы!</button>
      </div>
    </div>
  );
}