/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
 
/*
 * <"*", "list">::onfocus
 *
 * Handles the focus event for text nodes.
 *
 */ 
BrowserKit.ViewEvent({
	modelType:		["*", "list"],
	event:			"focus",

	_whereas:		["eventDescription.parentNotification == false"],

_does:
	function onFocus(eventDescription) 
	{
		this.style["outline"] = "1px solid green";

		return true;
	}
});

/*
 * <"*", "list">::onblur
 *
 * Handles the blur event for text nodes.
 *
 */
BrowserKit.ViewEvent({
	modelType:		["*", "list"],
	event:			"blur",

_does:
	function onBlur(eventDescription) 
	{
		this.style["outline"] = "";
	
		return true;
	}
});

