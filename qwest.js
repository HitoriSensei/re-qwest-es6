// Generated by uRequire v0.6.20 - template: 'UMD' 
(function (window, global) {
  
var __isAMD = !!(typeof define === 'function' && define.amd),
    __isNode = (typeof exports === 'object'),
    __isWeb = !__isNode;
(function (factory) {
  if (typeof exports === 'object') {
    var nr = new (require('urequire').NodeRequirer) ('qwest', module, __dirname, '.');
    module.exports = factory(nr.require, exports, module, nr.require('jquery-param'));
} else if (typeof define === 'function' && define.amd) { define(['require', 'exports', 'module', 'jquery-param'], factory) } else throw new Error('uRequire: Loading UMD module as <script>, without `build.noLoaderUMD`');
}).call(this, function (require, exports, module, PARAM) {
  

var win = window, doc = document, defaultXdrResponseType = "json", _limit = null, requests = 0, request_stack = [], getXHR = function getXHR() {
      return win.XMLHttpRequest ? new win.XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    }, xhr2 = getXHR().responseType === "";
  var qwest = function qwest(method, url, data, options, before) {
    method = method.toUpperCase();
    data = data || null;
    options = options || {};
    var nativeResponseParsing = false, crossOrigin, xdr = false, timeoutInterval, aborted = false, attempts = 0, headers = {}, mimeTypes = {
        text: "*/*",
        xml: "text/xml",
        json: "application/json",
        post: "application/x-www-form-urlencoded"
      }, accept = {
        text: "*/*",
        xml: "application/xml; q=1.0, text/xml; q=0.8, */*; q=0.1",
        json: "application/json; q=1.0, text/*; q=0.8, */*; q=0.1"
      }, vars = "", i, j, serialized, response, sending = false, delayed = false, timeout_start;
    var xhr = getXHR();
    var PINKYSWEAR = function PINKYSWEAR(gen) {
        var o = function o(result, data) {
          if (!o.p) {
            o.p = new Promise(function (resolve, reject) {
              if (result) {
                resolve(data[1]);
              } else {
                reject(data[2]);
              }
            });
            o._thens.each(function (args) {
              var _o$p;
              (_o$p = o.p).then.apply(_o$p, _toConsumableArray(args));
            });
            o._thens = null;
          }
        };
        o._thens = [];
        o.then = function (s, f) {
          if (o.p) {
            o.p.then(s, f);
          } else {
            o._thens.push(arguments);
          }
          return o;
        };
        return gen(o);
      }, promise = PINKYSWEAR(function (pinky) {
        pinky["catch"] = function (f) {
          return pinky.then(null, f);
        };
        pinky.complete = function (f) {
          return pinky.then(f, f);
        };
        pinky.send = function () {
          if (sending) {
            return;
          }
          sending = true;
          if (_limit && ++requests == _limit) {
            request_stack.push(pinky);
            return;
          }
          timeout_start = Date.now();
          if (crossOrigin) {
            if (!(xhr.withCredentials !== undefined) && win.XDomainRequest) {
              xhr = new XDomainRequest();
              xdr = true;
              if (method != "GET" && method != "POST") {
                method = "POST";
              }
            }
          }
          if (xdr) {
            xhr.open(method, url);
          } else {
            xhr.open(method, url, options.async, options.user, options.password);
            if (xhr2 && options.async) {
              xhr.withCredentials = options.withCredentials;
            }
          }
          if (!xdr) {
            for (var _i in headers) {
              if (headers[_i]) {
                xhr.setRequestHeader(_i, headers[_i]);
              }
            }
          }
          if (xhr2 && options.responseType != "document" && options.responseType != "auto") {
            try {
              xhr.responseType = options.responseType;
              nativeResponseParsing = xhr.responseType == options.responseType;
            } catch (e) {
            }
          }
          if (xhr2 || xdr) {
            xhr.onload = handleResponse;
            xhr.onerror = handleError;
          } else {
            xhr.onreadystatechange = function () {
              if (xhr.readyState == 4) {
                handleResponse();
              }
            };
          }
          if (options.responseType != "auto" && xhr.overrideMimeType !== undefined) {
            xhr.overrideMimeType(mimeTypes[options.responseType]);
          }
          if (before) {
            before(xhr);
          }
          if (xdr) {
            setTimeout(function () {
              xhr.send(method != "GET" ? data : null);
            }, 0);
          } else {
            xhr.send(method != "GET" ? data : null);
          }
        };
        return pinky;
      }), handleResponse = function handleResponse() {
        var i, responseType;
        --requests;
        sending = false;
        if (Date.now() - timeout_start >= options.timeout) {
          if (!options.attempts || ++attempts != options.attempts) {
            promise.send();
          } else {
            promise(false, [
              xhr,
              response,
              new Error("Timeout (" + url + ")")
            ]);
          }
          return;
        }
        if (request_stack.length) {
          request_stack.shift().send();
        }
        try {
          if (nativeResponseParsing && xhr.response !== undefined && xhr.response !== null) {
            response = xhr.response;
          } else if (options.responseType == "document") {
            var frame = doc.createElement("iframe");
            frame.style.display = "none";
            doc.body.appendChild(frame);
            frame.contentDocument.open();
            frame.contentDocument.write(xhr.response);
            frame.contentDocument.close();
            response = frame.contentDocument;
            doc.body.removeChild(frame);
          } else {
            responseType = options.responseType;
            if (responseType == "auto") {
              if (xdr) {
                responseType = defaultXdrResponseType;
              } else {
                var ct = xhr.getResponseHeader("Content-Type") || "";
                if (ct.indexOf(mimeTypes.json) > -1) {
                  responseType = "json";
                } else if (ct.indexOf(mimeTypes.xml) > -1) {
                  responseType = "xml";
                } else {
                  responseType = "text";
                }
              }
            }
            switch (responseType) {
            case "json":
              try {
                if (win.JSON !== undefined) {
                  response = JSON.parse(xhr.responseText);
                } else {
                  response = eval("(" + xhr.responseText + ")");
                }
              } catch (e) {
                throw "Error while parsing JSON body : " + e;
              }
              break;
            case "xml":
              try {
                if (win.DOMParser) {
                  response = new DOMParser().parseFromString(xhr.responseText, "text/xml");
                } else {
                  response = new ActiveXObject("Microsoft.XMLDOM");
                  response.async = "false";
                  response.loadXML(xhr.responseText);
                }
              } catch (e) {
                response = undefined;
              }
              if (!response || !response.documentElement || response.getElementsByTagName("parsererror").length) {
                throw "Invalid XML";
              }
              break;
            default:
              response = xhr.responseText;
            }
          }
          if (xhr.status && !/^2|1223/.test(xhr.status)) {
            throw xhr.status + " (" + xhr.statusText + ")";
          }
          promise(true, [
            xhr,
            response
          ]);
        } catch (e) {
          promise(false, [
            xhr,
            response,
            e
          ]);
        }
      }, handleError = function handleError(e) {
        --requests;
        promise(false, [
          xhr,
          null,
          new Error("Connection aborted")
        ]);
      };
    options.async = options.async !== undefined ? options.async : true;
    options.cache = options.cache || false;
    options.dataType = options.dataType !== undefined ? options.dataType.toLowerCase() : "post";
    options.responseType = options.responseType !== undefined ? options.responseType.toLowerCase() : "auto";
    options.user = options.user || "";
    options.password = options.password || "";
    options.withCredentials = !!options.withCredentials;
    options.timeout = options.timeout !== undefined ? parseInt(options.timeout, 10) : 30000;
    options.attempts = options.attempts !== undefined ? parseInt(options.attempts, 10) : 1;
    i = url.match(/\/\/(.+?)\//);
    crossOrigin = i && (i[1] ? i[1] != location.host : false);
    if (win.ArrayBuffer !== undefined && data instanceof ArrayBuffer) {
      options.dataType = "arraybuffer";
    } else if (win.Blob !== undefined && data instanceof Blob) {
      options.dataType = "blob";
    } else if (win.Document !== undefined && data instanceof Document) {
      options.dataType = "document";
    } else if (win.FormData !== undefined && data instanceof FormData) {
      options.dataType = "formdata";
    }
    switch (options.dataType) {
    case "json":
      data = JSON.stringify(data);
      break;
    case "post":
      data = PARAM(data);
    }
    if (options.headers) {
      var format = function format(match, p1, p2) {
        return p1 + p2.toUpperCase();
      };
      for (var _i2 in options.headers) {
        headers[_i2.replace(/(^|-)([^-])/g, format)] = options.headers[_i2];
      }
    }
    if (!(headers["Content-Type"] !== undefined) && method != "GET") {
      if (mimeTypes[options.dataType]) {
        if (mimeTypes[options.dataType]) {
          headers["Content-Type"] = mimeTypes[options.dataType];
        }
      }
    }
    if (!headers.Accept) {
      headers.Accept = accept[options.responseType] ? accept[options.responseType] : "*/*";
    }
    if (!crossOrigin && !(headers["X-Requested-With"] !== undefined)) {
      headers["X-Requested-With"] = "XMLHttpRequest";
    }
    if (options.cache) {
      headers["Cache-Control"] = options.cache != true ? "max-age=" + options.cache + " private" : "must-revalidate";
    }
    if (method == "GET" && data) {
      vars += data;
    }
    if (vars) {
      url += (/\?/.test(url) ? "&" : "?") + vars;
    }
    if (options.async) {
      promise.send();
    }
    return promise;
  };
  return {
    base: "",
    get: function get(url, data, options, before) {
      return qwest("GET", this.base + url, data, options, before);
    },
    post: function post(url, data, options, before) {
      return qwest("POST", this.base + url, data, options, before);
    },
    put: function put(url, data, options, before) {
      return qwest("PUT", this.base + url, data, options, before);
    },
    "delete": function _delete(url, data, options, before) {
      return qwest("DELETE", this.base + url, data, options, before);
    },
    map: function map(type, url, data, options, before) {
      return qwest(type.toUpperCase(), this.base + url, data, options, before);
    },
    xhr2: xhr2,
    limit: function limit(by) {
      _limit = by;
    },
    setDefaultXdrResponseType: function setDefaultXdrResponseType(type) {
      defaultXdrResponseType = type.toLowerCase();
    }
  };


})
}).call(this, (typeof exports === 'object' ? global : window), (typeof exports === 'object' ? global : window))