import React, { useEffect, useMemo, useState } from "react";
import "./QuizBoard.css";

type Category = "Логика" | "Туюнтма" | "Геометрия" | "Макалдар" | "Табышмактар";

const POINTS = [100, 200, 300, 400, 500, 600, 700] as const;

type QuizQuestion = {
  category: Category;
  points: (typeof POINTS)[number];
  text?: string;       // ✅ болушу мүмкүн
  imageSrc?: string;   // ✅ болушу мүмкүн (public/images/... )
  answer: string;
};

type UsedMap = Record<string, boolean>;

const QUESTIONS: QuizQuestion[] = [
  // ---------------- ЛОГИКА (7) ----------------
  { category: "Логика", points: 100, text: "Адамдар кайсы курт-кумурсканы колго үйрөтүшкөн?", answer: "Бал аары" },
  { category: "Логика", points: 200, text: "Эң чоң казанга эмне батпайт?", answer: "Өзүнүн капкагы" },
  { category: "Логика", points: 300, text: "Короз өзүн канаттуу дей алабы?", answer: "Жок, анткени короз сүйлөй албайт" },
  { category: "Логика", points: 400, text: "Кандай идиштен эч нерсе жегенге болбойт?", answer: "Бош идиштен" },
  { category: "Логика", points: 500, text: "Эки ата, эки бала үч апельсинди тең бөлүштү. Бул кандайча?", answer: "Чоң ата, ата жана бала болгон" },
  { category: "Логика", points: 600, text: "Топ өзүнө кайра кайтып келиш үчүн кантип ыргытса болот?", answer: "Жогору карай ыргытса" },
  { category: "Логика", points: 700, text: "Кайсы суроого дайыма «ооба» деп жооп берилет?", answer: "Сен уктап жатасыңбы?" },

  // ---------------- ТУЮНТМА (7) — баары бүтүн жооп ----------------
  { category: "Туюнтма", points: 100, text: "9 менен 6нын көбөйтүндүсүн тап", answer: "54" },
  { category: "Туюнтма", points: 200, text: "24 менен 19дун суммасын тап", answer: "43" },
  { category: "Туюнтма", points: 300, text: "100 менен 48дин айырмасын тап", answer: "52" },
  { category: "Туюнтма", points: 400, text: "28ди 7ге бөлгөндө тийиндиси канча?", answer: "4" },
  { category: "Туюнтма", points: 500, text: "45ти 9га бөлгөндө тийиндиси канча?", answer: "5" },
  { category: "Туюнтма", points: 600, text: "6 менен 9дун көбөйтүндүсүн тап", answer: "54" },
  { category: "Туюнтма", points: 700, text: "36ны 6га бөлгөндө тийиндиси канча?", answer: "6" },

  // ---------------- ГЕОМЕТРИЯ (7) — текст +/же сүрөт ----------------
  { category: "Геометрия", points: 100, text: "Сүрөттө канча үч бурчтук бар?", imageSrc: "/images/geo100.png", answer: "9" },
  { category: "Геометрия", points: 200, text: "Сүрөттө канча квадрат бар?", imageSrc: "/images/geo200.png", answer: "14" },
  { category: "Геометрия", points: 300, text: "Бал аарылар уяларын кандай формада курушат?", imageSrc: "/images/geo300.png", answer: "Алты бурчтук" },
  { category: "Геометрия", points: 400, text: "Трапецияда канча жуп параллель каптал бар?", answer: "1" },
  { category: "Геометрия", points: 500, text: "Төрт бурчу, төрт чокусу, төрт жагы бар фигура кандай аталат?", answer: "Төрт бурчтук" },
  { category: "Геометрия", points: 600, text: "Айлананын башы-аягы барбы?", answer: "Жок" },
  { category: "Геометрия", points: 700, text: "Квадратта канча тең каптал бар?", answer: "4" },

  // ---------------- МАКАЛДАР (7) ----------------
  { category: "Макалдар", points: 100, text: "7️⃣ 📏 1️⃣ ✂️", answer: "Жети өлчөп, бир кес" },
  { category: "Макалдар", points: 200, text: "🚶‍♂️🐐🐐🐐🐐🐐 🗣️💣", answer: "Айдаганы беш эчки, ышкырыгы таш жарат" },
  { category: "Макалдар", points: 300, text: "⏳ 🕊️", answer: "Убакыт учкан куш" },
  { category: "Макалдар", points: 400, text: "💪1️⃣ 📚💪1000", answer: "Билеги күчтүү бирди жыгат, билими күчтүү миңди жыгат" },
  { category: "Макалдар", points: 500, text: "👀😨✋💪", answer: "Көз коркок, кол баатыр" },
  { category: "Макалдар", points: 600, text: "1000👂 1👀", answer: "Миң уккандан, бир көргөн артык" },
  { category: "Макалдар", points: 700, text: "🎮🔥", answer: "Оюндан от чыгат" },

  // ---------------- ТАБЫШМАКТАР (7) ----------------
  {
    category: "Табышмактар",
    points: 100,
    text: `Жылбай калат машина,
Ылдамдык менде жатканда.
Оозуң менден ачылат,
Атымды менин айтканда.`,
    answer: "0 саны",
  },
  {
    category: "Табышмактар",
    points: 200,
    text: `Мына быйыл мектепке,
Биринчи жолу барамын.
Апам абдан кубанып,
Китеп, дептер аламын.
Туура келген санды айт,
Канча жашар баламын.`,
    answer: "7",
  },
  {
    category: "Табышмактар",
    points: 300,
    text: `Жөө күлүктөр жарышса
Маараларга келишет.
Эң алдында келгенге,
Мендей наамды беришет.`,
    answer: "1",
  },
  {
    category: "Табышмактар",
    points: 400,
    text: `Кремлде жаркырап,
Жанып турган жылдызмын.
Канча болот чокусу?`,
    answer: "5",
  },
  {
    category: "Табышмактар",
    points: 500,
    text: `Бутум менен турсам да,
Башым менен турсам да.
Мааним менин өзгөрбөйт.`,
    answer: "8",
  },
  {
    category: "Табышмактар",
    points: 600,
    text: `Улуттук оюн чынында,
Кызык болот турбайбы.
Сан менен дайым айтылчу.`,
    answer: "9",
  },
  {
    category: "Табышмактар",
    points: 700,
    text: `Бөдөнөнү куу Түлкү
Басып жээр чагында,
Амал менен айттырды,
Мен куткаргам аны да.`,
    answer: "6",
  },
];

