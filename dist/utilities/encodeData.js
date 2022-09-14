"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _convertToMultipart = _interopRequireDefault(require("./convertToMultipart"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function encodeData(values, enctype) {
  switch (enctype) {
    case "multipart/form-data":
      return (0, _convertToMultipart.default)(values);

    default:
      return values;
  }
}

var _default = encodeData;
exports.default = _default;