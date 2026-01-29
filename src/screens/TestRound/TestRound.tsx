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
  // 🔢 Сандык суроолор (1–10)
  {
    id: 1,
    text: "8 менен 7нин көбөйтүндүсүн тап",
    options: [
      { kind: "text", text: "54", correct: false },
      { kind: "text", text: "56", correct: true },
      { kind: "text", text: "64", correct: false },
    ],
  },
  {
    id: 2,
    text: "8 менен 7нин суммасын тап",
    options: [
      { kind: "text", text: "14", correct: false },
      { kind: "text", text: "15", correct: true },
      { kind: "text", text: "16", correct: false },
    ],
  },
  {
    id: 3,
    text: "8 менен 7нин айырмасын тап",
    options: [
      { kind: "text", text: "1", correct: true },
      { kind: "text", text: "15", correct: false },
      { kind: "text", text: "56", correct: false },
    ],
  },
  {
    id: 4,
    text: "8ди 7ге бөлгөндө тийиндиси канча?",
    options: [
      { kind: "text", text: "1", correct: true },
      { kind: "text", text: "7", correct: false },
      { kind: "text", text: "15", correct: false },
    ],
  },
  {
    id: 5,
    text: "7 менен 8нин көбөйтүндүсүн тап",
    options: [
      { kind: "text", text: "56", correct: true },
      { kind: "text", text: "54", correct: false },
      { kind: "text", text: "64", correct: false },
    ],
  },
  {
    id: 6,
    text: "7 менен 8нин суммасын тап",
    options: [
      { kind: "text", text: "14", correct: false },
      { kind: "text", text: "15", correct: true },
      { kind: "text", text: "16", correct: false },
    ],
  },
  {
    id: 7,
    text: "7 менен 8нин айырмасын тап",
    options: [
      { kind: "text", text: "1", correct: true },
      { kind: "text", text: "15", correct: false },
      { kind: "text", text: "56", correct: false },
    ],
  },
  {
    id: 8,
    text: "7ни 8ге бөлгөндө тийиндиси канча?",
    options: [
      { kind: "text", text: "0", correct: true },
      { kind: "text", text: "1", correct: false },
      { kind: "text", text: "7", correct: false },
    ],
  },
  {
    id: 9,
    text: "8 × 7 = ?",
    options: [
      { kind: "text", text: "48", correct: false },
      { kind: "text", text: "56", correct: true },
      { kind: "text", text: "64", correct: false },
    ],
  },
  {
    id: 10,
    text: "8 + 7 = ?",
    options: [
      { kind: "text", text: "14", correct: false },
      { kind: "text", text: "15", correct: true },
      { kind: "text", text: "16", correct: false },
    ],
  },

  // 📐 Бурчтар (11–20)
  {
    id: 11,
    text: "Кайсысы тар бурч?",
    options: [
      {
        kind: "image",
        src: "/images/angles/tar.png",
        alt: "тар бурч",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/angles/ken.png",
        alt: "кен бурч",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/angles/tik.png",
        alt: "тик бурч",
        correct: false,
      },
    ],
  },
  {
    id: 12,
    text: "Кайсысы кен бурч?",
    options: [
      {
        kind: "image",
        src: "/images/angles/ken.png",
        alt: "кен бурч",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/angles/tar.png",
        alt: "тар бурч",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/angles/tik.png",
        alt: "тик бурч",
        correct: false,
      },
    ],
  },
  {
    id: 13,
    text: "Тик бурчту танда",
    options: [
      {
        kind: "image",
        src: "/images/angles/tik.png",
        alt: "тик бурч",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/angles/ken.png",
        alt: "кен бурч",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/angles/tar.png",
        alt: "тар бурч",
        correct: false,
      },
    ],
  },
  {
    id: 14,
    text: "Жайылган бурч кайсы?",
    options: [
      {
        kind: "image",
        src: "/images/angles/jaiylgan.png",
        alt: "жайылган бурч",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/angles/tik.png",
        alt: "тик бурч",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/angles/tar.png",
        alt: "тар бурч",
        correct: false,
      },
    ],
  },
  {
    id: 15,
    text: "90° бурчту тап",
    options: [
      {
        kind: "image",
        src: "/images/angles/tik.png",
        alt: "тик",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/angles/ken.png",
        alt: "кен",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/angles/tar.png",
        alt: "тар",
        correct: false,
      },
    ],
  },
  {
    id: 16,
    text: "90°тан кичине бурч кайсы?",
    options: [
      {
        kind: "image",
        src: "/images/angles/tar.png",
        alt: "тар",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/angles/tik.png",
        alt: "тик",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/angles/ken.png",
        alt: "кен",
        correct: false,
      },
    ],
  },
  {
    id: 17,
    text: "90°тан чоң бурч кайсы?",
    options: [
      {
        kind: "image",
        src: "/images/angles/ken.png",
        alt: "кен",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/angles/tar.png",
        alt: "тар",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/angles/tik.png",
        alt: "тик",
        correct: false,
      },
    ],
  },
  {
    id: 18,
    text: "Түз сызыкка барабар бурч кайсы?",
    options: [
      {
        kind: "image",
        src: "/images/angles/jaiylgan.png",
        alt: "жайылган",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/angles/tik.png",
        alt: "тик",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/angles/ken.png",
        alt: "кен",
        correct: false,
      },
    ],
  },
  {
    id: 19,
    text: "Кайсысы тар бурч ЭМЕС?",
    options: [
      {
        kind: "image",
        src: "/images/angles/ken.png",
        alt: "кен",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/angles/tar.png",
        alt: "тар",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/angles/tik.png",
        alt: "тик",
        correct: false,
      },
    ],
  },
  {
    id: 20,
    text: "Кайсысы тик бурч ЭМЕС?",
    options: [
      {
        kind: "image",
        src: "/images/angles/tar.png",
        alt: "тар",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/angles/tik.png",
        alt: "тик",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/angles/ken.png",
        alt: "кен",
        correct: false,
      },
    ],
  },

  // 🔺 Фигуралар (21–30)
  {
    id: 21,
    text: "Квадратты тап",
    options: [
      {
        kind: "image",
        src: "/images/figures/kvadrat.png",
        alt: "квадрат",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/figures/uch.png",
        alt: "үч бурчтук",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/figures/tik.png",
        alt: "тик бурчтук",
        correct: false,
      },
    ],
  },
  {
    id: 22,
    text: "Үч бурчтукту тап",
    options: [
      {
        kind: "image",
        src: "/images/figures/uch.png",
        alt: "үч бурчтук",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/figures/kvadrat.png",
        alt: "квадрат",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/figures/tik.png",
        alt: "тик бурчтук",
        correct: false,
      },
    ],
  },
  {
    id: 23,
    text: "Тик бурчтукту тап",
    options: [
      {
        kind: "image",
        src: "/images/figures/tik.png",
        alt: "тик бурчтук",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/figures/uch.png",
        alt: "үч бурчтук",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/figures/kvadrat.png",
        alt: "квадрат",
        correct: false,
      },
    ],
  },
  {
    id: 24,
    text: "Төрт бурчу тең фигура кайсы?",
    options: [
      {
        kind: "image",
        src: "/images/figures/kvadrat.png",
        alt: "квадрат",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/figures/tik.png",
        alt: "тик бурчтук",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/figures/uch.png",
        alt: "үч бурчтук",
        correct: false,
      },
    ],
  },
  {
    id: 25,
    text: "Үч тарабы бар фигура кайсы?",
    options: [
      {
        kind: "image",
        src: "/images/figures/uch.png",
        alt: "үч бурчтук",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/figures/kvadrat.png",
        alt: "квадрат",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/figures/tik.png",
        alt: "тик бурчтук",
        correct: false,
      },
    ],
  },
  {
    id: 26,
    text: "Квадрат ЭМЕС фигураны тап",
    options: [
      {
        kind: "image",
        src: "/images/figures/uch.png",
        alt: "үч бурчтук",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/figures/kvadrat.png",
        alt: "квадрат",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/figures/kvadrat.png",
        alt: "квадрат",
        correct: false,
      },
    ],
  },
  {
    id: 27,
    text: "Тик бурчтук кайсы?",
    options: [
      {
        kind: "image",
        src: "/images/figures/tik.png",
        alt: "тик бурчтук",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/figures/kvadrat.png",
        alt: "квадрат",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/figures/uch.png",
        alt: "үч бурчтук",
        correct: false,
      },
    ],
  },
  {
    id: 28,
    text: "Үч бурчтук ЭМЕС фигураны тап",
    options: [
      {
        kind: "image",
        src: "/images/figures/kvadrat.png",
        alt: "квадрат",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/figures/uch.png",
        alt: "үч бурчтук",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/figures/uch.png",
        alt: "үч бурчтук",
        correct: false,
      },
    ],
  },
  {
    id: 29,
    text: "Төрт бурчтуу фигура кайсы?",
    options: [
      {
        kind: "image",
        src: "/images/figures/kvadrat.png",
        alt: "квадрат",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/figures/uch.png",
        alt: "үч бурчтук",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/figures/uch.png",
        alt: "үч бурчтук",
        correct: false,
      },
    ],
  },
  {
    id: 30,
    text: "Үч бурчтуу фигура кайсы?",
    options: [
      {
        kind: "image",
        src: "/images/figures/uch.png",
        alt: "үч бурчтук",
        correct: true,
      },
      {
        kind: "image",
        src: "/images/figures/tik.png",
        alt: "тик бурчтук",
        correct: false,
      },
      {
        kind: "image",
        src: "/images/figures/kvadrat.png",
        alt: "квадрат",
        correct: false,
      },
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
  const [questions, setQuestions] = useState<QuestionPrepared[]>(() =>
    prepareQuestions(),
  );
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
      <img
        className="opt-img"
        src={opt.src}
        alt={opt.alt ?? ""}
        draggable={false}
      />
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

          <div
            className={`options three ${team1HasImages ? "has-images" : ""}`}
          >
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

          <div
            className={`options three ${team2HasImages ? "has-images" : ""}`}
          >
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
        Вопрос {index + 1} из {questions.length} • Первый правильный +{POINTS} •
        Счёт: {gameState.scores.team1} — {gameState.scores.team2}
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
