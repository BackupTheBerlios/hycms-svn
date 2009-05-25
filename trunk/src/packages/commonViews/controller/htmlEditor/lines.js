/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
/*
 * <"*", "code", "lines", "list">::onfocus
 *
 * Handles the focus event for text nodes.
 *
 */
BrowserKit.ViewEvent({
	modelType:		["*", "code", "lines", "list"],
	event:			"focus",

	_whereas:		["eventDescription.parentNotification == false"],

_does:
	function onFocus(eventDescription) 
	{
		this.style["outline"] = "5px solid red";

		return true;
	}
});

/*
 * <"*", "code", "lines", "list">::onblur
 *
 * Handles the blur event for text nodes.
 *
 */
BrowserKit.ViewEvent({
	modelType:		["*", "code", "lines", "list"],
	event:			"blur",

_does:
	function onBlur(eventDescription) 
	{
		this.style["outline"] = "";
	
		return true;
	}
});

/*
 * View<"*", "code", "lines", "list">::translateOffset(anchorNode, anchorOffset)
 *
 * Translates the anchorNode / anchorOffset position of a view
 * into a model offset position.
 *
 */
HtmlEditor.TranslateOffset({
	type:	["*", "code", "lines", "list"],
	
_does:
	function translateOffset(anchorNode, anchorOffset)
	{
		return anchorOffset;
	}
});

