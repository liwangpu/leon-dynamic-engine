import { ComponentDiscoveryProvider, SchemaDataProcessor } from '@lowcode-engine/core';
import React, { memo, useCallback, useContext, useEffect, useMemo } from 'react';
import { ComponentPackageContext } from '../../contexts';
import * as _ from 'lodash';
import styles from './index.module.less';
import schema from './schema';

const Page: React.FC = memo(() => {

  const packages = useContext(ComponentPackageContext);

  useEffect(() => {
    (async () => {
      // console.log(`schema:`, schema);
      const processor = new SchemaDataProcessor(packages);

      // processor.registerHandler({ type: 'block', parentType: 'block' }, ({ current, self }) => {

      //   console.log(`block work`);
      //   return current;
      // });

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