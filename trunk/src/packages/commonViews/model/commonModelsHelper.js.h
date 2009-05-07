/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * Common models helper functions
 *
 */
/*
 * ModelConstruct_declare( type, whereas, func )
 *
 * Declares a standard function "construct" with the implementation "func"
 * for all objects creating a content object tagged with "type". Additional conditions
 * can be passed through the 'whereas' clause.
 *
 * This declarator declares 'func' with the following properties as method view:
 *
 * Purpose:
 *		func will be called, whenever an object with a certain tagging should be created
 *
 * This:
 * 		The tagging of the object to create
 *
 * Parameter:
 *		initialize		An initializer for the object (may be null)
 *
 * Return Value:
 * 		'func' returns the new object
 *

 */
function ModelConstruct_declare( type, whereas, func )
{
	if (whereas == null)
		whereas = [];
		
	if (!(whereas instanceof Array))
		whereas = [whereas];

	"construct".__declare(
		({
			input:		"initializer",
			output:		type,

			whereas:	["(input == null) ? true : (initializer.__taggedAs('"+type.join("','")+"') != -1)"].concat(whereas),
			max:		["this.__understoodAs('"+type.join("','")+"')"],
		
			does:		func
		})
	);
}

/*
 * ModelInsert_declare( type, whereas, func )
 *
 * Declares a standard function "insert" with the implementation "func"
 * for all objects tagged with "type". Additional conditions
 * can be passed through the 'whereas' clause.
 *
 * This declarator declares 'func' with the following properties as method view:
 *
 * Purpose:
 *		func will be called, whenever a child object should be inserted into a model
 *		object or one of its descendants.
 *
 * This:
 * 		The object, that should insert a new child object
 *
 * Parameter:
 *		position		A position identifier (normally a number)
 *		newChild		The child object to insert
 *		
 *
 * Return Value:
 * 		'func' returns normally 'this'. If it return 'null', the insertion
 *		was not possible
 *
 */
function ModelInsert_declare( type, whereas, func )
{
	if (whereas == null)
		whereas = [];
		
	if (!(whereas instanceof Array))
		whereas = [whereas];

	"construct".__declare(
		({
			input:		["position", "newChild"],
			output:		type,

			whereas:	["newChild != null", "position != null"].concat(whereas),
			max:		["this.__taggedAs('"+type.join("','")+"')"],
		
			does:		func
		})
	);
}

/*
 * ModelReplace_declare( type, whereas, func )
 *
 * Declares a standard function "replace" with the implementation "func"
 * for all objects tagged with "type". Additional conditions
 * can be passed through the 'whereas' clause.
 *
 * This declarator declares 'func' with the following properties as method view:
 *
 * Purpose:
 *		func will be called, whenever a child object of a model object 
 *		should be replaced by another object.
 *
 * This:
 * 		The object, that should replace a child object
 *
 * Parameter:
 *		position		A position identifier (normally a number)
 *		newChild		The new child object
 *		
 *
 * Return Value:
 * 		'func' returns the object itself. It might be that the call of 'insert' created
 *		a new instance of the object. If this is the case, the caller has to make sure,
 *		that "replace" is called at the parent object.
 *
 */
function ModelInsert_declare( type, whereas, func )
{
	if (whereas == null)
		whereas = [];
		
	if (!(whereas instanceof Array))
		whereas = [whereas];

	"construct".__declare(
		({
			input:		["position", "newChild"],
			output:		type,

			whereas:	["newChild != null", "position != null"].concat(whereas),
			max:		["this.__taggedAs('"+type.join("','")+"')"],
		
			does:		func
		})
	);
}
