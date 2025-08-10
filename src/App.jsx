import { useState } from 'react';

// This is the Square component, a single cell on the board.
// It's a "presentational" component because it just renders what it's told to.
function Square({ value, onSquareClick, isWinningSquare }) {
  // We use Tailwind classes to style the button.
  // The 'value' prop determines the text ('X' or 'O').
  // The 'isWinningSquare' prop adds a special highlight class.
  const squareClasses = `w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 
                       bg-gray-200 hover:bg-gray-300 transition-colors duration-200 
                       text-4xl font-bold flex items-center justify-center rounded-lg 
                       shadow-md cursor-pointer ${isWinningSquare ? 'bg-green-500 text-white animate-pulse' : ''}`;

  const valueClasses = value === 'X' ? 'text-red-500' : 'text-blue-500';

  return (
    <button className={squareClasses} onClick={onSquareClick}>
      <span className={valueClasses}>{value}</span>
    </button>
  );
}

// This is the Board component, which renders the 3x3 grid of squares.
// It receives the current board state and click handler from the parent App component.
function Board({ xIsNext, squares, onPlay, winningSquares }) {
  // handleClick is called when a square is clicked.
  function handleClick(i) {
    // If the square is already filled or the game is won, do nothing.
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    // Create a copy of the squares array to modify it (immutability is key in React).
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    // Call the parent's onPlay function to update the game state.
    onPlay(nextSquares);
  }

  // Determine the winner and the status message to display.
  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (squares.every(square => square !== null)) {
    status = `It's a draw!`;
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }
  
  const winningLine = winner ? winningSquares : [];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="text-2xl font-bold mb-4">{status}</div>
      <div className="grid grid-cols-3 gap-2">
        {squares.map((square, i) => (
          <Square 
            key={i} 
            value={square} 
            onSquareClick={() => handleClick(i)}
            isWinningSquare={winningLine.includes(i)}
          />
        ))}
      </div>
    </div>
  );
}

// This function checks for a winner on the board.
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
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
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return [];
}

// This is the main App component that manages the game's state.
export default function App() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const winningSquares = getWinningSquares(currentSquares);

  // This function handles updating the game state after a move is made.
  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  // This function jumps to a previous move in the game history.
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  // Map over the game history to create a list of buttons to jump to past moves.
  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button 
          onClick={() => jumpTo(move)}
          className={`px-4 py-2 my-1 rounded-md text-sm font-semibold transition-colors duration-200
                      ${move === currentMove ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          {description}
        </button>
      </li>
    );
  });

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-2xl space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-800">Tic-Tac-Toe</h1>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} winningSquares={winningSquares} />
        <button
          onClick={() => jumpTo(0)}
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-full font-bold text-lg 
                     shadow-lg hover:bg-blue-700 transition-all duration-300"
        >
          Restart Game
        </button>
      </div>
      <div className="game-info mt-8 md:mt-0 md:ml-10 p-6 bg-white rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Game History</h2>
        <ol className="list-none p-0 space-y-2">{moves}</ol>
      </div>
    </div>
  );
}
