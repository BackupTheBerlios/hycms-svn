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
HtmlView.View(
	["*", "lines", "*", "list"], null,

	function HtmlView_Lines(request) 
	{
		function viewFunction(elementOutput, element, key)
		{
			return elementOutput + "</br>";
		}

		return this._taggedIterate("div", request.addOption("viewFunction", viewFunction));
	}
);

//
// Inline code view
//
HtmlView.View(
	["*", "code", "*", "text"], null,

	function HtmlView_InlineCode(request) 
	{
		return HtmlView_renderLine(this, [])._tag("span", this, HtmlView_tagRequest);
	}
);

//
// Code view
//
HtmlView.View(
	["*", "code", "*", "list"], null,

	function HtmlView_Code(request)
	{
		return HtmlView_renderCode(this, []);
	}
);

//
// jsCode view
//
HtmlView.View(
	["*", "javascript", "*", "code", "*", "list"], null,

	function HtmlView_Code(request)
	{
		return HtmlView_renderCode(this, js_replacement_table);
	}
);



