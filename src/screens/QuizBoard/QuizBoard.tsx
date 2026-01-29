import React, { useEffect, useMemo, useState } from "react";
import "./QuizBoard.css";

type Category = "Логика" | "Туюнтма" | "Геометрия" | "Макалдар" | "Табышмактар";

const POINTS = [100, 200, 300, 400, 500, 600, 700] as const;

type QuizQuestion = {
  category: Category;
  points: (typeof POINTS)[number];
  text?: string;
  imageSrc?: string; // public/images/...
  answer: string;
};

type UsedMap = Record<string, boolean>;

const STORAGE_KEY_USED = "quiz_used_v1";
const STORAGE_KEY_SCORES = "quiz_scores_v1";
const STORAGE_KEY_TEAM = "quiz_activeTeam_v1";

// ⚠️ СУРООЛОРУҢ (сен жазгандай калтырдым)
const QUESTIONS: QuizQuestion[] = [
  // ---------------- ЛОГИКА (7) ----------------
  { category: "Логика", points: 100, text: "Адамдар кайсы курт-кумурсканы колго үйрөтүшкөн?", answer: "Бал аары" },
  { category: "Логика", points: 200, text: "Эң чоң казанга эмне батпайт?", answer: "Өзүнүн капкагы" },
  { category: "Логика", points: 300, text: "Короз өзүн канаттуу дей алабы?", answer: "Жок, анткени короз сүйлөй албайт" },
  { category: "Логика", points: 400, text: "Кандай идиштен эч нерсе жегенге болбойт?", answer: "Бош идиштен" },
  { category: "Логика", points: 500, text: "Эки ата, эки бала үч апельсинди тең бөлүштү. Бул кандайча?", answer: "Чоң ата, ата жана бала болгон" },
  { category: "Логика", points: 600, text: "Топ өзүнө кайра кайтып келиш үчүн кантип ыргытса болот?", answer: "Жогору карай ыргытса" },
  { category: "Логика", points: 700, text: "Кайсы суроого дайыма «ооба» деп жооп берилет?", answer: "Сен уктап жатасыңбы?" },

  // ---------------- ТУЮНТМА (7) ----------------
  { category: "Туюнтма", points: 100, text: "9 менен 6нын көбөйтүндүсүн тап", answer: "54" },
  { category: "Туюнтма", points: 200, text: "24 менен 19дун суммасын тап", answer: "43" },
  { category: "Туюнтма", points: 300, text: "100 менен 48дин айырмасын тап", answer: "52" },
  { category: "Туюнтма", points: 400, text: "28ди 7ге бөлгөндө тийиндиси канча?", answer: "4" },
  { category: "Туюнтма", points: 500, text: "45ти 9га бөлгөндө тийиндиси канча?", answer: "5" },
  { category: "Туюнтма", points: 600, text: "6 менен 9дун көбөйтүндүсүн тап", answer: "54" },
  { category: "Туюнтма", points: 700, text: "36ны 6га бөлгөндө тийиндиси канча?", answer: "6" },

  // ---------------- ГЕОМЕТРИЯ (7) ----------------
  { category: "Геометрия", points: 100, text: "Сүрөттө канча үч бурчтук бар?", imageSrc: "/images/geo100.png", answer: "9" },
  { category: "Геометрия", points: 200, text: "Төрт үч бурчтукту кошсо, канча бурч болот?", answer: "12" },
  { category: "Геометрия", points: 300, text: "Эгерде көп бурчтуктун төрт бурчу, төрт чокусу, төрт жагы болсо, анда ал эмне деп аталат ?", answer: "төрт бурчтук" },
  { category: "Геометрия", points: 400, text: "Бал аарылар уячаларын кандай бурчтук формасында курушат?", answer: "алты бурчтук" },
  { category: "Геометрия", points: 500, text: "Көп бурчтук эмес фигураны көрсөт \n а) үч бурчтук   б) тегерек   в) беш бурчтук", answer: "тегерек" },
  { category: "Геометрия", points: 600, text: "Канча үч бурчтук бар ?", imageSrc: "/images/geo600.png", answer: "11" },
  { category: "Геометрия", points: 700, text: "Кайсы фигуранын баш аягы жок ?", answer: "тегерек" },

  // ---------------- МАКАЛДАР (7) ----------------
  { category: "Макалдар", points: 100, text: "7️⃣ 📏 1️⃣ ✂️", answer: "Жети өлчөп, бир кес" },
  { category: "Макалдар", points: 200, text: "🚶‍♂️🐐🐐🐐🐐🐐 🗣️💣", answer: "Айдаганы беш эчки, ышкырыгы таш жарат" },
  { category: "Макалдар", points: 300, text: "⏳ 🕊️", answer: "Убакыт учкан куш" },
  { category: "Макалдар", points: 400, text: "💪1️⃣ 📚💪1000", answer: "Билеги күчтүү бирди жыгат, билими күчтүү миңди жыгат" },
  { category: "Макалдар", points: 500, text: "👀😨✋💪", answer: "Көз коркок, кол баатыр" },
  { category: "Макалдар", points: 600, text: "1000👂 1👀", answer: "Миң уккандан, бир көргөн артык" },
  { category: "Макалдар", points: 700, text: "🎮🔥", answer: "Оюндан от чыгат" },

  // ---------------- ТАБЫШМАКТАР (7) ----------------
  { category: "Табышмактар", points: 100, text: `Жылбай калат машина,\nЫлдамдык менде жатканда.\nОозуң менден ачылат,\nАтымды менин айтканда.`, answer: "0 саны" },
  { category: "Табышмактар", points: 200, text: `Мына быйыл мектепке,\nБиринчи жолу барамын.\nАпам абдан кубанып,\nКитеп, дептер аламын.\nТуура келген санды айт,\nКанча жашар баламын.`, answer: "7" },
  { category: "Табышмактар", points: 300, text: `Жөө күлүктөр жарышса\nМаараларга келишет.\nЭң алдында келгенге,\nМендей наамды беришет.`, answer: "1" },
  { category: "Табышмактар", points: 400, text: `Кремлде жаркырап,\nЖанып турган жылдызмын.\nКанча болот чокусу?`, answer: "5" },
  { category: "Табышмактар", points: 500, text: `Бутум менен турсам да,\nБашым менен турсам да.\nМааним менин өзгөрбөйт.`, answer: "8" },
  { category: "Табышмактар", points: 600, text: `Улуттук оюн чынында,\nКызык болот турбайбы.\nСан менен дайым айтылчу.`, answer: "9" },
  { category: "Табышмактар", points: 700, text: `Бөдөнөнү куу Түлкү\nБасып жээр чагында,\nАмал менен айттырды,\nМен куткаргам аны да.`, answer: "6" },
];

