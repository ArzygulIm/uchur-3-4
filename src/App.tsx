import { useLocalStorage } from './hooks/UseLocalStorage';
import AtChabysh from './screens/AtChabysh/AtChabysh';
import './App.css';
// Пока закомментируй импорты, если файлы еще не созданы или пусты
import TestRound from './screens/TestRound/TestRound';
import QuizBoard from './screens/QuizBoard/QuizBoard';

export type GameState = {
  stage: 'AT_CHABYSH' | 'TEST' | 'QUIZ' | 'RESULTS';
  scores: { team1: number; team2: number };
  completedQuizCards: string[];
};

const initialState: GameState = {
  stage: 'AT_CHABYSH',
  scores: { team1: 0, team2: 0 },
  completedQuizCards: [],
};

function App() {
  const [gameState, setGameState] = useLocalStorage<GameState>('quiz_v2', initialState);

  const nextStage = () => {
    setGameState(prev => {
      if (prev.stage === 'AT_CHABYSH') return { ...prev, stage: 'TEST' };
      if (prev.stage === 'TEST') return { ...prev, stage: 'QUIZ' };
      return { ...prev, stage: 'RESULTS' };
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <h1 className="text-center text-xl font-bold mb-4">Quiz Game</h1>
      
      {gameState.stage === 'AT_CHABYSH' && (
        <AtChabysh gameState={gameState} setGameState={setGameState} onComplete={nextStage} />
      )}

      {/* Заглушки для других этапов, чтобы проект не падал */}
      {gameState.stage === 'TEST' && (
        <TestRound gameState={gameState} setGameState={setGameState} onComplete={nextStage} />
      )}
      
      {gameState.stage === 'QUIZ' && (
        <QuizBoard gameState={gameState} setGameState={setGameState} onComplete={nextStage} />
      )}
    </div>
  );
}

// ВОТ ЭТА СТРОКА РЕШАЕТ ТВОЮ ОШИБКУ:
export default App;