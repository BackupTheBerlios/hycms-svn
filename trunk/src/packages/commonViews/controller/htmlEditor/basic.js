/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */

//
// Structure view
//
HtmlEditor.ReceiveFocus(
	{this:		["*", "structure"]},

	function structure(lastFocussed, eventDescription) 
	{
		this.style["outline"] = "1px solid red";

		return true;
	}
);

HtmlEditor.LostFocus(
	{this:		["*", "structure"]},

	function structure(editor, otherNode) 
	{
		this.style["outline"] = "";
	
		return true;
	}
);

//
// List view
//
HtmlEditor.ReceiveFocus(
	{this:		["*", "list"]},

	function list(lastFocussed, eventDescription) 
	{
		this.style["outline"] = "1px solid red";

		return true;
	}
);

HtmlEditor.LostFocus(
	{this:		["*", "list"]},

	function list(editor, otherNode) 
	{
		this.style["outline"] = "";
	
		return true;
	}
);

//
// Plain text view
//		 
HtmlEditor.ReceiveFocus(
	{this:		["*", "text"]},

	function text(lastFocussed, eventDescription) 
	{
		this.style["outline"] = "1px solid red";

		return true;
	}
);

HtmlEditor.LostFocus(
	{this:		["*", "text"]},

	function text(editor, otherNode) 
	{
		this.style["outline"] = "";
	
		return true;
	}
);

