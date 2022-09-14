"use strict";

require("core-js/modules/es.object.assign.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Form = Form;
exports.Handler = void 0;
exports.Submit = Submit;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.promise.js");

var _react = _interopRequireWildcard(require("react"));

var _material = require("@mui/material");

var _paradoxHooks = require("paradox-hooks");

var _utilities = require("../utilities");

const _excluded = ["children", "onSubmit", "fields", "enctype"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const Handler = /*#__PURE__*/(0, _react.createContext)(null);
exports.Handler = Handler;

function useForm(fields) {
  const initialValues = (0, _react.useMemo)(() => {
    const inputs = {};

    for (const name in fields) {
      inputs[name] = fields[name].value || "";
    }

    return inputs;
  }, [fields]);
  const validators = (0, _react.useMemo)(() => {
    const validators = {};

    for (const name in fields) {
      if (fields[name].validator) {
        validators[name] = fields[name].validator;
      }
    }

    return validators;
  }, [fields]);
  const [values, setValues] = (0, _react.useState)(initialValues);
  const [errors, setErrors] = (0, _react.useState)({});
  const validate = (0, _react.useCallback)((name, value) => {
    const validator = validators[name];

    if (typeof validator === "function") {
      const helperText = validators[name](value);
      setErrors(prev => _objectSpread(_objectSpread({}, prev), {}, {
        [name]: helperText
      }));
      return !helperText;
    } else if (typeof validator === "string") {
      const helperText = validator;
      setErrors(prev => _objectSpread(_objectSpread({}, prev), {}, {
        [name]: value ? "" : helperText
      }));
      return value;
    }

    return true;
  }, [validators]);
  const onChangeHandler = (0, _react.useCallback)(e => {
    const {
      name,
      value
    } = e.target;
    validate(name, value);
    setValues(prev => _objectSpread(_objectSpread({}, prev), {}, {
      [name]: value
    }));
  }, [validate]);
  const reset = (0, _react.useCallback)(() => {
    setValues(initialValues);
  }, [initialValues]);
  const submitValidator = (0, _react.useCallback)(() => {
    for (const name in values) {
      if (!validate(name, values[name])) {
        return false;
      }
    }

    return true;
  }, [values, validate]);
  return (0, _react.useMemo)(() => {
    return {
      values,
      onChangeHandler,
      errors,
      submitValidator,
      reset
    };
  }, [values, onChangeHandler, errors, submitValidator, reset]);
}

function Form(_ref) {
  let {
    children,
    onSubmit,
    fields,
    enctype
  } = _ref,
      rest = _objectWithoutProperties(_ref, _excluded);

  const [loading, setLoading] = (0, _react.useState)(false);
  const {
    snackBar,
    showMessage
  } = (0, _paradoxHooks.useSnack)();
  const handlers = useForm(fields);

  const submitHandler = async e => {
    setLoading(true);
    e.preventDefault();

    if (handlers.submitValidator()) {
      try {
        const values = (0, _utilities.encodeData)(handlers.values, enctype);
        const message = await onSubmit(values);
        showMessage({
          success: message
        });
      } catch (e) {
        showMessage({
          error: e.message
        });
      }
    } else {
      console.log("Form is not validated");
    }

    setLoading(false);
  };

  return /*#__PURE__*/_react.default.createElement(Handler.Provider, {
    value: _objectSpread(_objectSpread({}, handlers), {}, {
      loading,
      showMessage
    })
  }, /*#__PURE__*/_react.default.createElement("form", _extends({
    onSubmit: submitHandler,
    autoComplete: "off",
    noValidate: true
  }, rest), children), snackBar);
}

function Submit(props) {
  const {
    loading
  } = (0, _react.useContext)(Handler);
  const {
    loader,
    loaderProps
  } = props;

  const defaultLoader = /*#__PURE__*/_react.default.createElement(_material.CircularProgress, _extends({
    size: "20px",
    style: {
      marginLeft: "8px"
    }
  }, loaderProps));

  return props.children(loading ? loader || defaultLoader : null);
}