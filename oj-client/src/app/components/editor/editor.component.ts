import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TSMap } from 'typescript-map';

// pulling the ace into typescript so that we can use it here in ts
declare var ace: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  editor: any;
  language: string = 'Java';
  languages: string[] = ['Java', 'C++', 'Python', 'Javascript'];
  sessionId: string;
  output: string;
  defaultContent = {
    'Java': 
    `public class Example {
  public static void main(String[] args) { 
    // Type your Java code here, hiahiahia
  } 
}`,
    'C++':
    `#include <iostream> 
using namespace std; 
int main() { 
  // Type your C++ code here , hiahiahia
  return 0; 
}`,
    'Python':
    `class Solution: 
  def example(): 
    # Write your Python code here, hiahiahia`,
    'Javascript':
    `var soln = function() {
  // Type your JS code here, hiahiahia  
}`
  };
  // map in ts
  map: TSMap<string, string> = new TSMap<string, string> ([
    ['Java','java'],
    ['C++','c_cpp'],
    ['Python','python'],
    ['Javascript','javascript']
  ]);

  constructor(@Inject('collab') private collabService,
              @Inject('data') private dataService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.sessionId = params['id'];
      this.initEditor();
    });
  }

  initEditor(): void {
    this.editor = ace.edit('editor');
    this.editor.setTheme('ace/theme/eclipse');
    this.editor.setFontSize(18);
    this.editor.$blockScrolling = Infinity;
    this.resetEditor();
    this.collabService.init(this.editor, this.sessionId);
    this.collabService.lastDelta = null;
    this.editor.on('change', (delta) => {
      console.log('Editor Component: ' + JSON.stringify(delta));
      if (this.editor.lastAppliedChange != delta) {
        this.collabService.change(JSON.stringify(delta));
      }
    });
    this.editor.getSession().getSelection().on('changeCursor', () => {
      let cursor = this.editor.getSession().getSelection().getCursor();
      console.log(cursor);
      this.collabService.cursorMove(JSON.stringify(cursor));
    });
    this.collabService.restoreBuffer();
  }

  resetEditor(): void {
    this.editor.getSession().setMode(`ace/mode/${this.map.get(this.language)}`);
    this.editor.setValue(this.defaultContent[this.language]);
    this.output = '';
  }

  setLanguage(language: string) {
    this.language = language;
    this.resetEditor();
  }

  submit() {
    this.output = '';
    let userCodes = this.editor.getValue();
    let works = {
      userCodes: userCodes,
      lang: this.map.get(this.language)
    };
    this.dataService.buildAndRun(works)
                    .then(res => {
                      console.log(JSON.stringify(res));
                      this.output = res.text;
                    });
  }

}
