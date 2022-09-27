"use strict";

require("core-js/modules/es.object.assign.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Form = Form;
exports.Handler = void 0;
exports.Submit = Submit;
exports.useForm = useForm;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.promise.js");

var _react = _interopRequireWildcard(require("react"));

var _material = require("@mui/material");

var _paradoxHooks = require("paradox-hooks");

var _utilities = require("../utilities");

var _axios = _interopRequireDefault(require("axios"));

const _excluded = ["children", "onSubmit", "onError", "handlers", "method", "action", "enctype", "final", "retainOnSubmit"];

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

const validatorsDispatch = function validatorsDispatch(validators, newValidator) {
  const updatedValidators = [...(validators[newValidator.name] || []), ...newValidator.validator];
  return _objectSpread(_objectSpread({}, validators), {}, {
    [newValidator.name]: updatedValidators
  });
};

const initializeValidators = fields => {
  console.log("initializeValidators");
  const validators = {};

  for (const name in fields) {
    const field = fields[name];
    validators[name] = [];
    const rules = field.validator;

    if (rules) {
      if (Array.isArray(rules)) {
        validators[name].push(...rules);
      } else {
        validators[name].push(rules);
      }
    }

    const maxLength = field.maxLength;

    if (maxLength) {
      validators[name].unshift(value => value.length <= maxLength ? "" : "Maximum ".concat(maxLength, " characters are allowed"));
    }

    const minLength = field.minLength;

    if (minLength) {
      validators[name].unshift(value => value.length >= minLength ? "" : "Must contain at least ".concat(minLength, " characters"));
    }

    const required = field.required;

    if (required) {
      validators[name].unshift(value => value ? "" : "This field is required");
    }
  }

  return validators;
};

function useForm(fields) {
  const initialValues = (0, _react.useMemo)(() => {
    const inputs = {};

    for (const name in fields) {
      inputs[name] = fields[name].value || "";
    }

    return inputs;
  }, [fields]);
  const [validators, addValidator] = (0, _react.useReducer)(validatorsDispatch, fields, initializeValidators);
  const finals = (0, _react.useMemo)(() => {
    const finals = {};

    for (const name in fields) {
      if (fields[name].final) {
        finals[name] = fields[name].final;
      }
    }

    return finals;
  }, [fields]);
  const [values, setValues] = (0, _react.useState)(initialValues);
  const [errors, setErrors] = (0, _react.useState)({}); // validate a single field

  const validate = (0, _react.useCallback)((name, value) => {
    const rules = validators[name]; // if the validator doesn't contain any rules

    if (rules.length === 0) return true;
    return rules.every(rule => {
      if (typeof rule === "function") {
        const helperText = rule(value);
        setErrors(validators => _objectSpread(_objectSpread({}, validators), {}, {
          [name]: helperText
        }));
        return !helperText;
      } else {
        throw new Error("Invalid rule: Must be a function");
      }
    });
  }, [validators]); // onchange handler to fields

  const onChangeHandler = (0, _react.useCallback)(e => {
    const {
      name,
      value
    } = e.target; // validate the field to show error message

    validate(name, value);
    setValues(validators => _objectSpread(_objectSpread({}, validators), {}, {
      [name]: value
    }));
  }, [validate]); // set all values and errors to empty

  const reset = (0, _react.useCallback)(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]); // to set values manually

  const setManually = (0, _react.useCallback)(values => {
    setValues(validators => {
      const newValues = typeof values === "function" ? values(validators) : values;
      return _objectSpread(_objectSpread({}, validators), newValues);
    });
    setErrors({});
  }, [setValues]); // Checks if all the fields are validated before submitting

  const submitValidator = (0, _react.useCallback)(() => {
    for (const name in values) {
      if (!validate(name, values[name])) {
        return false;
      }
    }

    return true;
  }, [values, validate]);
  return (0, _react.useMemo)(() => ({
    values,
    onChangeHandler,
    errors,
    submitValidator,
    reset,
    setValues: setManually,
    finals,
    addValidator
  }), [values, onChangeHandler, errors, submitValidator, reset, setManually, finals, addValidator]);
}

function Form(_ref) {
  let {
    children,
    onSubmit,
    onError,
    handlers,
    method,
    action,
    enctype,
    final,
    retainOnSubmit
  } = _ref,
      rest = _objectWithoutProperties(_ref, _excluded);

  const [loading, setLoading] = (0, _react.useState)(false);
  const {
    snackBar,
    showMessage
  } = (0, _paradoxHooks.useSnack)();

  const submitMiddleware = async e => {
    e.preventDefault();

    if (!handlers.submitValidator()) {
      // Validating before submitting
      return console.log("Form not validated");
    }

    setLoading(true); // Tuning values with the functions passed in final field given in the fields

    const tunedValues = tuneValues(handlers); // Finalyzing values with the functions passed in final prop

    const finalValues = finalize(tunedValues, final); // Applying encoding on the data before submitting

    const values = (0, _utilities.encodeData)(finalValues, enctype); // Getting axios method to use based on the method prop

    const requestMethod = createAxiosMethod(method);

    try {
      const response = await (0, _axios.default)({
        url: action,
        method: requestMethod,
        data: values
      });

      if (!retainOnSubmit) {
        handlers.reset();
      }

      const message = await onSubmit(response, handlers.values);
      showMessage({
        success: message
      });
    } catch (e) {
      setLoading(false);

      if (e.name === "AxiosError") {
        if (typeof onError === "function") {
          return onError(e);
        } else {
          throw e;
        }
      }

      showMessage({
        error: e.message
      });
    }

    setLoading(false);
  };

  return /*#__PURE__*/_react.default.createElement(Handler.Provider, {
    value: _objectSpread(_objectSpread({}, handlers), {}, {
      loading,
      showMessage
    })
  }, /*#__PURE__*/_react.default.createElement("form", _extends({
    onSubmit: submitMiddleware,
    autoComplete: "off",
    noValidate: true
  }, rest), children), snackBar);
}

function Submit(props) {
  const handlers = (0, _react.useContext)(Handler);

  if (!handlers) {
    throw new Error("You are using Submit without a Form Component (you may be importing Form Component from wrong path");
  }

  const {
    loading
  } = handlers;
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
} // ------------- Utilities ------------------- //


function createAxiosMethod() {
  let method = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "GET";
  method = method.toLowerCase();

  if (typeof _axios.default[method] === "function") {
    return method;
  } else {
    throw new Error("Invalid method ".concat(method, " not supported"));
  }
}

function tuneValues(handlers) {
  const values = _objectSpread({}, handlers.values);

  for (const field in handlers.finals) {
    values[field] = handlers.finals[field](handlers.values[field]);
  }

  return values;
}

function finalize(tunedValues, finalizer) {
  if (typeof finalizer === "function") {
    return finalizer(tunedValues);
  }

  return tunedValues;
}