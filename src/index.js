import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

const BOARD_ROWS = 6;
const BOARD_COLUMNS = 7;

const RED_MARKER = './red-marker.png';
const BLUE_MARKER = './blue-marker.png';

function Square(props) {
  var img = ""

  if (props.value) {
    img = (<img src={props.value} alt="M"></img>);
  }
  
  if (props.victory) {
    return (
      <button className="square victory" onClick={props.onClick}>
       {img}
      </button>
    );
  } else {
    return (
      <button className="square" onClick={props.onClick}>
       {img}
      </button>
    );
  }
  
}

class SquareInfo {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }

  getRow() {return this.row;}
  getCol() { return this.col;}
}

class Board extends React.Component {
  renderSquare(index) {
    let v = false;

    if (this.props.victorySquares) {
      v = this.props.victorySquares.includes(index);
    }

    return (
      <Square
        victory={v}
        value={this.props.squares[index]}
        onClick={() => this.props.onClick(index)}
      />
    );
  }

  render() {
    let squaresArray = [];
    let board = [];

    for (let row = 0; row < BOARD_ROWS; row++){
      for (let col = 0; col < BOARD_COLUMNS; col++) {
        squaresArray.push(this.renderSquare(convert2Dto1D(row,col)));
      }

      board.push(<div className="board-row">{squaresArray}</div>);
      squaresArray = [];
    }

    return (<div>{board}</div>);
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(BOARD_ROWS*BOARD_COLUMNS).fill(null),
          moves: []
        }
      ],
      stepNumber: 0,
      xIsNext: true
    };
  }

  handleClick(i) {
    console.log(i);
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const moves = current.moves.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? RED_MARKER : BLUE_MARKER;
    moves.push(new SquareInfo(Math.floor(i%BOARD_COLUMNS),Math.floor(i/BOARD_COLUMNS)));

    this.setState({
      history: history.concat([
        {
          squares: squares,
          moves: moves,
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winnerData = calculateWinner(current.squares);

    const time_machine = [];

    history.forEach(entry => {
      var desc = entry.moves.length > 0 ? `Go to move (${entry.moves[entry.moves.length-1].getRow()+1}, ${entry.moves[entry.moves.length-1].getCol()+1})` : "Go to game start";

      if (entry === current) {
        desc = (<b>{desc}</b>);
      }

      time_machine.push(<li key={entry.moves.length}>
        <button onClick={() => this.jumpTo(entry.moves.length)}>{desc}</button>
      </li>)
    });

    let status;
    let v = null;

    if (winnerData) {
      if (winnerData.winner === RED_MARKER) {
        status = "Winner: Red";
        v = winnerData.winning_moves;
      } else if (winnerData.winner === BLUE_MARKER) {
        status = "Winner: Blue";
        v = winnerData.winning_moves;
      } else {
        status = "Draw.";
      }
    } else {
      status = "Next player: " + (this.state.xIsNext ? "Red" : "Blue");
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            victorySquares={v}
            squares={current.squares}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{time_machine}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  var win;

  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLUMNS; col++) {
      win = checkForWinningSequence(squares, row, col);

      if (win) {
        return win;
      }
    }
  }
  return null;
}

function checkForWinningSequence(squares, row, col) {
  //horizontal_win
  var startIndex = convert2Dto1D(row,col);
  
  if (typeof squares[startIndex] === 'undefined' || !squares[startIndex]) {
    return null;
  }

  //horizontal
  if (squares[startIndex] === squares[startIndex+1] &&
      squares[startIndex] === squares[startIndex+2] &&
      squares[startIndex] === squares[startIndex+3]) 
  {
    return {
      winning_moves: [startIndex, startIndex+1, startIndex+2, startIndex+3],
      winner: squares[startIndex]
    }
  }

  //vertical
  if (squares[startIndex] === squares[startIndex+(BOARD_COLUMNS)] &&
      squares[startIndex] === squares[startIndex+(BOARD_COLUMNS*2)] &&
      squares[startIndex] === squares[startIndex+(BOARD_COLUMNS*3)]) 
  {
    return {
      winning_moves: [startIndex, startIndex+BOARD_COLUMNS, startIndex+BOARD_COLUMNS*2, startIndex+BOARD_COLUMNS*3],
      winner: squares[startIndex]
    }
  }

  //diagonal-down
  if (squares[startIndex] === squares[startIndex+BOARD_COLUMNS+1] && 
    squares[startIndex] === squares[startIndex+((BOARD_COLUMNS+1)*2)] &&
    squares[startIndex] === squares[startIndex+((BOARD_COLUMNS+1)*3)]) 
    {
      return {
        winning_moves: [startIndex, startIndex+BOARD_COLUMNS+1, startIndex+(BOARD_COLUMNS+1)*2, startIndex+(BOARD_COLUMNS+1)*3],
        winner: squares[startIndex]
      }
    }

  //diagonal-up
  if (squares[startIndex] === squares[startIndex+BOARD_ROWS] && 
    squares[startIndex] === squares[startIndex+(BOARD_ROWS*2)] &&
    squares[startIndex] === squares[startIndex+(BOARD_ROWS*3)])
    {
      return {
        winning_moves: [startIndex, startIndex+BOARD_ROWS, startIndex+(BOARD_ROWS*2), startIndex+(BOARD_ROWS*3)],
        winner: squares[startIndex]
      }
    }

  //draw
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLUMNS; col++) {
      if (!squares[convert2Dto1D(row,col)]) {
        return null;
      } 
    }
  }

  return {
    winning_moves: null,
    winner: "DRAW"
  }
}

function convert2Dto1D(row, col) {
  return row*BOARD_COLUMNS+col;
}

ReactDOM.render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
