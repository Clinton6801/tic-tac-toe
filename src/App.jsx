import { useState, useEffect, useCallback } from 'react';

// This is the Square component, a single cell on the board.
function Square({ value, onSquareClick, isWinningSquare, isThinking }) {
  // Adjusted the size for mobile devices to be smaller (w-14 h-14)
  // and kept the larger size for bigger screens (sm:w-20 sm:h-20).
  const squareClasses = `bg-gray-200 transition-colors duration-200 
                       w-14 h-14 sm:w-20 sm:h-20 
                       text-2xl sm:text-4xl font-bold flex items-center justify-center rounded-xl 
                       shadow-md cursor-pointer
                       ${isWinningSquare ? 'bg-green-500 text-white animate-pulse' : 'hover:bg-gray-300'}
                       ${isThinking ? 'cursor-not-allowed' : ''}`;

  const valueClasses = value === 'X' ? 'text-red-500' : 'text-blue-500';

  return (
    <button className={squareClasses} onClick={onSquareClick} disabled={isThinking}>
      <span className={valueClasses}>{value}</span>
    </button>
  );
}

// This is the Board component, which renders the 3x3 grid of squares.
function Board({ xIsNext, squares, onPlay, isThinking, xPlayerName, oPlayerName }) {
  const winner = calculateWinner(squares);
  
  function handleClick(i) {
    if (winner || squares[i] || isThinking) {
      return;
    }
    
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  let status;
  const nextPlayerName = xIsNext ? xPlayerName : oPlayerName;
  if (winner) {
    const winnerName = winner === 'X' ? xPlayerName : oPlayerName;
    status = `Winner: ${winnerName}`;
  } else if (squares.every(square => square !== null)) {
    status = `It's a draw!`;
  } else {
    status = `Next player: ${nextPlayerName}`;
  }

  const winningLine = winner ? getWinningSquares(squares) : [];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="text-xl sm:text-2xl font-bold mb-4 text-white">{status}</div>
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {squares.map((square, i) => (
          <Square 
            key={i} 
            value={square} 
            onSquareClick={() => handleClick(i)}
            isWinningSquare={winningLine.includes(i)}
            isThinking={isThinking}
          />
        ))}
      </div>
    </div>
  );
}

// This function checks for a winner on the board.
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

// This function returns the winning combination of squares if a winner is found.
function getWinningSquares(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return [];
}

// Modal component for the end-of-series pop-up
function EndGameModal({ winner, onResetSeries, playerSymbol, xPlayerName, oPlayerName }) {
  const winnerName = winner === 'X' ? xPlayerName : oPlayerName;
  const isPlayerWinner = winner === playerSymbol;
  const message = `The series winner is ${winnerName}!`;
  const icon = isPlayerWinner ? (
    // Congrats SVG
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-500 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ) : (
    // Sad face SVG
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-500 mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 16s1.5-2 4-2 4 2 4 2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl text-center flex flex-col items-center">
        {icon}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{message}</h2>
        <button
          onClick={onResetSeries}
          className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold text-lg 
                     shadow-lg hover:bg-blue-700 transition-all duration-300"
        >
          Start New Series
        </button>
      </div>
    </div>
  );
}

