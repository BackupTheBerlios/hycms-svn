/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 */
/*
 * View_renderChild(object[, def[, additional_def_string]])
 *
 * Calls a view action for the given "object". The function ensures,
 * that all elements of the first {}-relation of "def" will be passed to the
 * dispatcher.
 *
 */
function View_renderChild(object, def, additional_def_string)
{
	var conditions = "";
	var additions = (additional_def_string == null) ? "" : additional_def_string;

	if (def != null) {
		// Preserve conditions
		conditions = def._relationToString("{}", 0, false, "?~");
		
		if (conditions == null)
			conditions = "";
		else
			conditions = "; "+conditions;
	}
	
	if (additions.charAt(0) == "|")
		additions = substr(1);
	
	return ( ("|View; "+additions+" "+conditions)._send( object ) );
}

/*
 * View_contextIterate(input, def, traverseFunction[, parentType])
 *
 * Iterates over an input object. For each input element
 * the traverseFunction(context, key, element) will be called. The
 * function will receive the input element and a description
 * of the entire context in which the element has been analyzed
 * so far. The context will be built upon the <<-Relation
 * of the calling element. The definitions of all calling elements
 * will be added as optional definitions.
 *
 * The parentType is the type of the element, that should be iterated. If
 * parentType is not given, the first element of the >()<-Relation will be
 * taken.
 *
 */
function View_contextIterate(input, def, traverseFunction, parentType)
{
	var context = ""
	var conditions = "";
	var selectType = parentType;
	
	// Get parent type from >()< if not given
	if (parentType == null)
		parentType = def._getUnorderedRelationElement(">()<").name;
	
	// Additional context relations
	var contextList = def._relationToArray("<<", 0, true, "?~");
	
	if (contextList == null)
		contextList = ["?~"+parentType];

	// Build parent definitions
	var parentDefs = " ";

	for (var idx = 0; idx < contextList.length; idx ++) {
		var parentDefLists = def._variationsToArrays(contextList[idx].substr(2), "?");
		for (var l_idx = 0; l_idx < parentDefLists.length; l_idx ++) {
			parentDefs += "; "+parentDefLists[l_idx]._arrayToRelationString("<", true);
		}
	}
	parentDefs = parentDefs.substr(2);
	context = [""].concat(contextList)._arrayToRelationString("<<", true) + "; "+parentDefs;

	// Traverse input
	input._get(parentType)._iterate( function (element, key) {
		traverseFunction("?~"+element._getClassName()+context, key, element);
	});
}

/*
 * View_listInside(input, def[, parentType[, renderFunction(element, def, context), iterateFunction(output, element, key)])
 *
 * Iterates over all elements of "input" and visualizes them using "renderFunction". 
 * The definition "def" of the function call has to be passed. 
 * The "parentType" determines the type of the parent element in which the input should be 
 * visualized in. If this parameter is not given, it will be taken from the first element of
 * the first ">()<"-relation, which is for HTML views normally the input
 * type.
 *
 * If iterateFunction is given, the output and the element will be passed to this function.
 * The outcome of "iterateFunction" will be concatenated to the return value. If iterateFunction
 * is not given, the output of all subsequent calls of renderFunction will be just concatenated.
 *
 * If renderFunction is not given, View_renderChild will be used.
 *
 * Returns:
 *	View of the input object
 *
 */
function View_listInside(input, def, parentType, renderFunction, iterateFunction)
{
	var output = "";

	if (renderFunction == null)
		renderFunction = View_renderChild;

	function _listInsideIterate_Simple(context, key, element) {
			output += renderFunction( element, def, context );		
	}

	function _listInsideIterate(context, key, element) {
			output += iterateFunction( renderFunction( element, def, context ), element, key );
	}

	if (iterateFunction != null)
		View_contextIterate(input, def, _listInsideIterate, parentType);
	else
		View_contextIterate(input, def, _listInsideIterate_Simple, parentType);
		
	return output;
}
