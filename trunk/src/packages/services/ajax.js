/*
 * hyCMS
 *
 * Services package
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
var __ajax_test_mode = window.__test_mode;
 
"send".__declare({
	_this:				"structure",

	url:				"text",
	callback:			"function",

	_optional_method:	"text",
	_default_method:	"GET",

_does:
	function send(url, callback, method)
	{
		var httpRequest;
		var requestData = [];
	
		// Build request data			
		for (var idx in this) {
			if (idx[0] == '_') continue;
		
			requestData.push(idx + "=" + this[idx]);
		}
		requestData = requestData.join("&");

		// Prepare requester
		if (window.XMLHttpRequest)
			httpRequest = new XMLHttpRequest();
		else if (window.ActiveXObject)
			httpRequest = new ActiveXObject("Microsoft.XMLHTTP");

		// Setup callback
		httpRequest.onreadystatechange = function(){
			if (httpRequest.readyState == 4) {
				callback(httpRequest.responseText);				
			}
		}

		// Send request
		if ((method == 'post') || (method == 'POST'))
			httpRequest.open('POST', url, !__ajax_test_mode);
		else
			httpRequest.open('POST', url+"?"+requestData, !__ajax_test_mode);
		
		httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');			
		httpRequest.send(requestData);
	
		// Synchronous transfers only in testing mode
		if (__ajax_test_mode) {
			if (httpRequest.status == 200)
				callback(httpRequest.responseText);
			else
				throw new Error("Connection failure");
		}
	}

});
