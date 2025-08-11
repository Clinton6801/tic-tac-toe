import { useState, useEffect } from 'react';

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
function Board({ xIsNext, squares, onPlay, winningSquares, isThinking, playerSymbol, gameMode, playerOneName, playerTwoName }) {
  const winner = calculateWinner(squares);

  function handleClick(i) {
    // Prevent moves if the game is over, the square is taken, or it's not the player's turn.
    // For computer mode, it also checks if it's the player's turn.
    const isPlayerTurnInComputerMode = (gameMode === 'computer') && 
                                     ((playerSymbol === 'X' && xIsNext) || (playerSymbol === 'O' && !xIsNext));
    const isPlayerTurnInHumanMode = gameMode === 'human';

    if (winner || squares[i] || isThinking) {
      return;
    }

    if (gameMode === 'computer' && !isPlayerTurnInComputerMode) {
      return;
    }
    
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  let status;
  const nextPlayerName = xIsNext ? playerOneName : playerTwoName;
  if (winner) {
    const winnerName = winner === 'X' ? playerOneName : playerTwoName;
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
function EndGameModal({ winner, onResetSeries, seriesLength, playerSymbol, playerOneName, playerTwoName }) {
  const winnerName = winner === 'X' ? playerOneName : playerTwoName;
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
  
  // New states for player names
  const [playerOneName, setPlayerOneName] = useState('');
  const [playerTwoName, setPlayerTwoName] = useState('');
  const [namesSet, setNamesSet] = useState(false);

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const winner = calculateWinner(currentSquares);
  
  const handleNameSubmit = () => {
    // Set default names if none are provided
    if (gameMode === 'human') {
      if (!playerOneName) setPlayerOneName('Player 1');
      if (!playerTwoName) setPlayerTwoName('Player 2');
    } else if (gameMode === 'computer') {
      if (!playerOneName) setPlayerOneName('You');
      setPlayerTwoName('Saboen');
    }
    setNamesSet(true);
  };
  
  // Helper function to find the best move for the computer
  const getBestMove = (squares) => {
    const emptySquares = squares.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
    const computerSymbol = playerSymbol === 'X' ? 'O' : 'X';
    const playerSymbolVal = playerSymbol;

    // 1. Check for a winning move for the computer
    for (const i of emptySquares) {
      const tempSquares = squares.slice();
      tempSquares[i] = computerSymbol;
      if (calculateWinner(tempSquares) === computerSymbol) {
        return i;
      }
    }
    
    // 2. Block the opponent's winning move
    for (const i of emptySquares) {
      const tempSquares = squares.slice();
      tempSquares[i] = playerSymbolVal;
      if (calculateWinner(tempSquares) === playerSymbolVal) {
        return i;
      }
    }
    
    // 3. Take the center if available
    if (emptySquares.includes(4)) {
      return 4;
    }
    
    // 4. Take a corner if available
    const corners = [0, 2, 6, 8];
    for (const i of corners) {
      if (emptySquares.includes(i)) {
        return i;
      }
    }
    
    // 5. Take any remaining available square
    return emptySquares[0];
  };

  // useEffect to handle computer's turn and end-of-round/series logic
  useEffect(() => {
    // --- End of Round/Series Logic ---
    if ((winner || currentSquares.every(square => square !== null)) && !seriesWinner) {
      let newPlayerScore = playerScore;
      let newComputerScore = computerScore;
      
      if (winner) {
        if (winner === playerSymbol) {
          newPlayerScore = playerScore + 1;
        } else {
          newComputerScore = computerScore + 1;
        }
      }

      // Delay to show the final winning move before resetting
      setTimeout(() => {
        // Calculate needed wins for the series to end.
        // For a 'Best of X' series, a player needs Math.ceil(X / 2) wins.
        // For example, Best of 3 needs 2 wins (Math.ceil(1.5) = 2).
        const neededWins = seriesLength ? Math.ceil(seriesLength / 2) : 0;
        
        if (seriesLength && (newPlayerScore >= neededWins || newComputerScore >= neededWins)) {
          // A series winner is found. Set state to show the modal.
          if (newPlayerScore >= neededWins) {
            setSeriesWinner(playerSymbol);
          } else {
            setSeriesWinner(playerSymbol === 'X' ? 'O' : 'X');
          }
        } else {
          // No series winner, reset the board for the next round.
          setPlayerScore(newPlayerScore);
          setComputerScore(newComputerScore);
          resetGame();
        }
      }, 1500);
    }
    
    // --- Computer's Turn Logic ---
    const isComputerTurn = (playerSymbol === 'O' && xIsNext) || (playerSymbol === 'X' && !xIsNext);
    if (gameMode === 'computer' && isComputerTurn && !winner && !currentSquares.every(square => square !== null) && !isThinking) {
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
  }, [currentSquares, xIsNext, gameMode, winner, difficulty, seriesWinner, playerScore, computerScore, seriesLength, playerSymbol, isThinking]);

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  const resetGame = () => {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
  };
  
  const resetAll = () => {
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
    resetGame();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen
                    bg-gradient-to-br from-black to-blue-900 text-white p-8 lg:p-12 font-sans">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-center">Tic-Tac-Toe</h1>
      
      {seriesWinner && <EndGameModal winner={seriesWinner} onResetSeries={resetAll} seriesLength={seriesLength} playerSymbol={playerSymbol} playerOneName={playerOneName} playerTwoName={playerTwoName} />}
      
      {!namesSet && (
        <>
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
                />
              </label>
            )}
            <button 
              onClick={handleNameSubmit}
              className="mt-4 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg 
                        shadow-lg hover:bg-indigo-700 transition-all duration-300"
            >
              Start Game
            </button>
          </div>
        </>
      )}
      
      {namesSet && !gameMode && (
        <>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">Choose Game Mode</h2>
          <div className="flex flex-col space-y-4 w-full max-w-sm">
            <button 
              onClick={() => { setGameMode('human'); setPlayerSymbol('X'); }}
              className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg 
                        shadow-lg hover:bg-indigo-700 transition-all duration-300"
            >
              2-Player Game
            </button>
            <button 
              onClick={() => { setGameMode('computer'); setPlayerTwoName('Saboen'); }}
              className="px-8 py-4 bg-teal-600 text-white rounded-full font-bold text-lg 
                        shadow-lg hover:bg-teal-700 transition-all duration-300"
            >
              Play Against Computer
            </button>
            <button
              onClick={() => setNamesSet(false)}
              className="mt-4 px-6 py-3 text-white rounded-full font-bold text-lg hover:underline transition-all duration-300"
            >
              Back
            </button>
          </div>
        </>
      )}

      {namesSet && gameMode === 'computer' && !difficulty && (
        <>
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
              onClick={() => setGameMode(null)}
              className="mt-4 px-6 py-3 text-white rounded-full font-bold text-lg hover:underline transition-all duration-300"
            >
              Back
            </button>
          </div>
        </>
      )}

      {namesSet && gameMode === 'computer' && difficulty && !seriesLength && (
        <>
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
        </>
      )}

      {namesSet && gameMode === 'computer' && difficulty && seriesLength && !playerSymbol && (
        <>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">Choose your symbol</h2>
          <div className="flex space-x-4 w-full max-w-sm justify-center">
            <button 
              onClick={() => { setPlayerSymbol('X'); }}
              className="w-24 h-24 text-6xl font-bold bg-red-500 text-white flex items-center justify-center rounded-xl 
                         shadow-lg hover:bg-red-600 transition-all duration-300"
            >
              X
            </button>
            <button 
              onClick={() => { setPlayerSymbol('O'); }}
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
        </>
      )}
      
      {(playerSymbol || gameMode === 'human') && namesSet && (
        <div className="flex flex-col md:flex-row-reverse items-center justify-center
                        space-y-8 md:space-y-0 md:space-x-reverse md:space-x-8 p-8 w-full">
          
          {/* Game Panel - with gradient background and now a max-width and auto margins */}
          <div className="game-panel flex flex-col items-center p-6 bg-gradient-to-r from-gray-800 to-gray-900 
                          rounded-xl shadow-2xl space-y-4 w-full md:w-3/4 max-w-lg mx-auto">
            <Board 
              xIsNext={xIsNext} 
              squares={currentSquares} 
              onPlay={handlePlay} 
              winningSquares={getWinningSquares(currentSquares)} 
              isThinking={isThinking}
              playerSymbol={playerSymbol}
              gameMode={gameMode}
              playerOneName={playerOneName}
              playerTwoName={playerTwoName}
            />
            {/* The buttons container now has a max-width and is centered */}
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
          
          {/* Score Panel - with gradient background and now a max-width and auto margins */}
          {gameMode === 'computer' && (
            <div className="score-panel p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-2xl space-y-4 text-center w-full md:w-1/4 max-w-sm md:max-w-xs mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Series Score</h2>
              <div className="flex flex-col space-y-2 text-lg sm:text-xl font-semibold">
                <span className="text-red-500">{playerOneName} ({playerSymbol}): {playerScore}</span>
                <span className="text-blue-500">{playerTwoName} ({playerSymbol === 'X' ? 'O' : 'X'}): {computerScore}</span>
              </div>
              <p className="text-base sm:text-lg mt-2">Best of {seriesLength}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// Note: The code above is a complete React component for a Tic-Tac-Toe game with various features including