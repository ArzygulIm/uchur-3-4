import React, { useEffect, useMemo, useRef, useState } from "react";
import type { GameState } from "../../App";
import "./QuizBoard.css";

interface QuizBoardProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onComplete: () => void;
}

type Team = 1 | 2;

type Question = {
  points: number;
  src: string;     // текст или картинка
  answer: string;  // текст или картинка
  text?: string;   // доп текст, если src-картинка
};

type QuestionsData = Record<string, Question[]>;

const TOTAL_TIME = 120;

const questionsData: QuestionsData = {
  "Макалдар": [
    { points: 200, src: "/images/makal200.png", answer: "Жети өлчөп бир кес" },
    { points: 400, src: "/images/makal400.png", answer: "Кыздын кырк чачы улуу" },
    { points: 600, src: "/images/makal600.png", answer: "Бир күнү уруш болгон үйдөн кырк күн береке кетет" },
    { points: 800, src: "/images/makal800.png", answer: "Эки жакшы тоого чыкса кудалашып түшөт, Эки жаман тоого чыкса кубалашып түшөт" },
    { points: 1000, src: "/images/makal1000.png", answer: "Аскар аскар аскар тоо, аягы барып чат болот. Атадан алтоо болсо да, сыйлашпаса жат болот" },
  ],
  "Логика": [
    { points: 200, src: "Өрдөк = 3, ит = 3, эчки = 2, ал эми балык = 0. Ал эми мышык канчага барабар? Эмне үчүн?", answer: "3, себеби мяу сөзүндө 3 тамга бар" },
    { points: 400, src: "Суу сактагычтагы суунун деңгээли күн сайын эки эсеге көбөйүп турат. Суу сактагыч толушу үчүн 60 күн керектелет. Канча убакыттан кийин суу сактагыч жарымына чейин толот?", answer: "59 күн" },
    { points: 600, src: "Келип чыккан сан 4төн чоң, 5тен кичине боло тургандай кылып 4 менен 5тин ортосуна белги койгула", answer: "4,5" },
    { points: 800, src: "4 5 6 7 8 9 \n 61 52 63 94 46 ?", answer: "18" },
    { points: 1000, src: "8 8 8 8 8 8 8 8 = 1000 боло тургандай кылып сандардын арасына + белгилерин коюп чыккыла", answer: "888 + 88 + 8 + 8 + 8 = 1000" },
  ],
  "Геометрия": [
    { points: 200, src: "Трапецияда канча жуп параллель капталы бар? \n A)1 B)2 C)3 D)4", answer: "1" },
    { points: 400, src: "Диагоналдары тең жана перпендикуляр кесилишкен төрт бурчтуу фигура кайсы? \n A)Квадрат B)Ромб C)Төрт бурчтуу D)Параллелограмм", answer: "Квадрат" },
    { points: 600, src: "/images/moon.jpg", text: "Айды 2 түз сызык менен 6 бөлүккө бөлгүлө", answer: "/images/moon_answer.jpg" },
    { points: 800, src: "/images/geometry.jpg", text: "Сүрөттө канча квадрат бар", answer: "14" },
    { points: 1000, src: "/images/geometry1000.jpg", answer: "/images/geometry1000_answer.jpg" },
  ],
  "Ребустар": [
    { points: 200, src: "/images/rebus200.png", answer: "Алгебра" },
    { points: 400, src: "/images/rebus400.png", answer: "Транспортир" },
    { points: 600, src: "/images/rebus600.png", answer: "Пифагор" },
    { points: 800, src: "/images/rebus800.png", answer: "Периметр" },
    { points: 1000, src: "/images/rebus1000.png", answer: "Масштаб" },
  ],
};

function isImagePath(str: unknown): str is string {
  if (typeof str !== "string") return false;
  const s = str.toLowerCase();
  const exts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  return s.startsWith("/") || s.startsWith("http") || exts.some((e) => s.endsWith(e));
}

function makeCardKey(category: string, points: number) {
  return `${category}|${points}`;
}

