/*
 * hyJS
 *
 * Predicate dispatcher
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */

/*
 * [static] __clone_declaration(decl)
 *
 * Clones the given declaration and ensures, that all required
 * elements are pre-initialized, if they are not given in 'decl'.
 *
 */
function __clone_declaration(decl)
{
	var newDeclaration = ({});
	
	// Copy settings
	newDeclaration._whereas = decl._whereas;
	newDeclaration._max = decl._max;	
	newDeclaration._features = decl._features;	
	newDeclaration._output = decl._output;

	// Copy parameters, options an default values
	for (var idx in decl) {
		var operatorOpt = "_optional_";
		var operatorOptLength = operatorOpt.length;
		var operatorDef = "_default_";
		var operatorDefLength = operatorDef.length;
		var operatorProto = "_prototype_";
		var operatorProtoLength = operatorProto.length;
			
		if (   (idx.substr(0, operatorOptLength) == operatorOpt) 
		    || (idx.substr(0, operatorDefLength) == operatorDef) 
		    || (idx.substr(0, operatorProtoLength) == operatorProto) 
		    || (idx == "_this")
		    || (idx[0] != "_")
		   ) 
		{
			newDeclaration[idx] = decl[idx];	
		}
	}

	// Arrayfy everthing
	if (newDeclaration._max == null)
		newDeclaration._max = [];
	if (!(newDeclaration._max instanceof Array))
		newDeclaration._max = [newDeclaration._max];	
	
	if (newDeclaration._whereas == null)
		newDeclaration._whereas = [];
	if (!(newDeclaration._whereas instanceof Array))
		newDeclaration._whereas = [newDeclaration._whereas];

	if (newDeclaration._output == null)
		newDeclaration._output = [];
	if (!(newDeclaration._output instanceof Array))
		newDeclaration._output = [newDeclaration._output];
	
	if (newDeclaration._features == null)
		newDeclaration._features = [];
	if (!(newDeclaration._features instanceof Array))
		newDeclaration._features = [newDeclaration._features];
	
	return newDeclaration;
}
 
/*
 * __filter_generics(declaration)
 *
 * Returns a hash of all generic functions in "declaration".
 *
 */
function __filter_generics(declaration)
{
	var operator = "_generic_";
	var operatorLen = operator.length;
	var genericHash = ({});

	for (var idx in declaration) {
		var selector;
	
		if (idx.substr(0, operatorLen) != operator) continue;
		
		selector = idx.substr(operatorLen);
		
		genericHash[selector] = declaration[idx];
	}
	
	return genericHash;
}

/*
 * __execute_generic(hash, name, value, declaration)
 *
 * Executes the generic named "name" and passes the parameter "value" to it.
 * The result of the generic will be merged into "declaration". The generic
 * has to be inside "hash". If it is not, the function does nothing and returns "false",
 * otherwise "true".
 *
 * After execution the generic will be removed from the declaration
 *
 */
function __execute_generic(hash, name, value, declaration)
{
	var generic = hash[name];
	var result;

	if (generic == null) return false;
	
	// Call generic
	if (generic.length == 1)
		result = generic(value);
	else
		result = generic.apply(this, value);

	delete declaration[name];

	// Apply generic
	if (result != null) {

		// Merge max, whereas, features and extend output
		if (result._max != null) 
			declaration._max = declaration._max.concat(result._max);

		if (result._whereas != null) 
			declaration._whereas = declaration._whereas.concat(result._whereas);
		
		if (result._features != null) 
			declaration._features = declaration._features.concat(result._features);

		if (result._output != null) 
			declaration._output = result._output.concat(declaration._output);


		// Copy others	
		for (var idx in result) {
			var operatorOpt = "_optional_";
			var operatorOptLength = operatorOpt.length;
			var operatorDef = "_default_";
			var operatorDefLength = operatorDef.length;
			var operatorProto = "_prototype_";
			var operatorProtoLength = operatorProto.length;

			if (   (idx.substr(0, operatorOptLength) == operatorOpt) 
				|| (idx.substr(0, operatorDefLength) == operatorDef) 
				|| (idx.substr(0, operatorProtoLength) == operatorProto) 
				|| (idx == "_this")
				|| (idx[0] != "_")
			   ) 
			{
				declaration[idx] = result[idx];			
			}
		}
	}
	
	return true;
}

