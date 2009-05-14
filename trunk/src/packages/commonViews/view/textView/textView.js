/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
 
//
// Structure view
//
"view".__declare
({
	_this:		"structure",

	_output:	["text"],
	
	_does:
		function TextView_Structure() 
		{
			var output = "";

			for (var key in this) {
				if (key[0] == "_")			
					continue;
					
				var element = this[key];
			
				output += key+":\n";
				output += element._view();
				output += "\n";
			}

			return output;
		}
});

//
// List view
//
"view".__declare
({
	_this:		"list",

	_output:	["text"],
	
	_does:
		function TextView_List() 
		{
			var output = "";

			for (var idx = 0; idx < this.length; idx ++) {
				output += idx+":\t";
				output += this[idx]._view();
				output += "\n";
			}
	
			return output;
		}
});

//
// Plain text view
//
"view".__declare
({
	_output:	["text"],
	_whereas:	["this.__is('text') || this.__is('number') || this.__is('boolean')"],
	
	_does:
		function TextView_Text() 
		{
			return this.valueOf();
		}
});

