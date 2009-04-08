/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
function _blinkCaret(caret, late)
{
	if ((caret == null) || (caret.style == null))
		return;
				
	if (caret.style.borderTopStyle != "none") 
		caret.style.borderStyle = "none"; 
	else 
		caret.style.borderStyle = "solid";
}

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

		//
		// Determine caret position
		//
		// This is ugly. We detect the caret, by temporarily splitting
		// the text node and placing a span inside it. Then we get the
		// position of the span and use it as the caret position.
		//
		// Unfortunatly contentEditable is too bad for our needs, so we need
		// this ugly hack...
		// 
		var origText = anchorNode.nodeValue;
		var caretDetector = document.createElement("span");
		var caretPost = document.createTextNode(origText.substr(anchorOffset));

		anchorNode.nodeValue = origText.substr(0, anchorOffset);
		anchorNode.parentNode.insertBefore(caretDetector, anchorNode.nextSibling);
		anchorNode.parentNode.insertBefore(caretPost, caretDetector.nextSibling);
		
		var caret = document.createElement("div");
		caret.className = "editorCaret";

		caret.style.height = window.getComputedStyle(anchorView, null).fontSize;
		caret.style.left = (caretDetector.offsetLeft);
		caret.style.top = (caretDetector.offsetTop - window.getComputedStyle(anchorView, null).fontSize.replace("px", ""));

		anchorNode.parentNode.removeChild(caretDetector);
		anchorNode.parentNode.removeChild(caretPost);
		anchorView.appendChild(caret);

		anchorNode.nodeValue = origText;

		// Set caret
		anchorView.caret = caret;
		
		caret.blinker = window.setInterval(_blinkCaret, 600, caret);
		
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

		if (lastFocussed.caret) {
			window.clearInterval(lastFocussed.caret.blinker);
			lastFocussed.removeChild(lastFocussed.caret);
			lastFocussed.caret = null;
		}
	
		return true._as("|accepted < boolean");
	}
);
