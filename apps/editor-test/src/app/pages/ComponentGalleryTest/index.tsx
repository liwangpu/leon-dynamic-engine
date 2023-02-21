import styles from './index.module.less';
import React, { memo, useCallback } from 'react';
import { ComponentGallery, ComponentGroup } from '@lowcode-engine/primary-plugin';
import EditorPluginDojo from '../../components/EditorPluginDojo';

const groups: Array<ComponentGroup> = [
  {
    title: '容器',
    components: [
      {
        title: '区块',
        type: 'block'
      }
    ]
  },
  {
    title: '表单项',
    components: [
      {
        title: '文本',
        type: 'text'
      },
      {
        title: '数值',
        type: 'number'
      }
    ]
  },
  {
    title: '按钮',
    components: [
      {
        title: '按钮',
        type: 'button'
      }
    ]
  }
];

const ComponentGalleryTest: React.FC = memo(props => {

  const notification = useCallback((topic: string, data?: any) => {
    console.log(`notification:`, topic, data);
  }, []);

  return (
    <div className={styles['gallery-test']}>
      <EditorPluginDojo >
        <div className='dojo_pane'>
          <ComponentGallery groups={groups} notification={notification} />
        </div>
        <div className='dojo_pane'>

        </div>
      </EditorPluginDojo>
    </div>
  );
});

ComponentGalleryTest.displayName = 'ComponentGalleryTest';

export default ComponentGalleryTest;