/*
 * buildDeclarator(name, declaration)
 *
 * Returns a default declarator for a method named "name".
 *
 * A default declarator can be used to create a prototype for a certain kind of method.
 * All method created with this declarator will inherit the specifications of the declarator.
 * The specification of the declarator is given in "declaration", which has the same
 * structure as a normal function declarator (see _declare, dispatcher.js).
 *
 * The object returned by buildDeclarator is a function, declaring a given
 * method. This function has the following signature:
 *
 *		declarator(extensions, method)
 *
 * Mixing of prototype declarator and extensions
 * ---------------------------------------------
 * Whereas "method" is the concrete implementation of the method and 'extensions' are
 * extensions to the declarator. Also 'extensions' has the same structure as a normal
 * function declarator. However, whenever an element of 'extensions' already exists
 * in the declarator, it will extend it and not overwrite it. E.g. if a certain
 * parameter is defined in 'declaration' and 'extension', than the definition inside
 * 'extension' will be used to extend the definition for the parameter. For example:
 * If [a,b] is given in 'declaration' for parameter "foo" and [c,d] is given in "extensions", 
 * than the method will be declared with "foo: [c,d,a,b]". The same aplies also to the output type.
 *
 * If a parameter, feature, whereas-Clause or max-Clause does not exist in 'declaration' it will be added.
 * Default values and call prototypes will be added or (if existing) overwritten.
 *
 * Generics
 * --------
 * Additionally to the elements of a normal function declarator the parameter 'declaration'
 * can also contain so-called "generics". A generic allows the parameterization of a method
 * declaration using a function, that will be called during the declaration.
 *
 * A generic element inside "declaration" is prefixed by "_generic_" and suffixed by the name
 * of the generic. The element itself contains a function implementing the generic. The function
 * can receive an arbitrary number of parameters. The return value of the function will be also
 * merged into the final method declaration.
 *
 * If a generic "_generic_foo" was declared, the method "foo" can be called during the declaration
 * of the method by passing an element "foo" to 'extensions'. This element contains all parameters
 * of the generic (if the generic receives multiple parameters this has to be a list).
 *
 */
function buildDeclarator(name, declaration)
{
	var generics = __filter_generics(declaration);

	declaration = __clone_declaration(declaration);

	return function __inlineDeclarator(extensions, method) {
		var newDeclaration = __clone_declaration(declaration);
		extensions = __clone_declaration(extensions);

		// Apply generics
		for (var idx in extensions) {
			if (idx[0] == "_") continue;
			
			__execute_generic(generics, idx, extensions[idx], extensions);
		}

		// Overwrite default values and call prototypes
		for (var idx in extensions) {
			var operatorDef = "_default_";
			var operatorDefLen = operatorDef.length;
			var operatorProto = "_prototype_";
			var operatorProtoLen = operatorProto.length;
			
			if ((idx.substr(0, operatorDefLen) != operatorDef) && (idx.substr(0, operatorProtoLen) != operatorProto)) continue;
			
			if (extensions[idx] != undefined)
				newDeclaration[idx] = extensions[idx];
		}
		
		// Add new whereas clauses, max clauses, features
		newDeclaration._whereas = newDeclaration._whereas.concat(extensions._whereas);
		newDeclaration._max = newDeclaration._max.concat(extensions._max);
		newDeclaration._features = newDeclaration._features.concat(extensions._features);
	
		// Extend output
		newDeclaration._output = extensions._output.concat(newDeclaration._output);
		
		// Add or extend parameters and options
		for (var idx in extensions) {
			var operator = "_optional_";
			var operatorLen = operator.length;
	
			if ((idx[0] == "_") && (idx != "_this") && (!(idx.substr(0, operatorLen) == operator))) continue;

			if ((extensions[idx] != undefined) && (newDeclaration[idx] == undefined))  {
				// Append						
				newDeclaration[idx] = extensions[idx];
			}
			else if ((extensions[idx] != undefined) && (newDeclaration[idx] != undefined))  {
				// Extend
				newDeclaration[idx] = extensions[idx].concat(newDeclaration[idx]);
			}
		}
		
		// Setup implementation
		newDeclaration._does = method;

		// Declare method
		name.__declare(newDeclaration);
	}
}

