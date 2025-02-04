// Copyright (C) 2016 Sergey Akopkokhyants
// This project is licensed under the terms of the MIT license.
// https://github.com/akserg/ng2-dnd

import {ChangeDetectorRef} from '@angular/core';
import {Directive, Input, Output, EventEmitter, ElementRef} from '@angular/core';

import {AbstractComponent, AbstractHandleComponent} from './abstract.component';
import {DragDropConfig} from './dnd.config';
import {DragDropService, DragDropSortableService} from './dnd.service';

@Directive({ selector: '[dnd-sortable-container]' })
export class SortableContainer extends AbstractComponent {

  @Input('dragEnabled') set draggable(value: boolean) {
    this.dragEnabled = !!value;
  }

  private _sortableData: Array<any> = [];

  @Input() set sortableData(sortableData: Array<any>) {
    this._sortableData = sortableData;
    //
    this.dropEnabled = !!this._sortableData;
    // console.log('collection is changed, drop enabled: ' + this.dropEnabled);
  }
  get sortableData(): Array<any> {
      return this._sortableData;
  }

  @Input('dropZones') set dropzones(value: Array<string>) {
      this.dropZones = value;
  }

  constructor(
    elemRef: ElementRef, dragDropService: DragDropService, config: DragDropConfig,
    cdr: ChangeDetectorRef,
    private _sortableDataService: DragDropSortableService
  ) {

    super(elemRef, dragDropService, config, cdr);
    this.dragEnabled = false;
  }

  _onDragEnterCallback(event: Event) {
    if (this._sortableDataService.isDragged) {
      let item: any = this._sortableDataService.sortableContainer
        ._sortableData[this._sortableDataService.index];
      // Check does element exist in sortableData of this Container
      if (this._sortableData.indexOf(item) === -1) {
        // Let's add it
        // Remove item from previouse list
        this._sortableDataService.sortableContainer._sortableData
          .splice(this._sortableDataService.index, 1);
        if (this._sortableDataService.sortableContainer._sortableData.length === 0) {
            this._sortableDataService.sortableContainer.dropEnabled = true;
        }
        // Add item to new list
        this._sortableData.unshift(item);
        this._sortableDataService.sortableContainer = this;
        this._sortableDataService.index = 0;
      }
      // Refresh changes in properties of container component
      this.detectChanges();
    }
  }
}

@Directive({ selector: '[dnd-sortable]', exportAs: 'dndSortable' })
export class SortableComponent extends AbstractComponent {

  @Input('sortableIndex') index: number;

  @Input('dragEnabled') set draggable(value: boolean) {
      this.dragEnabled = !!value;
  }

  @Input('dropEnabled') set droppable(value: boolean) {
      this.dropEnabled = !!value;
  }

  /**
   * The data that has to be dragged. It can be any JS object
   */
  @Input() dragData: any;

  /**
   * Drag allowed effect
   */
  @Input('effectAllowed') set effectallowed(value: "link" | "all" | "none" | "copy" | "move" | "copyLink" | "copyMove" | "linkMove" | "uninitialized") {
      this.effectAllowed = value;
  }

  /**
   * Drag effect cursor
   */
  @Input('effectCursor') set effectcursor(value: string) {
      this.effectCursor = value;
  }

  /**
   * Callback function called when the drag action ends with a valid drop action.
   * It is activated after the on-drop-success callback
   */
  @Output('onDragSuccess') onDragSuccessCallback: EventEmitter<any> = new EventEmitter<any>();

