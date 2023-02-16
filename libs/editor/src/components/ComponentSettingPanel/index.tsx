import { useContext } from 'react';
import styles from './index.module.less';
import DynamicComponentSetingPanel from '../DynamicComponentSetingPanel';
import * as _ from 'lodash';
import { observer } from 'mobx-react-lite';
import { EditorContext } from '../../contexts';

const EditingPanels = (componentIds: Array<string>) => {
  return componentIds.map(id => (<DynamicComponentSetingPanel key={id} componentId={id} />));
}

const ComponentSettingPanel = observer(() => {
  const { store } = useContext(EditorContext);
  const editingComponentIds = store.interactionStore.editingComponentIds;

  return (
    <div className={styles['component-setting-panel']}>
      <div className={styles['component-setting-panel__config']}>
        {EditingPanels(editingComponentIds)}
      </div>
    </div>
  );
});

ComponentSettingPanel.displayName = 'ComponentSettingPanel';

export default ComponentSettingPanel;
