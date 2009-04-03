/*
 * hyObjects(js)
 *
 * Definitions handling
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
var session_uuid = 0;
 
function MissingPrefixError(message)
{
//	console.trace();
	this.message = message;
}
MissingPrefixError.prototype = new Error();
 
function InvalidDefinitionError(message, fileName, lineNumber)
{
//	console.trace();
	this.message = message;
}
InvalidDefinitionError.prototype = new Error();

function OverloadingDefinitionError(message)
{
//	console.trace();
	this.message = message;
}
OverloadingDefinitionError.prototype = new Error();

function VariadicInheritanceError(message)
{
//	console.trace();
	this.message = message;
}
VariadicInheritanceError.prototype = new Error();

/*
 * Object::__each(callback)
 *
 * Iterates each non-prototype element in an object
 * and executes "callback(element, key)" for each element of it.
 *
 */
Object.prototype.__each = function(callback)
{
	var i = 0;

	for (var id in this) {
		if (this[id] == this.__proto__[id])
			continue;
			
		if (id.substr(0,2) == "__")
			continue;

		i ++;
			
		if (callback(this[id], id) == -1)
			return i;
	}
	
	return i;
}

/*
 * Object::__appendTerms(relation_list, expressions, no_variadic)
 *
 * Appends all terms from the given array "expressions" to the 
 * relation list "relation_list". For each term the relation_list
 * will be extended by an tuple: (name, is_option).
 *
 * If "no_variadic" is true, no variadic terms will be allowed and 
 * false will be returned.
 *
 * Return value:
 *		true		Success
 *		false		Variadic term in non-variadic list
 *
 */
Object.prototype.__appendTerms = function(relation_list, expressions, no_variadic)
{
	// [OPT] Count options
	relation_list.__options = 0;
	// [END OPT] Count options

	// Build relation table
	for (var idx = 0; idx < expressions.length; idx ++) {
		var term_expression = expressions[idx];
		var matched = term_expression.match(/^(\?|~|~\?|\?~)?([A-Za-z0-9_\-.]+|\*|\+)$/);

		// ? is not allowed inside a term and not allowed twice per term
		if (matched == null)
			throw new InvalidDefinitionError("Option operator at wrong position: "+term_expression);

		if (matched[1] == null)
			matched[1] = "";

		var term = matched[2];
		var is_option = matched[1].indexOf("?") != -1;
		var is_variadic = matched[1].indexOf("~") != -1;

		// Variadic is not allowed in general
		if (no_variadic && is_variadic)
			return false;

		// Variadic * is not allowed
		if ((term == "*") && (is_variadic))
			throw new InvalidDefinitionError("Variadic * is not allowed: "+term_expression);

		// Only add it, if not a null term
		if (term != ".") {
			var term_descriptor = {"name": term, "is_option": is_option, "is_variadic": is_variadic};
			
			// Put relation element
			relation_list.push(term_descriptor);

			// [OPT] Count options
			if (is_option)
				relation_list.__options ++;
			// [END OPT] Count options
		}
	}
	
	return true;
}

/*
 * Object::__parseOrdered(relation_string)
 *
 * Parses a given relation string as an ordered relation
 * and creates all required data structures for it.
 *
 */
Object.prototype.__parseOrdered = function(relation_string)
{
	// Get the relation symbol
	var symbols = relation_string.match(/[^\~?*+_\-0-9a-zA-Z.]+/g);
	var symbol;
	var term_expressions;

	if (symbols == null) {
		// No symbols, so it is a singular inheritance relation

		symbol = "<";
		term_expressions = [relation_string];
	
		// No empty relations allowed
		if (relation_string == "")
			throw new InvalidDefinitionError("Empty relation given.");
	}
	 else {
		// There is a symbol, so analyse it
		symbol = symbols[0];
	
		// Test if all relation symbols are the same
		for (var idx = 0; idx < symbols.length; idx ++) {
			var list_sym = symbols[idx];

			if (list_sym != symbol)
				throw new InvalidDefinitionError("Changing symbol in ordered relation: "+symbol+" <> "+list_sym);
		}
	
		// Get all term expressions
		term_expressions = relation_string.split(symbol);
	}
	
	// Setup relation table
	var list = new Array();
	var variadic_not_allowed = (symbol == "<");
	
	var valid_variadic = this.__appendTerms(list, term_expressions, variadic_not_allowed);
	
	if (!valid_variadic)
		throw new VariadicInheritanceError("Variadic inheritance not allowed - "+relation_string);
	
	if (this.__orderedRelations[symbol] == null) {
		this.__orderedRelations[symbol] = new Array();
		this.__orderedRelations[symbol].variations = new Object();
	}
		
	this.__orderedRelations[symbol].push(list);
	
	for (var r_idx = 0; r_idx < list.length; r_idx ++) {
		if (this.__orderedRelations[symbol].variations["#"+list[r_idx].name] == null)
			this.__orderedRelations[symbol].variations["#"+list[r_idx].name] = new Array();

		this.__orderedRelations[symbol].variations["#"+list[r_idx].name].push ( {"list": list, "position": r_idx} );
	}
	
	return list;	
}

