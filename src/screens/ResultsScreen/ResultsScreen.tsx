import { useMemo } from "react";
import "./ResultsScreen.css";

export default function ResultsScreen({
  scores,
  onRestart,
}: {
  scores: { team1: number; team2: number };
  onRestart: () => void;
}) {
  const winner = useMemo(() => {
    if (scores.team1 > scores.team2) return 1;
    if (scores.team2 > scores.team1) return 2;
    return 0;
  }, [scores.team1, scores.team2]);

  return (
    <div className="res-wrap">
      <div className="res-card">
        <h2 className="res-title">Результаты</h2>

        {/* ✅ 1 строка */}
        <div className="res-line">
          <span>Команда 1</span>
          <b>{scores.team1}</b>
          <span className="dash">—</span>
          <b>{scores.team2}</b>
          <span>Команда 2</span>
        </div>

        <div className="res-winner">
          {winner === 1 && "🏆 Команда 1 победила! Поздравляем! 🎉"}
          {winner === 2 && "🏆 Команда 2 победила! Поздравляем! 🎉"}
          {winner === 0 && "🤝 Ничья! Вы молодцы! 🎉"}
        </div>

        <img className="res-img" src="/screens/congrats.png" alt="" />

        <button className="res-btn" onClick={onRestart}>
          Начать заново
        </button>
      </div>
    </div>
  );
}