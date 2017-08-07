import { Injectable } from '@angular/core';
import { COLORS } from '../../assets/colors';

declare var io: any;
declare var ace: any;

@Injectable()
export class CollaborationService {

  collab_sck: any;
  // struct of clientsInfo: sckId ->-> marker;
  // each session keeps lots of markers;
  clientsInfo: Object = {};
  clientsNum: number = 0;

  constructor() { }

  init(editor: any, sessionId: string): void {
    this.collab_sck = io(window.location.origin, {
      query: 'sessionId='+sessionId
    });


    this.collab_sck.on('change', (delta: string) => {
      console.log('editor changed!!: '+delta);
      delta = JSON.parse(delta);
      editor.lastAppliedChange = delta;
      editor.getSession().getDocument().applyDeltas([delta]);
    });


    this.collab_sck.on('cursorMove', (cursor: string) => {
      console.log(cursor);
      let cursorObj = JSON.parse(cursor);
      let x = cursorObj.row;
      let y = cursorObj.column;
      let changedClientId = cursorObj.sckId;
      let session = editor.getSession();
      if(changedClientId in this.clientsInfo) {
        session.removeMarker(this.clientsInfo[changedClientId].marker);
      }
      else {
        this.clientsInfo[changedClientId] = {};
        let css = document.createElement('style');
        css.type = 'text/css';
        css.innerHTML = '.editor_cursor_' + changedClientId
          + '{ position: absolute; background: ' + COLORS[this.clientsNum] + ';'
          + 'z-index: 100; width: 3px !important; }';
        document.body.appendChild(css);
        this.clientsNum++;
      }
      let Range = ace.require('ace/range').Range;
      let newMarker = session.addMarker(new Range(x, y, x, y+1),
                                        'editor_cursor_' + changedClientId,
                                        true);
      this.clientsInfo[changedClientId].marker = newMarker;
      console.log(JSON.stringify(this.clientsInfo));
    })
  }

  change(delta: string): void {
    this.collab_sck.emit('change', delta);
  }

  cursorMove(cursor: string): void {
    this.collab_sck.emit('cursorMove', cursor);
  }

  restoreBuffer(): void {
    this.collab_sck.emit('restoreBuffer');
  }
}
