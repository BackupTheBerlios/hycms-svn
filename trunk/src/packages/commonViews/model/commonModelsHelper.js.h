/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * Common models helper functions
 *
 */
Model = new Package();
 
/*
 * [declarator] Model::Construct( type, initializer, whereas, method_body )
 *
 * This declarator will register an implementation of the method "Construct" with the given method_body.
 * The applicability of the method can be restricted by the parameters <type>, <initializer> and <whereas>. The method
 * declared by this declarator has the following syntax and semantics:
 *
 * --------------------------------------------------------------------------------------------------------
 *
 * Tagging::construct( [initializer == <initializer>] ) ==> [<type>]
 *
 * Purpose:
 * 		This method will be called, if a new object should be created. The method can be called on all arrays,
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

