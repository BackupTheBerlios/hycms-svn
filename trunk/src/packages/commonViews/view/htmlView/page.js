/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */

//
// Page view
//
HtmlView.View({
	_this:		["*", "page", "*", "list"],

_does:	
	function HtmlView_Page() 
	{
		return this._taggedIterate({tag: "div"});
	}
});

				  	   
//
// Page Title view
//
HtmlView.View({
	_this:			["*", "headline", "*", "?paragraph", "*", "list"], 
	 _whereas:		["parentList.length > 0", "parentList.__last().__is('page')"],
	
_does:
	function HtmlView_PageTitle() 
	{
		return this._taggedIterate({tag: "h1"});
	}
});
		  	   	    
//
// Section view
//
HtmlView.View({
	_this:			["*", "section", "*", "list"],

_does:	
	function HtmlView_Section() 
	{
		return this._taggedIterate({tag: "div"});
	}
});

//
// Section headline view
//
HtmlView.View({
	_this:			["*", "headline", "*", "?paragraph", "*", "list"], 
	 _whereas:		["parentList.length > 0", "parentList.__last().__is('section')"],

_does:	
	function HtmlView_SectionHeadline() 
	{

		return this._taggedIterate({tag: "h2"});
	}
});

//
// Subsection headline view
//
HtmlView.View({
	_this:			["*", "headline", "*", "?paragraph", "*", "list"], 
	 _whereas:		["parentList.length > 1", "parentList.__last().__is('section')", "parentList.__last(2).__is('section')"],
	
_does:	
	function HtmlView_SubSectionHeadline() 
	{
		return this._taggedIterate({tag: "h3"});
	}
});

