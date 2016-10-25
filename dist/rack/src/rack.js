'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NetworkRack = exports.CacheRack = undefined;

var _rack = require('kinvey-node-sdk/dist/rack');

var _rack2 = _interopRequireDefault(_rack);

var _serialize = require('kinvey-node-sdk/dist/rack/src/serialize');

var _serialize2 = _interopRequireDefault(_serialize);

var _parse = require('kinvey-node-sdk/dist/rack/src/parse');

var _parse2 = _interopRequireDefault(_parse);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _http = require('./http');

var _http2 = _interopRequireDefault(_http);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CacheRack = exports.CacheRack = function (_Rack) {
  _inherits(CacheRack, _Rack);

  function CacheRack() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Cache Rack';

    _classCallCheck(this, CacheRack);

    var _this = _possibleConstructorReturn(this, (CacheRack.__proto__ || Object.getPrototypeOf(CacheRack)).call(this, name));

    _this.use(new _cache2.default());
    return _this;
  }

  return CacheRack;
}(_rack2.default);

var NetworkRack = exports.NetworkRack = function (_Rack2) {
  _inherits(NetworkRack, _Rack2);

  function NetworkRack() {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'Network Rack';

    _classCallCheck(this, NetworkRack);

    var _this2 = _possibleConstructorReturn(this, (NetworkRack.__proto__ || Object.getPrototypeOf(NetworkRack)).call(this, name));

    _this2.use(new _serialize2.default());
    _this2.use(new _http2.default());
    _this2.use(new _parse2.default());
    return _this2;
  }

  return NetworkRack;
}(_rack2.default);