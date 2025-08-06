import { Children, isValidElement } from 'react';
import memoize from 'nano-memoize';
import { Section } from './section';
export const buildListboxCollection = memoize(({
  maxItems,
  children,
  items,
  inputValue
}) => {
  let collection = childrenToCollection({
    children,
    items
  });
  let filteredCollection = filterCollection({
    collection,
    inputValue
  });
  if (maxItems) {
    collection = new Map([...collection.entries()].slice(0, maxItems));
    filteredCollection = new Map([...filteredCollection.entries()].slice(0, maxItems));
  }
  return {
    collection,
    filteredCollection
  };
});
const filterCollection = memoize(({
  collection,
  inputValue
}) => {
  let filteredCollection = new Map();
  const query = inputValue ? `${inputValue}`.toLowerCase().trim() : '';
  if (!query) {
    filteredCollection = collection;
  } else {
    let filterIndex = 0;
    collection.forEach((meta, value) => {
      const haystack = meta.item ? JSON.stringify(meta.item) : meta.textLabel;
      if (haystack.toLowerCase().trim().includes(query)) {
        filteredCollection.set(value, {
          ...meta,
          index: filterIndex++
        });
      }
    });
  }
  return filteredCollection;
});
const childrenToCollection = memoize(({
  children,
  items
}) => {
  let reactChildren;
  if (items && typeof children === 'function') {
    reactChildren = items.map(item => children(item));
  } else {
    reactChildren = children;
  }
  const collection = new Map();
  let optionIndex = 0;
  const setOption = (element, section, sectionIndex, sectionItemIndex) => {
    const index = optionIndex++;
    const item = section ?
    // get item from nested array
    items?.[sectionIndex].items[sectionItemIndex] :
    // get item from flat array
    items?.[index];
    collection.set(element.props.value, {
      index,
      element,
      textLabel: getTextLabel(element),
      item,
      section,
      isDisabled: element.props.isDisabled,
      value: element.props.value
    });
  };
  Children.forEach(reactChildren, (child, childIndex) => {
    if (!isValidElement(child)) return;
    if (child.type === Section) {
      Children.forEach(child.props.children, (nestedChild, nestedChildIndex) => {
        setOption(nestedChild, child, childIndex, nestedChildIndex);
      });
    } else {
      setOption(child);
    }
  });
  return collection;
});
function getTextLabel(item) {
  const content = item.props.children;
  if (item.props.textLabel) {
    return item.props.textLabel;
  }
  if (content?.props?.message) {
    return content.props.message;
  }
  return `${content}` || '';
}