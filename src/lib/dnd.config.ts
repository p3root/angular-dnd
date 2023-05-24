// Copyright (C) 2017 Gnucoop
// This project is licensed under the terms of the MIT license.
// https://github.com/gnucoop/ng2-dnd

import {Injectable} from '@angular/core';
import {isString} from './dnd.utils';

export class DataTransferEffect {
  static COPY = new DataTransferEffect('copy');
  static LINK = new DataTransferEffect('link');
  static MOVE = new DataTransferEffect('move');
  static NONE = new DataTransferEffect('none');

  constructor(public name: "none" | "copy" | "link" | "move") { }
}

export class DragImage {
  constructor(
    public imageElement: any,
    public xOffset = 0,
    public yOffset = 0
  ) {
    if (isString(this.imageElement)) {
      // Create real image from string source
      let imgScr: string = <string>this.imageElement;
      this.imageElement = new HTMLImageElement();
      (<HTMLImageElement>this.imageElement).src = imgScr;
    }
  }
}

@Injectable()
export class DragDropConfig {
  public onDragStartClass = 'dnd-drag-start';
  public onDragEnterClass = 'dnd-drag-enter';
  public onDragOverClass = 'dnd-drag-over';
  public onSortableDragClass = 'dnd-sortable-drag';

  public dragEffect: DataTransferEffect = DataTransferEffect.MOVE;
  public dropEffect: DataTransferEffect = DataTransferEffect.MOVE;
  public dragCursor = 'move';
  public dragImage: DragImage;
}
