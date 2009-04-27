/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
"downloadContent".__declare
({
	input:		["callback"],
	output:		["*"],

	whereas:		"this instanceof String",
	
	does:

		function SemanticDataProvider(callback) 
		{
			var httpRequest;
			var requestData = null;
			var lock = 0;

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
						callback({__def: ["error", "text"], __value: "Read error: "+e}.__build());
						return;
					}
		
					if (requestData == null) {
						callback({__def: ["error", "text"], __value: "Missing data"}.__build());
						return;
					}

					try {
						callback(requestData.__build());
					}
					 catch(e) {
						document.body.innerHTML = e;
					 	console.log(e);
					}
				}
			}

			httpRequest.open('GET', "../services/content.php?hycms_cmd=get_content&hycms_path="+this, true);
			httpRequest.send(null);
		}
});

