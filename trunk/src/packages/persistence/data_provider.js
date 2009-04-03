/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
({
	purpose:	"DataProvider",

	input:		">(~path, ~callback)<; path < text; callback < function",
	output:		"<(?object)>"
})._(

	function SemanticDataProvider(input) 
	{
		var httpRequest;
		var requestData = null;
		var lock = 0;
		var callback = input._get("callback");

		if (window.XMLHttpRequest)
			httpRequest = new XMLHttpRequest();
		else if (window.ActiveXObject)
			httpRequest = new ActiveXObject("Microsoft.XMLHTTP");

		httpRequest.onreadystatechange = function() {
			if (httpRequest.readyState == 4) {
				var answer = new Object();

				// Convert data from JSON to object
				try {
					requestData = eval('('+httpRequest.responseText+')');
				} catch (e) {
					callback({__def: "|error < text", __value: "Read error: "+e}._as());
					return;
				}
			
				if (requestData == null) {
					callback({__def: "|error < text", __value: "Missing data"}._as());
					return;
				}

				try {
					callback(requestData._as());
				}
				 catch(e) {
					document.body.innerHTML = e;
				 	console.log(e);
				}
			}
		}

		httpRequest.open('GET', "../services/content.php?hycms_cmd=get_content&hycms_path="+input._get("path"), true);
		httpRequest.send(null);
	}
);