function keyOf(cat: Category, pts: number) {
  return `${cat}-${pts}`;
}

function findQuestion(cat: Category, pts: number): QuizQuestion | undefined {
  return QUESTIONS.find((q) => q.category === cat && q.points === pts);
}

export default function QuizBoard() {
  const categories: Category[] = useMemo(
    () => ["Логика", "Туюнтма", "Геометрия", "Макалдар", "Табышмактар"],
    [],
  );

  const [used, setUsed] = useState<UsedMap>({});
  const [open, setOpen] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [current, setCurrent] = useState<QuizQuestion | null>(null);

  const [timeLeft, setTimeLeft] = useState(30); // секунд
  const warning = timeLeft <= 10;

  const openQuestion = (cat: Category, pts: (typeof POINTS)[number]) => {
    const q = findQuestion(cat, pts);
    if (!q) return;

    const k = keyOf(cat, pts);
    if (used[k]) return;

    setCurrent(q);
    setOpen(true);
    setShowAnswer(false);
    setTimeLeft(30);
  };

  const markUsed = () => {
    if (!current) return;
    const k = keyOf(current.category, current.points);
    setUsed((prev) => ({ ...prev, [k]: true }));
  };

  const closeModal = () => {
    setOpen(false);
    setShowAnswer(false);
    setCurrent(null);
  };

  const resetBoard = () => {
    setUsed({});
    closeModal();
  };

  // Таймер
  useEffect(() => {
    if (!open) return;

    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) return 0;
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [open]);

  // 0 болгондо жоопту көрсөтөбүз (кааласаң өчүрүп койсоң болот)
  useEffect(() => {
    if (!open) return;
    if (timeLeft === 0) setShowAnswer(true);
  }, [timeLeft, open]);

  return (
    <div className="qb-wrap">
      <div className="qb-topbar">
        <div className="qb-title">Раунд · Quiz Board</div>

        <div className="qb-actions">
          <button className="qb-btn qb-btn-reset" onClick={resetBoard}>
            Сброс
          </button>
          <button
            className="qb-btn qb-btn-next"
            onClick={() => alert("Кийинки раунд логикасын өзүң кошосуң 🙂")}
          >
            Далее
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
                <div className="qb-meta-points">{current.points} балл</div>
              </div>

              <div className={`qb-timer ${warning ? "warning" : ""}`}>
                {timeLeft}s
              </div>
            </div>

            <div className="qb-content">
              {/* TEXT */}
              {current.text && (
                <div className={`qb-text ${current.text.includes("\n") ? "pre" : ""}`}>
                  {current.text}
                </div>
              )}

              {/* IMAGE */}
              {current.imageSrc && (
                <img className="qb-img" src={current.imageSrc} alt="суроо" />
              )}
            </div>

            <div className="qb-modal-actions">
              <button
                className="qb-btn qb-btn-primary"
                onClick={() => {
                  setShowAnswer(true);
                  markUsed();
                }}
              >
                Жоопту көрсөт
              </button>

              {showAnswer ? (
                <div className="qb-wait">
                  Жооп: <b>{current.answer}</b>
                </div>
              ) : (
                <div className="qb-wait">Команда жооп берип жатат…</div>
              )}

              <button
                className="qb-btn qb-btn-reset"
                onClick={() => {
                  markUsed();
                  closeModal();
                }}
              >
                Жабуу
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}