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
	output:		["json", "text"],
	features:	["indenting"],
	whereas:	["this.__is('structure')"],
	does:

	function JsonView_Structure(request) 
	{
		var output = "";
		var whitespace = "";
		var max_ws = 0;

		// Get white space length
		for (var idx in this) {
			if (idx[0] == '_') continue;
			
			var elem_length = idx.length;
			
			if (elem_length > max_ws)
				max_ws = elem_length;
		}

		function _whitespace(str) { var ws = "\t"; for (var i = 0; i <= (max_ws - str.length) / 8; i ++) ws += "\t"; return ws; }

		// Output definition		
		if (this.__def == null)
			output = "{__def:"+_whitespace("__def:")+"['"+this.__def.join("','")+"']";
		else
			output = "{__def:"+_whitespace("__def:")+"\"['"+__getJSTypeId(this)+"']\"";

		// Output of children
		var ext = "";
		
		for (var idx in this) {
			if (idx[0] == "_") continue;
		
			var def = " \""+ idx +"\":";
			var child = this[idx]._view(request);
			
			ext += def + _whitespace(def) + child +",\r";
		}
	
		// Closing definition
		if (ext != "")
			output += ",\r"+ext.substr(0, ext.length-2)+"\r}";
		else
			output += "}";

		return output.replace(RegExp("\n", "g"), "\n"+whitespace).replace(RegExp("\r", "g"), "\n");
	}
});


//
// List view
//
"view".__declare
({
	output:		["json", "text"],
	features:	["indenting"],
	whereas:	["this.__is('list')"],
	does:	

	function JsonView_List(request)
	{
		var output = "";
		
		if (this.__def != null)
			output  = "{__def: ['"+this.__def.join("','")+"'],\n";
		else
			output  = "{__def: \""+__getJSTypeId(this)+"\",\n";					
			
		output += " __value:\n";
		output += "\t[\n";

		var ext = "";

		for (var idx = 0; idx < this.length; idx ++) {
			var child = this[idx]._view(request);
			
			ext += "\t "+child.replace(RegExp("\n", "g"), "\n\t ")+",\n";
		}
		
		output += ext.substr(0, ext.length-2)+"\n";
		output += " \t]\n";
		output += "}";
		
		return output;
	}
});

//
// Plain text view
//		 
"view".__declare
({
	output:		["json", "text"],
	features:	["indenting"],
	whereas:	["this.__is('text') || this.__is('number') || this.__is('boolean')"],
	does:	
	
	function JsonView_Text(request)
	{
		var text = "\""+this.valueOf().replace(RegExp("[\\\"]", "g"), "\\\"")+"\"";

		if (this.__getClassName() == "text")
			return text;
		else
			return "{__def: ['"+this.__def.join("','")+"'], __value: "+text+"}";
	}

});

