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
	["*", "document_information", "*", "list"], null,
	
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
				output_header += HtmlView_showInContext(element, this, request);
				output_header += "</span>,&nbsp;";		
			} else {
				output_items += "<div class='document_information_item'>";
				output_items += HtmlView_showInContext(element, this, request);
				output_items += "</div>";		
			}			
		}

		return (  "<div class='document_information_head'>"+ output_header.substr(0, output_header.length-7) +"</div>"
				+ output_items
			   )._tag("div", this, HtmlView_tagRequest);
	}

);


//
// Abstract view
//
HtmlView.View(
	["*", "abstract", "*", "paragraph", "*", "list"], null,
	
	function HtmlView_Paragraph(request) 
	{
		return this._taggedIterate("p", request);
	}
);


//
// Version view
//
HtmlView.View(
	["*", "version", "*", "text"], null,

	function HtmlView_Version()
	{
		var text = this._htmlText();
		
		text = "Version "+text;
	
		return text._tag("span", this, HtmlView_tagRequest)
	}
);

