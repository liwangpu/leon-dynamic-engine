import { ComponentDiscoveryProvider, SchemaDataProcessor } from '@lowcode-engine/core';
import React, { memo, useCallback, useContext, useEffect, useMemo } from 'react';
import { ComponentPackageContext } from '../../contexts';
import * as _ from 'lodash';
import styles from './index.module.less';
import schema from './schema';
import { FormInputGroupTypes } from '../../consts';

const Page: React.FC = memo(() => {

  const packages = useContext(ComponentPackageContext);

  useEffect(() => {
    (async () => {
      // console.log(`schema:`, schema);
      const processor = new SchemaDataProcessor(packages);

      const formFields = [];
      // 生成头部表单field
      // processor.registerHandler({ parentType: 'block', type: FormInputGroupTypes }, ({ current, parent, self }) => {

      //   // console.log(`block inners:`, current.type);

      //   return current;
      // });

      // 生成表格
      processor.registerHandler({ parentType: 'table', slot: 'columns' }, ({ current, parent, path }) => {

        console.log(`table columns:`, current);
        return current;
      });

      // processor.registerHandler({ type: 'table', parentType: 'block' }, ({ current, self }) => {

      //   console.log(`table work`);
      //   return current;
      // });

      // processor.registerHandler({}, ({ current, paths }) => {

      //   console.log(`handler work:`, current.type, current.id, _.cloneDeep(paths));
      //   return current;
      // });


      // processor.registerHandler({ type: 'table-selection-column' }, ({ current }) => {

      //   console.log(`selectionColumn work`, current);
      //   // return { ...current, title: '多功能区块' };
      //   return null;
      // });

      const s = await processor.handle(schema);

      console.log(`process schema:`, s);
    })();
  }, []);

  return (
    <div className={styles['page']}>

    </div>
  );
});

Page.displayName = 'Page';

export default Page;