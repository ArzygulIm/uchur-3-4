import { useEffect, useMemo, useRef, useState } from "react";
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
  src: string; // текст или картинка
  answer: string; // текст или картинка
  text?: string; // доп текст, если src-картинка
};

type QuestionsData = Record<string, Question[]>;

const TOTAL_TIME = 120;

const questionsData: QuestionsData = {
  Логика: [
    {
      points: 100,
      src: "Адамдар кайсы курт-кумурсканы колго үйрөтүшкөн?",
      answer: "Бал аары",
    },
    {
      points: 200,
      src: "Эң чоң казанга эмне батпайт?",
      answer: "Өзүнүн капкагы",
    },
    {
      points: 300,
      src: "Короз өзүн канаттуу дей алабы?",
      answer: "Жок, себеби сүйлөй албайт",
    },
    {
      points: 400,
      src: "Кандай идиштен эч нерсе жегенге болбойт?",
      answer: "Бош идиштен",
    },
    {
      points: 500,
      src: "Эки ата, эки бала үч апельсинди тең бөлүштү. Бул кандайча?",
      answer: "Чоң ата, ата жана бала",
    },
    {
      points: 600,
      src: "Топту кайра өзүңө кайтып келгидей кылып кантип ыргытса болот?",
      answer: "Жогору карай ыргытса",
    },
    {
      points: 700,
      src: "Кайсы суроого дайыма «ооба» деп жооп берилет?",
      answer: "Сен уктап жатасыңбы?",
    },
  ],

  Туюнтма: [
    { points: 100, src: "9 менен 6нын көбөйтүндүсүн тап", answer: "54" },
    { points: 200, src: "8 менен 7нин суммасын тап", answer: "15" },
    { points: 300, src: "50 менен 30дун айырмасын тап", answer: "20" },
    { points: 400, src: "(458 + 482) : 2 туюнтмасын эсепте", answer: "470" },
    { points: 500, src: "875 менен 683түн суммасын тап", answer: "1558" },
    { points: 600, src: "365 + a, a = 485 болгондо мааниси", answer: "850" },
    {
      points: 700,
      src: "536 кой жана андан 534кө аз эчки. Бардыгы канча?",
      answer: "1070",
    },
  ],

  Геометрия: [
    { points: 100, src: "Үч бурчтуктун канча жагы бар?", answer: "3" },
    {
      points: 200,
      src: "Төрт үч бурчтукту кошсо канча бурч болот?",
      answer: "12",
    },
    {
      points: 300,
      src: "Төрт бурчу бар фигура эмне деп аталат?",
      answer: "Төрт бурчтук",
    },
    {
      points: 400,
      src: "Бал аарылар уясын кандай формада курушат?",
      answer: "Алты бурчтук",
    },
    { points: 500, src: "Көп бурчтук ЭМЕС фигураны ата", answer: "Тегерек" },
    {
      points: 600,
      src: "Кайсы фигуранын башы да, аягы да жок?",
      answer: "Тегерек",
    },
    { points: 700, src: "Квадратта канча тең каптал бар?", answer: "4" },
  ],

  Макалдар: [
    { points: 100, src: "7️⃣ 📏 1️⃣ ✂️", answer: "Жети өлчөп, бир кес" },
    {
      points: 200,
      src: "🚶‍♂️🐐🐐🐐🐐🐐🗣️💣",
      answer: "Айдаганы беш эчки, ышкырыгы таш жарат",
    },
    { points: 300, src: "⏳ 🕊️", answer: "Убакыт учкан куш" },
    {
      points: 400,
      src: "💪1️⃣ 📚💪1000",
      answer: "Билеги күчтүү бирди жыгат, билими күчтүү миңди жыгат",
    },
    { points: 500, src: "👀😨✋💪", answer: "Көз коркок, кол баатыр" },
    { points: 600, src: "1000👂 1👀", answer: "Миң уккандан бир көргөн артык" },
    { points: 700, src: "🎮🔥", answer: "Оюндан от чыгат" },
  ],

  Табышмактар: [
    {
      points: 100,
      src: `Жылбай калат машина,
Ылдамдык менде жатканда.
Оозуң менден ачылат,
Атымды менин айтканда
Ким экенмин анда мен
Кана балдар айткыла`,
      answer: "0 саны",
    },
    {
      points: 200,
      src: `Мына быйыл мектепке,
Биринчи жолу барамын.
Апам абдан кубанып,
Китеп,дептер аламын,
Туура келген санды айт.
Канча жашар баламын.`,
      answer: "7",
    },
    {
      points: 300,
      src: `Жөө күлүктөр жарышса
Маараларга келишет.
Эң алдында келгенге,
Мендей наамды беришет.
Айткылачы атымды.
Мен билейин тезирээк.`,
      answer: "1",
    },
    {
      points: 400,
      src: `Кремлде жаркырап,
Жанып турган жылдызмын.
Канча болот чокусу,
Кана айтчы сен туруп.
Кубанайын мен дагы,
Өз атымды так угуп.`,
      answer: "5",
    },
    {
      points: 500,
      src: `Бутум менен турсам да,
Башым менен турсам да.
Мааним менин өзгөрбөйт.
Бир эле болот атым да.
Кана сен да токтобой,
Атымды ата тартынбай.`,
      answer: "8",
    },
    {
      points: 600,
      src: `Улуттук оюн чынында,
Кызык болот турбайбы.
Сан менен дайым айтылчу.
Оюнду ойноп жыргайлы.
Кайсы сан экенин айткыла.
Оюнду баштап турганда.`,
      answer: "9",
    },
    {
      points: 700,
      src: `Бөдөнөнү куу Түлкү
Басып жээр чагында,
Амал менен айттырды,
Мен куткаргам аны да.
Айтчы атымды угайын,
Ачылаар сенин оозуң да.`,
      answer: "6",
    },
  ],
};

