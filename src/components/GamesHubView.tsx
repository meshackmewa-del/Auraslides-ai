import React, { useState, useEffect } from "react";
import { Gamepad2, Trophy, RotateCcw, Swords, Compass, Circle, HelpCircle } from "lucide-react";

type GameType = "chess" | "2048";

// --- CHESS UTILS ---
type ChessPiece = {
  type: "r" | "n" | "b" | "q" | "k" | "p";
  color: "w" | "b";
};

type ChessBoard = (ChessPiece | null)[][];

const UNICODE_PIECES: Record<string, string> = {
  "w-p": "♟", "w-r": "♜", "w-n": "♞", "w-b": "♝", "w-q": "♛", "w-k": "♚",
  "b-p": "♙", "b-r": "♖", "b-n": "♘", "b-b": "♗", "b-q": "♕", "b-k": "♔"
};

const createInitialChessBoard = (): ChessBoard => {
  const board: ChessBoard = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Set pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: "p", color: "b" };
    board[6][col] = { type: "p", color: "w" };
  }

  // Set majors
  const backRow: ("r" | "n" | "b" | "q" | "k" | "b" | "n" | "r")[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRow[col], color: "b" };
    board[7][col] = { type: backRow[col], color: "w" };
  }

  return board;
};

// --- 2048 UTILS ---
type Board2048 = number[][];

const createEmpty2048Board = (): Board2048 => [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
];

