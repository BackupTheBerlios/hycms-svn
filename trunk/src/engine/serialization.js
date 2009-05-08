/*
 * hyJS
 *
 * Tagged object serialization
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
 
/*
 * Object::__build()
 *
 * Deserializes a serialized object and returns its
 * deserialized copy. A serialized object has the following
 * form for number, string, boolean and array objects:
 *
 *	{__def:	TAGLIST, __value: VALUE}
 *
 * Whereas TAGLIST is an ordered array of tags describing the object
 * and VALUE is the data of objects.
 *
 * If the object is of type Object or Array, __build will be applied
 * to all of its elements, not beginning with "_".
 *
 * If the object has no __def element, the type will be derived by the
 * __getJSTypeId function.
 *
 */
Object.prototype.__build = function()
{
	var valObject = this.__value;

	// Serialized structured object?
	if ((valObject == null) && (this.__def != null))
	{
		newObject = new Object();
	
		if (this.__def == null)
			newObject.__tag.apply(newObject, [__getJsTypeId(this)]);
		else
			newObject.__tag.apply(newObject, this.__def);

		
		// Apply __build recursivley
		for (var idx in this) {
			if (idx[0] != "_")
				newObject[idx] = this[idx].__build();
		}
		
		return newObject;
	}
	
	// Array?
	if (valObject instanceof Array)
	{
		var newObject = [];
		
		if (this.__def == null)
			newObject.__tag.apply(newObject, [__getJsTypeId(this)]);
		else
			newObject.__tag.apply(newObject, this.__def);

		for (var idx = 0; idx < valObject.length; idx ++) {
			newObject[idx] = valObject[idx].__build();
		}
		
		return newObject;
	}
	
	// First-order object?
	if (valObject == null)
		return this.__tag(__getJSTypeId(this));
	else
		return valObject.__tag.apply(valObject, this.__def);
}

/*
 * Object::__hibernate()
 *
 * Returns a hibernateable copy of the given object. This will
 * create an object of the form for String, Number, Boolean, Array:
 *
 *	{__def: TAGLIST, __value: VALUE}
 *
 * If the given String, Number, Boolean, Array has no definition, the
 * original value object will be returned.
 *
 * For object of the form:
 *
 *  {__def: TAGLIST, ... }
 *
 * Whereas ... are all elements of the object not beginning with "_".
 *
 * For other objects. For instances of Array and all non first-order
 * objects, the function __serialize() will be called for all child
 * objects.
 *
 */
Object.prototype.__hibernate = function()
{
	var def = this.__def;
	
	if (def != null)
		def = def.concat([]);

	// Serialization of first-order objects
	if (    ((this instanceof String)   || (this instanceof Number)   || (this instanceof Boolean)) 
		 // NOTE: typeof() required due to a bug of webkit
		 || ((typeof(this) == "string") || (typeof(this) == "number") || (typeof(this) == "boolean"))
	   )
	{
		if (def != null)
			return {__def: def, __value: this.valueOf()};
		else
			return this.valueOf();
	}
		
	// Serialization of lists
	if (this instanceof Array)
	{
		var value = [];
	
		for (var idx = 0; idx < this.length; idx ++) {
			value.push(this[idx].__hibernate());
		}

		if (def != null)		
			return {__def: def, __value: value};
		else
			return value;
	}
	
	// Serialization of structured objects
	var newObject = new Object(); 
	
	if (def != null)
		newObject.__def = def;
		
	for (var idx in this)
	{
		if (idx[0] != "_")
			newObject[idx] = this[idx].__hibernate();
	}
	
	return newObject;	
}

/*
 * Object::__clone()
 *
 * Creates a copy of the object and (recursivley) of its child
 * elements which are not prefixed by "_". The definition will
 * also be cloned. 
 *
 * The object prototype will not be copied!
 *
 */
Object.prototype.__clone = function()
{
	var nObject = new Object();

	// Copy definition object
	if (this.__def != null)
		nObject.__def = this.__def.__clone();

	// Copy elements
	for (var idx in this) {
		if (idx[0] == '_')
			continue;
			
		nObject[idx] = this[idx];
	}
	
	return nObject;
}

/*
 * Array::__clone()
 *
 * Creates a copy of an array object and (recursivley)
 * of its child elements.
 *
 */
Array.prototype.__clone = function()
{
	var nObject = new Array();

	if (nObject.__def != null)
		nObject.__def = this.__def.__clone();

	// Copy elements
	for (var idx=0; idx < this.length; idx ++) {
		nObject[idx] = this[idx];
	}

	return nObject; 
}

/*
 * Number::__clone()
 *
 * Creates a copy of a number object
 *
 */
Number.prototype.__clone = function()
{
	var nObject = new Number(this.valueOf());
	
	if (nObject.__def != null)
		nObject.__def = this.__def.__clone();
	
	return nObject; 
}

/*
 * String::__clone()
 *
 * Creates a copy of a string object
 *
 */
String.prototype.__clone = function()
{
	var nObject = new String(this.valueOf());
	
	if (nObject.__def != null)
		nObject.__def = this.__def.__clone();
	
	return nObject; 
}

/*
 * Boolean::__clone()
 *
 * Creates a copy of a string object
 *
 */
Boolean.prototype.__clone = function()
{
	var nObject = new Boolean(this.valueOf());
	
	if (nObject.__def != null)
		nObject.__def = this.__def.__clone();
	
	return nObject; 
}

/*
 * Function::__clone()
 *
 * Since function objects can not be copied, just a reference
 * to the function will be returned.
 *
 */
Function.prototype.__clone = function()
{
	return this; 
}

/*
 * Array::__last(n = 1)
 *
 * Returns the nth element from the end of an array.
 *
 */
Array.prototype.__last = function(n)
{
	if (n == null)
		n = 1;

	return this[this.length - n];
}

