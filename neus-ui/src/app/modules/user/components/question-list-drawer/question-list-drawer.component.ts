import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuestionDto } from '../../../../services/models';

@Component({
  selector: 'app-question-list-drawer',
  imports: [],
  templateUrl: './question-list-drawer.component.html',
  styleUrl: './question-list-drawer.component.css'
})
export class QuestionListDrawerComponent {

  @Input() questionList: QuestionDto[] = [];
  @Input() correctAnswers:Map<string,boolean> = new Map<string,boolean>(); ;
  @Input() currentQuestionIndex: number = 0;
  @Output() onQuestionSelect = new EventEmitter<number>();


  // select question
  selectQuestion(index: number) {
    this.onQuestionSelect.emit(index);
  }

}
