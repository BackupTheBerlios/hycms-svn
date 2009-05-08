/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * Common models helper functions
 *
 */
var Model = new Package();

/*
 * [declarator] Model::Construct <type, initializer, whereas, method_body>
 *
 * This declarator will register an implementation of the method "construct" with the given method_body.
 * The applicability of the method can be restricted by the parameters <type>, <initializer> and <whereas>. The method
 * declared by this declarator has the following syntax and semantics:
 *
 * --------------------------------------------------------------------------------------------------------
 *
 * Tagging::construct( [initializer == <initializer>] ) ==> [<type>]
 *
 * Purpose:
 * 		Creates and initializes a new object. The method can be called on all arrays,
 *		containing a tagging describing the object to create. An additional initializer can be passed for
 *		prototyping the object.
 *
 * Applicability:
 *		This method is applicable on all arrays containing the tagging <type>.
 *
 * Parameters:
 *		initializer		A prototype for the object or 'null', if a build-in prototype should be used.
 *
 * Return value:
 *		The constructed object tagged by the given <type>.
 *
 * Example:
 *		var addr = ["?address_book", "list"]._construct();
 *
 *		Creates a new object tagged with 'address_book' according to its construction function. If there
 *		is no constructor available for 'address_book' a list will be created.
 *
 * --------------------------------------------------------------------------------------------------------
 *
 */
Model.Construct = function( type, initializer, whereas, func )
{
	if (whereas == null)
		whereas = [];
		
	if (!(whereas instanceof Array))
		whereas = [whereas];

	"construct".__declare(
		({
			options:	{"initializer":	initializer},
			output:		type,

			whereas:	["(__options.initializer == null) ? true : (__options.initializer.__taggedAs('"+type.join("','")+"') != -1)"].concat(whereas),
			max:		["this.__understoodAs('"+type.join("','")+"')"],
		
			does:		func
		})
	);
}

/*
 * [declarator] Model::Merge( type, part_type, position_type, whereas, method_body )
 *
 * This declarator will register an implementation of the method "merge" with the given method_body.
 * The applicability of the method can be restricted by the parameters <type>, <part_type>, <position_type>,
 * and <whereas>. The method declared by this declarator has the following syntax and semantics:
 *
 * --------------------------------------------------------------------------------------------------------
 *
 * OBJECT::merge( part, position ) ==> [replacement_list, list]
 *
 * Purpose:
 * 		Merges the object 'part' (which is of type <part_type>) into OBJECT at the given
 *		position. Whereas the type of "position" depends on <position_type>. The function returns
 *		a list, representing the object after merge. This can be:
 *
 *		- An empty list, if the object is not mergeable
 *		- A list of length 1, if "part" was sucessfully merged to 'position'
 *		- A list of length 3, if the merging of "part" result in splitting the original object
 *		  to the form of [ OBJECT[0...position], part, OBJECT[position+1, ..., SIZE] ]
 *
 *		The object returned in the list can be the original object or a new instance of the object.
 *
 * Applicability:
 *		This method is applicable on all OBJECT tagged with <type> and all parameters 'part' tagged with
 *		<part_type>. The position should be tagged with <position_type>. The method will only be called, 
 *		if <whereas> is satisfied or null.
 *
 * Parameters:
 *		part			The object, that should be merged
 *		position		The position inside OBJECT, where 'part' should be merged too. The semantics of
 *						position is specific to OBJECT.
 *
 * Return value:
 *		A list representing the result of the merge (see above).
 *
 * Example:
 *		var data = "Hello World"._construct("Foo ", 0);
 *
 *		Should return a list ["Foo Hello World"].
 *
 *		var data = "Hello World"._construct([1,2,3], 6);
 *
 *		Should return a list ["Hello ", [1,2,3], "World"]
 *
 * --------------------------------------------------------------------------------------------------------
 *
 */
Model.Merge = function( type, part_type, position_type, whereas, func )
{
	"merge".__declare(
		({
			input:		["part", "position"],
			output:		["replacement_list", "list"],

			whereas:	whereas,
			max:		["this.__taggedAs('"+type.join("','")+"')",
						 "part.__taggedAs('"+part_type.join("','")+"')",
						 "position.__taggedAs('"+position_type.join("','")+"')"
						],
		
			does:		func
		})
	);
}

/*
 * [declarator] Model::Remove( type, position_type, whereas, method_body )
 *
 * This declarator will register an implementation of the method "remove" with the given method_body.
 * The applicability of the method can be restricted by the parameters <type>, <part_type>, <position_type>,
 * and <whereas>. The method declared by this declarator has the following syntax and semantics:
 *
 * --------------------------------------------------------------------------------------------------------
 *
 * OBJECT::remove( position, count ) ==> <type>
 *
 * Purpose:
 * 		Removes 'count' child objects of OBJECT at the given 'position'.
 *
 * Applicability:
 *		This method is applicable on all OBJECT tagged with <type>. The parameter 'position' is of the
 *		given <position_type>. The method will be only called if 'whereas' is satisfied or null.
 *
 * Parameters:
 *		position		The start position of the deletion. The type depends on OBJECT.
 *		count			The count of elements to delete after this position.
 *
 * Return value:
 *		The object after the modification. This can be the original object or a new instance of it.
 *
 * Example:
 *		var data = "Hello World"._remove(0, 6);
 *
 *		Should return "World"
 *
 *		var data = [1,2,3]._remove(1,2)
 *
 *		Should return [1]
 *
 * --------------------------------------------------------------------------------------------------------
 *
 */
Model.Remove = function( type, position_type, whereas, func )
{
	if (whereas == null)
		whereas = [];
		
	if (!(whereas instanceof Array))
		whereas = [whereas];

	"remove".__declare(
		({
			input:		["position", "count"],
			output:		type,

			whereas:	["count.__taggedAs('number')"].concat(whereas),
			max:		["this.__taggedAs('"+type.join("','")+"')",
						 "position.__taggedAs('"+position_type.join("','")+"')"
						],
		
			does:		func
		})
	);
}

