"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.regexp.exec.js");

require("core-js/modules/es.regexp.test.js");

const validators = {
  email: _email => /[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+/.test(_email) ? "" : "Email is not valid",
  phone: _phone => /^\d{10}$/.test(_phone) ? "" : "Phone number must be 10 digits long"
};
var _default = validators;
exports.default = _default;