/*
 * Object::__parseUnordered(relation_string)
 *
 * Parses a given relation string as an ordered relation
 * and creates all required data structures for it.
 *
 */
Object.prototype.__parseUnordered = function(relation_string)
{
	// Get the relation symbol
	var symbols = relation_string.match(/[^~,._\-?*+0-9a-zA-Z]+/g);

	// No relation symbols found
	if (symbols.length < 2)
		throw new InvalidDefinitionError("Missing relation symbol in unordered Relation - "+relation_string);

	var begin_symbol = symbols[0];
	var end_symbol = symbols[1];
	var symbol = begin_symbol+end_symbol;
	
	// More than begin and end symbol
	if (symbols.length > 2)
		throw new InvalidDefinitionError("Invalid literal found - "+symbols[2]+" in "+relation_string);
	
	// Begin and end symbol have to be symmetric
	if (begin_symbol.length != end_symbol.length)
		throw new InvalidDefinitionError("Relation symbols not symmetric - "+begin_symbol+" vs. "+end_symbol);
	
	// Get all term expressions
	relation_string = relation_string.substr(begin_symbol.length, relation_string.length - (end_symbol.length + begin_symbol.length));
	var term_expressions = relation_string.split(",");
	
	// Setup relation table
	var list = new Array();
	this.__appendTerms(list, term_expressions, false);

	// Sort it, to make comparision faster	
	list.sort( function(a, b) { return a.name > b.name; } );
	
	if (this.__unorderedRelations[symbol] == null)
		this.__unorderedRelations[symbol] = new Array();
		
	this.__unorderedRelations[symbol].push(list);
	
	return list;
}

/*
 * Object::_as([definition1, ..., definitionN])
 *
 * Parses the given definition and appends it to the object.
 * If definition is not given, the function searches for an element "__def" inside
 * the object. If it has no "__def"-Element, the function applies one of the
 * native types as the object's definition.
 *
 * If the object contains an element "__value" the function will return a new
 * object of typeof(___value) with the definition applied.
 *
 * Passing multiple parameters to "_as" will lead to concatentating the parameters with
 * ; as joining symbol. All trailing "|" of further parameters will be removed, if given.
 * It is also possible to pass a map (string => string) or array to this function. 
 *
 * If the object contains elements, which have a "|" in their names, it will recursivley
 * apply the definition of the element key to the element itself - as long as the element
 * has no definition already.
 *
 * Exceptions
 *  MissingPrefixError				The given definition doesn't have the "|" prefix
 * 	OverloadingDefinitionError		Object is already assigned to a definition
 *  InvalidDefinitionError			Syntax error inside a definition
 *
 * Return value
 *	Reference to the object
 *
 */
