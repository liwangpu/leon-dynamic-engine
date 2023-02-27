import styles from './index.module.less';
import React, { memo } from 'react';
import SimpleNavsPage, { INavItem } from '../../components/SimpleNavsPage';

const routers: Array<INavItem> = [
  {
    title: '组件插件',
    path: '/app/editor-plugin-test/component-gallery'
  },
  {
    title: '模型插件',
    path: '/app/editor-plugin-test/model-gallery'
  },
  {
    title: '动态配置器',
    path: '/app/editor-plugin-test/dynamic-form'
  },
];

const EditorPluginTest: React.FC = memo(props => {

  return (
    <div className={styles['plugin-test']}>
      <SimpleNavsPage title='设计器插件测试' routes={routers} />
    </div>
  );
});

EditorPluginTest.displayName = 'EditorPluginTest';

export default EditorPluginTest;