import { cloneElement } from 'react';
export function renderTree({
  nodes,
  itemRenderer,
  parentNode,
  level
}) {
  return nodes.map((node, index) => {
    return cloneElement(itemRenderer(node), {
      level: level == undefined ? 0 : level + 1,
      index,
      node,
      parentNode,
      key: node.id,
      itemRenderer
    });
  });
}