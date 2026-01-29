import React, { useEffect, useMemo, useRef, useState } from "react";
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
  options: Option[]; // так 3 вариант, correct:true бирөө гана
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
  onComplete: () => void; // "Кийинки раунд"
}

const POINTS = 10;
const FLASH_TIME = 2000;
const QUESTIONS_COUNT = 3;

/* ---------- жардамчы ---------- */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Жооптор бүтүн сан болушун кааласаң — бөлүү мисалдары так бөлүнгөн.
const RAW_QUESTIONS: RawQuestion[] = [
  // ====== 🔢 1–10: Сандык суроолор (баары бүтүн жооп) ======
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
    text: "12 менен 15тин суммасын тап",
    options: [
      { kind: "text", text: "25", correct: false },
      { kind: "text", text: "27", correct: true },
      { kind: "text", text: "30", correct: false },
    ],
  },
  {
    id: 3,
    text: "32 менен 18дин айырмасын тап",
    options: [
      { kind: "text", text: "14", correct: true },
      { kind: "text", text: "12", correct: false },
      { kind: "text", text: "50", correct: false },
    ],
  },
  {
    id: 4,
    text: "28ди 7ге бөлгөндө тийиндиси канча?",
    options: [
      { kind: "text", text: "4", correct: true },
      { kind: "text", text: "5", correct: false },
      { kind: "text", text: "6", correct: false },
    ],
  },
  {
    id: 5,
    text: "3 менен 6нын көбөйтүндүсүн тап",
    options: [
      { kind: "text", text: "16", correct: false },
      { kind: "text", text: "18", correct: true },
      { kind: "text", text: "20", correct: false },
    ],
  },
  {
    id: 6,
    text: "45ти 9га бөлгөндө тийиндиси канча?",
    options: [
      { kind: "text", text: "4", correct: false },
      { kind: "text", text: "5", correct: true },
      { kind: "text", text: "6", correct: false },
    ],
  },
  {
    id: 7,
    text: "6 менен 9дун көбөйтүндүсүн тап",
    options: [
      { kind: "text", text: "54", correct: true },
      { kind: "text", text: "45", correct: false },
      { kind: "text", text: "63", correct: false },
    ],
  },
  {
    id: 8,
    text: "100 менен 48дин айырмасын тап",
    options: [
      { kind: "text", text: "52", correct: true },
      { kind: "text", text: "58", correct: false },
      { kind: "text", text: "62", correct: false },
    ],
  },
  {
    id: 9,
    text: "36ны 6га бөлгөндө тийиндиси канча?",
    options: [
      { kind: "text", text: "5", correct: false },
      { kind: "text", text: "6", correct: true },
      { kind: "text", text: "7", correct: false },
    ],
  },
  {
    id: 10,
    text: "24 менен 19дун суммасын тап",
    options: [
      { kind: "text", text: "43", correct: true },
      { kind: "text", text: "41", correct: false },
      { kind: "text", text: "45", correct: false },
    ],
  },

  // ====== 📐 11–20: Бурчтар ======
  {
    id: 11,
    text: "Кайсысы тар бурч?",
    options: [
      { kind: "image", src: "/images/angles/tar.png", alt: "тар бурч", correct: true },
      { kind: "image", src: "/images/angles/ken.png", alt: "кен бурч", correct: false },
      { kind: "image", src: "/images/angles/tik.png", alt: "тик бурч", correct: false },
    ],
  },
  {
    id: 12,
    text: "Кайсысы кең бурч?",
    options: [
      { kind: "image", src: "/images/angles/ken.png", alt: "кең бурч", correct: true },
      { kind: "image", src: "/images/angles/tar.png", alt: "тар бурч", correct: false },
      { kind: "image", src: "/images/angles/tik.png", alt: "тик бурч", correct: false },
    ],
  },
  {
    id: 13,
    text: "Кайсысы тик бурч?",
    options: [
      { kind: "image", src: "/images/angles/tik.png", alt: "тик бурч", correct: true },
      { kind: "image", src: "/images/angles/ken.png", alt: "кең бурч", correct: false },
      { kind: "image", src: "/images/angles/tar.png", alt: "тар бурч", correct: false },
    ],
  },
  {
    id: 14,
    text: "Кайсысы жайылган бурч?",
    options: [
      { kind: "image", src: "/images/angles/jaiylgan.png", alt: "жайылган бурч", correct: true },
      { kind: "image", src: "/images/angles/tik.png", alt: "тик бурч", correct: false },
      { kind: "image", src: "/images/angles/tar.png", alt: "тар бурч", correct: false },
    ],
  },
  {
    id: 15,
    text: "Кайсысы тар бурч ЭМЕС?",
    options: [
      { kind: "image", src: "/images/angles/ken.png", alt: "кең бурч", correct: true },
      { kind: "image", src: "/images/angles/tar.png", alt: "тар бурч", correct: false },
      { kind: "image", src: "/images/angles/tik.png", alt: "тик бурч", correct: false },
    ],
  },
  {
    id: 16,
    text: "Кайсысы кең бурч ЭМЕС?",
    options: [
      { kind: "image", src: "/images/angles/tar.png", alt: "тар бурч", correct: true },
      { kind: "image", src: "/images/angles/ken.png", alt: "кең бурч", correct: false },
      { kind: "image", src: "/images/angles/jaiylgan.png", alt: "жайылган бурч", correct: false },
    ],
  },
  {
    id: 17,
    text: "Кайсысы тик бурч ЭМЕС?",
    options: [
      { kind: "image", src: "/images/angles/ken.png", alt: "кең бурч", correct: true },
      { kind: "image", src: "/images/angles/tik.png", alt: "тик бурч", correct: false },
      { kind: "image", src: "/images/angles/tar.png", alt: "тар бурч", correct: false },
    ],
  },
  {
    id: 18,
    text: "Түз сызыкка барабар бурчту танда",
    options: [
      { kind: "image", src: "/images/angles/jaiylgan.png", alt: "жайылган", correct: true },
      { kind: "image", src: "/images/angles/tik.png", alt: "тик", correct: false },
      { kind: "image", src: "/images/angles/ken.png", alt: "кең", correct: false },
    ],
  },
  {
    id: 19,
    text: "90°тан кичине бурч кайсы?",
    options: [
      { kind: "image", src: "/images/angles/tar.png", alt: "тар", correct: true },
      { kind: "image", src: "/images/angles/tik.png", alt: "тик", correct: false },
      { kind: "image", src: "/images/angles/ken.png", alt: "кең", correct: false },
    ],
  },
  {
    id: 20,
    text: "90°тан чоң бурч кайсы?",
    options: [
      { kind: "image", src: "/images/angles/ken.png", alt: "кең", correct: true },
      { kind: "image", src: "/images/angles/tar.png", alt: "тар", correct: false },
      { kind: "image", src: "/images/angles/tik.png", alt: "тик", correct: false },
    ],
  },

  // ====== 🔺 21–30: Фигуралар ======
  {
    id: 21,
    text: "Квадратты тап",
    options: [
      { kind: "image", src: "/images/figures/kvadrat.png", alt: "квадрат", correct: true },
      { kind: "image", src: "/images/figures/uch.png", alt: "үч бурчтук", correct: false },
      { kind: "image", src: "/images/figures/tik.png", alt: "тик бурчтук", correct: false },
    ],
  },
  {
    id: 22,
    text: "Үч бурчтукту тап",
    options: [
      { kind: "image", src: "/images/figures/uch.png", alt: "үч бурчтук", correct: true },
      { kind: "image", src: "/images/figures/kvadrat.png", alt: "квадрат", correct: false },
      { kind: "image", src: "/images/figures/tik.png", alt: "тик бурчтук", correct: false },
    ],
  },
  {
    id: 23,
    text: "Тик бурчтукту тап",
    options: [
      { kind: "image", src: "/images/figures/tik.png", alt: "тик бурчтук", correct: true },
      { kind: "image", src: "/images/figures/kvadrat.png", alt: "квадрат", correct: false },
      { kind: "image", src: "/images/figures/uch.png", alt: "үч бурчтук", correct: false },
    ],
  },
  {
    id: 24,
    text: "Квадрат ЭМЕС фигураны тап",
    options: [
      { kind: "image", src: "/images/figures/tik.png", alt: "тик бурчтук", correct: true },
      { kind: "image", src: "/images/figures/kvadrat.png", alt: "квадрат", correct: false },
      { kind: "image", src: "/images/figures/kvadrat.png?x=1", alt: "квадрат", correct: false },
    ],
  },
  {
    id: 25,
    text: "Үч бурчтук ЭМЕС фигураны тап",
    options: [
      { kind: "image", src: "/images/figures/kvadrat.png", alt: "квадрат", correct: true },
      { kind: "image", src: "/images/figures/uch.png", alt: "үч бурчтук", correct: false },
      { kind: "image", src: "/images/figures/uch.png?x=1", alt: "үч бурчтук", correct: false },
    ],
  },
  {
    id: 26,
    text: "Төрт бурчтуу фигураны тап",
    options: [
      { kind: "image", src: "/images/figures/kvadrat.png", alt: "квадрат", correct: true },
      { kind: "image", src: "/images/figures/uch.png", alt: "үч бурчтук", correct: false },
      { kind: "image", src: "/images/figures/uch.png?x=2", alt: "үч бурчтук", correct: false },
    ],
  },
  {
    id: 27,
    text: "Үч тарабы бар фигура кайсы?",
    options: [
      { kind: "image", src: "/images/figures/uch.png", alt: "үч бурчтук", correct: true },
      { kind: "image", src: "/images/figures/tik.png", alt: "тик бурчтук", correct: false },
      { kind: "image", src: "/images/figures/kvadrat.png", alt: "квадрат", correct: false },
    ],
  },
  {
    id: 28,
    text: "Төрт тарабы бар фигура кайсы?",
    options: [
      { kind: "image", src: "/images/figures/tik.png", alt: "тик бурчтук", correct: true },
      { kind: "image", src: "/images/figures/uch.png", alt: "үч бурчтук", correct: false },
      { kind: "image", src: "/images/figures/uch.png?x=3", alt: "үч бурчтук", correct: false },
    ],
  },
  {
    id: 29,
    text: "Кайсы фигурада бардык бурчтары тик?",
    options: [
      { kind: "image", src: "/images/figures/tik.png", alt: "тик бурчтук", correct: true },
      { kind: "image", src: "/images/figures/uch.png", alt: "үч бурчтук", correct: false },
      { kind: "image", src: "/images/figures/kvadrat.png", alt: "квадрат", correct: false },
    ],
  },
  {
    id: 30,
    text: "Кайсы фигурада бардык капталдары тең? (Бул жерде туурасы – квадрат)",
    options: [
      { kind: "image", src: "/images/figures/kvadrat.png", alt: "квадрат", correct: true },
      { kind: "image", src: "/images/figures/tik.png", alt: "тик бурчтук", correct: false },
      { kind: "image", src: "/images/figures/uch.png", alt: "үч бурчтук", correct: false },
    ],
  },
];

