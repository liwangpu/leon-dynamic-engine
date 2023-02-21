import React, { memo, useState } from 'react';
import { Tree } from 'antd';

interface DataNode {
  title: string;
  key: string;
  isLeaf?: boolean;
  children?: DataNode[];
}

const initTreeData: DataNode[] = [
  { title: 'Expand to load', key: '0' },
  { title: 'Expand to load', key: '1' },
  { title: 'Tree Node', key: '2', isLeaf: true },
  {
    title: 'DDD', key: '3',
    children: [
      { title: '小明', key: 'a1' }
    ]
  },
];

// It's just a simple demo. You can use tree map to optimize update perf.
const updateTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] => {
  console.log(`list:`, list);
  console.log(`key:`, key);
  console.log(`children:`, children);
  return list.map((node) => {
    if (node.key === key) {
      console.log(`eq:`,);
      return {
        ...node,
        children,
      };
    }
    // console.log(`node:`,node);
    // console.log(`node children:`,node.children);
    if (node.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      };
    }

    // if (node.children) {
    //   return {
    //     ...node,
    //     children: [...children],
    //   };
    // }
    return node;
  });
};


const AntdTreeTest: React.FC = memo(props => {

  const [treeData, setTreeData] = useState(initTreeData);

  const onLoadData = ({ key, children }: any) => {
    console.log(`------------------------------`,);
    console.log(key, children);
    console.log(`------------------------------`,);
    return new Promise<void>((resolve) => {
      if (children) {
        resolve();
        return;
      }
      // setTimeout(() => {
      setTreeData((origin) =>
        updateTreeData(origin, key, [
          { title: 'Child Node', key: `${key}-0` },
          { title: 'Child Node', key: `${key}-1` },
        ]),
      );

      resolve();
      // }, 300);
    });
  }

  return (
    <div>
      <Tree
        showLine={false}
        loadData={onLoadData}
        treeData={treeData}
      />
    </div>
  );
});

AntdTreeTest.displayName = 'AntdTreeTest';

export default AntdTreeTest;