import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { BehaviorSubject, Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { Problem } from '../models/problem.model';
import { PROBLEMS } from '../mock-problems';

@Injectable()
export class DataService {

  private _problemSrc = new BehaviorSubject<Problem[]> ([]);
  problems: Problem[] = PROBLEMS;

  constructor(private http: Http) { }

  getProblems(): Observable<Problem[]> {
    this.http.get('api/v1/problems').toPromise()
    .then((res: Response) => {this._problemSrc.next(res.json());})
    .catch(this.errorHandler);
    return this._problemSrc.asObservable();
  }

  // tz: still returning promise cauz:
  // OK, it's right, we returned a PROMISE with the .then() and .catch() specified
  // this means that we can wait for it in other parts of program, not here
  // then in other places where we call for this promise, we can even chain .then() to further process
  // but note that here, what we do return is a promise which is limited to returning
  // Problem classed objs
  getProblem(id: number): Promise<Problem> {
    return this.http.get(`api/v1/problems/${id}`).toPromise()
    .then((res: Response) => {
      return res.json();
    })
    .catch(this.errorHandler);
  }

  addProblem(newProblem: Problem): Promise<void> {
    const headers = new Headers( {
      'content-type': 'application/json'
    });
    return this.http.post('api/v1/problems', newProblem, headers).toPromise()
    .then((res: Response) => {
      // call getProblems() again to add a change on _problemSrc, 
      // so that the problem-list watching this obs can see a change at once
      // if not, we can only see the new problem after refreshing the page
      this.getProblems();
      return res.json();
    })
    .catch(this.errorHandler);
  }

  buildAndRun(works: any): Promise<Object> {
    const headers = new Headers( {
      'content-type': 'application/json'
    });
    return this.http.post('api/v1/build_and_run', works, headers).toPromise()
    .then((res: Response) => {
      console.log(res);
      return res.json();
    })
    .catch(this.errorHandler);
  }

  private errorHandler(error: any): Promise<any> {
    console.error('An error happened', error);
    return Promise.reject(error.body || error);
  }
}