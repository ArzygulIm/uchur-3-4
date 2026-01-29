import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { GameState } from "../../App";
import "./AtChabysh.css";

// ✅ путь к файлу: src/audio/atChabysh.mp3
import atChabyshAudio from "../../audio/atChabysh.mp3";

interface AtChabyshProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onComplete: () => void;
}

const TOTAL_TIME = 60;
const TIMER_ENABLED = true;

type Scores = { team1: number; team2: number };

// === ДОЛЖНО СОВПАДАТЬ С CSS ===
const FINISH_TOP = 60;   // .finish-line { top: 60px }
const FINISH_H = 20;     // .finish-line height

const SAFE_PAD = 8;      // запас
const HORSE_H = 70;      // примерная высота horse (label+emoji). если надо: 60..85

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const AtChabysh: React.FC<AtChabyshProps> = ({ gameState, setGameState, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [raceStarted, setRaceStarted] = useState(false);

  // ✅ очки текущего заезда (двигают лошадок)
  const [roundScores, setRoundScores] = useState<Scores>({ team1: 0, team2: 0 });

  // 🧊 фиксируем итог заезда на финише, чтобы не было "прыжков"
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

    // ▶️ играет только во время активного заезда
    if (raceStarted && timeLeft > 0) {
      audioRef.current.play().catch(() => {});
      return;
    }

    // ⏸ стоп на финише/до старта
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  }, [raceStarted, timeLeft]);

  /* ---------- Генерация примера ---------- */
  const generate = () => {
    const isDiv = Math.random() > 0.4;

    if (isDiv) {
      const b = Math.floor(Math.random() * 8) + 2;   // 2..9
      const res = Math.floor(Math.random() * 8) + 2; // 2..9
      return { q: `${b * res} ÷ ${b}`, a: res };
    }

    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    return { q: `${a} × ${b}`, a: a * b };
  };

  /* ---------- Дорожки: измеряем высоту (для пиксельного движения) ---------- */
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

  /* ---------- Инициализация примеров ---------- */
  useEffect(() => {
    setProb1(generate());
    setProb2(generate());
  }, []);

  /* ---------- Таймер (только после старта) ---------- */
  useEffect(() => {
    if (!TIMER_ENABLED || !raceStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [raceStarted]);

  /* ---------- Заморозка результата заезда при timeLeft=0 ---------- */
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

  /* ---------- Проверка ответа ---------- */
  const checkAnswer = (team: 1 | 2) => {
    const input = team === 1 ? team1Input : team2Input;
    const prob = team === 1 ? prob1 : prob2;

    const setInput = team === 1 ? setTeam1Input : setTeam2Input;
    const setProb = team === 1 ? setProb1 : setProb2;

    const parsed = parseInt(input, 10);

    if (!Number.isNaN(parsed) && parsed === prob.a) {
      // ✅ 1) общий счёт команды (копится между заездами)
      setGameState((prev) => ({
        ...prev,
        scores: {
          ...prev.scores,
          [`team${team}`]:
            prev.scores[team === 1 ? "team1" : "team2"] + 10,
        },
      }));

      // ✅ 2) очки заезда (двигают лошадку)
      setRoundScores((prev) => ({
        ...prev,
        [team === 1 ? "team1" : "team2"]:
          prev[team === 1 ? "team1" : "team2"] + 10,
      }));

      setProb(generate());
    }

    setInput("");
  };

  /* ---------- Позиция лошадки (в пикселях, чтобы финиш не пересекали раньше) ---------- */
  const calculateBottomPx = (score: number, team: 1 | 2) => {
    if (trackH <= 0) return `${SAFE_PAD}px`;

    const startBottomPx = SAFE_PAD;

    // До финиша: лошадка не должна пересекать finish-line
    // horseTop = trackH - bottom - HORSE_H
    // нужно horseTop >= FINISH_TOP + FINISH_H + SAFE_PAD
    const maxBeforeFinishPx = trackH - HORSE_H - (FINISH_TOP + FINISH_H + SAFE_PAD);
    const safeBefore = clamp(maxBeforeFinishPx, 20, trackH);

    // За финишем (победитель на 0 секунде)
    const maxAfterFinishPx = trackH - HORSE_H - SAFE_PAD;
    const safeAfter = clamp(maxAfterFinishPx, safeBefore, trackH);

    if (!raceStarted) return `${startBottomPx}px`;

    // Финиш — только когда timeLeft=0
    if (timeLeft === 0 && finalRoundScores) {
      const s1 = finalRoundScores.team1;
      const s2 = finalRoundScores.team2;
      const isWinner = (team === 1 && s1 > s2) || (team === 2 && s2 > s1);

      return isWinner ? `${safeAfter}px` : `${safeBefore}px`;
    }

    // В игре: время + бонус очков, но clamp до safeBefore
    const progressTime = (TOTAL_TIME - timeLeft) / TOTAL_TIME; // 0..1
    const bonus = clamp((score / 10) * 0.03, 0, 0.4);          // каждые 10 очков ~ +0.03

    const progress = clamp(progressTime * 0.75 + bonus, 0, 1);
    const bottomPx = startBottomPx + progress * (safeBefore - startBottomPx);

    return `${bottomPx}px`;
  };

  /* ---------- Тексты модалки ---------- */
  const winnerText = useMemo(() => {
    const s1 = finalRoundScores ? finalRoundScores.team1 : roundScores.team1;
    const s2 = finalRoundScores ? finalRoundScores.team2 : roundScores.team2;

    if (s1 > s2) return "🏆 Заезд выиграла Команда 1!";
    if (s2 > s1) return "🏆 Заезд выиграла Команда 2!";
    return "🤝 Ничья в заезде!";
  }, [finalRoundScores, roundScores.team1, roundScores.team2]);

  const roundScoreText = useMemo(() => {
    const s1 = finalRoundScores ? finalRoundScores.team1 : roundScores.team1;
    const s2 = finalRoundScores ? finalRoundScores.team2 : roundScores.team2;
    return `Очки заезда: ${s1} — ${s2}`;
  }, [finalRoundScores, roundScores.team1, roundScores.team2]);

  const totalScoreText = useMemo(() => {
    return `Общий счёт: ${gameState.scores.team1} — ${gameState.scores.team2}`;
  }, [gameState.scores.team1, gameState.scores.team2]);

  /* ---------- След. ученики (новый заезд) ---------- */
  const nextStudents = () => {
    setFinalRoundScores(null);
    setRoundScores({ team1: 0, team2: 0 });

    setTimeLeft(TOTAL_TIME);
    setTeam1Input("");
    setTeam2Input("");
    setProb1(generate());
    setProb2(generate());

    // сразу стартуем новый заезд
    setRaceStarted(true);
  };

  /* ---------- Первый старт ---------- */
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
        {TIMER_ENABLED && <div className="timer-box">Время: {timeLeft}</div>}

        {!raceStarted && (
          <button
            onClick={firstStart}
            className="start-btn"
          >
            🚦 Старт
          </button>
        )}

        {/* Левая дорожка */}
        <div className="track" ref={leftTrackRef}>
          <div className="finish-line" />
          <div className="horse" style={{ bottom: calculateBottomPx(roundScores.team1, 1) }}>
            <span className="horse-label" style={{ color: "#3b82f6" }}>Team 1</span>
            🐎
          </div>
        </div>

        {/* Команда 1 */}
        <div className="play-area area-blue">
          <div className="question">{prob1.q}</div>
          <div className="screen">{team1Input}</div>
          <Numpad team={1} />
        </div>

        {/* Команда 2 */}
        <div className="play-area area-orange">
          <div className="question">{prob2.q}</div>
          <div className="screen">{team2Input}</div>
          <Numpad team={2} />
        </div>

        {/* Правая дорожка */}
        <div className="track" ref={rightTrackRef}>
          <div className="finish-line" />
          <div className="horse" style={{ bottom: calculateBottomPx(roundScores.team2, 2) }}>
            <span className="horse-label" style={{ color: "#f97316" }}>Team 2</span>
            🏇
          </div>
        </div>

        {/* Финальная модалка */}
        {timeLeft === 0 && (
          <div className="modal-overlay">
            <div className="modal">
              <h2 className="modal-title">{winnerText}</h2>

              <div className="modal-text">{roundScoreText}</div>
              <div className="modal-text">{totalScoreText}</div>

              <div className="modal-actions">
                <button onClick={nextStudents} className="btn modal-btn">
                  След. ученики
                </button>
                <button onClick={onComplete} className="btn btn-ok modal-btn">
                  Далее
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