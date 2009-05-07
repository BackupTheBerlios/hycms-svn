/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */

//
// Page view
//
HtmlView.View(
	["*", "page", "*", "list"], null,
	
	function HtmlView_Page(request) 
	{
		return this._taggedIterate("div", request);
	}
);

				  	   
//
// Page Title view
//
HtmlView.View(
	["*", "headline", "*", "?paragraph", "*", "list"], 
	["__options.parentList.length > 0", "__options.parentList.__last().__is('page')"],
	
	function HtmlView_PageTitle(request) 
	{
		return this._taggedIterate("h1", request);
	}
);
		  	   	    
//
// Section view
//
HtmlView.View(
	["*", "section", "*", "list"], null,
	
	function HtmlView_Section(request) 
	{
		return this._taggedIterate("div", request);
	}
);

//
// Section headline view
//
HtmlView.View(
	["*", "headline", "*", "?paragraph", "*", "list"], 
	["__options.parentList.length > 0", "__options.parentList.__last().__is('section')"],
	
	function HtmlView_SectionHeadline(request) 
	{
		return this._taggedIterate("h2", request);
	}
);

//
// Subsection headline view
//
HtmlView.View(
	["*", "headline", "*", "?paragraph", "*", "list"], 
	["__options.parentList.length > 1", "__options.parentList.__last().__is('section')", "__options.parentList.__last(2).__is('section')"],
	
	function HtmlView_SubSectionHeadline(request) 
	{
		return this._taggedIterate("h3", request);
	}
);

