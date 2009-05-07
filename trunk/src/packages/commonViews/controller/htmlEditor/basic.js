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
	["*", "structure"], null,

	function HtmlView_Structure(lastFocussed, eventDescription) 
	{
		this.style["outline"] = "1px solid red";
	
		return true;
	}
);

HtmlEditor.LostFocus(
	["*", "structure"], null,

	function HtmlView_Structure(editor, otherNode) 
	{
		this.style["outline"] = "";
	
		return true;
	}
);

//
// List view
//
HtmlEditor.ReceiveFocus(
	["*", "list"], null,

	function HtmlView_List(lastFocussed, eventDescription) 
	{
		this.style["outline"] = "1px solid red";
	
		return true;
	}
);

HtmlEditor.LostFocus(
	["*", "list"], null,

	function HtmlView_List(editor, otherNode) 
	{
		this.style["outline"] = "";
	
		return true;
	}
);

//
// Plain text view
//		 
HtmlEditor.ReceiveFocus(
	["*", "text"], null,

	function HtmlView_Text(lastFocussed, eventDescription) 
	{
		this.style["outline"] = "1px solid red";
	
		return true;
	}
);

HtmlEditor.LostFocus(
	["*", "text"], null,

	function HtmlView_Text(editor, otherNode) 
	{
		this.style["outline"] = "";
	
		return true;
	}
);

