import React, { useEffect, useMemo, useState } from "react";
import type { GameState } from "../../App";
import "./TestRound.css";

type Team = 1 | 2;

type Option =
  | { kind: "text"; text: string; correct: boolean }
  | { kind: "image"; src: string; alt?: string; correct: boolean };

interface RawQuestion {
  id: number;
  text: string;
  imageSrc?: string;
  options: Option[]; // ровно 3, correct:true только у одного
}

interface QuestionPrepared {
  id: number;
  text: string;
  imageSrc?: string;

  optionsTeam1: Option[];
  optionsTeam2: Option[];

  correct1: number;
  correct2: number;
}

interface TestRoundProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onComplete: () => void; // "След. раунд"
}

const POINTS = 10;
const FLASH_TIME = 2000;
const QUESTIONS_COUNT = 3;

/* ---------- helpers ---------- */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ---------- ВОПРОСЫ (добавляй сколько хочешь) ---------- */
const RAW_QUESTIONS: RawQuestion[] = [
  {
    id: 1,
    text: "8 × 7 = ?",
    options: [
      { kind: "text", text: "54", correct: false },
      { kind: "text", text: "56", correct: true },
      { kind: "text", text: "64", correct: false },
    ],
  },
  {
    id: 2,
    text: "72 ÷ 8 = ?",
    options: [
      { kind: "text", text: "8", correct: false },
      { kind: "text", text: "9", correct: true },
      { kind: "text", text: "7", correct: false },
    ],
  },
  {
    id: 3,
    text: "Выбери картинку с квадратом",
    imageSrc: "/quiz/question-square.png",
    options: [
      { kind: "image", src: "/quiz/opt-circle.png", alt: "circle", correct: false },
      { kind: "image", src: "/quiz/opt-square.png", alt: "square", correct: true },
      { kind: "image", src: "/quiz/opt-triangle.png", alt: "triangle", correct: false },
    ],
  },
  {
    id: 4,
    text: "81 ÷ 9 = ?",
    options: [
      { kind: "text", text: "9", correct: true },
      { kind: "text", text: "8", correct: false },
      { kind: "text", text: "7", correct: false },
    ],
  },
  {
    id: 5,
    text: "6 × 9 = ?",
    options: [
      { kind: "text", text: "54", correct: true },
      { kind: "text", text: "56", correct: false },
      { kind: "text", text: "49", correct: false },
    ],
  },
];

function prepareQuestions(): QuestionPrepared[] {
  // если вопросов мало — возьмём сколько есть
  const count = Math.min(QUESTIONS_COUNT, RAW_QUESTIONS.length);

  return shuffle(RAW_QUESTIONS)
    .slice(0, count)
    .map((q) => {
      const team1Opts = shuffle(q.options);
      const team2Opts = shuffle(q.options);

      return {
        id: q.id,
        text: q.text,
        imageSrc: q.imageSrc,
        optionsTeam1: team1Opts,
        optionsTeam2: team2Opts,
        correct1: team1Opts.findIndex((o) => o.correct),
        correct2: team2Opts.findIndex((o) => o.correct),
      };
    });
}

