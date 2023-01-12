import styles from './index.module.less';
import { useParams } from "react-router-dom";
import React, { memo, useEffect, useState } from 'react';
import { Table } from 'antd';
import { observer } from 'mobx-react-lite';
import { IModelField, ModelRepository } from '../../models';

const columns = [
  {
    title: '标签',
    dataIndex: 'key',
    key: 'key',
  },
  {
    title: '名称',
    dataIndex: 'title',
    key: 'title',
  },
];

const BusinessModel: React.FC = memo(observer(() => {

  const { businessModel } = useParams();
  const [fields, setFields] = useState<Array<IModelField>>();

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
}));

BusinessModel.displayName = 'BusinessModel';

export default BusinessModel;