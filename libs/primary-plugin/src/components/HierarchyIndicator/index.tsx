import { EditorContext } from '@lowcode-engine/editor';
import { observer } from 'mobx-react-lite';
import React, { memo, useContext } from 'react';
import styles from './index.module.less';
import * as _ from 'lodash';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

const HierarchyIndicator: React.FC = observer(props => {

  const { store } = useContext(EditorContext);
  const { interactionStore } = store;
  const { activeComponentId } = interactionStore;
  const hierarchyList = store.selectHierarchyList(activeComponentId);
  // console.log(`hierarchyList:`, _.cloneDeep(hierarchyList));

  return (
    <HierachyScrollbar hierachyList={hierarchyList} />
  );
});

HierarchyIndicator.displayName = 'HierarchyIndicator';

export default HierarchyIndicator;

interface IHierachyData {
  id: string;
  title: string;
}

interface IHierachyScrollbarProps {
  hierachyList: Array<IHierachyData>;
}

const HierachyScrollbar: React.FC<IHierachyScrollbarProps> = memo(({ hierachyList }) => {

  return (
    <div className={styles['scrollbar']}>
      <div className={styles['scrollbar__button']}>
        <LeftOutlined />
      </div>
      <div className={styles['scrollbar__track']}>

      </div>
      <div className={styles['scrollbar__button']}>
        <RightOutlined />
      </div>
    </div>
  );
});

HierarchyIndicator.displayName = 'HierarchyIndicator';
