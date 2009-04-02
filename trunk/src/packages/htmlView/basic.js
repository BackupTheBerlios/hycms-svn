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

		input._get("structure")._iterate( function (element, key) {
			var id = element._getClassName().toLowerCase();

			id = id[0].toUpperCase() + id.substr(1);
		
			output += "<tr>";
			output += "<td>"+id+"</td><td>";
			output += "|View; <(?html, ?text)>; ?html < text"._send( element );
			output += "</td></tr>";
		});

		return HtmlView_autotag("table", arguments, input, def, output);
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

	function HtmlView_List(input) 
	{
		var output = "";

		input._get("list")._iterate( function (element, key) {
			output += "<tr>";
			output += "<td>"+key.html_text()+"</td><td>";
			output += "|View; <(?html, ?text)>; ?html < text"._send( element );
			output += "</td></tr>";
		});
	
		return HtmlView_autotag("table", arguments, output);
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

	input:		">(~important_text)<; identifier < text",
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
//		console.log(input._get("error").valueOf());
		return input._get("error");
	}

);