Object.prototype._as = function()
{
	var self = this;
	var definition = "";

	// Get parameters
	for (var idx = 0; idx < arguments.length; idx ++) {
		var sym = "; ";
	
		if (arguments[idx] == null) {
			definition = null;
			break;
		}
		
		if (idx + 1 == arguments.length)
			sym = "";

		if ((arguments[idx].charAt(0) == "|") && (idx > 0))
			arg = arguments[idx].substr(1);
		else
			arg = arguments[idx];

		definition += arg + sym;
	}

	// No overloading of definitions
	if ((this.__definition != null) || (this.__orderedRelations != null)  || (this.__unorderedRelations != null))
		throw new OverloadingDefinitionError(definition+" overwrites "+this.__definition);

	// Implicit definition given?
	if (arguments.length == 0) {
		definition = this.__def;
	}
		
	// Set an implicit definition?
	if (definition == null) {
		if (this instanceof String)
			definition = "|text";
		else if (this instanceof Number)
			definition = "|number";
		else if (this instanceof Boolean)
			definition = "|boolean";
		else if (this instanceof Array)
			definition = "|list";
		else if (this instanceof Function)
			definition = "|function";
		else if (this instanceof Object)
			definition = "|structure";
	}

	// Building object from value?
	if (this.__value != null)
		return this.__value._as(definition);

	// Test and remove prefix
	if (definition.charAt(0) != "|") {
		throw new MissingPrefixError("Missing prefix - "+definition);
	}

	definition = definition.substr(1);

	// Remove whitespaces
	definition = definition.replace(/[ \t]/g, "");
	if (definition == "")
		throw new InvalidDefinitionError("Empty definition");
	
	// Split the relation strings
	var relation_strings = definition.split(";");

	if (relation_strings.length == 0)
		throw new InvalidDefinitionError("Empty definition");

	// Initialize relation array
	this.__orderedRelations = new Array();
	this.__unorderedRelations = new Array();	

	var precondition = null;

	// [OPT] Term lookup table
	this.__term_lookup = new Object();
	
	var lookup_list = definition.match(/[A-Za-z0-9\_\-]+/g);
	
	for (var idx = 0; idx < lookup_list.length; idx ++) {
		this.__term_lookup[lookup_list[idx]] = true;
	}
	// [END OPT]
		
	// Build relations
	for (var idx = 0; idx < relation_strings.length; idx ++) {
		var relation_string = relation_strings[idx];
		var relation = null;
	
		if (relation_string == "")
			throw new InvalidDefinitionError("Empty relation - "+relation_string);

		// Has it a precondition?
		if (relation_string.indexOf(":") != -1) {
			var precondition_list = relation_string.split(":");
			
			if (precondition_list.length > 2)
				throw new InvalidDefinitionError("Multiple preconditions detected - "+relation_string);
				
			relation_string = precondition_list[1];
			
			// Set or delete precondition for all following relations
			if (precondition_list[0] == "")
				precondition = null;
			else {
				// Is it really a list of terms?
				if (/[^A-Za-z0-9\_\-\,]/.test(precondition_list[0]))
					throw new InvalidDefinitionError("Invalid precondition term - "+precondition_list[0]);
			
				precondition = precondition_list[0].split(",");
			}
		}

		// Is it an ordered relation?
		if (/[?*~_\-0-9a-zA-Z.]/.test(relation_string.charAt(0)))
			relation = self.__parseOrdered(relation_string);
		else
			relation = self.__parseUnordered(relation_string);
			
		relation.conditions = precondition;
	}

	// Apply definitions recursivley to all |-prefixed elements,
	// which are still untyped
	for (var key in this) {
		if (key.charAt(0) == "|") {
			var element = this[key];

			if (this[key].__orderedRelations == null)
				this[key] = element._as(key);
		}	
	}

	this.__uuid = session_uuid ++;

	return this;
}

/*
 * String::_as([definition1, ..., definitionN])
 *
 * Creates a new string object and applies the given definition on it.
 *
 * Return value
 *	The new string object
 *
 * See
 *	Object._as
 *
 */
String.prototype._as = function()
{
	return Object._as.apply(this, arguments);
}

/*
 * Number::_as([definition1, ..., definitionN])
 *
 * Creates a new number object and applies the given definition on it.
 *
 * Return value
 *	The new number object
 *
 * See
 *	Object._as
 *
 */
Number.prototype._as = function()
{
	return Object._as.apply(this, arguments);
}

/*
 * Boolean::_as([definition1, ..., definitionN])
 *
 * Creates a new boolean object and applies the given definition on it.
 *
 * Return value
 *	The new boolean object
 *
 * See
 *	Object._as
 *
 */
Boolean.prototype._as = function()
{
	return 	Object._as.apply(this, arguments);
}

/*
 * Array::_as([definition1, ..., definitionN])
 * 
 * Applies the definition to the given array. All elements
 * will be applied to a definition too. The type of the elements
 * will be automatically derived or derived from a "__def"-property
 * of the element.
 *
 * See
 *  Object._as
 *
 */
Array.prototype._as = function()
{
	var self = Object._as.apply(this, arguments);
	
	if (self != this)
		throw new Error("JavaScript environment error.");
	
	// Apply definitions recursivley to all enumerated elements
	for (var key = 0; key < self.length; key ++) {
		self[key] = self[key]._as();
	}

	return self;	
}

/*
 * Object::_clean()
 *
 * Removes a definition from an object
 *
 */
Object.prototype._clean = function()
{
	this.__orderedRelations = null;
	this.__unorderedRelations = null;
}

