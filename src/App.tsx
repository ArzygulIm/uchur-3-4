import { useLocalStorage } from "./hooks/UseLocalStorage";
import "./App.css";

import AtChabysh from "./screens/AtChabysh/AtChabysh";
import TestRound from "./screens/TestRound/TestRound";
import QuizBoard from "./screens/QuizBoard/QuizBoard";

import WelcomeScreen from "./screens/WelcomeScreen/WelcomeScreen";
import InstructionScreen from "./screens/InstructionScreen/InstructionScreen";
import RoundIntro from "./screens/RoundIntro/RoundIntro";
import ResultsScreen from "./screens/ResultsScreen/ResultsScreen";

export type GameState = {
  stage:
    | "WELCOME"
    | "INSTRUCTION"
    | "INTRO_AT_CHABYSH"
    | "AT_CHABYSH"
    | "INTRO_TEST"
    | "TEST"
    | "INTRO_QUIZ"
    | "QUIZ"
    | "RESULTS";

  scores: { team1: number; team2: number };
  completedQuizCards: string[];
  visited?: { welcome?: boolean; instruction?: boolean };
};

const initialState: GameState = {
  stage: "WELCOME",
  scores: { team1: 0, team2: 0 },
  completedQuizCards: [],
  visited: { welcome: false, instruction: false },
};

function App() {
  const [gameState, setGameState] = useLocalStorage<GameState>("quiz_v2", initialState);

  const isFullscreenStage =
    gameState.stage === "AT_CHABYSH" ||
    gameState.stage === "TEST" ||
    gameState.stage === "QUIZ";

  const goNext = () => {
    setGameState((prev) => {
      switch (prev.stage) {
        case "WELCOME":
          return { ...prev, stage: "INSTRUCTION", visited: { ...prev.visited, welcome: true } };

        case "INSTRUCTION":
          return {
            ...prev,
            stage: "INTRO_AT_CHABYSH",
            visited: { ...prev.visited, instruction: true },
          };

        case "INTRO_AT_CHABYSH":
          return { ...prev, stage: "AT_CHABYSH" };

        case "AT_CHABYSH":
          return { ...prev, stage: "INTRO_TEST" };

        case "INTRO_TEST":
          return { ...prev, stage: "TEST" };

        case "TEST":
          return { ...prev, stage: "INTRO_QUIZ" };

        case "INTRO_QUIZ":
          return { ...prev, stage: "QUIZ" };

        case "QUIZ":
          return { ...prev, stage: "RESULTS" };

        default:
          return prev;
      }
    });
  };

  const restart = () => {
    setGameState({
      ...initialState,
      scores: { team1: 0, team2: 0 },
      completedQuizCards: [],
    });
  };

  const confirmReset = () => {
    const ok = window.confirm("Сбросить игру и начать сначала?");
    if (ok) restart();
  };

  return (
    <div className={`app-root ${isFullscreenStage ? "is-fullscreen" : "is-centered"}`}>
      {/* ✅ Header — всегда сверху, но внутри общего layout */}
      <div className="app-header">
        <div className="app-header-left">
          <div className="app-title">Quiz Game</div>

          <div className="app-mini-score">
            <span>Команда 1: <b>{gameState.scores.team1}</b></span>
            <span className="dash">—</span>
            <span>Команда 2: <b>{gameState.scores.team2}</b></span>
          </div>
        </div>

        <button className="app-reset-btn" onClick={confirmReset}>
          ↻ Сброс
        </button>
      </div>

      {/* ✅ Content */}
      <div className="app-content">
        {/* Центрированные экраны */}
        {gameState.stage === "WELCOME" && (
          <div className="center-wrap">
            <WelcomeScreen onNext={goNext} />
          </div>
        )}

        {gameState.stage === "INSTRUCTION" && (
          <div className="center-wrap">
            <InstructionScreen onNext={goNext} />
          </div>
        )}

        {gameState.stage === "INTRO_AT_CHABYSH" && (
          <div className="center-wrap">
            <RoundIntro
              title="Раунд 1"
              subtitle="Ат чабыш • Умножение/деление"
              imageSrc="/screens/atchabysh.png"
              onStart={goNext}
            />
          </div>
        )}

        {gameState.stage === "INTRO_TEST" && (
          <div className="center-wrap">
            <RoundIntro
              title="Раунд 2"
              subtitle="Тест • Кто быстрее ответит"
              imageSrc="/screens/test.png"
              onStart={goNext}
            />
          </div>
        )}

        {gameState.stage === "INTRO_QUIZ" && (
          <div className="center-wrap">
            <RoundIntro
              title="Раунд 3"
              subtitle="Викторина • Табло"
              imageSrc="/screens/quizboard.png"
              onStart={goNext}
            />
          </div>
        )}

        {gameState.stage === "RESULTS" && (
          <div className="center-wrap">
            <ResultsScreen scores={gameState.scores} onRestart={restart} />
          </div>
        )}

        {/* Fullscreen экраны */}
        {gameState.stage === "AT_CHABYSH" && (
          <AtChabysh gameState={gameState} setGameState={setGameState} onComplete={goNext} />
        )}

        {gameState.stage === "TEST" && (
          <TestRound gameState={gameState} setGameState={setGameState} onComplete={goNext} />
        )}

        {gameState.stage === "QUIZ" && (
          <QuizBoard gameState={gameState} setGameState={setGameState} onComplete={goNext} />
        )}
      </div>
    </div>
  );
}

export default App;