/**
 * Кайталанбасын үчүн:
 * - usedIds ичинде болгон суроолор тандалбайт
 * - эгер суроолор түгөнсө, usedIds тазаланат да кайра башталат
 */
function prepareQuestions(usedIds: Set<number>): QuestionPrepared[] {
  const available = RAW_QUESTIONS.filter((q) => !usedIds.has(q.id));

  // жетпей калса — кайра баштайбыз
  if (available.length < QUESTIONS_COUNT) {
    usedIds.clear();
  }

  const pool = RAW_QUESTIONS.filter((q) => !usedIds.has(q.id));
  const picked = shuffle(pool).slice(0, QUESTIONS_COUNT);

  picked.forEach((q) => usedIds.add(q.id));

  return picked.map((q) => {
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

export default function TestRoundKg({
  gameState,
  setGameState,
  onComplete,
}: TestRoundProps) {
  const usedIdsRef = useRef<Set<number>>(new Set());

  const [questions, setQuestions] = useState<QuestionPrepared[]>(() =>
    prepareQuestions(usedIdsRef.current),
  );
  const [index, setIndex] = useState(0);

  const [answered1, setAnswered1] = useState(false);
  const [answered2, setAnswered2] = useState(false);
  const [winner, setWinner] = useState<Team | null>(null);

  const [wrong1, setWrong1] = useState<number | null>(null);
  const [wrong2, setWrong2] = useState<number | null>(null);

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
        setShowEndModal(true);
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

    if (team === 1) setAnswered1(true);
    if (team === 2) setAnswered2(true);

    if (isCorrect) {
      setWinner(team);
      addPoints(team);
      finishSetOrNext();
      return;
    }

    if (team === 1) setWrong1(optionIndex);
    if (team === 2) setWrong2(optionIndex);

    const otherAnswered = team === 1 ? answered2 : answered1;
    if (otherAnswered) finishSetOrNext();
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
    setShowEndModal(false);
    setQuestions(prepareQuestions(usedIdsRef.current));
    setIndex(0);

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
        {/* 1-Топ */}
        <div className={`team-panel blue ${winner === 1 ? "win" : ""}`}>
          <div className="team-badge">1-Топ</div>

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

        {/* 2-Топ */}
        <div className={`team-panel orange ${winner === 2 ? "win" : ""}`}>
          <div className="team-badge">2-Топ</div>

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
        Суроо {index + 1} / {questions.length} • Туура жооп +{POINTS} упай • Эсеп:{" "}
        {gameState.scores.team1} — {gameState.scores.team2}
      </div>

      {showEndModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Бүттү!</h2>
            <div className="modal-score">
              Азыркы эсеп: {gameState.scores.team1} — {gameState.scores.team2}
            </div>

            <div className="modal-actions">
              <button className="modal-btn primary" onClick={nextStudents}>
                Кийинки окуучулар
              </button>
              <button className="modal-btn secondary" onClick={onComplete}>
                Кийинки раунд
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
