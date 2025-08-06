import React, { useState } from 'react';
import { useControlledState } from '@react-stately/utils';
import { FocusScope } from '@react-aria/focus';
import { TreeContext } from './tree-context';
import { renderTree } from './render-tree';
export function Tree({
  children,
  nodes,
  ...props
}) {
  const [expandedKeys, setExpandedKeys] = useControlledState(props.expandedKeys, props.defaultSelectedKeys, props.onExpandedKeysChange);
  const [selectedKeys, setSelectedKeys] = useControlledState(props.selectedKeys, props.defaultSelectedKeys, props.onSelectedKeysChange);
  const [focusedNode, setFocusedNode] = useState();
  const value = {
    expandedKeys,
    setExpandedKeys,
    selectedKeys,
    setSelectedKeys,
    focusedNode,
    setFocusedNode
  };
  return <TreeContext.Provider value={value}>
      <FocusScope>
        <TreeRoot nodes={nodes} itemRenderer={children} />
      </FocusScope>
    </TreeContext.Provider>;
}
function TreeRoot(props) {
  return <ul className="overflow-hidden text-sm" role="tree">
      {renderTree(props)}
    </ul>;
}