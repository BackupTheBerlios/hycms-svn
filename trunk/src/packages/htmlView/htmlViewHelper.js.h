/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * HTML View helper functions
 *
 */
 
/*
 * HtmlView_declare( type, whereas, func )
 *
 * Declares a standard function "view" with the implementation "func"
 * for all objects with the type constraint "type". Additional conditions
 * can be passed through the 'whereas' clause.
 *
 * This declarator declares 'func' with the following properties as method view:
 *
 * - 'func' will be declared to fullfill the following features:
 *
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
 * 'func' returns the type ["html", "text"].
 *
 * 'func' has the optional parameter parentList, which contains the hierarchy of objects
 * the current object is shown in. 
 *
 * 'func' is optimal, if the evaluation of this.__taggedAs(type) is optimal.
 *
 */
function HtmlView_declare( type, whereas, func )
{
	"view".__declare(
		({
			features:	["recursive_context", "keep_method_conditions", "set_type_attribute", "set_uuid_attribute", "not_editable_attribute"],

			options:	{"parentList":		[]},
			output:		["html", "text"],

			whereas:	whereas,
			max:		["this.__taggedAs('"+type.join("','")+"')"],
		
			does:		func
		})
	);
}
 
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
	input:		["tag", "object"],
	features:	["recursive_context", "keep_method_conditions", "set_type_attribute", "set_uuid_attribute", "not_editable_attribute"],

	options:	{"attributes": []},
	output:		["html", "text"],

	whereas:	["tag.__is('text')", "this.__is('text')", "object.__uuid != null"],
	
	does:	

function HtmlView_tag(tag, object, request)
{
	// Build attribute string
	var attribStr = ""

	if (request.options.attributes.length > 0)
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
 * HtmlView_showInContext(object, parent, request) => [html, text]
 *
 * Calls the method 'view' for the given object. The 'request' object will be copied
 * and the parentList will be extended by 'parent'.
 *
 */
function HtmlView_showInContext(object, parent, request)
{
	var nRequest = request.copy();
	nRequest.options.parentList.push(parent);

	return object._view(nRequest);
}

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
	input:		["tag", "object"],
	features:	["recursive_context", "keep_method_conditions", "set_type_attribute", "set_uuid_attribute", "not_editable_attribute"],

	options:	{"parentList": [],  "viewFunction": function HtmlView_flatViewIterate(text) { return text; } },
	output:		["html", "text"],

	whereas:	["tag.__is('text')", "this.__is('list')", "viewFunction instanceof Function"],
	
	does:	 
function HtmlView_taggedIterate(tag, request, options)
{
	var output = "";
	var viewFunction = options.viewFunction;
	request.removeOption("viewFunction");
	
	for (var idx = 0; idx < this.length; idx ++)
	{
		var tmpOutput = HtmlView_showInContext(this[idx], this, request);

		output += viewFunction(tmpOutput, this[idx], idx);
	}

	return output._tag(tag, this);
}

});

/*
 * ["structure"]::taggedIterate(tag, [viewFunction, parentList]) => [html, text]
 *
 * See: ["list"]::taggedIterate
 *
 */
"taggedIterate".__declare({
	input:		["tag", "object"],
	features:	["recursive_context", "keep_method_conditions", "set_type_attribute", "set_uuid_attribute", "not_editable_attribute"],

	options:	{"parentList": [],  "viewFunction": function HtmlView_flatViewIterate(text) { return text; } },
	output:		["html", "text"],

	whereas:	["tag.__is('text')", "this.__is('structure')", "viewFunction instanceof Function"],
	
	does:	 

function HtmlView_taggedIterate(tag, request, options)
{
	var output = "";
	var viewFunction = options.viewFunction;
	request.removeOption("viewFunction");

	for (var idx in this)
	{
		if (idx[0] == '_')
			continue;
			
		var tmpOutput = HtmlView_showInContext(this[idx], this, request);
		output += viewFunction(tmpOutput, this[idx], idx);
	}

	return output._tag(tag, this);
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
	output:		["html", "text"],

	whereas:	["this.__is('text')"],
	
	does:	
	
function htmlText(text)
{
	return this.valueOf()
			.replace(/\</g, "&lt;")
			.replace(/\>/g, "&gt;")
			.replace(/\n/g, "<br />");
}

});

