/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */

//
// Structure view
//
HtmlView_declare(
	["*", "structure"], null,

	function HtmlView_Structure(request) 
	{
		function viewFunction(elementOutput, element, key)
		{
			var id = element.__getClassName().toLowerCase();
			
			id = id[0].toUpperCase() + id.substr(1);
			id = id.replace(RegExp("[\_\-]", "g"), " ");
			
			return "<tr><td>"+id+"</td><td>"+  elementOutput + "</td></tr>";
		}

		return this._taggedIterate("table", request.addOption("viewFunction", viewFunction));
	}
);

//
// List view
//
HtmlView_declare(
	["*", "list"], null,
	
	function HtmlView_List(request) 
	{
		function viewFunction(elementOutput, element, key)
		{
			return "<tr><td>"+key+"</td><td>"+  elementOutput + "</td></tr>";
		}

		return this._taggedIterate("table", request.addOption("viewFunction", viewFunction));
	}
);

//
// Plain text view
//		 
HtmlView_declare(
	["*", "text"], null,

	function HtmlView_Text()
	{
		return this._htmlText()._tag("span", this)
	}

);

//
// Plain text view
//		 
HtmlView_declare(
	["*", "important_text", "*", "text"], null,

	function HtmlView_Text()
	{
		return this._htmlText()._tag("b", this)
	}
);

//
// Simle URL
//	
HtmlView_declare(
	["*", "url", "*", "text"],

	function HtmlView_Url() 
	{
		return this._htmlText()._tag("span", this, Request(null, null, {"attributes": "href='"+this+"'"}));
	}

);

HtmlView_declare(
	["*", "error"],

	function HtmlView_Error(input, def) 
	{
		return this._htmlText()._tag("b", this)
	}

);

