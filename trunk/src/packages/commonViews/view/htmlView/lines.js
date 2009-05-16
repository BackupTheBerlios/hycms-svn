/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * [ REQUIREMENTS ]
 *
 * paragraph.js => (contextIterate)
 *
 */
//
// Lines view
//
HtmlView.View({
	_this:		["*", "lines", "*", "list"],

_does:
	function HtmlView_Lines() 
	{
		function viewFunction(elementOutput, element, key)
		{
			return elementOutput + "</br>";
		}

		return this._taggedIterate({tag: "div", viewFunction: viewFunction});
	}
});

//
// Inline code view
//
HtmlView.View({
	_this:		["*", "code", "*", "text"],

_does:
	function HtmlView_InlineCode() 
	{
		return HtmlView_renderLine(this, [])._tag({tag: "span", object: this});
	}
});

//
// Code view
//
HtmlView.View({
	_this:		["*", "code", "*", "list"],

_does:
	function HtmlView_Code(request)
	{
		return HtmlView_renderCode(this, []);
	}
});

//
// jsCode view
//
HtmlView.View({
	_this:		["*", "javascript", "*", "code", "*", "list"],

_does:
	function HtmlView_Code(request)
	{
		return HtmlView_renderCode(this, js_replacement_table);
	}
});



