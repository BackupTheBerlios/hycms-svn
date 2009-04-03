/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
 
//
// Structure view
//
({
	purpose:	"View",
	input:		">(structure)<; structure",
	output:     "<(text)>; text"
})._(

	function TextView_Structure(input) 
	{
		var output = "";

		input._get("structure")._iterate( function (element, key) {
			output += key+":\n";
			output += "|?TextView < View; <(?text)>; null < text"._send( element );
			output += "\n";
		});
	
		return output._as();
	}

);

//
// List view
//
({
	purpose:	"View",
	input: 		">(list)<; list",
	output:		"<(text)>; text"
})._(

	function TextView_List(input) 
	{
		var output = "";

		input._get("list")._iterate( function (element, key) {
			output += key+":\t";

			output += "|?TextView < View; <(?text)>; null < text"._send( element );
			output += "\n";
		});
	
		return output._as();
	}

);

//
// Plain text view
//
({
	purpose:	"View",
	input: 	    ">(text)<; text",
	output:		"<(text)>; text"
})._( 

	function TextView_Text(input) 
	{
		return input._get("text");
	}

);

