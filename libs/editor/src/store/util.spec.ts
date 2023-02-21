import { IComponentConfiguration } from '@lowcode-engine/core';
import * as _ from 'lodash';
import { getSnapshot, SnapshotIn } from 'mobx-state-tree';
import { generateDesignState, nestComponentTree } from './util';
import { EditorStoreModel, INITIAL_STATE } from './editor-store';


describe('store util', () => {

  describe('generateDesignState', () => {
    const schema = {
      id: "p1",
      title: "页面",
      type: "detail-page",
      // operators: [
      //   {
      //     id: "op1",
      //     type: "button",
      //     title: "保存"
      //   },
      //   {
      //     id: "op2",
      //     type: "button",
      //     title: "审批"
      //   },
      // ],
      // body: [
      //   {
      //     id: "v1",
      //     type: "video-player",
      //     title: "视频播放器"
      //   }
      // ],
      pagination: {
        id: 'pp1',
        type: 'pagination',
        pageSize: 10
      }
    };

    test.only('完整的hierarchy映射', () => {
      const state: SnapshotIn<EditorStoreModel> = generateDesignState(schema, {
        "detail-page": ['operators', 'body', 'pagination']
      }, {
        'detail-page@pagination': true
      });
      console.log(JSON.stringify(state));
      // console.log(JSON.stringify(state.treeStore));

      const ss = nestComponentTree(state, {
        "detail-page": ['operators', 'body', 'pagination']
      }, {
        'detail-page@pagination': true
      });
      console.log(JSON.stringify(ss));
      // expect(true).toBe(true);
      // const componentTreeIds = Object.keys(state.componentTrees);
      // const configurationIds = Object.keys(state.componentConfigurations);
      // const allComponentIds = ['p1', 'op1', 'op2', 'v1']
      // expect(componentTreeIds).toEqual(expect.arrayContaining(allComponentIds));
      // expect(configurationIds).toEqual(expect.arrayContaining(allComponentIds));
      // const pageTree = state.componentTrees['p1'];
      // expect(pageTree['operation']).toEqual(expect.arrayContaining(['op1', 'op2']));
      // expect(pageTree['body']).toEqual(expect.arrayContaining(['v1']));
    });

  });

});