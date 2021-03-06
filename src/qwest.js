/*! original: qwest 2.0.7 (https://github.com/pyrsmk/qwest) 
    fork: https://github.com/HitoriSensei/re-qwest-es6
*/

define(['jquery-param'], function(PARAM) {
	var win=window,
			doc=document,
	// Default response type for XDR in auto mode
			defaultXdrResponseType = 'json',
	// Variables for limit mechanism
			limit = null,
			requests = 0,
			request_stack = [],
	// Get XMLHttpRequest object
			getXHR = function(){
				return win.XMLHttpRequest?
						new win.XMLHttpRequest():
						new ActiveXObject('Microsoft.XMLHTTP');
			},
	// Guess XHR version
			xhr2 = (getXHR().responseType==='');

	// Core function
	var qwest = function(method, url, data, options, before) {

		// Format
		method = method.toUpperCase();
		data = data || null;
		options = options || {};

		// Define variables
		var nativeResponseParsing = false,
				crossOrigin,
				xdr = false,
				timeoutInterval,
				aborted = false,
				attempts = 0,
				headers = {},
				mimeTypes = {
					text: '*/*',
					xml: 'text/xml',
					json: 'application/json',
					post: 'application/x-www-form-urlencoded'
				},
				accept = {
					text: '*/*',
					xml: 'application/xml; q=1.0, text/xml; q=0.8, */*; q=0.1',
					json: 'application/json; q=1.0, text/*; q=0.8, */*; q=0.1'
				},
				vars = '',
				i, j,
				serialized,
				response,
				sending = false,
				delayed = false,
				timeout_start;

		var xhr = getXHR();

		var PINKYSWEAR = ((gen)=>{
      let o = function(result,data){
        if(!o.p){
          o.p = new Promise(function(resolve,reject){
            if(result){
              resolve(data[1])
            }else{
              reject(data[2])
            }
          })
          o._thens.each(function(args){o.p.then(...args)})
          o._thens = null
        }
      }
      o._thens = []
			o.then = function(s,f) {
        if(o.p){
          o.p.then(s, f)
        }else{
          o._thens.push(arguments)
        }
        return o
      }
			return gen(o)
		}),

		// Create the promise
		promise = PINKYSWEAR(function(pinky) {
			pinky['catch'] = function(f) {
				return pinky.then(null, f);
			};
			pinky.complete = function(f) {
				return pinky.then(f, f);
			};
			pinky.send = function() {
				// Prevent further send() calls
				if(sending) {
					return;
				}
				sending = true;
				// Reached request limit, get out!
				if(limit && ++requests==limit) {
					request_stack.push(pinky);
					return;
				}
				// Start the chrono
				timeout_start = Date.now();
				if(crossOrigin) {
					if(!(xhr.withCredentials!==undefined) && win.XDomainRequest) {
						xhr = new XDomainRequest(); // CORS with IE8/9
						xdr = true;
						if(method!='GET' && method!='POST') {
							method = 'POST';
						}
					}
				}
				// Open connection
				if(xdr) {
					xhr.open(method, url);
				}
				else {
					xhr.open(method, url, options.async, options.user, options.password);
					if(xhr2 && options.async) {
						xhr.withCredentials = options.withCredentials;
					}
				}
				// Set headers
				if(!xdr) {
					for(let i in headers) {
						if(headers[i]) {
							xhr.setRequestHeader(i, headers[i]);
						}
					}
				}
				// Verify if the response type is supported by the current browser
				if(xhr2 && options.responseType!='document' && options.responseType!='auto') { // Don't verify for 'document' since we're using an internal routine
					try {
						xhr.responseType = options.responseType;
						nativeResponseParsing = (xhr.responseType==options.responseType);
					}
					catch(e){}
				}
				// Plug response handler
				if(xhr2 || xdr) {
					xhr.onload = handleResponse;
					xhr.onerror = handleError;
				}
				else {
					xhr.onreadystatechange = function() {
						if(xhr.readyState == 4) {
							handleResponse();
						}
					};
				}
				// Override mime type to ensure the response is well parsed
				if(options.responseType!='auto' && (xhr.overrideMimeType!==undefined)) {
					xhr.overrideMimeType(mimeTypes[options.responseType]);
				}
				// Run 'before' callback
				if(before) {
					before(xhr);
				}
				// Send request
				if(xdr) {
					setTimeout(function(){ // https://developer.mozilla.org/en-US/docs/Web/API/XDomainRequest
						xhr.send(method!='GET'?data:null);
					},0);
				}
				else {
					xhr.send(method!='GET'?data:null);
				}
			};
			return pinky;
		}),

		// Handle the response
		handleResponse = function() {
					// Prepare
					var i, responseType;
					--requests;
					sending = false;
					// Verify timeout state
					// --- https://stackoverflow.com/questions/7287706/ie-9-javascript-error-c00c023f
					if(Date.now()-timeout_start >= options.timeout) {
						if(!options.attempts || ++attempts!=options.attempts) {
							promise.send();
						}
						else {
							promise(false, [xhr,response,new Error('Timeout ('+url+')')]);
						}
						return;
					}
					// Launch next stacked request
					if(request_stack.length) {
						request_stack.shift().send();
					}
					// Handle response
					try{
						// Process response
						if(nativeResponseParsing && (xhr.response!==undefined) && xhr.response!==null) {
							response = xhr.response;
						}
						else if(options.responseType == 'document') {
							var frame = doc.createElement('iframe');
							frame.style.display = 'none';
							doc.body.appendChild(frame);
							frame.contentDocument.open();
							frame.contentDocument.write(xhr.response);
							frame.contentDocument.close();
							response = frame.contentDocument;
							doc.body.removeChild(frame);
						}
						else{
							// Guess response type
							responseType = options.responseType;
							if(responseType == 'auto') {
								if(xdr) {
									responseType = defaultXdrResponseType;
								}
								else {
									var ct = xhr.getResponseHeader('Content-Type') || '';
									if(ct.indexOf(mimeTypes.json)>-1) {
										responseType = 'json';
									}
									else if(ct.indexOf(mimeTypes.xml)>-1) {
										responseType = 'xml';
									}
									else {
										responseType = 'text';
									}
								}
							}
							// Handle response type
							switch(responseType) {
								case 'json':
									try {
										if((win.JSON!==undefined)) {
											response = JSON.parse(xhr.responseText);
										}
										else {
											response = eval('('+xhr.responseText+')');
										}
									}
									catch(e) {
										throw "Error while parsing JSON body : "+e;
									}
									break;
								case 'xml':
									// Based on jQuery's parseXML() function
									try {
										// Standard
										if(win.DOMParser) {
											response = (new DOMParser()).parseFromString(xhr.responseText,'text/xml');
										}
										// IE<9
										else {
											response = new ActiveXObject('Microsoft.XMLDOM');
											response.async = 'false';
											response.loadXML(xhr.responseText);
										}
									}
									catch(e) {
										response = undefined;
									}
									if(!response || !response.documentElement || response.getElementsByTagName('parsererror').length) {
										throw 'Invalid XML';
									}
									break;
								default:
									response = xhr.responseText;
							}
						}
						// Late status code verification to allow passing data when, per example, a 409 is returned
						// --- https://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
						if(xhr.status && !/^2|1223/.test(xhr.status)) {
							throw xhr.status+' ('+xhr.statusText+')';
						}
						// Fulfilled
						promise(true, [xhr,response]);
					}
					catch(e) {
						// Rejected
						promise(false, [xhr,response,e]);
					}
				},

		// Handle errors
				handleError = function(e) {
					--requests;
					promise(false, [xhr,null,new Error('Connection aborted')]);
				};

		// Normalize options
		options.async = options.async!==undefined?options.async:true;
		options.cache = options.cache || false;
		options.dataType = (options.dataType!==undefined)?options.dataType.toLowerCase():'post';
		options.responseType = (options.responseType!==undefined)?options.responseType.toLowerCase():'auto';
		options.user = options.user || '';
		options.password = options.password || '';
		options.withCredentials = !!options.withCredentials;
		options.timeout = (options.timeout!==undefined)?parseInt(options.timeout,10):30000;
		options.attempts = (options.attempts!==undefined)?parseInt(options.attempts,10):1;

		// Guess if we're dealing with a cross-origin request
		i = url.match(/\/\/(.+?)\//);
		crossOrigin = i && (i[1]?i[1]!=location.host:false);

		// Prepare data
		if((win.ArrayBuffer!==undefined) && data instanceof ArrayBuffer) {
			options.dataType = 'arraybuffer';
		}
		else if((win.Blob!==undefined) && data instanceof Blob) {
			options.dataType = 'blob';
		}
		else if((win.Document!==undefined) && data instanceof Document) {
			options.dataType = 'document';
		}
		else if((win.FormData!==undefined) && data instanceof FormData) {
			options.dataType = 'formdata';
		}
		switch(options.dataType) {
			case 'json':
				data = JSON.stringify(data);
				break;
			case 'post':
				data = PARAM(data);
		}

		// Prepare headers
		if(options.headers) {
			var format = function(match,p1,p2) {
				return p1 + p2.toUpperCase();
			};
			for(let i in options.headers) {
				headers[i.replace(/(^|-)([^-])/g,format)] = options.headers[i];
			}
		}
		if(!((headers['Content-Type']!==undefined)) && method!='GET') {
			if(mimeTypes[options.dataType]) {
				if(mimeTypes[options.dataType]) {
					headers['Content-Type'] = mimeTypes[options.dataType];
				}
			}
		}
		if(!headers.Accept) {
			headers.Accept = (accept[options.responseType])?accept[options.responseType]:'*/*';
		}
		if(!crossOrigin && !((headers['X-Requested-With']!==undefined))) { // (that header breaks in legacy browsers with CORS)
			headers['X-Requested-With'] = 'XMLHttpRequest';
		}

		if(options.cache) {
			headers['Cache-Control'] = options.cache!=true ? `max-age=${options.cache} private` : `must-revalidate`;
		}

		// Prepare URL
		if(method=='GET' && data) {
			vars += data;
		}
		if(vars) {
			url += (/\?/.test(url)?'&':'?')+vars;
		}

		// Start the request
		if(options.async) {
			promise.send();
		}

		// Return promise
		return promise;

	};

	// Return the external qwest object
	return {
		base: '',
		get: function(url, data, options, before) {
			return qwest('GET', this.base+url, data, options, before);
		},
		post: function(url, data, options, before) {
			return qwest('POST', this.base+url, data, options, before);
		},
		put: function(url, data, options, before) {
			return qwest('PUT', this.base+url, data, options, before);
		},
		'delete': function(url, data, options, before) {
			return qwest('DELETE', this.base+url, data, options, before);
		},
		map: function(type, url, data, options, before) {
			return qwest(type.toUpperCase(), this.base+url, data, options, before);
		},
		xhr2: xhr2,
		limit: function(by) {
			limit = by;
		},
		setDefaultXdrResponseType: function(type) {
			defaultXdrResponseType = type.toLowerCase();
		}
	};
});
