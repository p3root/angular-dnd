// Copyright (C) 2017 Gnucoop
// This project is licensed under the terms of the MIT license.
// https://github.com/gnucoop/ng2-dnd

import { NgModule, ModuleWithProviders } from '@angular/core';

import {DragDropConfig} from './dnd.config';
import {
  DragDropService, DragDropSortableService,
  dragDropServiceFactory, dragDropSortableServiceFactory
} from './dnd.service';
import {DraggableComponent, DraggableHandleComponent} from './draggable.component';
import {DroppableComponent} from './droppable.component';
import {SortableContainer, SortableComponent, SortableHandleComponent} from './sortable.component';

export let providers = [
  DragDropConfig,
  { provide: DragDropService, useFactory: dragDropServiceFactory },
  {
    provide: DragDropSortableService,
    useFactory: dragDropSortableServiceFactory,
    deps: [DragDropConfig]
  }
];

@NgModule({
  declarations: [
    DraggableComponent, DraggableHandleComponent, DroppableComponent,
    SortableContainer, SortableComponent, SortableHandleComponent
  ],
  exports :  [
    DraggableComponent, DraggableHandleComponent, DroppableComponent,
    SortableContainer, SortableComponent, SortableHandleComponent
  ]

})
export class DndModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DndModule,
      providers: providers
    };
  }
}
