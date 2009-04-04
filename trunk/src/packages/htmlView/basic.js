/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
 
//
// Structure view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(structure)<; structure; [?*]; ?text",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_Structure(input, def) 
	{
		var output = "";

		function _view_internal(output, element, key) {
			var id = element._getClassName().toLowerCase();

			id = id[0].toUpperCase() + id.substr(1);
			id = id.replace(RegExp("[\_\-]", "g"), " ");
		
			return "<tr><td>"+id+"</td><td>"+output+"</td></tr>";
		}

		return HtmlView_autotag("table", arguments, HtmlView_listInside(input, def, "structure", _view_internal));
	}
);

//
// List view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(list)<; list; [?*]; ?text",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_List(input, def) 
	{
		var output = "";

		function _view_internal(output, element, key) {
			return "<tr><td>"+key.html_text()+"</td><td>"+output+"</td></tr>";
		}

		return HtmlView_autotag("table", arguments, HtmlView_listInside(input, def, "list", _view_internal));
	}

);

//
// Plain text view
//		 
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(text)<; text",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_Text(input, def) 
	{
		return HtmlView_autotag("span", arguments, input._get("text").html_text());
	}

);

//
// Plain boolean view
//		 
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(boolean)<; boolean",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_Boolean(input, def) 
	{
		return HtmlView_autotag("span", arguments, String(input._get("boolean")).html_text());
	}

);

//
// Plain number view
//		 
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(number)<; number",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_Number(input, def) 
	{
		return HtmlView_autotag("span", arguments, String(input._get("number")).html_text());
	}

);
//
// Important text view
//		 
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(~important_text)<; important_text < text",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_ImportantText(input, def) 
	{
		return HtmlView_autotag("b", arguments, input._get("text").html_text());
	}

);

//
// Identifier text view
//		 
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(~identifier)<; identifier < text",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_Identifier(input, def) 
	{
		return HtmlView_autotag("i", arguments, input._get("text").html_text());
	}

);

//
// URL view
//		 
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(~url)<; url < text",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_Url(input, def) 
	{
		return HtmlView_autotag("a", arguments, input._get("url").html_text(), "href='"+input._get("url")+"'");
	}

);

//
// Error view
//		 
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(~error)<; error < text",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_Error(input, def) 
	{
		return HtmlView_autotag("b", arguments, input._get("error").html_text());
	}

);