  @Output('onDragStart') onDragStartCallback: EventEmitter<any> = new EventEmitter<any>();
  @Output('onDragOver') onDragOverCallback: EventEmitter<any> = new EventEmitter<any>();
  @Output('onDragEnd') onDragEndCallback: EventEmitter<any> = new EventEmitter<any>();
  @Output('onDropSuccess') onDropSuccessCallback: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    elemRef: ElementRef, dragDropService: DragDropService, config: DragDropConfig,
    private _sortableContainer: SortableContainer,
    private _sortableDataService: DragDropSortableService,
    cdr: ChangeDetectorRef
  ) {

    super(elemRef, dragDropService, config, cdr);

    this.dropZones = this._sortableContainer.dropZones;
    this.dragEnabled = true;
    this.dropEnabled = true;
  }

  _onDragStartCallback(event: Event) {
    this._sortableDataService.isDragged = true;
    this._sortableDataService.sortableContainer = this._sortableContainer;
    this._sortableDataService.index = this.index;
    this._sortableDataService.markSortable(this._elem);
    // Add dragData
    this._dragDropService.isDragged = true;
    this._dragDropService.dragData = this.dragData;
    this._dragDropService.onDragSuccessCallback = this.onDragSuccessCallback;
    //
    this.onDragStartCallback.emit(this._dragDropService.dragData);
  }

  _onDragOverCallback(event: Event) {
    if (this._sortableDataService.isDragged && this._elem !== this._sortableDataService.elem) {
      this._sortableDataService.sortableContainer = this._sortableContainer;
      this._sortableDataService.index = this.index;
      this._sortableDataService.markSortable(this._elem);
      this.onDragOverCallback.emit(this._dragDropService.dragData);
    }
  }

  _onDragEndCallback(event: Event) {
    // console.log('_onDragEndCallback. end dragging elem with index ' + this.index);
    this._sortableDataService.isDragged = false;
    this._sortableDataService.sortableContainer = null;
    this._sortableDataService.index = null;
    this._sortableDataService.markSortable(null);
    // Add dragGata
    this._dragDropService.isDragged = false;
    this._dragDropService.dragData = null;
    this._dragDropService.onDragSuccessCallback = null;
    //
    this.onDragEndCallback.emit(this._dragDropService.dragData);
  }

  _onDragEnterCallback(event: Event) {
    if (this._sortableDataService.isDragged) {
      this._sortableDataService.markSortable(this._elem);
      if (
        (this.index !== this._sortableDataService.index) ||
        (this._sortableDataService.sortableContainer.sortableData !==
        this._sortableContainer.sortableData)
      ) {
        // Get item
        let item: any = this._sortableDataService.sortableContainer
          .sortableData[this._sortableDataService.index];
        // Remove item from previouse list
        this._sortableDataService.sortableContainer.sortableData
          .splice(this._sortableDataService.index, 1);
        if (this._sortableDataService.sortableContainer.sortableData.length === 0) {
            this._sortableDataService.sortableContainer.dropEnabled = true;
        }
        // Add item to new list
        this._sortableContainer.sortableData.splice(this.index, 0, item);
        if (this._sortableContainer.dropEnabled) {
            this._sortableContainer.dropEnabled = false;
        }
        this._sortableDataService.sortableContainer = this._sortableContainer;
        this._sortableDataService.index = this.index;
      }
    }
  }

  _onDropCallback (event: Event) {
    if (this._sortableDataService.isDragged) {
      this.onDropSuccessCallback.emit(this._dragDropService.dragData);
      if (this._dragDropService.onDragSuccessCallback) {
          this._dragDropService.onDragSuccessCallback.emit(this._dragDropService.dragData);
      }
      // Refresh changes in properties of container component
      this._sortableContainer.detectChanges();
    }
  }
}

@Directive({ selector: '[dnd-sortable-handle]' })
export class SortableHandleComponent extends AbstractHandleComponent {
  private _el: HTMLElement;

  @Input() set sortableComponent(component: SortableComponent) {
    component.setDragHandle(this._el);
  }

  constructor(
    elemRef: ElementRef, dragDropService: DragDropService,
    config: DragDropConfig, cdr: ChangeDetectorRef
  ) {
    super(elemRef, dragDropService, config, cdr);

    this._el = elemRef.nativeElement;
  }
}
