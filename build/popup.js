'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Popup = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _utils = require('./utils');

var _bind = require('lodash/bind');

var _bind2 = _interopRequireDefault(_bind);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @private
 */

var Popup = exports.Popup = function (_EventEmitter) {
  _inherits(Popup, _EventEmitter);

  function Popup() {
    _classCallCheck(this, Popup);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Popup).apply(this, arguments));
  }

  _createClass(Popup, [{
    key: 'open',
    value: function open() {
      var _this2 = this;

      var url = arguments.length <= 0 || arguments[0] === undefined ? '/' : arguments[0];

      this.eventListeners = {
        loadHandler: (0, _bind2.default)(this.loadHandler, this),
        clickHandler: (0, _bind2.default)(this.clickHandler, this),
        closeHandler: (0, _bind2.default)(this.closeHandler, this)
      };

      var promise = new Promise(function (resolve) {
        _this2.tiWebView = Titanium.UI.createWebView({
          width: '100%',
          height: '100%',
          url: url
        });

        _this2.popup = Titanium.UI.createWindow({
          backgroundColor: 'white',
          barColor: '#000',
          title: 'Mobile Identity Connect',
          modal: true
        });
        _this2.popup.add(_this2.tiWebView);

        if ((0, _utils.isiOS)()) {
          _this2.tiWin = Titanium.UI.createWindow({
            backgroundColor: 'white',
            barColor: '#e3e3e3',
            title: 'Mobile Identity Connect'
          });
          _this2.tiWin.add(_this2.tiWebView);

          _this2.tiCloseButton = Titanium.UI.createButton({
            title: 'Close',
            style: Titanium.UI.iPhone.SystemButtonStyle.DONE
          });
          _this2.tiWin.setLeftNavButton(_this2.tiCloseButton);
          _this2.tiCloseButton.addEventListener('click', _this2.eventListeners.clickHandler);

          _this2.popup = Titanium.UI.iOS.createNavigationWindow({
            backgroundColor: 'white',
            window: _this2.tiWin,
            modal: true
          });
        } else if ((0, _utils.isAndroid)()) {
          _this2.popup.addEventListener('androidback', _this2.eventListeners.closeHandler);
        }

        _this2.tiWebView.addEventListener('load', _this2.eventListeners.loadHandler);
        _this2.tiWebView.addEventListener('error', _this2.eventListeners.loadHandler);
        _this2.popup.addEventListener('close', _this2.eventListeners.closeHandler);
        _this2.popup.open();
        resolve(_this2);
      });
      return promise;
    }
  }, {
    key: 'close',
    value: function close() {
      var _this3 = this;

      var promise = new Promise(function (resolve) {
        _this3.popup.close();
        resolve();
      });
      return promise;
    }
  }, {
    key: 'loadHandler',
    value: function loadHandler(event) {
      this.emit('loaded', event.url);
    }
  }, {
    key: 'clickHandler',
    value: function clickHandler() {
      this.close();
    }
  }, {
    key: 'closeHandler',
    value: function closeHandler() {
      this.tiWebView.removeEventListener('load', this.eventListeners.loadHandler);
      this.tiWebView.removeEventListener('error', this.eventListeners.loadHandler);
      this.popup.removeEventListener('close', this.eventListeners.closeHandler);

      if ((0, _utils.isiOS)()) {
        this.tiCloseButton.removeEventListener('click', this.eventListeners.clickHandler);
      } else if ((0, _utils.isAndroid)()) {
        this.popup.close();
        this.popup.removeEventListener('androidback', this.eventListeners.closeHandler);
      }

      this.emit('closed');
    }
  }]);

  return Popup;
}(_events.EventEmitter);