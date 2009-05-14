/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
"downloadContent".__declare
({
	_this:			["text"],
	callback:		"function",

	_output:		["*"],
	
_does:
	function downloadContent(callback) 
	{
		var requestData = null;

		function __receive(responseText)
		{
			var answer = new Object();

			// Convert data from JSON to object
			try {
				requestData = eval('('+responseText+')');
			} catch (e) {
				callback({__def: ["error", "text"], __value: "Read error: "+e}.__build());
				return;
			}

			if (requestData == null) {
				callback({__def: ["error", "text"], __value: "Missing data"}.__build());
				return;
			}

			// Transfer data to the caller
			try {
				callback(requestData.__build());
			}
			 catch(e) {
				document.body.innerHTML = e;
			 	console.log(e);
			}			
		}

		// Send request
		({
			hycms_cmd:	"get_content",
			hycms_path:	this
		})._send({method: "GET", url: "../services/content.php", callback: __receive});
	}
});

