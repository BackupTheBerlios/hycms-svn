/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */


//
// BeginEdit: generic handler for text
//
({
	purpose:		"BeginEdit",
	conditions:		"{use_uuid_attribute, set_is_focussed}",

	input:			">(event_coordinates, ~focussed_model)<",
	input_types:	"?focussed_model < text; event_coordinates < structure",
	
	output:			"<(accepted)>; accepted < boolean"
})._(

	function BeginEdit_Text(input, def)
	{
		var anchorNode = input._get("event_coordinates")._get("anchor_node").valueOf();
		var anchorOffset = input._get("event_coordinates")._get("anchor_offset").valueOf();
		var anchorView = input._get("event_coordinates")._get("anchor_view").valueOf();
		
		anchorView.setAttribute("is_focussed", true);
		anchorView.style["background"] = "#efefef";

		HtmlEditor_setCaret(anchorView, anchorNode, anchorOffset);
		
		return true._as("|accepted < boolean");
	}
);

//
// StopEdit: generic handler for text
//
({
	purpose:		"StopEdit",
	conditions:		"{use_uuid_attribute, unset_is_focussed}",

	input:			">(event_coordinates, last_focussed_view, ~unfocussed_model)<",
	input_types:	"?unfocussed_model < text; event_coordinates < structure; last_focussed_view < ?dom_node < native",
	
	output:			"<(accepted)>; accepted < boolean"
})._(

	function StopEdit_Text(input, def)
	{
		var lastFocussed = input._get("last_focussed_view").valueOf();
		
		lastFocussed.setAttribute("is_focussed", false);
		lastFocussed.style["background"] = "";

		HtmlEditor_unsetCaret(lastFocussed);
	
		return true._as("|accepted < boolean");
	}
);
