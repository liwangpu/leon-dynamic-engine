import { IProjectSchema } from '@lowcode-engine/core';
import { ComponentTypes } from '@lowcode-engine/primary-component-package';

export const LocalShemaStore = (() => {
  const STORAGE_KEY = 'simple-page-editor-schema';

  const INITIAL_SCHEMA: IProjectSchema = {
    id: 'page',
    type: ComponentTypes.listPage,
    code: 'LIST-PAGE',
    title: '列表页面',
    width: '100%',
    height: '100%',
  };

  return {
    query() {
      const str = localStorage.getItem(STORAGE_KEY);
      if (str) {
        return JSON.parse(str);
      }

      return INITIAL_SCHEMA;
    },
    save(schema: IProjectSchema) {
      if (!schema) { return; }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(schema));
    },
    reset() {
      this.save(INITIAL_SCHEMA);
    },
  };
})();