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
      const processor = new SchemaDataProcessor<{ task: number }>(packages);

      const formFields = [];

      processor.registerHandler({ parentType: 'table', slot: 'columns', first: true }, ({ current, variables, first, last, even, odd, index, count }) => {

        console.log(`---------------  table work  ---------------`);
        console.log(`first:`, first);
        console.log(`last:`, last);
        console.log(`even:`, even);
        console.log(`odd:`, odd);
        console.log(`index:`, index);
        console.log(`count:`, count);


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