/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */

//
// Structure view
//
EditorReceiveFocus_declare(
	["*", "structure"], null,

	function HtmlView_Structure(lastFocussed, eventDescription) 
	{
		this.style["outline"] = "1px solid red";
	
		return true;
	}
);

EditorLostFocus_declare(
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
EditorReceiveFocus_declare(
	["*", "list"], null,

	function HtmlView_List(lastFocussed, eventDescription) 
	{
		this.style["outline"] = "1px solid red";
	
		return true;
	}
);

EditorLostFocus_declare(
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
EditorReceiveFocus_declare(
	["*", "text"], null,

	function HtmlView_Text(lastFocussed, eventDescription) 
	{
		this.style["outline"] = "1px solid red";
	
		return true;
	}
);

EditorLostFocus_declare(
	["*", "text"], null,

	function HtmlView_Text(editor, otherNode) 
	{
		this.style["outline"] = "";
	
		return true;
	}
);

