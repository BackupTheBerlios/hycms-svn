/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
 
//
// Author view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(author)<; author < person < structure",
	author:		"[~name, ?~mail_address, ?*]; ?name < text; ?mail_address < text",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_Author(input, def) 
	{
		var add_output = "";
		var author = input._get("author");
		var main_info = "";

		// Get name
		if (author._get("name"))
			main_info = author._get("name");
		else
			main_info = "Missing author name";
			
		// Mail address as link, if given
		if (author._get("mail_address")) {
			// This is bad ... normally we have to call a Mail-Address-View !!!
			main_info = "<a href='mailto:"+author._get("mail_address")+"'>"+main_info+"</a>";
		}
			
		// Additional informations
		function _listInsideIterate(context, key, element) {
				if (element._instanceOf("name") || element._instanceOf("mail_address"))
					return 0;
					
				add_output += HtmlView_renderChild( element, def, context ) + "; ";		
		}

		View_contextIterate(input, def, _listInsideIterate);

		// Append additional information only, if given
		if (add_output != "")
			add_output = " ("+add_output+")";

		return HtmlView_autotag("span", arguments, main_info + add_output);
	}

);