/*
 * Object::_def_string()
 *
 * Creates a string representation of the objects definition.
 * (internal use)
 *
 */
Object.prototype._def_string = function()
{
	var relations = new Array();
	var self = this;

	for (var key in this.__orderedRelations)
	{
		if (this.__orderedRelations[key] instanceof Array) {
			var relation = this.__orderedRelations[key];

			for (var idx = 0; idx < relation.length; idx++) {
				relations.push( self._relationToString(key, idx, true) );
			}
		}
	}
	
	for (var key in this.__unorderedRelations)
	{
		if (this.__unorderedRelations[key] instanceof Array) {
			var relation = this.__unorderedRelations[key];

			for (var idx = 0; idx < relation.length; idx++) {
				relations.push( self._relationToString(key, idx, false) );
			}
		}
	}
	return "|"+relations.join("; ");
}

/*
 * [static ::__variadic_equivalence(yee_term, ier_term, ier_variations, yee_variations)
 *
 * Analyses whether the term "yee_term" is equivalent with the term string "ier_term".
 * The term can be variaded using the term variations "ier_varations" and "yee_varations".
 *
 * Return value:
 *		false			If terms are not equal
 *		n				If terms are equal and "n" variations were required
 */
function __variadic_equivalence(yee_term, ier_term, ier_variations, yee_variations)
{
	// Direct comparision of non-variadic terms
	if ((!yee_term.is_variadic) && (!ier_term.is_variadic))
		return (yee_term.name == ier_term.name) ? 1 : 0;
	
	// Return in case of identical terms
	if (yee_term.name == ier_term.name)
		return 1;

	var yee_variations_available = (    (yee_variations["<"] != null)  
								 	 && (yee_variations["<"].variations["#"+yee_term.name] != null) 
							 		 && (yee_variations["<"].variations["#"+yee_term.name].length > 0)
							 	   );
	var ier_variations_available = (    (ier_variations["<"] != null)  
								 	 && (ier_variations["<"].variations["#"+ier_term.name] != null) 
							 		 && (ier_variations["<"].variations["#"+ier_term.name].length > 0)
							 	   );

	// Are there variations of the variadic yee term?
	if (yee_term.is_variadic && !yee_variations_available)
		return false;

	if (ier_term.is_variadic && !ier_variations_available)
		return false;

	// yee_variation: Search a fitting term in all variations of the yee term
	if (yee_term.is_variadic && !ier_term.is_variadic) {
		var variations = yee_variations["<"].variations["#"+yee_term.name];

		// [OPT] There is no yee variation of the ier term, we should test
		if (yee_variations["<"].variations["#"+ier_term.name] == null)
			return false;
		// [END OPT]

		for (var idx = 0; idx < variations.length; idx ++) {
			var variation = variations[idx];

			for (var l_idx = variation.position; l_idx < variation.list.length; l_idx ++) {
				if (variation.list[l_idx].name == ier_term.name)
					return idx + 1;
			}
		}
		
		return false;
	}

	// ier_variation: Search a fitting term in all variations of the ier term
	if (!yee_term.is_variadic && ier_term.is_variadic) {
		var variations = ier_variations["<"].variations["#"+ier_term.name];

		// [OPT] There is no ier variation of the yee term, we should test
		if (ier_variations["<"].variations["#"+yee_term.name] == null)
			return false;
		// [END OPT]

		for (var idx = 0; idx < variations.length; idx ++) {
			var variation = variations[idx];

			for (var l_idx = variation.position; l_idx < variation.list.length; l_idx ++) {
				if (variation.list[l_idx].name == yee_term.name)
					return idx + 1;
			}
		}

		return false;
	}

	// both variations
	if (yee_term.is_variadic && ier_term.is_variadic) {
		// There are no variations of the opposite term
		var yee_lookup = yee_variations["<"].variations;
		var ier_variations = ier_variations["<"].variations["#"+ier_term.name];
		var yee_variations = yee_variations["<"].variations["#"+yee_term.name];

		for (var idx = 0; idx < ier_variations.length; idx ++) {
			var ier_variation = ier_variations[idx];

			for (var l_idx = ier_variation.position; l_idx < ier_variation.list.length; l_idx ++) {

				// Search yee inside ier
				for (var y_idx = 0; y_idx < yee_variations.length; y_idx ++) {
					var yee_variation = yee_variations[y_idx];

					// [OPT] Test if the yee term is available in any ier list
					if (yee_lookup["#"+ier_variation.list[l_idx].name] == null)
						break;
					// [END OPT]

					for (var ly_idx = ier_variation.position; ly_idx < yee_variation.list.length; ly_idx ++) {
						if (ier_variation.list[l_idx].name == yee_variation.list[ly_idx].name)
							return ly_idx + 1;
					}
				}
			}
		}

		return false;
	}	
	
}

