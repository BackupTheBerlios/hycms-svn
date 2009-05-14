/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
//
// DocumentInformation view
//
HtmlView.View(
	{_this:		["*", "document_information", "*", "list"]},
	
	function HtmlView_DocumentInformation(request)
	{
		var output_header = "";
		var output_items = "";

		for (var idx = 0; idx < this.length; idx ++)
		{
			var element = this[idx];
				
			// Display all inline elements in one line
			if (!element.__is("list")) {
				output_header += "<span class='document_information_head_item'>";
				output_header += element._view();
				output_header += "</span>,&nbsp;";		
			} else {
				output_items += "<div class='document_information_item'>";
				output_items += element._view();
				output_items += "</div>";		
			}			
		}

		return (  "<div class='document_information_head'>"+ output_header.substr(0, output_header.length-7) +"</div>"
				+ output_items
			   )._tag({tag: "div", object: this});
	}

);


//
// Abstract view
//
HtmlView.View(
	{_this:		["*", "abstract", "*", "paragraph", "*", "list"]},
	
	function HtmlView_Paragraph(request) 
	{
		return this._taggedIterate({tag: "p"});
	}
);


//
// Version view
//
HtmlView.View(
	{_this:		["*", "version", "*", "text"]},

	function HtmlView_Version()
	{
		var text = this._htmlText();
		
		text = "Version "+text;
	
		return text._tag({tag: "span", object: this});
	}
);

