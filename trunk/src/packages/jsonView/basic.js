/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
 
/*
 * JsonView_renderChild
 *
 * See:
 *	HtmlView_renderChild
 *
 */
function JsonView_renderChild(object, def, additional_def_string)
{
	var additions = (additional_def_string == null) ? "" : "; " + additional_def_string;

	additions = "<(json)>; json < text" + additions;
	
	return View_renderChild(object, def, additions);
}
 
/*
 * JsonView_listInternal
 *
 * See:
 *	HtmlView_listInternal
 *
 */
function JsonView_listInside(input, def, parentType, iterateFunction)
{
	return View_listInside(input, def, parentType, JsonView_renderChild, iterateFunction);
}

//
// Structure view
//
({
	purpose:	"View",
	conditions:	"{?indenting}",

	input:		">(structure)<; structure; [?*]; ?text",
	output:		"<(json)>; ?json < text"
})._(

	function JsonView_Structure(input, def) 
	{
		var structure = input._get("structure");
		var output = "";
		var whitespace = "";
		var max_ws = 0;

		// Get white space length
		structure._iterate( function(element, key) {
			var elem_length = element._def_string().length;
			
			if (elem_length > max_ws)
				max_ws = elem_length;
		});

		function _whitespace(str) { var ws = "\t"; for (var i = 0; i <= (max_ws - str.length) / 8; i ++) ws += "\t"; return ws; }

		// Output definition		
		output = "{__def:"+_whitespace("__def:")+"\""+structure._def_string()+"\"";

		// Output of children
		var ext = "";
		
		structure._iterate ( function(element, key) {
			var def = " \""+element._def_string()+"\":";
			var child = "|View; <(json)>; json < text"._send(element);
			
			ext += def+_whitespace(def) + child +",\r";
		});
	
		// Closing definition
		if (ext != "")
			output += ",\r"+ext.substr(0, ext.length-2)+"\r}";
		else
			output += "}";

		return output.replace(RegExp("\n", "g"), "\n"+whitespace).replace(RegExp("\r", "g"), "\n");
	}
);


//
// List view
//
({
	purpose:	"View",
	conditions:	"{?indenting}",

	input:		">(list)<; list; [?*]; ?text",
	output:		"<(json)>; ?json < text"
})._(

	function JsonView_List(input, def) 
	{
		var list = input._get("list");
		var output = "";
		
		output  = "{__def: \""+list._def_string()+"\",\n";
		output += " __value:\n";
		output += "	[\n";

		var ext = "";

		list._iterate ( function(element, key) {
			var def = " \""+element._def_string()+"\":";
			var child = "|View; <(json)>; json < text"._send(element);
			
			ext += "\t "+child.replace(RegExp("\n", "g"), "\n\t ")+",\n";
		});
		
		output += ext.substr(0, ext.length-2)+"\n";
		output += " \t]\n";
		output += "}";
		
		return output;
	}
);

//
// Plain text view
//		 
({
	purpose:	"View",
	conditions:	"{?indenting}",

	input:		">(text)<; text",
	output:		"<(json)>; ?json < text"
})._(

	function JsonView_Text(input, def) 
	{
		var data = input._get("text");
		var text = "\""+data.valueOf().replace(RegExp("[\\\"]", "g"), "\\\"")+"\"";

		if (data._getClassName() == "text")
			return text;
		else
			return "{__def: \""+data._def_string()+"\", __value: "+text+"}";
	}

);

//
// Plain boolean view
//		 
({
	purpose:	"View",
	conditions:	"{?indenting}",

	input:		">(boolean)<; boolean",
	output:		"<(json)>; ?json < text"
})._(

	function JsonView_Boolean(input, def) 
	{
		var data = input._get("boolean");
		var text = data.valueOf();

		if (data._getClassName() == "boolean")
			return text;
		else
			return "{__def: \""+data._def_string()+"\", __value: "+text+"}";
	}
);

//
// Plain number view
//		 
({
	purpose:	"View",
	conditions:	"{?indenting}",

	input:		">(number)<; number",
	output:		"<(json)>; ?json < text"
})._(

	function JsonView_Number(input, def) 
	{
		var data = input._get("number");
		var text = data.valueOf();

		if (data._getClassName() == "number")
			return text;
		else
			return "{__def: \""+data._def_string()+"\", __value: "+text+"}";
	}
);