// This is the main App component that manages the game's state.
export default function App() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [gameMode, setGameMode] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [seriesLength, setSeriesLength] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [seriesWinner, setSeriesWinner] = useState(null);
  const [playerOneName, setPlayerOneName] = useState('');
  const [playerTwoName, setPlayerTwoName] = useState('');
  const [namesSet, setNamesSet] = useState(false);
  const [currentStarterSymbol, setCurrentStarterSymbol] = useState('X');

  const xIsNext = (currentStarterSymbol === 'X' && currentMove % 2 === 0) || (currentStarterSymbol === 'O' && currentMove % 2 !== 0);
  const currentSquares = history[currentMove];
  const winner = calculateWinner(currentSquares);
  const isRoundOver = winner || currentSquares.every(square => square !== null);

  let xPlayerName, oPlayerName, xPlayerScore, oPlayerScore;
  if (gameMode === 'human') {
    xPlayerName = playerOneName || 'Player 1';
    oPlayerName = playerTwoName || 'Player 2';
    xPlayerScore = '-';
    oPlayerScore = '-';
  } else if (gameMode === 'computer') {
    if (playerSymbol === 'X') {
      xPlayerName = playerOneName || 'You';
      oPlayerName = playerTwoName || 'Computer';
      xPlayerScore = playerScore;
      oPlayerScore = computerScore;
    } else {
      xPlayerName = playerTwoName || 'Computer';
      oPlayerName = playerOneName || 'You';
      xPlayerScore = computerScore;
      oPlayerScore = playerScore;
    }
  }

  const handleNameSubmit = () => {
    if (gameMode === 'human') {
      if (!playerOneName.trim()) setPlayerOneName('Player 1');
      if (!playerTwoName.trim()) setPlayerTwoName('Player 2');
    } else if (gameMode === 'computer') {
      if (!playerOneName.trim()) setPlayerOneName('You');
      setPlayerTwoName('Computer');
    }
    setNamesSet(true);
  };
  
  const getBestMove = useCallback((squares) => {
    const emptySquares = squares.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    const computerSymbol = playerSymbol === 'X' ? 'O' : 'X';
    const playerSymbolVal = playerSymbol;

    for (const i of emptySquares) {
      const tempSquares = squares.slice();
      tempSquares[i] = computerSymbol;
      if (calculateWinner(tempSquares) === computerSymbol) {
        return i;
      }
    }
    
    for (const i of emptySquares) {
      const tempSquares = squares.slice();
      tempSquares[i] = playerSymbolVal;
      if (calculateWinner(tempSquares) === playerSymbolVal) {
        return i;
      }
    }
    
    if (emptySquares.includes(4)) {
      return 4;
    }
    
    const corners = [0, 2, 6, 8];
    for (const i of corners) {
      if (emptySquares.includes(i)) {
        return i;
      }
    }
    
    return emptySquares[0];
  }, [playerSymbol]);
  
  const resetGame = useCallback(() => {
    // Automatically alternates the starter for the next round
    setCurrentStarterSymbol(prevStarter => prevStarter === 'X' ? 'O' : 'X');
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }, []);
  
  const resetAll = useCallback(() => {
    setGameMode(null);
    setDifficulty(null);
    setSeriesLength(null);
    setPlayerSymbol(null);
    setPlayerScore(0);
    setComputerScore(0);
    setSeriesWinner(null);
    setPlayerOneName('');
    setPlayerTwoName('');
    setNamesSet(false);
    setCurrentStarterSymbol('X'); // Default starter for a new series
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  }, []);

  // This is the new, refactored handlePlay function
  function handlePlay(nextSquares) {
    setHistory([...history.slice(0, currentMove + 1), nextSquares]);
    setCurrentMove(currentMove + 1);
  }

  useEffect(() => {
    if (isRoundOver && !seriesWinner) {
      if (winner) {
        if (winner === playerSymbol) {
          setPlayerScore(prevScore => prevScore + 1);
        } else {
          setComputerScore(prevScore => prevScore + 1);
        }
      }
      
      const neededWins = seriesLength ? Math.ceil(seriesLength / 2) : 0;
      
      // Use setTimeout to ensure state is updated before checking for series winner
      setTimeout(() => {
        setPlayerScore(currentPScore => {
          setComputerScore(currentCScore => {
            if (currentPScore >= neededWins || currentCScore >= neededWins) {
              if (currentPScore >= neededWins) {
                setSeriesWinner(playerSymbol);
              } else {
                setSeriesWinner(playerSymbol === 'X' ? 'O' : 'X');
              }
            } else {
              // Automatically reset the game and alternate the starter
              resetGame();
            }
            return currentCScore; // Return value for computerScore setter
          });
          return currentPScore; // Return value for playerScore setter
        });
      }, 1500);
    }
  }, [isRoundOver, seriesWinner, winner, playerSymbol, seriesLength, resetGame]);

  useEffect(() => {
    // --- Computer's Turn Logic ---
    const isComputerTurn = (playerSymbol === 'O' && xIsNext) || (playerSymbol === 'X' && !xIsNext);
    if (gameMode === 'computer' && isComputerTurn && !isRoundOver && !isThinking) {
      setIsThinking(true);
      setTimeout(() => {
        const nextSquares = currentSquares.slice();
        const computerSymbol = playerSymbol === 'X' ? 'O' : 'X';
        let computerMove;
        
        if (difficulty === 'easy') {
          const availableSquares = nextSquares.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
          computerMove = availableSquares[Math.floor(Math.random() * availableSquares.length)];
        } else {
          computerMove = getBestMove(nextSquares);
        }
        
        if (computerMove !== undefined) {
          nextSquares[computerMove] = computerSymbol;
          handlePlay(nextSquares);
        }
        setIsThinking(false);
      }, 1000);
    }
  }, [xIsNext, gameMode, difficulty, isThinking, currentSquares, isRoundOver, playerSymbol, getBestMove, handlePlay]);
  
  const isStartButtonDisabled = gameMode === 'human' 
    ? !playerOneName.trim() || !playerTwoName.trim()
    : !playerOneName.trim();

  // Multi-step setup flow
  if (!gameMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen
                      bg-gradient-to-br from-black to-blue-900 text-white p-8 lg:p-12 font-sans">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center">Tic-Tac-Toe</h1>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">Choose Game Mode</h2>
        <div className="flex flex-col space-y-4 w-full max-w-sm">
          <button 
            onClick={() => { setGameMode('human'); }}
            className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg 
                      shadow-lg hover:bg-indigo-700 transition-all duration-300"
          >
            2-Player Game
          </button>
          <button 
            onClick={() => { setGameMode('computer'); setPlayerTwoName('Computer'); }}
            className="px-8 py-4 bg-teal-600 text-white rounded-full font-bold text-lg 
                      shadow-lg hover:bg-teal-700 transition-all duration-300"
          >
            Play Against Computer
          </button>
        </div>
      </div>
    );
  }

  if (gameMode && !namesSet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen
                      bg-gradient-to-br from-black to-blue-900 text-white p-8 lg:p-12 font-sans">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center">Tic-Tac-Toe</h1>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">Set up your game</h2>
        <div className="flex flex-col space-y-4 w-full max-w-sm">
          <label className="text-lg">
            Player 1 Name:
            <input 
              type="text" 
              value={playerOneName}
              onChange={(e) => setPlayerOneName(e.target.value)}
              className="mt-2 w-full p-3 rounded-lg text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Player 1"
              key="player-one-name"
            />
          </label>
          {gameMode === 'human' && (
            <label className="text-lg">
              Player 2 Name:
              <input 
                type="text" 
                value={playerTwoName}
                onChange={(e) => setPlayerTwoName(e.target.value)}
                className="mt-2 w-full p-3 rounded-lg text-gray-800 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Player 2"
                key="player-two-name"
              />
            </label>
          )}
          <button 
            onClick={handleNameSubmit}
            disabled={isStartButtonDisabled}
            className={`mt-4 px-8 py-4 text-white rounded-full font-bold text-lg 
                      shadow-lg transition-all duration-300
                      ${isStartButtonDisabled ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            Start Game
          </button>
          <button
            onClick={() => {setGameMode(null); setPlayerOneName(''); setPlayerTwoName('');}}
            className="mt-4 px-6 py-3 text-white rounded-full font-bold text-lg hover:underline transition-all duration-300"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // Rest of the game logic for computer mode options
  if (gameMode === 'computer' && namesSet && !difficulty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen
                      bg-gradient-to-br from-black to-blue-900 text-white p-8 lg:p-12 font-sans">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center">Tic-Tac-Toe</h1>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">Choose Difficulty</h2>
        <div className="flex flex-col space-y-4 w-full max-w-sm">
          <button 
            onClick={() => { setDifficulty('easy'); }}
            className="px-8 py-4 bg-teal-600 text-white rounded-full font-bold text-lg 
                      shadow-lg hover:bg-teal-700 transition-all duration-300"
          >
            Easy
          </button>
          <button 
            onClick={() => { setDifficulty('difficult'); }}
            className="px-8 py-4 bg-rose-600 text-white rounded-full font-bold text-lg 
                      shadow-lg hover:bg-rose-700 transition-all duration-300"
          >
            Difficult
          </button>
          <button
            onClick={() => setNamesSet(false)}
            className="mt-4 px-6 py-3 text-white rounded-full font-bold text-lg hover:underline transition-all duration-300"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (gameMode === 'computer' && namesSet && difficulty && !seriesLength) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen
                      bg-gradient-to-br from-black to-blue-900 text-white p-8 lg:p-12 font-sans">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center">Tic-Tac-Toe</h1>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">Choose Series Length</h2>
        <div className="flex flex-col space-y-4 w-full max-w-sm">
          {[3, 5, 7, 10].map((length) => (
            <button 
              key={length}
              onClick={() => { setSeriesLength(length); }}
              className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg 
                       shadow-lg hover:bg-indigo-700 transition-all duration-300"
            >
              Best of {length}
            </button>
          ))}
          <button
            onClick={() => setDifficulty(null)}
            className="mt-4 px-6 py-3 text-white rounded-full font-bold text-lg hover:underline transition-all duration-300"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (gameMode === 'computer' && namesSet && difficulty && seriesLength && !playerSymbol) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen
                      bg-gradient-to-br from-black to-blue-900 text-white p-8 lg:p-12 font-sans">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center">Tic-Tac-Toe</h1>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">Choose your symbol</h2>
        <div className="flex space-x-4 w-full max-w-sm justify-center">
          <button 
            onClick={() => { setPlayerSymbol('X'); setCurrentStarterSymbol('X'); }}
            className="w-24 h-24 text-6xl font-bold bg-red-500 text-white flex items-center justify-center rounded-xl 
                       shadow-lg hover:bg-red-600 transition-all duration-300"
          >
            X
          </button>
          <button 
            onClick={() => { setPlayerSymbol('O'); setCurrentStarterSymbol('O'); }}
            className="w-24 h-24 text-6xl font-bold bg-blue-500 text-white flex items-center justify-center rounded-xl 
                       shadow-lg hover:bg-blue-600 transition-all duration-300"
          >
            O
          </button>
        </div>
        <button
          onClick={() => setSeriesLength(null)}
          className="mt-8 px-6 py-3 text-white rounded-full font-bold text-lg hover:underline transition-all duration-300"
        >
          Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen
                    bg-gradient-to-br from-black to-blue-900 text-white p-8 lg:p-12 font-sans">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center">Tic-Tac-Toe</h1>
      
      {seriesWinner && <EndGameModal winner={seriesWinner} onResetSeries={resetAll} playerSymbol={playerSymbol} xPlayerName={xPlayerName} oPlayerName={oPlayerName} />}
      
      {(playerSymbol || gameMode === 'human') && namesSet && (
        <div className="flex flex-col md:flex-row-reverse items-center justify-center
                        space-y-8 md:space-y-0 md:space-x-reverse md:space-x-8 p-8 w-full">
          
          <div className="game-panel flex flex-col items-center p-6 bg-gradient-to-r from-gray-800 to-gray-900 
                          rounded-xl shadow-2xl space-y-4 w-full md:w-3/4 max-w-lg mx-auto">
            <Board 
              xIsNext={xIsNext} 
              squares={currentSquares} 
              onPlay={handlePlay} 
              isThinking={isThinking}
              gameMode={gameMode}
              xPlayerName={xPlayerName}
              oPlayerName={oPlayerName}
            />
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-4 max-w-xs mx-auto w-full">
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold text-lg 
                          shadow-lg hover:bg-blue-700 transition-all duration-300 w-full"
              >
                Reset Board
              </button>
              <button
                onClick={resetAll}
                className="px-6 py-3 bg-red-600 text-white rounded-full font-bold text-lg 
                          shadow-lg hover:bg-red-700 transition-all duration-300 w-full"
              >
                Change Mode
              </button>
            </div>
          </div>
          
          {gameMode === 'computer' && (
            <div className="score-panel p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-2xl space-y-4 text-center w-full md:w-1/4 max-w-sm md:max-w-xs mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Series Score</h2>
              <div className="flex flex-col space-y-2 text-lg sm:text-xl font-semibold">
                <span className="text-red-500">
                    {xPlayerName} (X): {xPlayerScore}
                </span>
                <span className="text-blue-500">
                    {oPlayerName} (O): {oPlayerScore}
                </span>
              </div>
              <p className="text-base sm:text-lg mt-2">Best of {seriesLength}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
