import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QuestionDto } from '../../../../services/models';

@Component({
  selector: 'app-admin-question-list-drawer',
  imports: [],
  templateUrl: './admin-question-list-drawer.component.html',
  styleUrl: './admin-question-list-drawer.component.css'
})
export class AdminQuestionListDrawerComponent {
  @Input() questionList: QuestionDto[] = [];
  @Input() currentQuestionIndex: number = 0;
  @Output() onQuestionSelect = new EventEmitter<number>();


  // select question
  selectQuestion(index: number) {
    this.onQuestionSelect.emit(index);
  }
}
