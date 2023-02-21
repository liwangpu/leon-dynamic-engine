import styles from './index.module.less';
import React, { memo, useCallback } from 'react';
import { ModelGallery, IBusinessModel } from '@lowcode-engine/primary-plugin';
import EditorPluginDojo from '../../components/EditorPluginDojo';

const AllModels: Array<IBusinessModel> = [
  {
    id: 'student',
    name: '学生',
    code: 'student',
    fields: [
      {
        id: 'student_name',
        name: '姓名',
        code: 'name',
        fieldType: 'string',
      },
      {
        id: 'student_age',
        name: '年纪',
        code: 'age',
        fieldType: 'number',
      },
      {
        id: 'student_hobby',
        name: '爱好',
        code: 'hobby',
        fieldType: 'string',
      }
    ],
    relations: [
      {
        id: 'school',
        name: '学校',
        code: 'school'
      },
      {
        id: 'class',
        name: '班级',
        code: 'class'
      }
    ]
  },
  {
    id: 'school',
    name: '学校',
    code: 'school',
    fields: [
      {
        id: 'school_name',
        name: '名称',
        code: 'name',
        fieldType: 'string',
      },
      {
        id: 'school_grade',
        name: '等级',
        code: 'grade',
        fieldType: 'number',
      }
    ]
  },
  {
    id: 'class',
    name: '班级',
    code: 'class',
    fields: [
      {
        id: 'class_name',
        name: '名称',
        code: 'name',
        fieldType: 'string',
      },
      {
        id: 'class_grade',
        name: '等级',
        code: 'grade',
        fieldType: 'number',
      }
    ]
  }
];

const ModelGalleryTest: React.FC = memo(props => {

  const modelLoader = useCallback(async (id: string) => {
    return AllModels.find(m => m.id === id);
  }, []);

  const configurationTransfer = useCallback(async (data) => {
    return { type: 'text', title: data.name };
  }, []);

  const notification = useCallback((topic: string, data?: any) => {
    console.log(`notification:`, topic, data);
  }, []);

  return (
    <div className={styles['gallery-test']}>
      <EditorPluginDojo >
        <div className='dojo_pane'>
          <ModelGallery modelLoader={modelLoader} mainModelId='student' configurationTransfer={configurationTransfer} notification={notification} />
        </div>
        <div className='dojo_pane'>

        </div>
      </EditorPluginDojo>
    </div>
  );
});

ModelGalleryTest.displayName = 'ModelGalleryTest';

export default ModelGalleryTest;