export default function QuizBoard({ gameState, setGameState, onComplete }: QuizBoardProps) {
  const categories = useMemo(() => Object.keys(questionsData), []);
  const usedSet = useMemo(() => new Set(gameState.completedQuizCards), [gameState.completedQuizCards]);

  // ✅ очередь команд (программа сама определяет)
  const [currentTeam, setCurrentTeam] = useState<Team>(1);

  // модалка
  const [isOpen, setIsOpen] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  // таймер
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const timerRef = useRef<number | null>(null);

  const stopTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = (seconds: number) => {
    stopTimer();
    setTimeLeft(seconds);

    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimer();
          setShowAnswer(true); // ✅ время вышло → показываем ответ
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => stopTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timerText = useMemo(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [timeLeft]);

  const openQuestion = (category: string, q: Question) => {
    const key = makeCardKey(category, q.points);
    if (usedSet.has(key)) return;

    // ✅ прогресс (использованные карточки) в gameState → сохраняется в localStorage через useLocalStorage
    setGameState((prev) => ({
      ...prev,
      completedQuizCards: [...prev.completedQuizCards, key],
    }));

    setActiveCategory(category);
    setActiveQuestion(q);
    setShowAnswer(false);
    setIsOpen(true);
    startTimer(TOTAL_TIME);
  };

  const closeModal = () => {
    stopTimer();
    setIsOpen(false);
    setShowAnswer(false);
    setActiveQuestion(null);

    // ✅ после закрытия вопроса очередь команд меняется автоматически
    setCurrentTeam((t) => (t === 1 ? 2 : 1));
  };

  const onShowAnswerClick = () => {
    stopTimer();
    setShowAnswer(true);
  };

  const markCorrect = () => {
    if (!activeQuestion) return;

    const points = activeQuestion.points;

    setGameState((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [currentTeam === 1 ? "team1" : "team2"]:
          prev.scores[currentTeam === 1 ? "team1" : "team2"] + points,
      },
    }));

    closeModal();
  };

  const markWrong = () => {
    // очки не добавляем
    closeModal();
  };

  const resetProgress = () => {
    setGameState((prev) => ({
      ...prev,
      scores: { team1: 0, team2: 0 },
      completedQuizCards: [],
    }));
    setCurrentTeam(1);
  };

  return (
    <div className="qb-wrap">
      {/* верхняя панель */}
      <div className="qb-topbar">
        <div className="qb-left">
          <div className="qb-title">Раунд 3 • Quiz Board</div>
          <div className="qb-sub">
            <span className="qb-turn">Очередь: Команда {currentTeam}</span>
            <span className="qb-score">
              Счёт: <b>{gameState.scores.team1}</b> — <b>{gameState.scores.team2}</b>
            </span>
          </div>
        </div>

        <div className="qb-actions">
          <button className="qb-btn qb-btn-reset" onClick={resetProgress}>
            Сброс
          </button>
          <button className="qb-btn qb-btn-next" onClick={onComplete}>
            Далее
          </button>
        </div>
      </div>

      {/* поле */}
      <div className="qb-board">
        {categories.map((cat) => (
          <div className="qb-row" key={cat}>
            <div className="qb-cat">{cat}</div>

            {questionsData[cat].map((q) => {
              const key = makeCardKey(cat, q.points);
              const used = usedSet.has(key);

              return (
                <button
                  key={key}
                  className={`qb-card ${used ? "used" : ""}`}
                  disabled={used}
                  onClick={() => openQuestion(cat, q)}
                >
                  {q.points}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isOpen && activeQuestion && (
        <div className="qb-modal-overlay">
          <div className="qb-modal">
            <div className="qb-modal-head">
              <div className="qb-meta">
                <div className="qb-meta-cat">{activeCategory}</div>
                <div className="qb-meta-points">{activeQuestion.points} упай</div>
                <div className="qb-meta-team">Азыркы команда: <b>Команда {currentTeam}</b></div>
              </div>

              <div className={`qb-timer ${timeLeft <= 10 ? "warning" : ""}`}>
                {timerText}
              </div>
            </div>

            {!showAnswer ? (
              <div className="qb-content">
                {isImagePath(activeQuestion.src) ? (
                  <>
                    <img className="qb-img" src={activeQuestion.src} alt="question" />
                    {activeQuestion.text ? <div className="qb-text">{activeQuestion.text}</div> : null}
                  </>
                ) : (
                  <div className="qb-text pre">{activeQuestion.src}</div>
                )}
              </div>
            ) : (
              <div className="qb-content">
                <div className="qb-answer-title">Жооп / Ответ:</div>
                {isImagePath(activeQuestion.answer) ? (
                  <img className="qb-img" src={activeQuestion.answer} alt="answer" />
                ) : (
                  <div className="qb-text pre">{activeQuestion.answer}</div>
                )}
              </div>
            )}

            <div className="qb-modal-actions">
              {!showAnswer ? (
                <>
                  <button className="qb-btn qb-btn-primary" onClick={onShowAnswerClick}>
                    Жоопту көрсөтүү / Показать ответ
                  </button>
                  <button className="qb-btn" onClick={markCorrect} title="Можно засчитать сразу (без показа ответа)">
                    ✅ Правильно (+{activeQuestion.points})
                  </button>
                  <button className="qb-btn qb-btn-wrong" onClick={markWrong}>
                    ❌ Неправильно
                  </button>
                </>
              ) : (
                <>
                  <button className="qb-btn qb-btn-correct" onClick={markCorrect}>
                    ✅ Правильно (+{activeQuestion.points})
                  </button>
                  <button className="qb-btn qb-btn-wrong" onClick={markWrong}>
                    ❌ Неправильно
                  </button>
                </>
              )}

              <button className="qb-btn qb-btn-close" onClick={closeModal}>
                Закрыть
              </button>
            </div>

            {showAnswer && (
              <div className="qb-wait">
                Жооп көрсөтүлдү — мугалим баасын тандайт ✅
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}