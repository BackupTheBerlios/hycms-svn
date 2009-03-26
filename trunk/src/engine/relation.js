/*
 * hyObjects(js)
 *
 * Relation operations
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
 
function _relationToArrayInternal(relation, option_state)
{
	var relation_names = [];

	for (var r_idx = 0; r_idx < relation.length; r_idx ++) {
		var option_symbol = "";
	
		// Use correct option symbol
		if ((option_state == null) || (option_state == ""))
			option_symbol = (relation[r_idx].is_option ? "?" : "") + (relation[r_idx].is_variadic ? "~" : "");
		else if (option_state == "?")
			option_symbol = "?";
		else if (option_state == "?~")
			option_symbol = "?~";			
		else if (option_state == "~?")
			option_symbol = "~?";			
		else if (option_state == "!")
			option_symbol = "";

		// Print option
		relation_names.push(option_symbol + relation[r_idx].name);
	}

	return relation_names;
}
 
/*
 * Object::_relationToArray(symbol, idx, is_ordered, option_state)
 *
 * Converts a relation of the current object to a list of terms. The
 * relation has the given symbol and index. "is_ordered" defines whether it
 * is an ordered or unordered relation.
 *
 * The parameter "option_state" determines, how option should be printed:
 *
 *	null, ""		Leave options as in relation
 *	"?"				All optional
 *	"!"				All non-optional
 *
 * Return value:
 *		array			Representation of the relation as array (ordering is preserved)
 *		null			Relation does not exist
 */
Object.prototype._relationToArray = function(symbol, idx, is_ordered, option_state) 
{
	var relation = is_ordered ? this.__orderedRelations : this.__unorderedRelations;

	if ((relation != null) && (relation[symbol] != null) && (relation[symbol][idx] != null)) {
		var context = "";
		var relation_names = [];
		
		relation = relation[symbol][idx];
		
		return _relationToArrayInternal(relation, option_state);
	}
	
	return null;
}

/*
 * Array::_arrayToRelationString(symbol, is_ordered)
 *
 * Creates a relation-like string representation of a list of terms. 
 * 
 */
Array.prototype._arrayToRelationString = function(symbol, is_ordered)
{
	if (is_ordered) {

		if (this.length == 1) {
			if (symbol == "<")
				return this[0];
			else
				return ". "+symbol+" "+this[0];
		}
		 else {
			return this.join(" "+symbol+" ");
		}

	}
	else {
		return symbol.substr(0, symbol.length/2) + this.join(", ") + symbol.substr(symbol.length/2);
	}
}

/*
 * Object::_relationToString(symbol, idx, is_ordered, option_state)
 *
 * Converts a relation of the current object to a string representation. The
 * relation has the given symbol and index. "is_ordered" defines whether it
 * is an ordered or unordered relation.
 *
 * The parameter "option_state" determines, how option should be printed:
 *
 *	null, ""		Leave options as in relation
 *	"?"				All optional
 *	"!"				All non-optional
 *
 * Return value:
 *		string			Representation of the relation
 *		null			Relation does not exist
 */
Object.prototype._relationToString = function(symbol, idx, is_ordered, option_state) 
{
	var list = this._relationToArray(symbol, idx, is_ordered, option_state);
	
	if (list != null) {
		return list._arrayToRelationString(symbol, is_ordered);
	}

	return null;
}

/*
 * Object::_variationsToArrays(term, option_state)
 *
 * Converts a term variation to a list of variation lists.
 *
 */
Object.prototype._variationsToArrays = function(term, option_state)
{
	var lists = [];

	if (    (this.__orderedRelations == null) 
		 || (this.__orderedRelations["<"] == null)
		 || (this.__orderedRelations["<"].variations == null) 
		 || (this.__orderedRelations["<"].variations["#"+term] == null) 		 
		)
		return null;
		
	var variations = this.__orderedRelations["<"].variations["#"+term];

	for (var idx = 0; idx < variations.length; idx ++) {
		lists.push(_relationToArrayInternal(variations[idx].list, option_state));
	}
	
	return lists;
}

