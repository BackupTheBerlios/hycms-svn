/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
//
// DocumentInformation view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(document_information)<; ?document_information < list",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_DocumentInformation(input, def) 
	{
		var output_header = "";
		var output_items = "";

		function _listInsideIterate(context, key, element) {
		
			// Display all inline elements in one line
			if (!element._instanceOf("list")) {
				output_header += "<span class='document_information_head_item'>";
				output_header += HtmlView_renderChild( element, def, context );
				output_header += "</span>,&nbsp;";		
			} else {
				output_items += "<div class='document_information_item'>";
				output_items += HtmlView_renderChild( element, def, context );
				output_items += "</div>";		
			}			
		}

		View_contextIterate(input, def, _listInsideIterate);

		return HtmlView_autotag("div", arguments,
						        "<div class='document_information_head'>"+ output_header.substr(0, output_header.length-7) +"</div>"
						        + output_items
					           );
			

	}

);


//
// Abstract view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(~abstract)<; abstract < list",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_Abstract(input, def) 
	{
		return HtmlView_autotag("p", arguments, HtmlView_listInside(input, def));
	}

);

//
// Version view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute, ?not_editable_attribute}",

	input:		">(~version)<; version < text",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_Abstract(input, def) 
	{
		return HtmlView_autotag("span", arguments, "<span not_editable='true'>Version:&nbsp;</span>"+input._get("version"));
	}

);
