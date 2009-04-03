/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
/*
 * HtmlView_renderChild(object[, def[, additional_def_string]])
 *
 * Same as "View_renderChild", but this function will append the request with
 * "<(~html)>; ?html < text" to ensure, that an HTML or text view will be
 * used.
 *
 * See:
 *		View_renderChild
 *
 */
function HtmlView_renderChild(object, def, additional_def_string)
{
	var additions = (additional_def_string == null) ? "" : "; " + additional_def_string;

	additions = "<(~html)>; ?html < text" + additions;
	
	return View_renderChild(object, def, additions);
}


/*
 * HtmlView_listInside(input, def[, parentType, iterateFunction(output, element, key)])
 *
 * Iterates over all elements of "input" and visualizes them as inline
 * elements of a paragraph. The definition "def" of the function call
 * has to be passed. The "parentType" determines the type
 * of the parent element in which the input should be visualized in. If
 * this parameter is not given, it will be taken from the first element of
 * the first ">()<"-relation, which is for HTML views normally the input
 * type.
 *
 * If iterateFunction is given, the output and the element will be passed to this function.
 * The outcome of "iterateFunction" will be concatenated to the return value. If iterateFunction
 * is not given, the output of each child nodes will just concatenated together.
 *
 * Returns:
 *	HTML view of the children of "input"
 *
 */
function HtmlView_listInside(input, def, parentType, iterateFunction)
{
	return View_listInside(input, def, parentType, HtmlView_renderChild, iterateFunction);
}

/*
 * HtmlView_uuid_attribute(object)
 *
 * Creates a UUID HTML-attribute for the given object.
 *
 * It will create an HTML attribute of the form:
 *
 *		uuid='OBJECT_UUID'
 *
 */
function HtmlView_uuid_attribute(object)
{
	return "uuid ='"+object.__uuid+"'";
}

/*
 * HtmlView_open_tag(tag, object, method[, attributes[, override_class]])
 *
 * Creates a opening HTML tag that is marked up with "tag". It will contain
 * a class='NAME' and a uuid attribute for "object". The NAME will be taken from the
 * term that was described by the first term of the first >()<-Relation in the
 * definition of "method"..
 *
 * It will create an HTML tag of the form:
 *
 *		<TAG class='NAME' uuid='OBJECT_UUID'>
 *
 * A string containing additional attributes can be passed to the function,
 * this will create a node in the form of:
 *
 *		<TAG class='NAME' uuid='OBJECT_UUID' ATTRIBUTES>
 *
 * If override_class is given, it will be used for the CSS class name.
 *
 */
function HtmlView_open_tag(tag, object, method, attributes, override_class)
{
	var class_name;

	// Get additional attributes
	if (attributes == null)
		attributes = "";
	else
		attributes = " "+attributes;

	// Get class name
	if (override_class != null)
		class_name = override_class;
	else
		class_name = method._getUnorderedRelationElement(">()<", 0, 0 ).name;

	return "<"+tag+" class='"+class_name+"' "+HtmlView_uuid_attribute(object)+attributes+">";
}

/*
 * HtmlView_tag(tag, object, method, content[, attributes[, override_class]])
 *
 * Creates a HTML tag that is marked up with "tag". It will contain
 * a class='NAME' and a uuid attribute for "object". The NAME will be taken from the
 * term that was described by the first term of the first >()<-Relation in the
 * definition of "method". The tag surrounds the given "content" string.
 
 * Return value:
 *  It will create an HTML tag of the form:
 *
 *		<TAG class='NAME' uuid='OBJECT_UUID'>CONTENT</TAG>
 *
 * A string containing additional attributes can be passed to the function,
 * this will create a node in the form of:
 *
 *		<TAG class='NAME' uuid='OBJECT_UUID' ATTRIBUTES>
 *
 *  The function will also call ._as("|?html < text") on the output string.
 *
 */
function HtmlView_tag(tag, object, method, content, attributes, override_class)
{
	return (  HtmlView_open_tag(tag, object, method, attributes, override_class)
		     + content
		     + "</"+tag+">")._as("|?html < text");
}

/*
 * HtmlView_autotag(tag, arguments, content[, attributes[, override_class]])
 *
 * Works like HtmlView_tag, but the parameters "object" and "method" will be
 * extracted from the parameter "arguments", which is the arguments-Object
 * of the calling function. The extraction will work the following way:
 *
 *	method:		arguments.callee
 *	object:		The element of the input-Parameter (1st parameter of the arguments array)
 *				which is described by the first term of the >()<-Relation of the
 *				def parameter (2nd parameter of the arguments array).
 *
 */
function HtmlView_autotag(tag, args, content, attributes, override_class)
{
	var method = args.callee;
	var object = args[0]._get(args[1]._getUnorderedRelationElement(">()<", 0, 0 ).name);

	return HtmlView_tag(tag, object, method, content, attributes, override_class);
}

/*
 * HtmlView_open_autotag(tag, arguments, content[, attributes[, override_class]])
 *
 * Works like HtmlView_open_tag, but the parameters "object" and "method" will be
 * extracted from the parameter "arguments", which is the arguments-Object
 * of the calling function. The extraction will work the following way:
 *
 *	method:		arguments.callee
 *	object:		The element of the input-Parameter (1st parameter of the arguments array)
 *				which is described by the first term of the >()<-Relation of the
 *				def parameter (2nd parameter of the arguments array).
 *
 */
function HtmlView_open_autotag(tag, args, content, attributes, override_class)
{
	var method = args.callee;
	var object = args[0]._get(args[1]._getUnorderedRelationElement(">()<", 0, 0 ).name);
	
	return HtmlView_open_tag(tag, object, method, content, attributes, override_class);
}

/*
 * String::html_text(text)
 *
 * Returns "text" in a form that can be used inside a HTML document. This means:
 *
 * - all occu < and > are replaced by &lt; and &gt;.
 * - all \n are replaced by <br/>
 * 
 */
String.prototype.html_text = function HtmlView_String_html_text(text)
{
	return this.valueOf()
			.replace(/\</g, "&lt;")
			.replace(/\>/g, "&gt;")
			.replace(/\n/g, "<br />");
}