function isImagePath(str: unknown): str is string {
  if (typeof str !== "string") return false;
  const s = str.toLowerCase();
  const exts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  return (
    s.startsWith("/") || s.startsWith("http") || exts.some((e) => s.endsWith(e))
  );
}

function makeCardKey(category: string, points: number) {
  return `${category}|${points}`;
}

export default function QuizBoard({
  gameState,
  setGameState,
  onComplete,
}: QuizBoardProps) {
  const categories = useMemo(() => Object.keys(questionsData), []);
  const usedSet = useMemo(
    () => new Set(gameState.completedQuizCards),
    [gameState.completedQuizCards],
  );

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
              Счёт: <b>{gameState.scores.team1}</b> —{" "}
              <b>{gameState.scores.team2}</b>
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
                <div className="qb-meta-points">
                  {activeQuestion.points} упай
                </div>
                <div className="qb-meta-team">
                  Азыркы команда: <b>Команда {currentTeam}</b>
                </div>
              </div>

              <div className={`qb-timer ${timeLeft <= 10 ? "warning" : ""}`}>
                {timerText}
              </div>
            </div>

            {!showAnswer ? (
              <div className="qb-content">
                {isImagePath(activeQuestion.src) ? (
                  <>
                    <img
                      className="qb-img"
                      src={activeQuestion.src}
                      alt="question"
                    />
                    {activeQuestion.text ? (
                      <div className="qb-text">{activeQuestion.text}</div>
                    ) : null}
                  </>
                ) : (
                  <div className="qb-text pre">{activeQuestion.src}</div>
                )}
              </div>
            ) : (
              <div className="qb-content">
                <div className="qb-answer-title">Жооп / Ответ:</div>
                {isImagePath(activeQuestion.answer) ? (
                  <img
                    className="qb-img"
                    src={activeQuestion.answer}
                    alt="answer"
                  />
                ) : (
                  <div className="qb-text pre">{activeQuestion.answer}</div>
                )}
              </div>
            )}

            <div className="qb-modal-actions">
              {!showAnswer ? (
                <>
                  <button
                    className="qb-btn qb-btn-primary"
                    onClick={onShowAnswerClick}
                  >
                    Жоопту көрсөтүү / Показать ответ
                  </button>
                  <button
                    className="qb-btn"
                    onClick={markCorrect}
                    title="Можно засчитать сразу (без показа ответа)"
                  >
                    ✅ Правильно (+{activeQuestion.points})
                  </button>
                  <button className="qb-btn qb-btn-wrong" onClick={markWrong}>
                    ❌ Неправильно
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="qb-btn qb-btn-correct"
                    onClick={markCorrect}
                  >
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