function keyOf(cat: Category, pts: number) {
  return `${cat}-${pts}`;
}
function findQuestion(cat: Category, pts: number): QuizQuestion | undefined {
  return QUESTIONS.find((q) => q.category === cat && q.points === pts);
}

// ---------- safe localStorage helpers ----------
function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function writeJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export default function QuizBoard() {
  const categories: Category[] = useMemo(
    () => ["Логика", "Туюнтма", "Геометрия", "Макалдар", "Табышмактар"],
    [],
  );

  // ✅ used карталарды storage'тан окуйбуз
  const [used, setUsed] = useState<UsedMap>(() => readJSON<UsedMap>(STORAGE_KEY_USED, {}));

  // ✅ баллдар да сакталсын десең — бул да storage'тан
  const [scores, setScores] = useState(() =>
    readJSON<{ team1: number; team2: number }>(STORAGE_KEY_SCORES, { team1: 0, team2: 0 }),
  );

  // ✅ актив команда да сакталсын
  const [activeTeam, setActiveTeam] = useState<1 | 2>(() =>
    readJSON<1 | 2>(STORAGE_KEY_TEAM, 1),
  );

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<QuizQuestion | null>(null);

  const [timeLeft, setTimeLeft] = useState(30);
  const warning = timeLeft <= 10;

  const [showAnswer, setShowAnswer] = useState(false);
  const [paused, setPaused] = useState(false);

  // ✅ used өзгөргөн сайын storage'ка жазабыз
  useEffect(() => writeJSON(STORAGE_KEY_USED, used), [used]);

  // ✅ scores сакталсын
  useEffect(() => writeJSON(STORAGE_KEY_SCORES, scores), [scores]);

  // ✅ activeTeam сакталсын
  useEffect(() => writeJSON(STORAGE_KEY_TEAM, activeTeam), [activeTeam]);

  const openQuestion = (cat: Category, pts: (typeof POINTS)[number]) => {
    const q = findQuestion(cat, pts);
    if (!q) return;

    const k = keyOf(cat, pts);
    if (used[k]) return;

    setCurrent(q);
    setOpen(true);
    setTimeLeft(30);
    setPaused(false);
    setShowAnswer(false);
  };

  const markUsed = () => {
    if (!current) return;
    const k = keyOf(current.category, current.points);
    setUsed((prev) => ({ ...prev, [k]: true }));
  };

  const closeModal = () => {
    setOpen(false);
    setCurrent(null);
    setShowAnswer(false);
    setPaused(false);
  };

  const resetBoard = () => {
    setUsed({});
    setScores({ team1: 0, team2: 0 });
    setActiveTeam(1);

    // storage тазалоо
    try {
      localStorage.removeItem(STORAGE_KEY_USED);
      localStorage.removeItem(STORAGE_KEY_SCORES);
      localStorage.removeItem(STORAGE_KEY_TEAM);
    } catch {}

    closeModal();
  };

  // Таймер (paused болгондо токтойт)
  useEffect(() => {
    if (!open || paused) return;

    const t = setInterval(() => {
      setTimeLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(t);
  }, [open, paused]);

  // убакыт 0 болсо жооп автомат көрүнөт + таймер токтойт
  useEffect(() => {
    if (!open) return;
    if (timeLeft === 0) {
      setPaused(true);
      setShowAnswer(true);
    }
  }, [timeLeft, open]);

  const addPointsToTeam = (team: 1 | 2, pts: number) => {
    setScores((prev) => ({
      team1: team === 1 ? prev.team1 + pts : prev.team1,
      team2: team === 2 ? prev.team2 + pts : prev.team2,
    }));
  };

  const handleShowAnswer = () => {
    setPaused(true);     // ⏸ токтойт
    setShowAnswer(true); // 👀 жооп дароо
  };

  const handleCorrect = () => {
    if (!current) return;
    addPointsToTeam(activeTeam, current.points);
    markUsed();
    closeModal();
  };

  const handleWrong = () => {
    markUsed();
    closeModal();
  };

  return (
    <div className="qb-wrap">
      <div className="qb-topbar">
        <div className="qb-title">Quiz Board</div>

        <div className="qb-actions">
          <button className="qb-btn qb-btn-reset" onClick={resetBoard}>
            Сброс
          </button>
        </div>
      </div>

      {/* SCORE + ACTIVE TEAM */}
      <div className="qb-topbar" style={{ marginBottom: 10 }}>
        <div style={{ fontWeight: 900 }}>
          Эсеп: 1-топ {scores.team1} — 2-топ {scores.team2}
        </div>

        <div className="qb-actions">
          <button
            className="qb-btn qb-btn-reset"
            onClick={() => setActiveTeam(1)}
            style={{
              background: activeTeam === 1 ? "#3b82f6" : "#334155",
              color: "white",
            }}
          >
            Актив: 1-топ
          </button>
          <button
            className="qb-btn qb-btn-reset"
            onClick={() => setActiveTeam(2)}
            style={{
              background: activeTeam === 2 ? "#f97316" : "#334155",
              color: "white",
            }}
          >
            Актив: 2-топ
          </button>
        </div>
      </div>

      <div className="qb-board">
        {categories.map((cat) => (
          <div className="qb-row" key={cat}>
            <div className="qb-cat">{cat}</div>

            {POINTS.map((pts) => {
              const k = keyOf(cat, pts);
              const isUsed = !!used[k];
              return (
                <button
                  key={pts}
                  className={`qb-card ${isUsed ? "used" : ""}`}
                  disabled={isUsed}
                  onClick={() => openQuestion(cat, pts)}
                >
                  {pts}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {open && current && (
        <div className="qb-modal-overlay" onClick={closeModal}>
          <div className="qb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qb-modal-head">
              <div className="qb-meta">
                <div className="qb-meta-cat">{current.category}</div>
                <div className="qb-meta-points">
                  {current.points} балл • Актив команда: {activeTeam}-топ
                </div>
              </div>

              <div className={`qb-timer ${warning ? "warning" : ""}`}>
                {timeLeft}s
              </div>
            </div>

            <div className="qb-content">
              {current.text && (
                <div className={`qb-text ${current.text.includes("\n") ? "pre" : ""}`}>
                  {current.text}
                </div>
              )}

              {current.imageSrc && (
                <img className="qb-img" src={current.imageSrc} alt="суроо" />
              )}
            </div>

            <div className="qb-modal-actions">
              {!showAnswer ? (
                <>
                  <button className="qb-btn qb-btn-primary" onClick={handleShowAnswer}>
                    Жоопту көрсөт
                  </button>
                  <div className="qb-wait">Команда жооп берип жатат…</div>
                  <button className="qb-btn qb-btn-reset" onClick={closeModal}>
                    Жабуу
                  </button>
                </>
              ) : (
                <>
                  <div className="qb-wait">
                    Жооп: <b>{current.answer}</b>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="qb-btn qb-btn-primary" onClick={handleCorrect}>
                      Туура ✅ (+{current.points})
                    </button>
                    <button className="qb-btn qb-btn-reset" onClick={handleWrong}>
                      Туура эмес ❌
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}