export default function TestRound({
  gameState,
  setGameState,
  onComplete,
}: TestRoundProps) {
  const [questions, setQuestions] = useState<QuestionPrepared[]>(() => prepareQuestions());
  const [index, setIndex] = useState(0);

  const [answered1, setAnswered1] = useState(false);
  const [answered2, setAnswered2] = useState(false);
  const [winner, setWinner] = useState<Team | null>(null);

  // подсветка неправильной кнопки
  const [wrong1, setWrong1] = useState<number | null>(null);
  const [wrong2, setWrong2] = useState<number | null>(null);

  // модалка после 3-го вопроса
  const [showEndModal, setShowEndModal] = useState(false);

  const q = useMemo(() => questions[index], [questions, index]);

  useEffect(() => {
    setAnswered1(false);
    setAnswered2(false);
    setWinner(null);
    setWrong1(null);
    setWrong2(null);
  }, [index]);

  const addPoints = (team: Team) => {
    setGameState((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [team === 1 ? "team1" : "team2"]:
          prev.scores[team === 1 ? "team1" : "team2"] + POINTS,
      },
    }));
  };

  const finishSetOrNext = () => {
    setTimeout(() => {
      const isLast = index >= questions.length - 1;
      if (isLast) {
        setShowEndModal(true); // ✅ после 3-го вопроса
      } else {
        setIndex((i) => i + 1);
      }
    }, FLASH_TIME);
  };

  const handleAnswer = (team: Team, optionIndex: number) => {
    if (showEndModal) return;
    if (winner) return;
    if (team === 1 && answered1) return;
    if (team === 2 && answered2) return;

    const isCorrect =
      team === 1 ? optionIndex === q.correct1 : optionIndex === q.correct2;

    // после нажатия команда больше не может отвечать
    if (team === 1) setAnswered1(true);
    if (team === 2) setAnswered2(true);

    if (isCorrect) {
      setWinner(team);
      addPoints(team);
      finishSetOrNext();
      return;
    }

    // неправильный — подсветка красным
    if (team === 1) setWrong1(optionIndex);
    if (team === 2) setWrong2(optionIndex);

    // если обе команды уже ответили (оба неправильно) — дальше
    const otherAnswered = team === 1 ? answered2 : answered1;
    if (otherAnswered) {
      finishSetOrNext();
    }
  };

  const renderOption = (opt: Option) =>
    opt.kind === "text" ? (
      <span className="opt-text">{opt.text}</span>
    ) : (
      <img className="opt-img" src={opt.src} alt={opt.alt ?? ""} draggable={false} />
    );

  const team1HasImages = q.optionsTeam1.some((o) => o.kind === "image");
  const team2HasImages = q.optionsTeam2.some((o) => o.kind === "image");

  const nextStudents = () => {
    // ✅ новая тройка вопросов, очки НЕ сбрасываем
    setShowEndModal(false);
    setQuestions(prepareQuestions());
    setIndex(0);

    // сброс состояния кнопок/подсветок
    setAnswered1(false);
    setAnswered2(false);
    setWinner(null);
    setWrong1(null);
    setWrong2(null);
  };

  return (
    <div className="test-outer">
      <div className="test-question">
        <div className="question-text">{q.text}</div>
        {q.imageSrc && (
          <div className="question-image-wrap">
            <img className="question-image" src={q.imageSrc} alt="" />
          </div>
        )}
      </div>

      <div className="test-grid">
        {/* TEAM 1 */}
        <div className={`team-panel blue ${winner === 1 ? "win" : ""}`}>
          <div className="team-badge">Team 1</div>

          <div className={`options three ${team1HasImages ? "has-images" : ""}`}>
            {q.optionsTeam1.map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${wrong1 === i ? "wrong" : ""}`}
                disabled={answered1 || !!winner || showEndModal}
                onClick={() => handleAnswer(1, i)}
              >
                {renderOption(opt)}
              </button>
            ))}
          </div>
        </div>

        {/* TEAM 2 */}
        <div className={`team-panel orange ${winner === 2 ? "win" : ""}`}>
          <div className="team-badge">Team 2</div>

          <div className={`options three ${team2HasImages ? "has-images" : ""}`}>
            {q.optionsTeam2.map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${wrong2 === i ? "wrong" : ""}`}
                disabled={answered2 || !!winner || showEndModal}
                onClick={() => handleAnswer(2, i)}
              >
                {renderOption(opt)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="progress">
        Вопрос {index + 1} из {questions.length} • Первый правильный +{POINTS} • Счёт:{" "}
        {gameState.scores.team1} — {gameState.scores.team2}
      </div>

      {/* ✅ МОДАЛКА ПОСЛЕ 3 ВОПРОСА */}
      {showEndModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Готово!</h2>
            <div className="modal-score">
              Текущий счёт: {gameState.scores.team1} — {gameState.scores.team2}
            </div>

            <div className="modal-actions">
              <button className="modal-btn primary" onClick={nextStudents}>
                След. ученики
              </button>
              <button className="modal-btn secondary" onClick={onComplete}>
                След. раунд
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}