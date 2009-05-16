/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
//
// Paragraph view
//
HtmlView.View({
	_this:		["*", "paragraph", "*", "list"],

_does:	
	function HtmlView_Paragraph() 
	{
		return this._taggedIterate({tag: "p"});
	}
});

//
// Headline view
//
HtmlView.View({
	_this:		["*", "headline", "*", "?paragraph", "*", "list"],

_does:	
	function HtmlView_Paragraph(parentList) 
	{
		return this._taggedIterate({tag: "h4"});
	}
});
