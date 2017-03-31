// Copyright (C) 2017 Gnucoop
// This project is licensed under the terms of the MIT license.
// https://github.com/gnucoop/ng2-dnd

import { NgModule, ModuleWithProviders } from '@angular/core';

import {DragDropConfig} from './dnd.config';
import {
  DragDropService, DragDropSortableService,
  dragDropServiceFactory, dragDropSortableServiceFactory
} from './dnd.service';
import {DraggableComponent} from './draggable.component';
import {DroppableComponent} from './droppable.component';
import {SortableContainer, SortableComponent} from './sortable.component';

export * from './abstract.component';
export * from './dnd.config';
export * from './dnd.service';
export * from './draggable.component';
export * from './droppable.component';
export * from './sortable.component';

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
  declarations: [DraggableComponent, DroppableComponent, SortableContainer, SortableComponent],
  exports : [DraggableComponent, DroppableComponent, SortableContainer, SortableComponent],

})
export class DndModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DndModule,
      providers: providers
    };
  }
}
