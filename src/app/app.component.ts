import { Component, OnInit } from '@angular/core';
import { TreeService } from './tree.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Naughts and crosses';
  board = [];
  goes = 'cross';
  winner = null;
  constructor(private treeService: TreeService) {
      treeService.game$.subscribe(game => {
        this.board = game.board;
        this.goes = game.goes;
        this.winner = game.winner;
      });
  }
  ngOnInit() {
      this.treeService.startGame();
  }
  move(i, cell) {
      if (this.goes !== 'cross') {
        return;
      }
      if (cell !== null) {
        return;
      }

      // Move
      this.treeService.makeMove(i);
  }
}
