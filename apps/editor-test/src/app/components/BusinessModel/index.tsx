import styles from './index.module.less';
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { observer } from 'mobx-react-lite';
import { ModelRepository } from '../../models';
import { IBusinessField } from '@lowcode-engine/primary-plugin';

const columns = [
  {
    title: '编码',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
];

const BusinessModel: React.FC = observer(() => {

  const { businessModel } = useParams();
  const [fields, setFields] = useState<Array<IBusinessField>>();

  useEffect(() => {
    (async () => {
      const model = await ModelRepository.getInstance().get(businessModel);
      setFields(model.fields);
    })();
  }, []);

  return (
    <div className={styles['business-model']}>
      {fields && <Table columns={columns} dataSource={fields} />}
    </div>
  );
});

BusinessModel.displayName = 'BusinessModel';

export default BusinessModel;