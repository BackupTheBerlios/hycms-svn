/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */

//
// Structure view
//
HtmlView.View({
	_this:			["*", "structure"],

_does:
	function HtmlView_Structure() 
	{
		function viewFunction(elementOutput, element, key)
		{
			var id = element.__getClassName().toLowerCase();
			
			id = id[0].toUpperCase() + id.substr(1);
			id = id.replace(RegExp("[\_\-]", "g"), " ");
			
			return "<tr><td>"+id+"</td><td>"+  elementOutput + "</td></tr>";
		}

		return this._taggedIterate({tag: "table", viewFunction: viewFunction});
	}
});

//
// List view
//
HtmlView.View({
	_this:			["*", "list"],
	
_does:	
	function HtmlView_List() 
	{
		function viewFunction(elementOutput, element, key)
		{
			return "<tr><td>"+key+"</td><td>"+  elementOutput + "</td></tr>";
		}

		return this._taggedIterate({tag: "table", viewFunction: viewFunction});
	}
});

//
// Plain text view
//		 
HtmlView.View({
	_this:			["*", "text"],

_does:
	function HtmlView_Text()
	{
		return this._htmlText()._tag({tag: "span", object: this});
	}

});

//
// Plain text view
//		 
HtmlView.View({
	_this:			["*", "important_text", "*", "text"],

_does:
	function HtmlView_Text()
	{
		return this._htmlText()._tag({tag: "b", object: this});
	}
});

//
// Simle URL
//	
HtmlView.View({
	_this:			["*", "url", "*", "text"],

_does:
	function HtmlView_Url() 
	{
		return this._htmlText()._tag({tag: "span", object: this, attributes: ["href='"+this+"'"]});
	}
});

HtmlView.View({
	_this:			["*", "error"],
	
_does:
	function HtmlView_Error(input, def) 
	{
		return this._htmlText()._tag({tag: "b", object: this});
	}
});

