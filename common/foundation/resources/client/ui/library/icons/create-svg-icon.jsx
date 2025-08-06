import React from 'react';
import { SvgIcon } from '@ui/icons/svg-icon';
export function createSvgIcon(path, displayName = '', viewBox) {
  const Component = (props, ref) => <SvgIcon data-testid={`${displayName}Icon`} ref={ref} viewBox={viewBox} {...props} size={props.size || 'md'}>
      {path}
    </SvgIcon>;
  if (process.env.NODE_ENV !== 'production') {
    // Need to set `displayName` on the inner component for React.memo.
    // React prior to 16.14 ignores `displayName` on the wrapper.
    Component.displayName = `${displayName}Icon`;
  }
  return React.memo(React.forwardRef(Component));
}
export function createSvgIconFromTree(data, displayName = '') {
  const path = treeToElement(data);
  return createSvgIcon(path, displayName);
}
function treeToElement(tree) {
  return tree?.map && tree.map((node, i) => {
    return React.createElement(node.tag, {
      key: i,
      ...node.attr
    }, treeToElement(node.child));
  });
}
export function elementToTree(el) {
  const attributes = {};
  const tree = {
    tag: el.tagName,
    attr: attributes
  };
  Array.from(el.attributes).forEach(attribute => {
    attributes[attribute.name] = attribute.value;
  });
  if (el.children.length) {
    tree.child = Array.from(el.children).map(child => elementToTree(child));
  }
  return tree;
}