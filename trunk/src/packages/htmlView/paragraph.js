/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */

//
// Paragraph view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(paragraph)<; paragraph < list",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_Paragraph(input, def) 
	{
		return HtmlView_autotag("p", arguments, HtmlView_listInside(input, def));

	}

);

//
// Headline view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(headline)<; headline < paragraph < list",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_Headline(input, def) 
	{
		return HtmlView_autotag("h4", arguments, HtmlView_listInside(input, def));
	}

);