/*
 * [static] ::__unorderedSatisfied(satisfier_list, satisfyee_list, ier_variations, yee_variations)
 *
 * Helper function
 *
 * See:
 *  String::_satisfies
 *
 */
function __unorderedSatisfied(satisfier, satisfyee, ier_variations, yee_variations)
{
	var count = 0;

	for (var i = 0; i < satisfyee.length; i++) {
		var element = satisfyee[i];
		var found = null;

		// * is satisfied if there is at least one element in satisfier
		if (element.name == "*") {
		
			if (satisfier.length < 1)
				return -1;
				
			continue;
		}
	
		// Search for satisfying element
		for (var j = 0; j < satisfier.length; j++)
		{
			var sat_element = satisfier[j];
			
			if (sat_element.name == "*") {
				found = element;
				break;
			}
						
			if (__variadic_equivalence(element, sat_element, ier_variations, yee_variations) != false)
			{
				found = element;
				break;
			}
		}

		// Element not found and not optional
		if ((found == null) && (!element.is_option))
			return -1;
		
		// Element optional, increment optional count
		if ((found != null) && (sat_element.name != "*") && (element.is_option)) {
			count ++;
		}

	}

	return count;
}

/*
 * [static] ::__orderedSatisfied(satisfier_list, satisfyee_list, ier_variations, yee_variations)
 *
 * Helper function
 *
 * See:
 *  String::_satisfies
 *
 */
function __orderedSatisfied(satisfier, satisfyee, ier_variations, yee_variations, lookup_hash)
{
	var count = 0;
	var ier_base = 0;

	for (var yee_idx = 0; yee_idx < satisfyee.length; yee_idx ++) {
		var yee_term = satisfyee[yee_idx];
		var found = false;
	
		// [OPT] Stop, if term is not in the lookup hash of ther satisfier
		if (!lookup_hash[yee_term.name]) {
			if (!yee_term.is_option)
				return -1;
			else
				continue;
		}
		// [END OPT]

		// Stop, if we can't iterate again over the satisfier list
		if (ier_base == satisfier.length) {

			// This is okay, if there are only optional terms in yee
			do {
				if (satisfyee[yee_idx].is_option == false)
					return -1;
			}while(++ yee_idx < satisfyee.length);
			
			 return count;			
		}
		
		// Accept ?* yer-terms and fail on * yer-terms
		if (yee_term.name == "*") {
		
			if (!yee_term.is_option)
				return -1;
				
			continue;
		}
			
		// Test, if the term is available in ier idx
		for (var ier_idx = ier_base; ier_idx < satisfier.length; ier_idx ++) {
			var ier_term = satisfier[ier_idx];

			// If ier is a * term, it satisfies until its successor is not the same as the yee term
			if (ier_term.name == "*") {
				found = true;
				
				if (    (ier_idx + 1 < satisfier.length) 
				     && (__variadic_equivalence(yee_term, satisfier[ier_idx+1], ier_variations, yee_variations) != false)
				   )
				{
					ier_base += 2;
				}
					
				break;
			}
			
			// Test for equality of terms or accept any +-Term
			if ((yee_term.name == "+") || __variadic_equivalence(yee_term, ier_term, ier_variations, yee_variations)) {
				ier_base = ier_idx + 1;
				found = true;
				break;
			}
		}

		if (found) {		
			// Term was found
			if (yee_term.is_option)
				count ++;
		}
		 else if (!yee_term.is_option) {
			// Term not found and not optional
			return -1;	 	
		}
	}

	return count;
}

/*
 * __test_precondition(list, ier_variations)
 *
 * Helper function
 *
 * See:
 *	String::_satisfies
 *
 */
function __test_precondition(list, ier_variations)
{
	if (list.conditions != null) {
		var conditions = list.conditions;
		var condition_met = false;
				
		for (var c_idx = 0; c_idx < conditions.length; c_idx ++) {
			
			if (   (ier_variations["<"] != null)
				&& (ier_variations["<"].variations != null)			    
				&& (ier_variations["<"].variations["#"+conditions[c_idx]] != null)
			   )
			{
				condition_met = true;
				break;
			}
		}

		return condition_met;
	}
	
	return true;	
}

