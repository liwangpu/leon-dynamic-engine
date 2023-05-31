// import styles from './index.module.less';
// import { observer } from 'mobx-react-lite';
// import { useEffect, useState } from 'react';
// import React from 'react';
// import 'jsoneditor/dist/jsoneditor.css';
// import { IProjectManager } from '@lowcode-engine/editor';
// import * as _ from 'lodash';
// import { Button, message } from 'antd';
// import GalleryHeader from '../GalleryHeader';
// import JsonViewer from 'react-json-view';
// import { CopyOutlined } from '@ant-design/icons';

// export interface SchemaViewerProps {
//   project: IProjectManager;
// }

// const SchemaViewer: React.FC<SchemaViewerProps> = observer(props => {

//   const [val, setVal] = useState<any>();
//   const [messageApi, contextHolder] = message.useMessage();

//   useEffect(() => {
//     const disposer = props.project.monitorSchema(schema => {
//       setVal(schema);
//     });

//     return () => {
//       disposer();
//     };
//   }, []);

//   const copySchema = () => {
//     messageApi.info('复制成功!');
//     navigator.clipboard.writeText(JSON.stringify(val));
//   };

//   return (
//     <div className={styles['schema-viewer']}>
//       <GalleryHeader title='元数据' >
//         <div className={styles['toolbar']}>
//           <Button
//             type="text"
//             title='复制'
//             icon={<CopyOutlined />}
//             size='small'
//             onClick={copySchema}
//           />
//         </div>
//       </GalleryHeader>
//       {contextHolder}
//       <div className={styles['schema-viewer__content']}>
//         <JsonViewer
//           name='SCHEMA'
//           src={val}
//           indentWidth={2}
//           enableClipboard={false}
//           displayObjectSize={false}
//           displayDataTypes={false}
//         // theme='ocean' 
//         />
//       </div>
//     </div>
//   );
// });

// SchemaViewer.displayName = 'SchemaViewer';

// export default SchemaViewer;