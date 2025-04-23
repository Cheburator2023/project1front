/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-rest-params */
/* eslint-disable block-scoped-var */
/* eslint-disable no-void */
/* eslint-disable no-func-assign */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */

function _typeof(obj) {
  '@babel/helpers - typeof';

  if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj &&
        typeof Symbol === 'function' &&
        obj.constructor === Symbol &&
        obj !== Symbol.prototype
        ? 'symbol'
        : typeof obj;
    };
  }
  return _typeof(obj);
}

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

const t = _interopRequireWildcard(require('@babel/types'));

function _getRequireWildcardCache() {
  if (typeof WeakMap !== 'function') return null;
  const cache = new WeakMap();
  _getRequireWildcardCache = function _getRequireWildcardCache() {
    return cache;
  };
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (_typeof(obj) !== 'object' && typeof obj !== 'function')) {
    return { default: obj };
  }
  const cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  const newObj = {};
  const hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _nonIterableSpread() {
  throw new TypeError('Invalid attempt to spread non-iterable instance');
}

function _iterableToArray(iter) {
  if (
    Symbol.iterator in Object(iter) ||
    Object.prototype.toString.call(iter) === '[object Arguments]'
  )
    return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
}

function _default(api, _ref) {
  const _ref$attrName = _ref.attrName;
  const attrName = _ref$attrName === void 0 ? 'data-test-id' : _ref$attrName;
  const _ref$mode = _ref.mode;
  const mode = _ref$mode === void 0 ? 'regular' : _ref$mode;
  const _ref$ignoreElements = _ref.ignoreElements;
  const ignoreElements =
    _ref$ignoreElements === void 0
      ? [
          'div',
          'input',
          'a',
          'button',
          'span',
          'p',
          'br',
          'hr',
          'ul',
          'ol',
          'li',
          'img',
          'form',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'svg',
          'path',
          'g',
        ]
      : _ref$ignoreElements;
  const _ref$additionalIgnore = _ref.additionalIgnoreElements;
  const additionalIgnoreElements = _ref$additionalIgnore === void 0 ? [] : _ref$additionalIgnore;
  const _ref$delimiter = _ref.delimiter;
  const delimiter = _ref$delimiter === void 0 ? '-' : _ref$delimiter;
  let isRootElement = true;
  return {
    visitor: {
      Program: function Program(path) {
        path.traverse({
          ClassDeclaration: function ClassDeclaration(path) {
            isRootElement = true;
            const componentName = path.node.id.name;
            passDownComponentName(path, componentName, mode, delimiter);
          },
          VariableDeclarator: function VariableDeclarator(path) {
            isRootElement = true;
            const componentName = path.node.id.name;
            passDownComponentName(path, componentName, mode, delimiter);
          },
          JSXElement: function JSXElement(path) {
            const componentName = path.node.openingElement.name.name || '';
            const isRoot = isRootElement || path.parent.type === 'ReturnStatement';
            const isIgnoredElement = []
              .concat(
                _toConsumableArray(ignoreElements),
                _toConsumableArray(additionalIgnoreElements),
              )
              .includes(componentName);

            if (
              componentName === '' ||
              componentName.includes('Fragment') ||
              (!isRoot && isIgnoredElement)
            ) {
              return;
            } // if has a key get its value

            const keyValue = getKey(path);
            const concatComponentName = concatComponentsName(
              path.node.componentName,
              isIgnoredElement ? '' : componentName,
              delimiter,
              keyValue,
            );
            isRootElement = false;
            const testId = keyValue
              ? t.jsxExpressionContainer(t.identifier(concatComponentName))
              : t.stringLiteral(concatComponentName);
            path.node.openingElement.attributes.push(
              t.jSXAttribute(t.jSXIdentifier(attrName), testId),
            );
            mode === 'full' && passDownComponentName(path, componentName, mode, delimiter);
          },
        });
      },
    },
  };
}

var concatComponentsName = function concatComponentsName() {
  const parent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  const current = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  const delimiter = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '-';
  const keyValue = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
  const componentsName =
    parent && current ? ''.concat(parent).concat(delimiter).concat(current) : parent || current;
  return keyValue
    ? '`'.concat(componentsName).concat(delimiter, '${').concat(keyValue, '}`')
    : componentsName;
};

var passDownComponentName = function passDownComponentName(path, componentName, mode, delimiter) {
  let isRootElement = true;
  path.traverse({
    JSXElement: function JSXElement(path) {
      if (mode === 'minimal') {
        path.node.componentName =
          isRootElement || path.parent.type === 'ReturnStatement'
            ? concatComponentsName(path.node.componentName, componentName, delimiter)
            : null;
      } else {
        path.node.componentName = concatComponentsName(
          path.node.componentName,
          componentName,
          delimiter,
        );
      }

      isRootElement = false;
    },
  });
};

var getKey = function getKey(path) {
  const keyAttribute = path.node.openingElement.attributes.find((_ref2) => {
    const name = _ref2.name;
    return name && name.name === 'key';
  });
  const keyValue =
    keyAttribute && keyAttribute.value && keyAttribute.value.expression
      ? keyAttribute.value.expression.name
      : '';
  return keyValue;
};
