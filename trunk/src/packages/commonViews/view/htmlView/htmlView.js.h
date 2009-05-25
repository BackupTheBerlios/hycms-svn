/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * HTML View helper functions
 *
 */
HtmlView = new Package();

HtmlView.tagFeatures = {_returns: ["html", "text"], _features: ["set_type_as_css_class", "set_type_attribute", "set_uuid_attribute"]};


/*
 * [declarator] OBJECT::view( [parentList] ) ==> [html, text]
 *
 * Purpose:
 * 		Shows OBJECT as HTML text. 
 *
 * Parameters:
 * 		The method may receive the additional parameter "parentList" which contains the context, the object should be seen in. 
 * 		The context is represented as a list of the parent elements of the given OBJECT.
 *
 * Return value:
 *		String tagged as [html, text]
 *
 * Features:
 *		recursive_context			The function passes the view context using the
 *									optional parameter 'parentList' to all subsequent
 *									calls of 'view'.
 *
 *		keep_method_conditions		The function passes all requested features of the method
 *									call to all subsequent calls of 'view'.
 *
 *		set_type_attribute			The function sets the attribute 'type' in every html output
 *									field.
 *
 *		set_uuid_attribute			The function sets the attribute 'uuid' in every html output
 *									field.
 *
 *		not_editable_attribute		The function will set the attribute "not_editable='yes'" to
 *									all HTML output nodes, which are not editable.
 *
 *		NOTE: The first five features will be automatically fulfilled, if the message implementation
 *			  uses the calls [text]::tag and [*]::taggedIterate. The first two features will be
 *			  automatically fulfilled by the HtmlView_showInContext function.
 *
 * Method prototypes:
 *		This method	provides a prototype for "view", "tag" and "taggedIterate" calls. It enforces
 *		that the "tag" call of the HtmlView pacakge will be used. It also enforces that 'view' and
 *		'taggedIterate' propagate the context and the features of the call to all recursive
 *		calls of these methods.	
 *
 * Example:
 *
 *		"Hallo Welt"._view();
 *
 *		May evaluate to:
 *
 *			<span uuid='###'>Hallo Welt</span>
 *
 * --------------------------------------------------------------------------------------------------------
 *
 */
HtmlView.View = buildDeclarator("view",
{
	_optional_parentList:	"list",
	_default_parentList:	[],

	_features:	["recursive_context", "keep_method_conditions", "set_type_as_css_class", "set_type_attribute", "set_uuid_attribute"],
	_output:	["html", "text"],
	
	_prototype_tag:				HtmlView.tagFeatures,
	_prototype_taggedIterate:	{parentList: Evaluates("parentList.concat([this])"), _features: Keep(), _returns: Keep()},
	_prototype_view:			{parentList: Evaluates("parentList.concat([this])"), _features: Keep(), _returns: Keep()}
});

/*
 * [text]::tag(tag, object[, attributes]) => [html, text]
 *
 * Creates a HTML "tag" around the "content" string. The
 * tag will have the UUID and type attribute of "object" and, if given,
 * any additional attributes from the given array "attributes". It also
 * sets the CSS-class to the class name of the object.
 *
 */
"tag".__declare({
	_this:		["*", "text"],
	tag:		"text",
	object:		"*",
	
	_optional_attributes:	"structure",
	_default_attributes:	{},
	
	_output:	HtmlView.tagFeatures._returns,
	_features:	HtmlView.tagFeatures._features,

	_whereas:	["object.__uuid != null"],
	
_does:	
	function HtmlView_tag(tag, object, attributes)
	{
		// Build attribute string
		var attribStr = ""

		if (attributes.length > 0)
			attribStr = attributes.join(" ");

		// Build type string
		var typeStr = "";

		if (object.__def == null)
			typeStr = __getJSTypeId();
		else
			typeStr = object.__def.join(",");
		
		// Build CSS class
		var css = "";

		if (object.__def == null)
			css = __getJSTypeId();
		else
			css = object.__def.join(" ");	

		return "<"+tag+" class='"+css+"' uuid='"+object.__uuid+"' type='"+typeStr+"'"+attribStr+">"+this+"</"+tag+">";
	}

});

/*
 * ["list"]::taggedIterate(tag, [viewFunction, parentList]) => [html, text]
 *
 * Iterates over all elements of 'this' and generates a view output using the method view().
 * 
 * For each element, the function 'viewFunction(output, key, element)' will be called. This
 * function receives the output of the view-method() of the child object and returns
 * HTML-Code to embed the view object inside the parent view. The function can receive the
 * parentList-Argument optionally. To all successive calls of 'view' it will pass a modified
 * parentList extended by 'this'.
 *
 * If viewFunction is not given, the output of all elements will directly concatenated.
 *
 * The function promisses to keep the same features as the HTML View declarator, if
 * the request-Object of the caller was passed to it.
 *
 */
"taggedIterate".__declare({
	_this:					["*", "list"],
	tag:					"text",

	_optional_viewFunction:	"function",
	_default_viewFunction:	function HtmlView_flatViewIterate(text) { return text; },
	
	_optional_parentList:	"list",
	_default_parentList:	[],
	
	_features:				["recursive_context", "keep_method_conditions", "set_type_attribute", "set_uuid_attribute", "set_type_as_css_class"],
	_output:				["html", "text"],

	_prototype_tag:			HtmlView.tagFeatures,
	_prototype_view:		{parentList: Keep(), _features: Keep(), _returns: Keep()},
	
_does:	 
	function HtmlView_taggedIterate(tag, viewFunction, parentList)
	{
		var output = "";
	
		for (var idx = 0; idx < this.length; idx ++)
		{
			var tmpOutput = this[idx]._view();

			output += viewFunction(tmpOutput, this[idx], idx);
		}

		return output._tag({tag: tag, object: this});
	}

});

/*
 * ["structure"]::taggedIterate(tag, [viewFunction, parentList]) => [html, text]
 *
 * See: ["list"]::taggedIterate
 *
 */
"taggedIterate".__declare({
	_this:					["*", "structure"],
	tag:					"text",

	_optional_viewFunction:	"function",
	_default_viewFunction:	function HtmlView_flatViewIterate(text) { return text; },
	
	_optional_parentList:	"list",
	_default_parentList:	[],
	
	_features:				["recursive_context", "keep_method_conditions", "set_type_attribute", "set_uuid_attribute", "set_type_as_css_class"],
	_output:				["html", "text"],

	_prototype_tag:			HtmlView.tagFeatures,
	_prototype_view:		{parentList: Evaluates("parentList.concat([this])"), _features: Keep(), _returns: Keep()},
	
_does:	 
	function HtmlView_taggedIterate(tag, viewFunction, parentList)
	{
		var output = "";
	
		for (var idx in this)
		{
			if (idx[0] == "_") continue;
	
			var tmpOutput = this[idx]._view();

			output += viewFunction(tmpOutput, this[idx], idx);
		}

		return output._tag({tag: tag, object: this});
	}

});

/*
 * [text]::htmlText() => [html, text]
 *
 * Returns "text" in a form that can be used inside a HTML document. This means:
 *
 * - all occu < and > are replaced by &lt; and &gt;.
 * - all \n are replaced by <br/>
 * 
 */
"htmlText".__declare({
	_this:			["*", "text"],
	_output:		["html", "text"],
	
_does:	
	function htmlText(text)
	{
		if (this.valueOf() == "")
			return "&nbsp;";
	
		return this.valueOf()
				.replace(/\</g, "&lt;")
				.replace(/\>/g, "&gt;")
				.replace(/\n/g, "<br />");
	}
});

