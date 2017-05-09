import { Injectable } from '@angular/core';
import { BehaviorSubject  } from 'rxjs/BehaviorSubject';
import { Observable  } from 'rxjs/Observable';

class Node {
    board
    children
    level
    constructor(board, children, level) {
        this.board = board;
        this.children = children;
        this.level = level;
    }
}

function invert(figure) {
    return figure === 'cross' ? 'naught' : 'cross';
}

function checkWinner(board) {
    let strBoard = board.map(cell => {
        let char = null;
        switch(cell) {
            case 'cross':
                char = 'x';
                break;
            case 'naught':
                char = 'o';
                break;
            case null:
                char = 'n';
                break;
        }
        return char;
    });

    strBoard = strBoard.join('');
    if (strBoard.indexOf('ooo') > -1) {
        return 'naught';
    } else if (strBoard.indexOf('xxx') > -1) {
        return 'cross';
    }

    if (strBoard.indexOf('n') === -1) {
        return 'tie';
    }

    return null;
}

function makeMoveOn(node, figure) {
    const board = node.board;
    const level = node.level;
    const newLevel = level + 1;
    const children = [];
    const winner = checkWinner(board);

    if (winner !== null) {
        // Assign a winner or a tie
        node.winner = winner;
        node.children = children;
        return;
    }
    board.forEach((cell, i) => {
        if (cell === null) {
            // create a new node there
            const newBoard = board.slice();
            newBoard[i] = figure;
            const move = new Node(newBoard, [], newLevel);
            children.push(move);
        }
    });
    node.children = children;

    node.children.forEach(child => {
        makeMoveOn(child, invert(figure));
    });
}

function compareArrays(ar1, ar2) {
    if (ar1.length !== ar2.length) {
        return false;
    }

    for (let i = 0; i < ar1.length; i++) {
        if (ar1[i] !== ar2[i]) {
            return false;
        }
    }

    return true;
}

function flatten(ar) {
    return ar.reduce((acc, x) => acc.concat(x), []);
}
function findBoardInTree(game, board) {
    const level = board.filter(figure => figure !== null).length;
    const children = game.children;
    let matching = null;

    if (game.level !== level - 1) {
        // Go deeper
        matching = children.map(node => findBoardInTree(node, board));
        matching = flatten(matching);
    } else {
        matching = children.filter(state => compareArrays(state.board, board));
    }
    return matching;
}

function gamesFromBoard(game) {
    const children = game.children;

    if (children.length === 0) {
        // A leaf node
        const outcome = {
            cross: 0,
            naught: 0,
            tie: 0
        };
        outcome[game.winner] = 1;
        return [outcome];
    }

    const outcomes = children.map(node => gamesFromBoard(node).reduce((acc, x) => {
        acc.cross += x.cross;
        acc.naught += x.naught;
        acc.tie += x.tie;
        acc.node  = node;
        return acc;
    }, {
        cross: 0,
        naught: 0,
        tie: 0
    }));

    return outcomes;
}

function chooseBranch(outcomes, figure) {
    return outcomes.reduce((acc, x) => {
        if (acc === null) {
            return x;
        }

        if (acc[figure] + acc.tie < x[figure] + x.tie) {
            return x
        }

        return acc;
    }, null);
}

@Injectable()
export class TreeService {
    private gameSource = new BehaviorSubject({
        board: [],
        goes: 'cross',
        winner: null
    });
    game$ = this.gameSource.asObservable();

    cells = 8;

    // Tree
    tree = null
    winner = null
    constructor() {
    }
    startGame() {
        const board = new Array(this.cells).fill(null);
        const goes = 'cross';
        this.gameSource.next({
            board,
            goes,
            winner: null
        });

        // Make the tree
        console.time('Make the tree');
        this.tree = new Node((new Array(this.cells).fill(null)), [], 0);
        makeMoveOn(this.tree, 'cross');
        console.timeEnd('Make the tree');
    }
    makeMove(index) {
        // Update the board
        const board = this.gameSource.value.board;
        const goes = this.gameSource.value.goes;
        const winner = this.gameSource.value.winner;
        board[index] = 'cross'
        this.gameSource.next({
            board,
            goes: invert(goes),
            winner
        });

        const _winner = checkWinner(board);
        if (_winner !== null) {
            this.winner = _winner;
            this.gameSource.next({
                board,
                goes,
                winner: this.winner
            });
            setTimeout(_ => {
                this.startGame();
            }, 4000);
            return;
        }

        console.time('Find a move');
        const boardGame = findBoardInTree(this.tree, board).pop();
        const outcomes = gamesFromBoard(boardGame);
        const winningBranch = chooseBranch(outcomes, 'naught');
        console.timeEnd('Find a move');

        const _winnerAfterAI = checkWinner(winningBranch.node.board);
        this.gameSource.next({
            board: winningBranch.node.board,
            goes,
            winner: _winnerAfterAI
        });
        if (_winnerAfterAI !== null) {
            setTimeout(_ => {
                this.startGame();
            }, 4000);
        }
    }
}
