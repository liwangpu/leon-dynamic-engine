import styles from './index.module.less';
import { observer } from 'mobx-react-lite';
import { memo, useCallback, useEffect, useRef } from 'react';
import React from 'react';
import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import { EventTopicEnum, IEventManager, IProjectManager } from '@tiangong/editor';
import * as _ from 'lodash';
import { delay, distinctUntilChanged, filter, map } from 'rxjs';

export interface SchemaViewerProps {
  project: IProjectManager;
  event: IEventManager;
}

const SchemaViewer: React.FC<SchemaViewerProps> = memo(observer(props => {

  const container = useRef<HTMLDivElement>();
  const jsoneditor = useRef<any>();
  const latestJson = useRef<any>();

  const onSchemaChange = useCallback(_.debounce(schema => {
    props.project.import(schema);
  }, 250), []);

  useEffect(() => {
    if (jsoneditor.current) { return; }
    const options = {
      mode: 'code',
      mainMenuBar: false,
      navigationBar: true,
      statusBar: true,
      onChangeText: str => {
        try {
          latestJson.current = JSON.parse(str);
          onSchemaChange(latestJson.current);
        } catch (error) {
          //
        }
      }
    };
    jsoneditor.current = new JSONEditor(container.current, options);
    return () => {
      jsoneditor.current.destroy();
      jsoneditor.current = null;
    };
  }, []);

  useEffect(() => {
    if (!jsoneditor.current) { return; }
    const subscription = props.event.message
      .pipe(filter(evt => evt.topic === EventTopicEnum.pluginPanelActiving))
      .pipe(map(evt => evt.data))
      .pipe(distinctUntilChanged())
      .pipe(filter(name => name === 'SCHEMA'))
      .subscribe(() => {
        jsoneditor.current.resize();
      });

    const disposer = props.project.monitorSchema(schema => {
      if (_.isEqual(schema, latestJson.current)) { return; }
      jsoneditor.current.update(schema);
      latestJson.current = schema;
    });

    return () => {
      latestJson.current = null;
      disposer();
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className={styles['schema-viewer']} ref={container} />
  );
}));

SchemaViewer.displayName = 'SchemaViewer';

export default SchemaViewer;