export default function GamesHubView() {
  const [activeGame, setActiveGame] = useState<GameType>("chess");

  // --- CHESS STATE ---
  const [chessBoard, setChessBoard] = useState<ChessBoard>(createInitialChessBoard());
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [chessTurn, setChessTurn] = useState<"w" | "b">("w");
  const [chessLog, setChessLog] = useState<string>("White's turn to move first.");
  const [isVsComputer, setIsVsComputer] = useState<boolean>(true);

  // --- 2048 STATE ---
  const [board2048, setBoard2048] = useState<Board2048>(createEmpty2048Board());
  const [score2048, setScore2048] = useState<number>(0);
  const [highScore2048, setHighScore2048] = useState<number>(() => {
    const saved = localStorage.getItem("auraslide_2048_high");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isGameOver2048, setIsGameOver2048] = useState<boolean>(false);

  // --- CHESS LOGIC ---
  const resetChess = () => {
    setChessBoard(createInitialChessBoard());
    setSelectedSquare(null);
    setChessTurn("w");
    setChessLog("Game restarted. White's turn.");
  };

  const handleSquareClick = (row: number, col: number) => {
    const clickedPiece = chessBoard[row][col];

    // If a piece was already selected
    if (selectedSquare) {
      const [selRow, selCol] = selectedSquare;
      
      // If clicking same piece, deselect
      if (selRow === row && selCol === col) {
        setSelectedSquare(null);
        return;
      }

      // If clicking another piece of the same color, select that instead
      if (clickedPiece && clickedPiece.color === chessTurn) {
        setSelectedSquare([row, col]);
        return;
      }

      // Otherwise, execute the move!
      const activePiece = chessBoard[selRow][selCol]!;
      const updatedBoard = chessBoard.map(r => [...r]);
      
      // Execute capture or raw move
      updatedBoard[row][col] = activePiece;
      updatedBoard[selRow][selCol] = null;
      
      const targetLabel = `${String.fromCharCode(97 + col)}${8 - row}`;
      const srcLabel = `${String.fromCharCode(97 + selCol)}${8 - selRow}`;
      const capturedPiece = clickedPiece ? ` captures ${clickedPiece.type.toUpperCase()}` : "";
      
      setChessBoard(updatedBoard);
      setSelectedSquare(null);
      
      const newTurn = chessTurn === "w" ? "b" : "w";
      setChessTurn(newTurn);
      setChessLog(`${activePiece.color === "w" ? "White" : "Black"} moved ${activePiece.type.toUpperCase()} from ${srcLabel} to ${targetLabel}${capturedPiece}.`);

      // Trigger Computer opponent if in VS computer mode & computer's turn
      if (isVsComputer && newTurn === "b") {
        setTimeout(() => {
          makeComputerChessMove(updatedBoard);
        }, 600);
      }
    } else {
      // Select a piece if it belongs to current player
      if (clickedPiece && clickedPiece.color === chessTurn) {
        setSelectedSquare([row, col]);
      }
    }
  };

  const makeComputerChessMove = (currentBoard: ChessBoard) => {
    // Collect all black pieces
    const blackPieces: { row: number; col: number; piece: ChessPiece }[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = currentBoard[r][c];
        if (p && p.color === "b") {
          blackPieces.push({ row: r, col: c, piece: p });
        }
      }
    }

    if (blackPieces.length === 0) return;

    // Try to find a valid computer move
    let moved = false;
    // Shuffle pieces to randomize response
    const shuffledPieces = [...blackPieces].sort(() => Math.random() - 0.5);

    for (const item of shuffledPieces) {
      const { row, col, piece } = item;
      
      // Simple heuristic paths
      const possibleTargets: [number, number][] = [];
      
      if (piece.type === "p") {
        // pawns move down
        if (row + 1 < 8 && !currentBoard[row + 1][col]) {
          possibleTargets.push([row + 1, col]);
        }
        // pawn capture diagonal
        if (row + 1 < 8 && col - 1 >= 0 && currentBoard[row + 1][col - 1]?.color === "w") {
          possibleTargets.push([row + 1, col - 1]);
        }
        if (row + 1 < 8 && col + 1 < 8 && currentBoard[row + 1][col + 1]?.color === "w") {
          possibleTargets.push([row + 1, col + 1]);
        }
      } else if (piece.type === "n") {
        const moves = [
          [2, 1], [2, -1], [-2, 1], [-2, -1],
          [1, 2], [1, -2], [-1, 2], [-1, -2]
        ];
        moves.forEach(([dr, dc]) => {
          const nr = row + dr, nc = col + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const dest = currentBoard[nr][nc];
            if (!dest || dest.color === "w") possibleTargets.push([nr, nc]);
          }
        });
      } else {
        // Rooks, bishops, queens, kings - random immediate steps
        const dirs = [
          [1, 0], [-1, 0], [0, 1], [0, -1],
          [1, 1], [1, -1], [-1, 1], [-1, -1]
        ];
        dirs.forEach(([dr, dc]) => {
          const nr = row + dr, nc = col + dc;
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            const dest = currentBoard[nr][nc];
            if (!dest || dest.color === "w") possibleTargets.push([nr, nc]);
          }
        });
      }

      if (possibleTargets.length > 0) {
        const [tr, tc] = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
        const updatedBoard = currentBoard.map(r => [...r]);
        const targetPiece = updatedBoard[tr][tc];
        
        updatedBoard[tr][tc] = piece;
        updatedBoard[row][col] = null;

        setChessBoard(updatedBoard);
        setChessTurn("w");
        setChessLog(`AuraAI Computer response: Moved ${piece.type.toUpperCase()} to ${String.fromCharCode(97 + tc)}${8 - tr}${targetPiece ? ` capturing ${targetPiece.type.toUpperCase()}` : ""}. Your turn!`);
        moved = true;
        break;
      }
    }

    if (!moved) {
      setChessTurn("w");
      setChessLog("Computer passes (no legal moves left). Your turn!");
    }
  };


  // --- 2048 GAME LOGIC ---
  const init2048 = () => {
    let board = createEmpty2048Board();
    board = addRandom2048Tile(board);
    board = addRandom2048Tile(board);
    setBoard2048(board);
    setScore2048(0);
    setIsGameOver2048(false);
  };

  const addRandom2048Tile = (board: Board2048): Board2048 => {
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length === 0) return board;
    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  useEffect(() => {
    if (activeGame === "2048") {
      init2048();
    }
  }, [activeGame]);

  const slideRowLeft = (row: number[], updateScore: (val: number) => void): number[] => {
    // filter non-zeros
    let arr = row.filter(val => val !== 0);
    const result: number[] = [];
    
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === arr[i + 1]) {
        const mergedVal = arr[i] * 2;
        result.push(mergedVal);
        updateScore(mergedVal);
        i++; // skip next since it merged
      } else {
        result.push(arr[i]);
      }
    }

    // Pad with zeros
    while (result.length < 4) {
      result.push(0);
    }
    return result;
  };

  const rotateBoardClockwise = (board: Board2048): Board2048 => {
    const result = createEmpty2048Board();
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        result[c][3 - r] = board[r][c];
      }
    }
    return result;
  };

  const handle2048Move = (direction: "left" | "right" | "up" | "down") => {
    if (isGameOver2048) return;
    
    let current = board2048.map(r => [...r]);
    let addedScore = 0;
    const addScore = (val: number) => { addedScore += val; };

    // We can handle all directions by rotating the board, sliding left, and rotating back!
    // Directions rotations:
    // Left: 0 rotations
    // Up: 3 rotations (or 1 CCW) -> slide left -> 1 rotation
    // Right: 2 rotations -> slide left -> 2 rotations
    // Down: 1 rotation -> slide left -> 3 rotations

    let rotations = 0;
    if (direction === "up") rotations = 3;
    if (direction === "right") rotations = 2;
    if (direction === "down") rotations = 1;

    for (let i = 0; i < rotations; i++) {
      current = rotateBoardClockwise(current);
    }

    // Slide left
    let moved = false;
    const slided = current.map(row => {
      const newRow = slideRowLeft(row, addScore);
      if (JSON.stringify(newRow) !== JSON.stringify(row)) moved = true;
      return newRow;
    });

    // Rotate back
    let finalBoard = slided;
    const reverseRotations = (4 - rotations) % 4;
    for (let i = 0; i < reverseRotations; i++) {
      finalBoard = rotateBoardClockwise(finalBoard);
    }

    if (moved) {
      const nextBoard = addRandom2048Tile(finalBoard);
      setBoard2048(nextBoard);
      const newScore = score2048 + addedScore;
      setScore2048(newScore);
      
      if (newScore > highScore2048) {
        setHighScore2048(newScore);
        localStorage.setItem("auraslide_2048_high", newScore.toString());
      }

      // Check Game Over
      checkGameOver2048(nextBoard);
    }
  };

  const checkGameOver2048 = (board: Board2048) => {
    // Check if any empty cell exists
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] === 0) return;
      }
    }
    // Check if adjacent merges are possible
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = board[r][c];
        if (r < 3 && val === board[r + 1][c]) return;
        if (c < 3 && val === board[r][c + 1]) return;
      }
    }
    setIsGameOver2048(true);
  };

  const get2048TileColor = (val: number) => {
    switch (val) {
      case 2: return "bg-slate-800 text-slate-100 border-slate-700/60";
      case 4: return "bg-slate-700 text-blue-200 border-blue-900/40";
      case 8: return "bg-blue-650 text-blue-100 border-blue-500/30";
      case 16: return "bg-blue-500 text-white border-blue-400/50";
      case 32: return "bg-indigo-600 text-white border-indigo-400/50";
      case 64: return "bg-indigo-500 text-white border-indigo-300/60";
      case 128: return "bg-pink-600 text-white border-pink-400/60 shadow-lg shadow-pink-900/10";
      case 256: return "bg-purple-600 text-white border-purple-400/60 shadow-lg shadow-purple-900/20";
      case 512: return "bg-emerald-600 text-white border-emerald-400/60 shadow-lg shadow-emerald-900/20";
      case 1024: return "bg-amber-600 text-amber-50 border-amber-400 shadow-md";
      case 2048: return "bg-rose-600 text-white font-black border-rose-300 shadow-lg animate-pulse";
      default: return "bg-slate-900/40 text-slate-600 border-slate-900";
    }
  };

  return (
    <div className="space-y-4 text-left font-sans animate-fade-in select-none">
      
      {/* Tab select slider */}
      <div className="flex gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
        <button
          onClick={() => setActiveGame("chess")}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeGame === "chess"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Swords className="w-3.5 h-3.5" />
          Aura Chess VS AI
        </button>

        <button
          onClick={() => setActiveGame("2048")}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeGame === "2048"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Aura Slide 2048
        </button>
      </div>

      {/* --- RENDER CHESS GAME --- */}
      {activeGame === "chess" && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-blue-400">Tactical Chess Arena</h3>
              <p className="text-[10px] text-slate-500">Play local Sandbox mode or versus CPU opponent</p>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-mono text-slate-400 flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVsComputer}
                  onChange={(e) => setIsVsComputer(e.target.checked)}
                  className="rounded bg-slate-850 border-slate-700 text-blue-500 focus:ring-0 cursor-pointer"
                />
                VS CPU
              </label>

              <button
                onClick={resetChess}
                className="p-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                title="Restart Chess match"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chess Board Frame */}
          <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <div className="grid grid-cols-8 gap-0.5 aspect-square w-full">
              {chessBoard.map((rowArr, rowIdx) =>
                rowArr.map((piece, colIdx) => {
                  const isLight = (rowIdx + colIdx) % 2 === 0;
                  const isSelected = selectedSquare && selectedSquare[0] === rowIdx && selectedSquare[1] === colIdx;
                  
                  // Helper colorings for active selections
                  let cellBg = isLight ? "bg-slate-800" : "bg-slate-900";
                  if (isSelected) cellBg = "bg-blue-600/55 ring-1 ring-blue-400 z-10";

                  const pieceKey = piece ? `${piece.color}-${piece.type}` : "";
                  const pieceSymbol = piece ? UNICODE_PIECES[pieceKey] : "";

                  return (
                    <button
                      key={`${rowIdx}-${colIdx}`}
                      onClick={() => handleSquareClick(rowIdx, colIdx)}
                      className={`relative aspect-square flex items-center justify-center focus:outline-none transition-all cursor-pointer ${cellBg}`}
                    >
                      {/* Piece display */}
                      {pieceSymbol && (
                        <span 
                          className={`text-2xl sm:text-3xl font-bold select-none ${
                            piece.color === "w" 
                              ? "text-blue-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" 
                              : "text-rose-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                          }`}
                        >
                          {pieceSymbol}
                        </span>
                      )}

                      {/* Coordinates tags */}
                      {colIdx === 0 && (
                        <span className="absolute top-0.5 left-0.5 text-[8px] text-slate-650 font-mono">
                          {8 - rowIdx}
                        </span>
                      )}
                      {rowIdx === 7 && (
                        <span className="absolute bottom-0.5 right-0.5 text-[8px] text-slate-650 font-mono">
                          {String.fromCharCode(97 + colIdx)}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 font-mono text-[11px] text-slate-400 leading-relaxed min-h-[44px]">
            <span className="text-blue-400 font-bold">LOG:</span> {chessLog}
          </div>
        </div>
      )}

      {/* --- RENDER 2048 GAME --- */}
      {activeGame === "2048" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-800 px-3 py-2 rounded-xl">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">Score</span>
                <span className="text-sm font-bold text-slate-200 font-mono">{score2048}</span>
              </div>
              <div className="border-l border-slate-800 pl-4">
                <span className="text-[9px] text-slate-500 uppercase block font-semibold flex items-center gap-0.5">
                  <Trophy className="w-2.5 h-2.5 text-amber-500" />
                  Best
                </span>
                <span className="text-sm font-bold text-amber-400 font-mono">{highScore2048}</span>
              </div>
            </div>

            <button
              onClick={init2048}
              className="p-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Restart 2048"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* 2048 Main Board Canvas */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 relative">
            <div className="grid grid-cols-4 gap-2 aspect-square w-full">
              {board2048.map((row, r) =>
                row.map((val, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`aspect-square rounded-xl border flex flex-col items-center justify-center font-bold font-mono transition-all duration-150 ${get2048TileColor(val)}`}
                  >
                    {val > 0 ? (
                      <span className={val >= 1024 ? "text-base sm:text-lg" : "text-lg sm:text-xl"}>
                        {val}
                      </span>
                    ) : (
                      <Circle className="w-1.5 h-1.5 text-slate-850" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Game Over Overlay */}
            {isGameOver2048 && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3">
                <p className="text-base font-bold text-rose-400 uppercase tracking-widest font-mono">Game Over</p>
                <button
                  onClick={init2048}
                  className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Action Pad (Onscreen controls) */}
          <div className="space-y-1.5">
            <div className="text-center">
              <button
                onClick={() => handle2048Move("up")}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer font-bold text-xs"
              >
                ▲ UP
              </button>
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handle2048Move("left")}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer font-bold text-xs"
              >
                ◀ LEFT
              </button>
              <button
                onClick={() => handle2048Move("down")}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer font-bold text-xs"
              >
                ▼ DOWN
              </button>
              <button
                onClick={() => handle2048Move("right")}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer font-bold text-xs"
              >
                ▶ RIGHT
              </button>
            </div>
          </div>
          
          <p className="text-[10px] text-slate-500 text-center italic mt-1 leading-normal">
            Slide tiles in any direction. Matching tiles merge into their double value!
          </p>
        </div>
      )}

    </div>
  );
}
