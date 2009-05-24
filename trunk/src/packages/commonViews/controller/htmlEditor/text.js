/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
/*
 * <"*", "text">::onfocus
 *
 * Handles the focus event for text nodes.
 *
 */
BrowserKit.ViewEvent({
	modelType:		["*", "text"],
	event:			"focus",

	_whereas:		["eventDescription.parentNotification == false"],

_does:
	function onFocus(eventDescription) 
	{
		this.style["outline"] = "1px solid red";

		return true;
	}
});

/*
 * <"*", "text">::onblur
 *
 * Handles the blur event for text nodes.
 *
 */
BrowserKit.ViewEvent({
	modelType:		["*", "text"],
	event:			"blur",

_does:
	function onBlur(eventDescription) 
	{
		this.style["outline"] = "";
	
		return true;
	}
});

/*
 * View<"*", "text">::translateOffset(anchorNode, anchorOffset)
 *
 * Translates the anchorNode / anchorOffset position of a view
 * into a model offset position.
 *
 */
HtmlEditor.TranslateOffset({
	type:	["*", "text"],
	
_does:
	function translateOffset(anchorNode, anchorOffset)
	{
		return anchorOffset;
	}
});

//TODO: PARAGRAPH_VIEW, TRANSLATE_OFFSET richtig machen (codeview und so...)
