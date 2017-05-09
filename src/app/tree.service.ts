import { Injectable } from '@angular/core';
import { BehaviorSubject  } from 'rxjs/BehaviorSubject';
import { Observable  } from 'rxjs/Observable';

function invert(figure) {
    return figure === 'cross' ? 'naught' : 'cross';
}

@Injectable()
export class TreeService {
    private gameSource = new BehaviorSubject({
        board: [],
        goes: 'cross'
    });
    game$ = this.gameSource.asObservable();

    cells = 5;
    constructor() {

    }
    startGame() {
        const board = new Array(this.cells).fill(null);
        const goes = 'cross';
        this.gameSource.next({
            board,
            goes
        });
    }
    makeMove(index) {
        // Update the board
        const board = this.gameSource.value.board;
        const goes = this.gameSource.value.goes;
        board[index] = 'cross'
        this.gameSource.next({
            board,
            goes: invert(goes)
        });
    }
}
