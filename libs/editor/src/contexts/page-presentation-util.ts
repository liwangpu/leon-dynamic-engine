import React from 'react';

export const PagePresentationUtilContext = React.createContext<PagePresentationUtilContextProvider>(null);

export class PagePresentationUtilContextProvider {

  private _dragPreviewNode: HTMLDivElement;
  public get dragPreviewNode(): HTMLDivElement {
    return this._dragPreviewNode;
  }

  public setDragPreviewNode(node: HTMLDivElement): void {
    this._dragPreviewNode = node;
  }

}