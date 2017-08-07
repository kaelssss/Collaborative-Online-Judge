import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Problem } from '../../models/problem.model';

@Component({
  selector: 'app-problem-list',
  templateUrl: './problem-list.component.html',
  styleUrls: ['./problem-list.component.css']
})
export class ProblemListComponent implements OnInit {

  subcProblems: Subscription;
  problems: Problem[];

  constructor(@Inject('data') private dataService) { }

  ngOnInit() {
    this.getProblems();
  }

  getProblems(): void {
    this.dataService.getProblems().subscribe(problems => {this.problems = problems;});
  }
}
