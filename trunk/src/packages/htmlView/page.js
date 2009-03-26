/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */

//
// Page view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(page)<; page < list",
	output:		"<(~html)>; ?html < text"
})._ (

	function HtmlView_Page(input, def) 
	{ 
		return HtmlView_autotag("div", arguments, HtmlView_listInside(input, def));
	}

);

				  	   
//
// Page Title view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(headline)<; headline < paragraph < list",
	called_in:	"headline << page; page < list",
	output:		"<(~html)>; ?html < text"
})._ (

	function HtmlView_PageTitle(input, def) 
	{
		return HtmlView_autotag("h1", arguments, HtmlView_listInside(input, def));
	}

);
				  	   	    
//
// Section view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(section)<; section < list",
	output:		"<(~html)>; ?html < text"
})._ (

	function HtmlView_Section(input, def) 
	{
		return HtmlView_autotag("div", arguments, HtmlView_listInside(input, def));

	}

);

//
// Section headline view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(headline)<; headline < paragraph < list",
	called_in:	"headline << section << page; section < list; page < list",
	output:		"<(~html)>; ?html < text"
})._ (

	function HtmlView_SectionHeadline(input, def) 
	{
		return HtmlView_autotag("h2", arguments, HtmlView_listInside(input, def));

	}

);

//
// Subsection headline view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(headline)<; headline < paragraph < list",
	called_in:	"headline << section << section << page; section < list; page < list",
	output:		"<(~html)>; ?html < text"
})._ (

	function HtmlView_SubSectionHeadline(input, def) 
	{
		return HtmlView_autotag("h3", arguments, HtmlView_listInside(input, def));

	}

);

