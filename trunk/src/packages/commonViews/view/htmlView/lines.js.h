/*
 * HtmlView_renderLine(element, replacements)
 *
 * Renders a given string to a HTML representation with respect to the
 * given replacement table.
 *
 * See:
 *	HtmlView_renderCode
 *
 */
function HtmlView_renderLine(element, replacements) 
{
		var code_line;

		code_line = element.valueOf().replace(/\&/g, "&&").replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
		
		for (var idx = 0; idx < replacements.length; idx ++) {
			var replacement = replacements[idx];
			var css_type = "code_highlight_"+replacement.type.toLowerCase();
			
			code_line = code_line.replace(replacement.regexp, "$1<span class='"+css_type+"'>$2</span>$3");
		}
		
		return code_line;
}

/*
 * HtmlView_renderCode(input, replacements)
 *
 * Shows the content of "input" as code snippet. For each line, the given set
 * the replacement-table will be used to replace a certain piece of code by
 * a highlighting using regular expressions. The replacement table is a list of
 * elements of the form:
 *
 * {regexp: REGEXP, type: TYPE},
 *
 * Whereas REGEXP is the regular expression used to replace the input. The REGEXP
 * is of the Form (BEFORE_HIGHLIGHT)(HIGHLIGHT)(AFTER_HIGHLIGHT), so the references 1 and 3
 * give the text before/after the match and the reference 2 selects the text
 * to be highlighted.
 *
 * The TYPE can be one of the following:
 *
 * literal, expression, type, operator, parenthesis, comment, label
 *
 * Example:
 *
 * {regexp: /([^a-zA-Z0-9])(while)([^a-zA-Z0-9])/g, type: "expression"}
 *
 * TODO: We need an EBNF-based parser. Perhaps it would be better to store the
 *		 highlighting profile in an external file that will be selected according
 *		 to the input type, to make this more flexible to the user...
 *
 * REMEMBER:	A regexp handling & in a language have to replace &&!
 *
 */
function HtmlView_renderCode(input, replacements)
{
	var output = "";

	for (var idx = 0; idx < input.length; idx ++) {
		output += "<span class='code_line_nr' style='-moz-user-select: none;'>"+ (idx+1) + "</span>" + HtmlView_renderLine(input[idx], replacements) + "<br/>";
	}

	return output._tag({tag: "div", object: input});
}

