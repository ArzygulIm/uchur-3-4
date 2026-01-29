import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { GameState } from "../../App";
import "./AtChabysh.css";

// ✅ файлдын жолу: src/audio/atChabysh.mp3
import atChabyshAudio from "../../audio/atChabysh.mp3";

interface AtChabyshProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onComplete: () => void;
}

const TOTAL_TIME = 60;
const TIMER_ENABLED = true;

type Scores = { team1: number; team2: number };

// === CSS МЕНЕН БИРДЕЙ БОЛУШУ КЕРЕК ===
const FINISH_TOP = 60; // .finish-line { top: 60px }
const FINISH_H = 20; // .finish-line бийиктиги

const SAFE_PAD = 8; // коопсуз запас
const HORSE_H = 70; // лошадканын болжолдуу бийиктиги (жазуу + emoji). керек болсо 60..85

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const AtChabysh: React.FC<AtChabyshProps> = ({ gameState, setGameState, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [raceStarted, setRaceStarted] = useState(false);

  // ✅ ушул жарыштагы упайлар (лошадканы жылдырат)
  const [roundScores, setRoundScores] = useState<Scores>({ team1: 0, team2: 0 });

  // 🧊 финиште ушул жарыштын упайын “тоңдурабыз”, лошадка “секирип” кетпесин
  const [finalRoundScores, setFinalRoundScores] = useState<Scores | null>(null);

  const [team1Input, setTeam1Input] = useState("");
  const [team2Input, setTeam2Input] = useState("");

  const [prob1, setProb1] = useState({ q: "", a: 0 });
  const [prob2, setProb2] = useState({ q: "", a: 0 });

  const gameFinished = timeLeft === 0;

  // === музыка ===
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(atChabyshAudio);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    // ▶️ жарыш жүрүп жатканда гана ойнойт
    if (raceStarted && timeLeft > 0) {
      audioRef.current.play().catch(() => {});
      return;
    }

    // ⏸ финиште/стартка чейин токтойт
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, [raceStarted, timeLeft]);

  /* ---------- Мисал түзүү ---------- */
  const generate = () => {
    const isDiv = Math.random() > 0.4;

    if (isDiv) {
      const b = Math.floor(Math.random() * 8) + 2; // 2..9
      const res = Math.floor(Math.random() * 8) + 2; // 2..9
      return { q: `${b * res} ÷ ${b}`, a: res };
    }

    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    return { q: `${a} × ${b}`, a: a * b };
  };

  /* ---------- Дорожканын бийиктигин өлчөйбүз (пиксел менен жылдыруу үчүн) ---------- */
  const leftTrackRef = useRef<HTMLDivElement | null>(null);
  const rightTrackRef = useRef<HTMLDivElement | null>(null);
  const [trackH, setTrackH] = useState<number>(0);

  useLayoutEffect(() => {
    const measure = () => {
      const h1 = leftTrackRef.current?.getBoundingClientRect().height ?? 0;
      const h2 = rightTrackRef.current?.getBoundingClientRect().height ?? 0;
      setTrackH(Math.max(h1, h2));
    };

    measure();

    const ro = new ResizeObserver(measure);
    if (leftTrackRef.current) ro.observe(leftTrackRef.current);
    if (rightTrackRef.current) ro.observe(rightTrackRef.current);

    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  /* ---------- Баштапкы мисалдар ---------- */
  useEffect(() => {
    setProb1(generate());
    setProb2(generate());
  }, []);

  /* ---------- Таймер (старттан кийин гана) ---------- */
  useEffect(() => {
    if (!TIMER_ENABLED || !raceStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [raceStarted]);

  /* ---------- timeLeft=0 болгондо ушул жарыштын упайын тоңдурабыз ---------- */
  useEffect(() => {
    if (timeLeft !== 0) return;
    if (finalRoundScores) return;

    setFinalRoundScores({ team1: roundScores.team1, team2: roundScores.team2 });
  }, [timeLeft, finalRoundScores, roundScores.team1, roundScores.team2]);

  /* ---------- Нумпад ---------- */
  const handleNumpad = (team: 1 | 2, val: string) => {
    if (!raceStarted) return;
    if (gameFinished) return;

    const setInput = team === 1 ? setTeam1Input : setTeam2Input;
    const currentInput = team === 1 ? team1Input : team2Input;

    if (val === "DEL") {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    if (val === "OK") {
      checkAnswer(team);
      return;
    }

    if (currentInput.length < 3) {
      setInput((prev) => prev + val);
    }
  };

  /* ---------- Жоопту текшерүү ---------- */
  const checkAnswer = (team: 1 | 2) => {
    const input = team === 1 ? team1Input : team2Input;
    const prob = team === 1 ? prob1 : prob2;

    const setInput = team === 1 ? setTeam1Input : setTeam2Input;
    const setProb = team === 1 ? setProb1 : setProb2;

    const parsed = parseInt(input, 10);

    if (!Number.isNaN(parsed) && parsed === prob.a) {
      // ✅ 1) жалпы упай (ар бир жарыштан кийин кошулуп турат)
      setGameState((prev) => ({
        ...prev,
        scores: {
          ...prev.scores,
          [`team${team}`]: prev.scores[team === 1 ? "team1" : "team2"] + 10,
        },
      }));

      // ✅ 2) ушул жарыштын упайы (лошадканы жылдырат)
      setRoundScores((prev) => ({
        ...prev,
        [team === 1 ? "team1" : "team2"]: prev[team === 1 ? "team1" : "team2"] + 10,
      }));

      setProb(generate());
    }

    setInput("");
  };

  /* ---------- Лошадканын орду (пиксел менен) ---------- */
  const calculateBottomPx = (score: number, team: 1 | 2) => {
    if (trackH <= 0) return `${SAFE_PAD}px`;

    const startBottomPx = SAFE_PAD;

    // Финишке чейин: лошадка finish-line'ды убакыт бүтө электе кесип өтпөсүн
    // horseTop = trackH - bottom - HORSE_H
    // керек: horseTop >= FINISH_TOP + FINISH_H + SAFE_PAD
    const maxBeforeFinishPx = trackH - HORSE_H - (FINISH_TOP + FINISH_H + SAFE_PAD);
    const safeBefore = clamp(maxBeforeFinishPx, 20, trackH);

    // Фиништен өтүү (жеңүүчү timeLeft=0 болгондо гана)
    const maxAfterFinishPx = trackH - HORSE_H - SAFE_PAD;
    const safeAfter = clamp(maxAfterFinishPx, safeBefore, trackH);

    if (!raceStarted) return `${startBottomPx}px`;

    // Финиш — таймер 0 болгондо гана
    if (timeLeft === 0 && finalRoundScores) {
      const s1 = finalRoundScores.team1;
      const s2 = finalRoundScores.team2;
      const isWinner = (team === 1 && s1 > s2) || (team === 2 && s2 > s1);

      return isWinner ? `${safeAfter}px` : `${safeBefore}px`;
    }

    // Оюн жүрүп жатканда: убакыт + упай бонусу, бирок safeBefore'ден ашпайт
    const progressTime = (TOTAL_TIME - timeLeft) / TOTAL_TIME; // 0..1
    const bonus = clamp((score / 10) * 0.03, 0, 0.4); // ар 10 упай ~ +0.03

    const progress = clamp(progressTime * 0.75 + bonus, 0, 1);
    const bottomPx = startBottomPx + progress * (safeBefore - startBottomPx);

    return `${bottomPx}px`;
  };

  /* ---------- Модалкадагы тексттер ---------- */
  const winnerText = useMemo(() => {
    const s1 = finalRoundScores ? finalRoundScores.team1 : roundScores.team1;
    const s2 = finalRoundScores ? finalRoundScores.team2 : roundScores.team2;

    if (s1 > s2) return "🏆 Бул жарышта 3-класстын окуучусу жеңди";
    if (s2 > s1) return "🏆 Бул жарышта 4-класстын окуучусу жеңди";
    return "🤝 Жарыш тең болду";
  }, [finalRoundScores, roundScores.team1, roundScores.team2]);

  const roundScoreText = useMemo(() => {
    const s1 = finalRoundScores ? finalRoundScores.team1 : roundScores.team1;
    const s2 = finalRoundScores ? finalRoundScores.team2 : roundScores.team2;
    return `Бул жарыштын баллы: ${s1} — ${s2}`;
  }, [finalRoundScores, roundScores.team1, roundScores.team2]);

  const totalScoreText = useMemo(() => {
    return `Жалпы балл: ${gameState.scores.team1} — ${gameState.scores.team2}`;
  }, [gameState.scores.team1, gameState.scores.team2]);

  /* ---------- Кийинки окуучулар (жаңы жарыш) ---------- */
  const nextStudents = () => {
    setFinalRoundScores(null);
    setRoundScores({ team1: 0, team2: 0 });

    setTimeLeft(TOTAL_TIME);
    setTeam1Input("");
    setTeam2Input("");
    setProb1(generate());
    setProb2(generate());

    // жаңы жарышты дароо баштайбыз
    setRaceStarted(true);
  };

  /* ---------- Биринчи баштоо ---------- */
  const firstStart = () => {
    setFinalRoundScores(null);
    setRoundScores({ team1: 0, team2: 0 });

    setTimeLeft(TOTAL_TIME);
    setTeam1Input("");
    setTeam2Input("");
    setProb1(generate());
    setProb2(generate());

    setRaceStarted(true);
  };

  const Numpad = ({ team }: { team: 1 | 2 }) => (
    <div className="numpad">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
        <button
          key={n}
          className="btn"
          onClick={() => handleNumpad(team, n.toString())}
          disabled={!raceStarted || gameFinished}
        >
          {n}
        </button>
      ))}
      <button
        className="btn btn-del"
        onClick={() => handleNumpad(team, "DEL")}
        disabled={!raceStarted || gameFinished}
      >
        ✖
      </button>
      <button
        className="btn btn-ok"
        onClick={() => handleNumpad(team, "OK")}
        disabled={!raceStarted || gameFinished}
      >
        OK
      </button>
    </div>
  );

  return (
    <div className="game-outer">
      <div className="game-container">
        {TIMER_ENABLED && <div className="timer-box">Убакыт: {timeLeft}</div>}

        {!raceStarted && (
          <button onClick={firstStart} className="start-btn">
            🚦 Баштоо
          </button>
        )}

        {/* Сол дорожка */}
        <div className="track" ref={leftTrackRef}>
          <div className="finish-line" />
          <div className="horse" style={{ bottom: calculateBottomPx(roundScores.team1, 1) }}>
            <span className="horse-label" style={{ color: "#3b82f6" }}>
              3-класс
            </span>
            🐎
          </div>
        </div>

        {/* 1-команда */}
        <div className="play-area area-blue">
          <div className="question">{prob1.q}</div>
          <div className="screen">{team1Input}</div>
          <Numpad team={1} />
        </div>

        {/* 2-команда */}
        <div className="play-area area-orange">
          <div className="question">{prob2.q}</div>
          <div className="screen">{team2Input}</div>
          <Numpad team={2} />
        </div>

        {/* Оң дорожка */}
        <div className="track" ref={rightTrackRef}>
          <div className="finish-line" />
          <div className="horse" style={{ bottom: calculateBottomPx(roundScores.team2, 2) }}>
            <span className="horse-label" style={{ color: "#f97316" }}>
              4-класс
            </span>
            🏇
          </div>
        </div>

        {/* Финалдык модалка */}
        {timeLeft === 0 && (
          <div className="modal-overlay">
            <div className="modal">
              <h2 className="modal-title">{winnerText}</h2>

              <div className="modal-text">{roundScoreText}</div>
              <div className="modal-text">{totalScoreText}</div>

              <div className="modal-actions">
                <button onClick={nextStudents} className="btn modal-btn">
                  Кийинки окуучулар
                </button>
                <button onClick={onComplete} className="btn btn-ok modal-btn">
                  Кийинки раунд
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AtChabysh;