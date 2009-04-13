/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
//
// BeginEdit: generic handler for structure
//
({
	purpose:		"BeginEdit",
	conditions:		"{use_uuid_attribute, set_is_focussed, use_content_editable_caret}",

	input:			">(event_coordinates, ~focussed_model)<",
	input_types:	"?focussed_model < structure; event_coordinates < structure",
	
	output:			"<(accepted)>; accepted < boolean"
})._(

	function BeginEdit_Structure(input, def)
	{
		var anchorView = input._get("event_coordinates")._get("anchor_view").valueOf();	
	
		anchorView.setAttribute("is_focussed", true);
		anchorView.style["background"] = "#ffdfff";
		
		return true._as("|accepted < boolean");	
	}
);

//
// StopEdit: generic handler for structure
//
({
	purpose:		"StopEdit",
	conditions:		"{use_uuid_attribute, unset_is_focussed, use_content_editable_caret}",

	input:			">(event_coordinates, last_focussed_view, ~unfocussed_model)<",
	input_types:	"?unfocussed_model < structure; event_coordinates < structure; last_focussed_view < ?dom_node < native",
	
	output:			"<(accepted)>; accepted < boolean"
})._(

	function StopEdit_Structure(input, def)
	{
		var lastFocussed = input._get("last_focussed_view").valueOf();
		
		lastFocussed.setAttribute("is_focussed", false);
		lastFocussed.style["background"] = "";

	
		return true._as("|accepted < boolean");
	}
);

//
// BeginEdit: generic handler for list
//
({
	purpose:		"BeginEdit",
	conditions:		"{use_uuid_attribute, set_is_focussed, use_content_editable_caret}",

	input:			">(event_coordinates, ~focussed_model)<",
	input_types:	"?focussed_model < list; event_coordinates < structure",
	
	output:			"<(accepted)>; accepted < boolean"
})._(

	function BeginEdit_List(input, def)
	{
		var anchorView = input._get("event_coordinates")._get("anchor_view").valueOf();	
	
		anchorView.setAttribute("is_focussed", true);
		anchorView.style["background"] = "#dfffff";
		
		return true._as("|accepted < boolean");	
	}
);

//
// StopEdit: generic handler for list
//
({
	purpose:		"StopEdit",
	conditions:		"{use_uuid_attribute, unset_is_focussed, use_content_editable_caret}",

	input:			">(event_coordinates, last_focussed_view, ~unfocussed_model)<",
	input_types:	"?unfocussed_model < list; event_coordinates < structure; last_focussed_view < ?dom_node < native",
	
	output:			"<(accepted)>; accepted < boolean"
})._(

	function StopEdit_List(input, def)
	{
		var lastFocussed = input._get("last_focussed_view").valueOf();
		
		lastFocussed.setAttribute("is_focussed", false);
		lastFocussed.style["background"] = "";
	
		return true._as("|accepted < boolean");
	}
);

