/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * [ REQUIREMENTS ]
 *
 * paragraph.js => (contextIterate)
 *
 */
 
//
// Table view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(~table)<; table < list",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_Table(input, def) 
	{
		var output = "";
		
		function _listInsideIterate(context, key, element) {
			output += HtmlView_renderChild( element, def, context );
		}

		View_contextIterate(input, def, _listInsideIterate);		
				
		return HtmlView_tag("table", input, def, output);
	}
		
);

//
// Table headline view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(~headline)<; headline < list; headline << table << ?*",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_TableHeadline(input, def) 
	{
		var output = "";
		var col_nr = 0;

		function _listInsideIterate(context, key, element) {
			col_nr ++;
			
			if (col_nr % 2)
				output += "<th class='std_table_odd'>";
			else
				output += "<th class='std_table_even'>";
				
			output += HtmlView_renderChild( element, def, context );
			output += "</th>";
		}

		View_contextIterate(input, def, _listInsideIterate);		
		
		return HtmlView_autotag("tr", arguments, output);
	}
		
);

//
// Table Line view
//
({
	purpose:	"View",
	conditions:	"{?recursive_context, ?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(~table_line)<; table_line < list; table_line << table << ?*",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_TableLine(input, def) 
	{
		var output = "";
		var col_nr = 0;

		function _listInsideIterate(context, key, element) {
			col_nr ++;
			
			if (col_nr % 2)
				output += "<td class='std_table_odd'>";
			else
				output += "<td class='std_table_even'>";
				
			output += HtmlView_renderChild( element, def, context );
			output += "</td>";
		}

		View_contextIterate(input, def, _listInsideIterate);		
		
		return HtmlView_autotag("tr", arguments, output);
	}
		
);
