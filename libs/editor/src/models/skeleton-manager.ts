import { IEditorContext } from './editor-manager';
import { makeAutoObservable } from 'mobx';
import { SkeletonAreaEnum } from '../enums';

export interface ISkeleton {
  title: string;
  area: SkeletonAreaEnum;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface ISkeletonManager {
  skeletonMap: Map<string, ISkeleton>;
  skeletonGroup: { [name in SkeletonAreaEnum]?: Set<string> };
  add(st: ISkeleton): void;
  remove(name: string): void;
}

export class SkeletonManager implements ISkeletonManager{

  public skeletonMap = new Map<string, ISkeleton>();
  public skeletonGroup: { [name in SkeletonAreaEnum]?: Set<string> } = {};
  public constructor(private context: IEditorContext) {
    makeAutoObservable(this, {
      skeletonMap: false
    });
  }

  public add(st: ISkeleton) {
    if (this.skeletonMap.has(st.title)) {
      console.log(`name为${st.title}的skeleton已经注册过`,);
      return;
    }
    if (!st.area) {
      console.error(`name为${st.title}的skeleton没有写明area参数`);
      return;
    }

    let map = this.skeletonGroup[st.area] || new Set<string>();
    map.add(st.title);
    this.skeletonGroup[st.area] = map;
    this.skeletonMap.set(st.title, st);
  }

  public remove(name: string): void {
    if (!this.skeletonMap.has(name)) { return; }
    const st = this.skeletonMap.get(name);
    const set = this.skeletonGroup[st.area];
    set.delete(name);
    this.skeletonGroup[st.area] = new Set(set.values());
    this.skeletonMap.delete(name);
  }

}