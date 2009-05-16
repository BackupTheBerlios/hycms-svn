/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */

//
// Structure view
//
BrowserKit.ViewEvent({
	modelType:		["*", "structure"],
	event:			"focus",

	_whereas:		["eventDescription.parentNotification == false"],

_does:
	function structure(eventDescription) 
	{
		this.style["outline"] = "1px solid red";

		return true;
	}
});

BrowserKit.ViewEvent({
	modelType:		["*", "structure"],
	event:			"blur",

_does:
	function structure(eventDescription) 
	{
		this.style["outline"] = "";
	
		return true;
	}
});

//
// List view
//
BrowserKit.ViewEvent({
	modelType:		["*", "list"],
	event:			"focus",

	_whereas:		["eventDescription.parentNotification == false"],

_does:
	function list(eventDescription) 
	{
		this.style["outline"] = "1px solid red";

		return true;
	}
});

BrowserKit.ViewEvent({
	modelType:		["*", "list"],
	event:			"blur",

_does:
	function list(eventDescription) 
	{
		this.style["outline"] = "";
	
		return true;
	}
});

//
// Plain text view
//		 
BrowserKit.ViewEvent({
	modelType:		["*", "text"],
	event:			"focus",

	_whereas:		["eventDescription.parentNotification == false"],

_does:
	function text(eventDescription) 
	{
		this.style["outline"] = "1px solid red";

		return true;
	}
});

BrowserKit.ViewEvent({
	modelType:		["*", "text"],
	event:			"blur",

_does:
	function text(eventDescription) 
	{
		this.style["outline"] = "";
	
		return true;
	}
});


