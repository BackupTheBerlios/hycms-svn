/*
 * hyObjects(js)
 *
 * Test suite
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
var articleViewTest =
{
	"Document information view":
		function()
		{
			var abc_text = "abc"._as("|text");
			var abc = [abc_text]._as("|?paragraph < list");
			var def = "def"._as("|?recursion_test < text");
		
			console.assert( testView( [abc, def],
									  "|?document_information < list",
									    "<div class='document_information' uuid='$UUID'>"
									  	+ "<div class='document_information_head'>"
									  		+ "<span class='document_information_head_item'>"
									  		+ "<span class='recursion_test' uuid='"+def.__uuid+"' recursion_test='true'>def</span>"
									  		+ "</span>"
									  	+ "</div>"
									  	+ "<div class='document_information_item'>"
									  		+ "<p class='paragraph' uuid='"+abc.__uuid+"'><span class='text' uuid='"+abc_text.__uuid+"'>abc</span></p>"
									  	+ "</div>"
									  + "</div>"
									)
						  );
		}
}
