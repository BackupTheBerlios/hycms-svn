/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
 
//
// Author view
//
HtmlView.View({
	_this:			["*", "author", "*", "person", "*", "structure"],

_does:
	function HtmlView_Author(request) 
	{
		var add_output = "";
		var main_info = "";
		var pname = this.__getByClass("name");
		var mail = this.__getByClass("mail_address");

		// Get name
		if (pname == null)
			pname = "Missing author name";
		else
			main_info = pname;
			
		// Mail address as link, if given
		if (mail) {
			// This is bad ... normally we have to call a Mail-Address-View !!!
			main_info = "<a href='mailto:"+mail+"'>"+pname+"</a>";
		}
			
		// Additional informations
		for (var idx in this) {
			var element = this[idx];
		
			if (idx[0] == '_') continue;
			if (element.__is("name") || element.__is("mail_address")) continue;
			
			add_output += element._view()+ "; ";			
		}

		// Append additional information only, if given
		if (add_output != "")
			add_output = " ("+add_output+")";

		return (main_info + add_output)._tag({tag: "span", object:this});
	}

});

