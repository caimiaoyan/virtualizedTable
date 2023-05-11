import Immutable from 'immutable';
import React from 'react';

/**
 * @description 渲染器
 */
export function renderElement(renderer, props) {
  if (React.isValidElement(renderer)) {
    if (!props) return renderer;
    return React.cloneElement(renderer, props);
  } else if (typeof renderer === 'function') {
    if (renderer.prototype && renderer.prototype.isReactComponent) {
      return React.createElement(renderer, props);
    } else if (renderer.defaultProps) {
      return renderer(_objectSpread({}, renderer.defaultProps, {}, props));
    }
    return renderer(props);
  } else if (typeof renderer === 'string') {
    return renderer;
  } else {
    return null;
  }
}

/**
 * @description 计算容器高度
 * @param  {String || Number}  _height 比较对象1
 * @return {Number} 容器高度
 */
export function calcContainerHeight(_height) {
  
  if(typeof _height === 'number' || (typeof _height === 'string' && /^[0-9]*$/.test(_height))){
    _height = _height + 'px';
  }

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.width = '1px';
  container.style.height = _height;
  document.body.appendChild(container);
  const height = container.offsetHeight;
  document.body.removeChild(container);

  return height;
}

/**
 * @description 深比较判断对象是否相等
 * @param  {object} temp1 比较对象1
 * @param  {object} temp2 比较对象2
 * @return {Boolean}      true:相等；false:不等
 */
export function immutableCompare(temp1, temp2) {
  const _temp1 = Immutable.fromJS(temp1), _temp2 = Immutable.fromJS(temp2);
  return Immutable.is(_temp1, _temp2);
}

/**
 * @description 计算滚动条尺寸
 * @return {Number} 滚动条尺寸
 */
export function getScrollbarSize() {
  let scrollbarSize;
  const scrollDiv = document.createElement('div');
  scrollDiv.style.position = 'absolute';
  scrollDiv.style.top = '-9999px';
  scrollDiv.style.width = '50px';
  scrollDiv.style.height = '50px';
  scrollDiv.style.overflow = 'scroll';
  document.body.appendChild(scrollDiv);
  scrollbarSize = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);

  return scrollbarSize;
}

/**
 * @description 利用immutablejs 对象深拷贝
 * @param  {Object} obj 被拷贝对象
 * @return {Object} obj的深拷贝对象
 */
export function deepCopy(obj) {
  return Immutable.fromJS(obj).toJSON();
}

/**
 * @description 判断对象是否相同
 */
export function isObjectEqual(objA, objB, ignoreFunction) {

  if (ignoreFunction === void 0) {
    ignoreFunction = true;
  }

  if (objA === objB) return true;
  if (objA === null && objB === null) return true;
  if (objA === null || objB === null) return false;
  if (typeof objA !== 'object' || typeof objB !== 'object') return false;
  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;

  for (var i = 0; i < keysA.length; i++) {
    var key = keysA[i];

    if (key === '_owner' && objA.$$typeof) {
      // React-specific: avoid traversing React elements' _owner.
      //  _owner contains circular references
      // and is not needed when comparing the actual elements (and not their owners)
      continue;
    }

    var valueA = objA[key];
    var valueB = objB[key];
    var valueAType = typeof valueA;
    if (valueAType !== typeof valueB) return false;
    if (valueAType === 'function' && ignoreFunction) continue;

    if (valueAType === 'object') {
      if (!isObjectEqual(valueA, valueB, ignoreFunction)) return false; else continue;
    }

    if (valueA !== valueB) return false;
  }

  return true;
}

/**
 * @description 添加类名前缀
 */
export function prefixClass(className) {
  return 'BaseTable' + "__" + className;
};

/**
 * @description 给对象添加默认值，返回对应对象属性的value
 */
export function getObjectValue(obj, defaultObj, proprety){
  return obj.hasOwnProperty(proprety)? obj[proprety] : defaultObj[proprety];
}