/*
 * __check_lists(satisfier_baselist, satisfyee_baselist, handler, ier_variations, yee_variations)
 *
 * Helper function
 *
 * See:
 *  String::_satisfies
 *
 */
function __check_lists(satisfier_baselist, satisfyee_baselist, handler, ier_variations, yee_variations, lookup_hash)
{
	var option_count = 0;

	for (var relation in satisfyee_baselist) {
		var list = satisfyee_baselist[relation];

		if (!(list instanceof Array))
			continue;

		// Relation does not exist in "satisfier"
		if (    (satisfier_baselist[relation] == null) 
		     || (satisfier_baselist[relation][0] == null)
		    ) 
		{
			var all_optional = true;
		
			// Is every satisfyee relation optional or has it a precondition?
			for (var idx = 0; idx < list.length; idx ++) {
			
				// Is the yee-precondition satisfied?
				if (!__test_precondition(list[idx], ier_variations))
					continue;
	
				/*
				// [WITHOUT OPT]		
				for (var r_idx = 0; r_idx < list[idx].length; r_idx ++) {
					if (list[idx][r_idx].is_option == false) {
						all_optional = false;
						break;
					}
				}
				
				if (!all_optional)
					break;
				// [END WITHOUT OPT]
				*/
				
				// [OPT] Use precalculated options count
				if (list[idx].__options < list[idx].length)
					break;
				// [END OPT] Use precalculated options count
			}
			
			if (!all_optional)
				return -1;
			 else
			 	continue;
		}

		// Get the highest option count satisfying the relation
		for (var yee_idx = 0; yee_idx < list.length; yee_idx ++) {
			var max_count = -1;
			
			// Is the yee-precondition satisfied?
			if (!__test_precondition(list[yee_idx], ier_variations))
				continue;

			for (var ier_idx = 0; ier_idx < satisfier_baselist[relation].length; ier_idx ++) {
				var count;	

				count = handler(satisfier_baselist[relation][ier_idx], list[yee_idx], ier_variations, yee_variations, lookup_hash);
		
				if (count > max_count)
					max_count = count;
			}

			// There was no satisfying relation
			if (max_count == -1) {
				return -1;
			}

			// Use the maximum count for this relation
			option_count += max_count;
		}		
	}
	
	return option_count;
}

/*
 * _satisfy_internal(satisfier, satisfyee)
 *
 * Helper function. Tests whether the definition of the object
 * "satisfier" satisfies the definition of the object "satisfyee".
 *
 */
function _satisfy_internal(satisfier, satisfyee)
{
	var option_count = 0;

	// Check unordered relations
	option_count = __check_lists(satisfier.__unorderedRelations, 
								 satisfyee.__unorderedRelations, 
								 __unorderedSatisfied,
								 satisfier.__orderedRelations,
								 satisfyee.__orderedRelations,
								 satisfier.__term_lookup
								);
	
	// Unsatisfiable condition
	if (option_count == -1)
		return -1;
	
	// Check ordered relations
	var ordered_count = __check_lists(satisfier.__orderedRelations, 
								 	  satisfyee.__orderedRelations, 
							 		  __orderedSatisfied,
									 satisfier.__orderedRelations,
									 satisfyee.__orderedRelations,
									 satisfier.__term_lookup
									 );

	// Unsatisfiable condition
	if (ordered_count == -1)
		return -1;
	
	option_count += ordered_count;
		
	// Successful exit
	return option_count;
}


/*
 * String::_satisfies(definition)
 *
 * Tests whether the given definition satisfies another definition.
 * If this satisfies "defintion", the count of satisfied optional
 * terms is returned, otherwise -1.
 *
 * If a definition contains multiple occurences of the same relation,
 * the function will determine the maximum option count satisfying
 * each relation.
 *
 * The function recognizes the special term "*". The semantic of it,
 * is as follows:
 *
 *	- In an ordered relation, it satisfies all terms between the two
 *	  last known "*"-terms. It got satisfied by all other terms.
 *
 *	- In an unordered relation, it satisfies all terms in the other
 *	  relation and got satisfied by at least one term.
 *
 * "*" does not satisfy any options.
 *
 * Exceptions:
 *	See "_as"
 */
String.prototype._satisfies = function(definition)
{
	var satisfier = {}._as(this.valueOf());
	var satisfyee = {}._as(definition);

	return _satisfy_internal(satisfier, satisfyee);
}

