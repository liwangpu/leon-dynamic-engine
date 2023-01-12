// import { IComponentConfiguration } from '@tiangong/core';
import { types, flow } from "mobx-state-tree";
import { PageRepository } from '../models';


export const DynamicPage = types.custom<any, any>({
  name: 'DynamicPage',
  fromSnapshot(value: any) {
    return value;
  },
  toSnapshot(value: any) {
    return value;
  },
  isTargetType(value: any): boolean {
    return true;
  },
  getValidationMessage(value: any): string {
    return null;
  }
});

export const PageStore = types.model({
  pages: types.map(DynamicPage)
})
  .views(self => ({
    editingPage(id: string) {
      if (!self.pages.has(id)) { return null; }
      return self.pages.get(id);
    }
  }))
  .actions(self => ({
    refresh: flow(function* (businessModel: string) {
      const pages: any[] = yield PageRepository.getInstance().query(businessModel);
      self.pages.clear();
      pages.forEach(p => {
        self.pages.set(p.id, p);
      });
    }),
    getPage: flow(function* (id: string) {
      const page = yield PageRepository.getInstance().get(id);
      self.pages.set(id, page);
    }),
    addPage: flow(function* (page: any) {
      const id: string = yield PageRepository.getInstance().create(page);
      self.pages.set(id, { ...page, id });
      return id;
    }),
    updatePage: flow(function* (page: any) {
      yield PageRepository.getInstance().update(page.id, page);
      self.pages.set(page.id, page);
    }),
    deletePage: flow(function* (id: string) {
      yield PageRepository.getInstance().delete(id);
      self.pages.delete(id)
    })
  }));