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
 * [declarator]<type>	Tagging::construct( [initializer == <initializer>] ) ==> [<type>]
 *
 * Declarator:
 *		The declarator is parameterized by <type>, which specifies the type of the object to create.
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
Model.Construct = buildDeclarator("construct", 
{
	_this: 				"list",
	
	_generic_type:		function(type) {
							return {
									_output:					type,
									_max: 						"this.__understoodAs('"+type.join("', '")+"')",
									
									_optional_initializer:		type,
							};
						}
});

