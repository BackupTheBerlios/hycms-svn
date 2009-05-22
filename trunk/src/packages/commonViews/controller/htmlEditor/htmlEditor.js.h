/*
 * hyCMS
 * Copyright(C)2008 by Friedrich Gräter
 * Published under the terms of the Lesser GNU General Public License v2
 *
 * HTML Editor Controller helper functions
 *
 */
HtmlEditor = new Package();

/*
 * [declarator]<model_type>		Node<type>::translateOffset( anchorOffset ) ==> number
 *
 * Declarator:
 *		The declarator is parameterized by <type>, which specifies the type of the object shown by the view.
 *
 * Purpose:
 * 		Translates the anchorOffset coordinates of a view element to a numerical offset of the model object.
 *
 * Parameters:
 *		path:		List of objects along the path to the destination object
 *		pathAt:		The position of THIS in "path"
 *		offset:		The offset of the object
 *		child:		The object to insert		
 *
 * Return value:
 *		null		If inserting is not possible
 *
 *		TRUE		If inserting of the child object requires an update of the view of the current object
 *
 *		FALSE		If inserting of the child object does not require an immediate update of the view
 *
 *		[list]		If the child object could not be inserted because the parent is immutable or direct
 *					insertion is not possible for any other reason. The list contains an arbitrary number
 *					 of objects, that should replace the child object.
 *
 * --------------------------------------------------------------------------------------------------------
 *
 */
HtmlEditor.TranslateOffset = buildDeclarator("translateOffset", 
{
	_this:			"@Node",
	anchorOffset:	"number",

	_output:		"number",

	_generic_type:		function(type) {
							return {
									_whereas:		["this._getView() != null", "this._getView()._getModel() != null"],
									_max:			["this._getView()._getModel().__taggedAs('"+type.join("','")+"')"]
							};
						},
});

