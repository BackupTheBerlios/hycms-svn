/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
//
// Paragraph view
//
HtmlView.View(
	["*", "paragraph", "*", "list"], null,
	
	function HtmlView_Paragraph(request) 
	{
		return this._taggedIterate("p", request);
	}
);

//
// Headline view
//
HtmlView.View(
	["*", "headline", "*", "?paragraph", "*", "list"], null,
	
	function HtmlView_Paragraph(request) 
	{
		return this._taggedIterate("h4", request);
	}
);