/*
 * Object::_hasTerm(symbol, idx, is_ordered, term)
 *
 * Tests whether the given term is part of the given ordered or unordered
 * relation "symbol" with index "idx".
 *
 * Return value:
 *		Boolean
 */
Object.prototype._hasTerm = function(symbol, idx, is_ordered, term)
{
	var relation = is_ordered ? this.__orderedRelations : this.__unorderedRelations;

	if ((relation != null) && (relation[symbol] != null) && (relation[symbol][idx] != null)) {
		var context = "";
		var relation_names = [];
		
		relation = relation[symbol][idx];
		
		for (var r_idx = 0; r_idx < relation.length; r_idx ++) {
			if (relation[r_idx].name == term)
				return true;	
		}
	}
	
	return false;
}

/*
 * Object::_inOrderOf(term, symbol, idx=0)
 *
 * Tests whether the given term is part of the given ordered relation
 * "symbol".
 *
 * Return value:
 *		Boolean
 */
Object.prototype._inOrderOf = function(term, symbol, idx)
{
	return this._hasTerm(symbol, idx == null ? 0 : idx, true, term);
}

/*
 * Object::_insideOf(term, symbol, idx=0)
 *
 * Tests whether the given term is part of the given unordered relation
 * "symbol".
 *
 * Return value:
 *		Boolean
 */
Object.prototype._insideOf = function(term, symbol, idx)
{
	return this._hasTerm(symbol, idx == null ? 0 : idx, false, term);
}

/*
 * Object::_instanceOf(term, idx=0)
 *
 * Tests whether the given term is part of the first inheritance
 * relation of an object.
 *
 * Return value:
 *		Boolean
 */
Object.prototype._instanceOf = function(term, idx)
{
	return this._inOrderOf(term, "<", idx == null ? 0 : idx);
}

/*
 * Object::_getClassName()
 *
 * Returns the name of the most-specific term in the inheritance
 * hierarchy.
 *
 */
Object.prototype._getClassName = function()
{
	return this.__orderedRelations["<"][0][0].name;
}

/*
 * Object::_getOrderedRelationElement(relation, idx = 0, r_idx = 0)
 *
 * Returns the relation element from the given oredered relation "relation"
 * at position "idx". The r_idx-th relation will be taken. The relation 
 * element is a object with the following structure:
 *
 * {name: "term", is_option: BOOLEAN, is_variadic: BOOLEAN}
 *
 */
Object.prototype._getOrderedRelationElement = function(relation, idx, r_idx)
{
	if (idx == null)
		idx = 0;
		
	if (r_idx == null)
		r_idx = 0;

	if (    (this.__orderedRelations == null)
	     || (this.__orderedRelations[relation] == null)
	     || (this.__orderedRelations[relation][r_idx] == null)
	     || (this.__orderedRelations[relation][r_idx][idx] == null)
	   )
	   return null;

	return this.__orderedRelations[relation][r_idx][idx];
}

/*
 * Object::_getUnorderedRelationElement(relation, idx = 0, r_idx = 0)
 *
 * Returns the relation element from the given oredered relation "relation"
 * at position "idx". The r_idx-th relation will be taken. The relation 
 * element is a object with the following structure:
 *
 * {name: "term", is_option: BOOLEAN, is_variadic: BOOLEAN}
 *
 */
Object.prototype._getUnorderedRelationElement = function(relation, idx, r_idx)
{
	if (idx == null)
		idx = 0;
		
	if (r_idx == null)
		r_idx = 0;

	if (    (this.__unorderedRelations == null)
	     || (this.__unorderedRelations[relation] == null)
	     || (this.__unorderedRelations[relation][r_idx] == null)
	     || (this.__unorderedRelations[relation][r_idx][idx] == null)
	   )
	   return null;

	return this.__unorderedRelations[relation][r_idx][idx];
}
