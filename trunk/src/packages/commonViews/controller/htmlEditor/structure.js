/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */

/*
 * <"*", "structure">::onfocus
 *
 * Handles the focus event for structure nodes.
 *
 */
BrowserKit.ViewEvent({
	modelType:		["*", "structure"],
	event:			"focus",

	_whereas:		["eventDescription.parentNotification == false"],

_does:
	function onFocus(eventDescription) 
	{
		this.style["outline"] = "1px solid blue";

		return true;
	}
});

/*
 * <"*", "structure">::onfocus
 *
 * Handles the blur event for text nodes.
 *
 */
BrowserKit.ViewEvent({
	modelType:		["*", "structure"],
	event:			"blur",

_does:
	function onBlur(eventDescription) 
	{
		this.style["outline"] = "";
	
		return true;
	}
});

