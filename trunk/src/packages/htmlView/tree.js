/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
var tree_raised_string = "-";
var tree_closed_string = "+";

/*
 * HtmlView_Tree_toggle(event)
 *
 * Event handler for tree view raise/close-button.
 *
 */
function HtmlView_Tree_toggle(event)
{
	var target = event.target;

	//	Toggles visibility of different elements
	function __setDisplay(state)
	{
	 	var nodes = target.parentNode.parentNode.childNodes;

	 	for (var idx = 0; idx < nodes.length; idx ++) {
	 		var node = nodes[idx];
			var state_str;
			
			if (node.nodeName == "DIV")
				state_str = state ? "block" : "none";
			else
				state_str = state ? "inline" : "none";

	 		if (node.className == "tree_list")
	 		{
	 		   node.style.display = state_str;
	 		}
	 	}
	}

	if (target.raised == null) {
		target.raised = (target.innerHTML == tree_raised_string) ? (true) : (false);
	}

	// Toggle
	if (target.raised != true)
	{
		// Not raised
		target.innerHTML = tree_raised_string;
		target.raised = true;

		__setDisplay(true);		
	}
	 else {
		// Raised
	 	target.innerHTML = tree_closed_string;
		target.raised = false;
	 		 	
		__setDisplay(false);
	}

}

//
// Tree view
//
({
	purpose:	"View",
	conditions:	"{?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(tree)<; tree < structure",
	tree:		"[node_name, comment, raised, list]; node_name < text; child_nodes < list; comment < text; raised < boolean",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_Tree(input, def) 
	{
		var output = "";
		var tree = input._get("tree");
		var list = tree._get("child_nodes");
		var style_str = "";
		var button_str = tree_raised_string;

		function __getView(element) {
			if (tree._get(element) != null)
				return HtmlView_renderChild( tree._get(element), def );
			else
				return "";
		}

		if (tree._get("raised") == false) {
			style_str = "style='display:none;'";
			button_str = tree_closed_string;
		}

		output += "<span class='tree_name' >"
		output += "<span class='tree_toggle' onclick='HtmlView_Tree_toggle(event)'>"+button_str+"</span>";
		output += __getView("node_name") + "</span>";
		
		output += "<span class='tree_comment'>"+ __getView("comment") + "</span>";
		output += "<div "+style_str+" class='tree_list'>" 
					
		if (list != null) {
			var idx = 0;
		
			list._iterate( function (element, key) {
				if (idx % 2)
					output += "<div class='tree_list_item_odd'>" 
				else
					output += "<div class='tree_list_item_even'>" 				
				
				output += HtmlView_renderChild( element, def );
				output += "</div>"
				
				idx ++;
			});
	
		}
		output += "</div>";				

		return HtmlView_autotag("div", arguments, output);
	}


);

//
// Tree node view
//
({
	purpose:	"View",
	conditions:	"{?keep_method_conditions, ?set_uuid_attribute}",

	input:		">(tree_node)<; tree_node < structure",
	tree_node:	"[node_name, comment]; ?file_name < ?node_name < ?text; ?comment < ?text",
	output:		"<(~html)>; ?html < text"
})._(

	function HtmlView_TreeNode(input, def) 
	{
		var output = "";
		var node = input._get("tree_node");

		function __getView(element) {
			if (node._get(element) != null)
				return HtmlView_renderChild( node._get(element, def) );
			else
				return "";
		}

		output += "<span class='tree_name' >"
		output += __getView("node_name") + "</span>";
	
		output += "<span class='tree_comment'>"+ __getView("comment") + "</span>";

		return HtmlView_autotag("div", arguments, output);
	}


);

