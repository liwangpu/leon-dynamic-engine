import React from 'react';

export const PagePresentationUtilContext = React.createContext<PagePresentationUtilContextProvider>(null);

export class PagePresentationUtilContextProvider {

  private _dragPreviewNode: HTMLDivElement;
  private _componentHoverPath: Array<string> = [];

  public get dragPreviewNode(): HTMLDivElement {
    return this._dragPreviewNode;
  }

  public get hoveredComponentId(): string {
    return this._componentHoverPath[this._componentHoverPath.length - 1];
  }

  public setDragPreviewNode(node: HTMLDivElement): void {
    this._dragPreviewNode = node;
  }

  public componentHover(componentId: string): void {
    this._componentHoverPath.push(componentId);
  }

  public componentUnHover(): void {
    this._componentHoverPath.pop();
  }


}