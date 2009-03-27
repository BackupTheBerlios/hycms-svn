/*
 * hyObjects(js)
 *
 * Test suite
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
var definitionTest =
{
	"Declaring a primitive type":
		function()
		{
			var test_string		= "my text";
			var test_number		= 123;
			var test_boolean	= true;
						
			var obj_string  = test_string._as("|a < b");
			var obj_number  = test_number._as("|c < d");
			var obj_boolean = test_boolean._as("|e < f");
			
			// Semantic equality of primitive and instantiated type with resp. to "==" operator
			console.assert(test_string == obj_string);
			console.assert(test_number == obj_number);
			console.assert(test_boolean == obj_boolean);

			console.assert(obj_string == "my text");
			console.assert(obj_number == 123);
			console.assert(obj_boolean == true);

			// Test that == is handled correctly
			console.assert(obj_string != "stuff");
			console.assert(obj_number != 0);
			console.assert(obj_boolean != false);
			
			// Test application of the definition
			console.assert(obj_string.__orderedRelations != null);
			console.assert(obj_number.__orderedRelations != null);
			console.assert(obj_boolean.__orderedRelations != null);
		},
		
	"Declaring an object":
		function()
		{
			var test_object		= {"any": "object"};
			var test_array		= [1, 2, 3];
			var test_function	= function(a) { return 1 + a; }
			
			var as_object 	 = test_object._as("|a < b");
			var as_array  	 = test_array._as("|g < h");
			var as_function  = test_function._as("|i < j");	
						
			// Test that references are identically after call of "as"
			console.assert(as_object == test_object);
			console.assert(as_array == test_array);
			console.assert(as_function == test_function);
			
			// Test application of the definition
			console.assert(test_object.__orderedRelations != null);
			console.assert(test_array.__orderedRelations != null);
			console.assert(test_function.__orderedRelations != null);
		},
		
	"Passing multiple parameters to as":
		function()
		{
			var test_object		= {"any": "object"};
			var test_array		= [1, 2, 3];
			var test_function	= function(a) { return 1 + a; }
			
			var as_object 	 = test_object._as("|a < b", "|e << b");
			var as_array  	 = test_array._as("|g < h", "e << b");
			var as_function  = test_function._as("|i < j", "|e << b");	
						
			// Test that references are identically after call of "as"
			console.assert(as_object == test_object);
			console.assert(as_array == test_array);
			console.assert(as_function == test_function);
			
			// Test application of the definition
			console.assert(test_object.__orderedRelations["<"] != null);
			console.assert(test_array.__orderedRelations["<"] != null);
			console.assert(test_function.__orderedRelations["<"] != null);

			console.assert(test_object.__orderedRelations["<<"] != null);
			console.assert(test_array.__orderedRelations["<<"] != null);
			console.assert(test_function.__orderedRelations["<<"] != null);

		},
		
	"Not overloading an object with two definitions":
		function()
		{
			var test_object		= {"any": "object"};
			
			test_object._as("|x < y");
			
			assertException( function() { test_object._as("|p < q"); }, OverloadingDefinitionError );
		},
		
	"Not accepting invalid definitions":
		function()
		{
			// Requireing | as prefix
			assertException( function() { var a = "my_text"; a._as("a < b");}, MissingPrefixError );
		
			// No empty definitions
			assertException( function() { var a = "my_text"; a._as("|"); }, InvalidDefinitionError );	
			
			// No duplicated ? and ~ operators
			assertException( function() { var a = "my_text"; a._as("|foo < ??bar"); }, InvalidDefinitionError );
			assertException( function() { var a = "my_text"; a._as("|[??bar, goo]"); }, InvalidDefinitionError );			

			assertException( function() { var a = "my_text"; a._as("|foo << ~~bar"); }, InvalidDefinitionError );
			assertException( function() { var a = "my_text"; a._as("|[~~bar, goo]"); }, InvalidDefinitionError );			

			// Option operator not allowed on wrong position
			assertException( function() { var a = "my_text"; a._as("|[b?ar, goo]"); }, InvalidDefinitionError );
			assertException( function() { var a = "my_text"; a._as("|[bar, goo?]"); }, InvalidDefinitionError );
			
			// Unordered relations must close and open
			assertException( function() { var a = "my_text"; a._as("|[ foo, bar"); }, InvalidDefinitionError );
			assertException( function() { var a = "my_text"; a._as("|foo, bar]"); }, InvalidDefinitionError );
			assertException( function() { var a = "my_text"; a._as("|[foo; bar]"); }, InvalidDefinitionError );
			assertException( function() { var a = "my_text"; a._as("|foo < bar; [ foo, bar"); }, InvalidDefinitionError );
			
			// Unordered relation symbols must have a symetric length
			assertException( function() { var a = "my_text"; a._as("|[[a]");}, InvalidDefinitionError );
			
			// Not allowing ; as symbol for ordered relations
			assertException( function() { var a = "my_text"; a._as("|;foo,bar#"); }, InvalidDefinitionError );			
			
			// Not allowing inconsistent relation symbols
			assertException( function() { var a = "my_text"; a._as("|foo << bar < goo << gaa"); }, InvalidDefinitionError );
			
			// No variadic *
			assertException( function() { var a = "my_text"; a._as("|~* << foo"); }, InvalidDefinitionError );
			
			// No variadic inheritance
			assertException( function() { var a = "my_text"; a._as("|~p < q") }, VariadicInheritanceError );
			
			// Invalid preconditions
			assertException( function() { var a = "my_text"; a._as("|a < b : c") }, InvalidDefinitionError );
			assertException( function() { var a = "my_text"; a._as("|a : < b : c") }, InvalidDefinitionError );
			assertException( function() { var a = "my_text"; a._as("|:: < b < c") }, InvalidDefinitionError );
			assertException( function() { var a = "my_text"; a._as("|(a): < b < c") }, InvalidDefinitionError );
			assertException( function() { var a = "my_text"; a._as("|a,,b: < b < c") }, InvalidDefinitionError );
			assertException( function() { var a = "my_text"; a._as("|,b: < b < c") }, InvalidDefinitionError );
			assertException( function() { var a = "my_text"; a._as("|a,: < b < c") }, InvalidDefinitionError );
			assertException( function() { var a = "my_text"; a._as("|,: < b < c") }, InvalidDefinitionError );
		},

	"Parsing ordered relations":
		function()
		{
			var a = "my_text";
			var obj = a._as("|?a << b << ?~c << ~?d << ~e");

			// There are only 4 elements in the relation
			console.assert(obj.__orderedRelations["<<"][0].length == 5);			
			
			// Test the ordering of all elements and there option state
			console.assert(obj.__orderedRelations["<<"][0][0].name == "a");
			console.assert(obj.__orderedRelations["<<"][0][0].is_option == true);
			console.assert(obj.__orderedRelations["<<"][0][0].is_variadic == false);
			
			console.assert(obj.__orderedRelations["<<"][0][1].name == "b");
			console.assert(obj.__orderedRelations["<<"][0][1].is_option == false);
			console.assert(obj.__orderedRelations["<<"][0][1].is_variadic == false);

			console.assert(obj.__orderedRelations["<<"][0][2].name == "c");
			console.assert(obj.__orderedRelations["<<"][0][2].is_option == true);
			console.assert(obj.__orderedRelations["<<"][0][2].is_variadic == true);			

			console.assert(obj.__orderedRelations["<<"][0][3].name == "d");
			console.assert(obj.__orderedRelations["<<"][0][3].is_option == true);
			console.assert(obj.__orderedRelations["<<"][0][3].is_variadic == true);			

			console.assert(obj.__orderedRelations["<<"][0][4].name == "e");
			console.assert(obj.__orderedRelations["<<"][0][4].is_option == false);
			console.assert(obj.__orderedRelations["<<"][0][4].is_variadic == true);
		},
		
	"Storage of variations":
		function()
		{
			var obj = "my_text"._as("|?a < b < ?c < ?d < e");
		
			// Storage of variations			
			console.assert(obj.__orderedRelations["<"].variations["#a"][0].list == obj.__orderedRelations["<"][0]);
			console.assert(obj.__orderedRelations["<"].variations["#b"][0].list == obj.__orderedRelations["<"][0]);
			console.assert(obj.__orderedRelations["<"].variations["#c"][0].list == obj.__orderedRelations["<"][0]);
			console.assert(obj.__orderedRelations["<"].variations["#d"][0].list == obj.__orderedRelations["<"][0]);
			console.assert(obj.__orderedRelations["<"].variations["#e"][0].list == obj.__orderedRelations["<"][0]);

			console.assert(obj.__orderedRelations["<"].variations["#a"][0].position == 0);
			console.assert(obj.__orderedRelations["<"].variations["#b"][0].position == 1);
			console.assert(obj.__orderedRelations["<"].variations["#c"][0].position == 2);
			console.assert(obj.__orderedRelations["<"].variations["#d"][0].position == 3);
			console.assert(obj.__orderedRelations["<"].variations["#e"][0].position == 4);									
		},

	"Parsing ordered relations (long relation symbol)":
		function()
		{
			var a = "my_text";
			var obj = a._as("|d <<<< ?b <<<< ?~a <<<<  ~c <<<< ~?d");
			
			// There are no other relations
			console.assert(obj.__orderedRelations["<"] == null);
			console.assert(obj.__orderedRelations["<<"] == null);			
			console.assert(obj.__orderedRelations["<<<"] == null);		
			console.assert(obj.__orderedRelations["<<<<"] != null);			
			console.assert(obj.__orderedRelations["<<<<<"] == null);			
			
			// The <<<<-relation has 4 elements
			console.assert(obj.__orderedRelations["<<<<"][0].length == 5);			
			
			// Elements are ordered correctly and have correct option state
			console.assert(obj.__orderedRelations["<<<<"][0][0].name == "d");
			console.assert(obj.__orderedRelations["<<<<"][0][0].is_option == false);
			console.assert(obj.__orderedRelations["<<<<"][0][0].is_variadic == false);

			console.assert(obj.__orderedRelations["<<<<"][0][1].name == "b");
			console.assert(obj.__orderedRelations["<<<<"][0][1].is_option == true);
			console.assert(obj.__orderedRelations["<<<<"][0][1].is_variadic == false);

			console.assert(obj.__orderedRelations["<<<<"][0][2].name == "a");
			console.assert(obj.__orderedRelations["<<<<"][0][2].is_option == true);
			console.assert(obj.__orderedRelations["<<<<"][0][2].is_variadic == true);

			console.assert(obj.__orderedRelations["<<<<"][0][3].name == "c");
			console.assert(obj.__orderedRelations["<<<<"][0][3].is_option == false);
			console.assert(obj.__orderedRelations["<<<<"][0][3].is_variadic == true);			

			console.assert(obj.__orderedRelations["<<<<"][0][4].name == "d");
			console.assert(obj.__orderedRelations["<<<<"][0][4].is_option == true);
			console.assert(obj.__orderedRelations["<<<<"][0][4].is_variadic == true);			

		},

	"Parsing ordered relations (ignoring term '.')":
		function()
		{
			var a = 123;
			var obj = a._as("|. <<< number");
			
			console.assert(obj.__orderedRelations["<<<"][0].length == 1);
			console.assert(obj.__orderedRelations["<<<"][0][0].name == "number");
		},
		
	"Parsing ordered relations (no inheritance given)":
		function()
		{
			var a = 123;
			var obj = a._as("|a");
			
			console.assert(obj.__orderedRelations["<"][0].length == 1);
			console.assert(obj.__orderedRelations["<"][0][0].name == "a");
		},		

	"Multiple relations of the same type (ordered relations)":
		function()
		{
			var a = "my_text";
			var obj = a._as("|a << ?b; ?a << b << ~c");
			
			// Note: ordering of the relations is kept!
			console.assert(obj.__orderedRelations["<<"][0].length == 2);
			
			console.assert(obj.__orderedRelations["<<"][0][0].name == "a");
			console.assert(obj.__orderedRelations["<<"][0][0].is_option == false);
			console.assert(obj.__orderedRelations["<<"][0][0].is_variadic == false);
			
			console.assert(obj.__orderedRelations["<<"][0][1].name == "b");
			console.assert(obj.__orderedRelations["<<"][0][1].is_option == true);
			console.assert(obj.__orderedRelations["<<"][0][1].is_variadic == false);

			console.assert(obj.__orderedRelations["<<"][1].length == 3);
			console.assert(obj.__orderedRelations["<<"][1][0].name == "a");
			console.assert(obj.__orderedRelations["<<"][1][0].is_option == true);
			console.assert(obj.__orderedRelations["<<"][1][0].is_variadic == false);					
			
			console.assert(obj.__orderedRelations["<<"][1][1].name == "b");
			console.assert(obj.__orderedRelations["<<"][1][1].is_option == false);
			console.assert(obj.__orderedRelations["<<"][1][1].is_variadic == false);			
			
			console.assert(obj.__orderedRelations["<<"][1][2].name == "c");
			console.assert(obj.__orderedRelations["<<"][1][2].is_option == false);
			console.assert(obj.__orderedRelations["<<"][1][2].is_variadic == true);					
		},

	"Parsing unordered relations":
		function()
		{
			var a = "my_text";
			var obj = a._as("|[~d,b,?c,~a,?~e,~?f]");
			
			console.assert(obj.__unorderedRelations["[]"][0].length == 6);
			
			// White-box test: unordered relations got lexicographically sorted 
			console.assert(obj.__unorderedRelations["[]"][0][0].name == "a");
			console.assert(obj.__unorderedRelations["[]"][0][0].is_option == false);
			console.assert(obj.__unorderedRelations["[]"][0][0].is_variadic == true);

			console.assert(obj.__unorderedRelations["[]"][0][1].name == "b");
			console.assert(obj.__unorderedRelations["[]"][0][1].is_option == false);
			console.assert(obj.__unorderedRelations["[]"][0][1].is_variadic == false);

			console.assert(obj.__unorderedRelations["[]"][0][2].name == "c");
			console.assert(obj.__unorderedRelations["[]"][0][2].is_option == true);
			console.assert(obj.__unorderedRelations["[]"][0][2].is_variadic == false);			

			console.assert(obj.__unorderedRelations["[]"][0][3].name == "d");
			console.assert(obj.__unorderedRelations["[]"][0][3].is_option == false);
			console.assert(obj.__unorderedRelations["[]"][0][3].is_variadic == true);

			console.assert(obj.__unorderedRelations["[]"][0][4].name == "e");
			console.assert(obj.__unorderedRelations["[]"][0][4].is_option == true);
			console.assert(obj.__unorderedRelations["[]"][0][4].is_variadic == true);

			console.assert(obj.__unorderedRelations["[]"][0][5].name == "f");
			console.assert(obj.__unorderedRelations["[]"][0][5].is_option == true);
			console.assert(obj.__unorderedRelations["[]"][0][5].is_variadic == true);
		},

	"Parsing unordered relations (ignoring term '.')":
		function()
		{
			var a = 123;
			var obj = a._as("|[., foo]");
			
			console.assert(obj.__unorderedRelations["[]"][0].length == 1);
			console.assert(obj.__unorderedRelations["[]"][0][0].name == "foo");
		},

	"Parsing unordered relations (long relation symbol)":
		function()
		{
			var a = "my_text";
			var obj = a._as("|</~d,b,?c,a/>");

			console.assert(obj.__unorderedRelations["<//>"][0].length == 4);
			
			// White-box test: unordered relations got lexicographically sorted 
			console.assert(obj.__unorderedRelations["<//>"][0][0].name == "a");
			console.assert(obj.__unorderedRelations["<//>"][0][0].is_option == false);

			console.assert(obj.__unorderedRelations["<//>"][0][1].name == "b");
			console.assert(obj.__unorderedRelations["<//>"][0][1].is_option == false);

			console.assert(obj.__unorderedRelations["<//>"][0][2].name == "c");
			console.assert(obj.__unorderedRelations["<//>"][0][2].is_option == true);

			console.assert(obj.__unorderedRelations["<//>"][0][3].name == "d");
			console.assert(obj.__unorderedRelations["<//>"][0][3].is_option == false);
			console.assert(obj.__unorderedRelations["<//>"][0][3].is_variadic == true);
		},
	
	"Multiple relations of the same type (unordered relations)":
		function()
		{
			var a = "my_text";
			var obj = a._as("|[a , ?b]; [?a, b, c]");

			// Note: Ordering of the relations is kept!
			console.assert(obj.__unorderedRelations["[]"][0].length == 2);
			console.assert(obj.__unorderedRelations["[]"][0][0].name == "a");
			console.assert(obj.__unorderedRelations["[]"][0][0].is_option == false);
			console.assert(obj.__unorderedRelations["[]"][0][1].name == "b");
			console.assert(obj.__unorderedRelations["[]"][0][1].is_option == true);

			console.assert(obj.__unorderedRelations["[]"][1].length == 3);
			console.assert(obj.__unorderedRelations["[]"][1][0].name == "a");
			console.assert(obj.__unorderedRelations["[]"][1][0].is_option == true);		
			console.assert(obj.__unorderedRelations["[]"][1][1].name == "b");
			console.assert(obj.__unorderedRelations["[]"][1][1].is_option == false);
			console.assert(obj.__unorderedRelations["[]"][1][2].name == "c");
			console.assert(obj.__unorderedRelations["[]"][1][2].is_option == false);			
		},
	
	"Allowing multiple occurences of * in a relation (ordered)":
		function()
		{
			var a = "my_text";
			var obj = a._as("|a < ?* < c < * < d");
			
			// There are only 4 elements in the relation
			console.assert(obj.__orderedRelations["<"][0].length == 5);			
			
			// Test the ordering of all elements and there option state
			console.assert(obj.__orderedRelations["<"][0][0].name == "a");
			console.assert(obj.__orderedRelations["<"][0][0].is_option == false);

			console.assert(obj.__orderedRelations["<"][0][1].name == "*");
			console.assert(obj.__orderedRelations["<"][0][1].is_option == true);

			console.assert(obj.__orderedRelations["<"][0][2].name == "c");
			console.assert(obj.__orderedRelations["<"][0][2].is_option == false);

			console.assert(obj.__orderedRelations["<"][0][3].name == "*");
			console.assert(obj.__orderedRelations["<"][0][3].is_option == false);

			console.assert(obj.__orderedRelations["<"][0][4].name == "d");
			console.assert(obj.__orderedRelations["<"][0][4].is_option == false);
		},
		
	"Allowing multiple occurences of * in a relation (unordered)":
		function()
		{
			var a = "my_text";
			var obj = a._as("|[a, ?*, c, *, d]");
			
			// There are only 4 elements in the relation
			console.assert(obj.__unorderedRelations["[]"][0].length == 5);			

			// Test the ordering of all elements and there option state
			console.assert(obj.__unorderedRelations["[]"][0][0].name == "*");
			console.assert(obj.__unorderedRelations["[]"][0][0].is_option == true);

			console.assert(obj.__unorderedRelations["[]"][0][1].name == "*");
			console.assert(obj.__unorderedRelations["[]"][0][1].is_option == false);

			console.assert(obj.__unorderedRelations["[]"][0][2].name == "a");
			console.assert(obj.__unorderedRelations["[]"][0][2].is_option == false);

			console.assert(obj.__unorderedRelations["[]"][0][3].name == "c");
			console.assert(obj.__unorderedRelations["[]"][0][3].is_option == false);

			console.assert(obj.__unorderedRelations["[]"][0][4].name == "d");
			console.assert(obj.__unorderedRelations["[]"][0][4].is_option == false);
		},		
	
	"Parsing preconditions":
		function()
		{
			var a = "my_text";
			var obj = a._as("|a < b; a,b: [e, f]; f: c < d; q < u; :l < m");
			
			console.assert(obj.__orderedRelations["<"][0].length == 2);
			console.assert(obj.__orderedRelations["<"][0][0].name == "a");
			console.assert(obj.__orderedRelations["<"][0][1].name == "b");
			console.assert(obj.__orderedRelations["<"][0].conditions == null);			

			console.assert(obj.__unorderedRelations["[]"][0].length == 2);
			console.assert(obj.__unorderedRelations["[]"][0][0].name == "e");
			console.assert(obj.__unorderedRelations["[]"][0][1].name == "f");
			console.assert(obj.__unorderedRelations["[]"][0].conditions.length == 2);				
			console.assert(obj.__unorderedRelations["[]"][0].conditions[0] == "a");	
			console.assert(obj.__unorderedRelations["[]"][0].conditions[1] == "b");				

			console.assert(obj.__orderedRelations["<"][1].length == 2);
			console.assert(obj.__orderedRelations["<"][1][0].name == "c");
			console.assert(obj.__orderedRelations["<"][1][1].name == "d");
			console.assert(obj.__orderedRelations["<"][1].conditions.length == 1);			
			console.assert(obj.__orderedRelations["<"][1].conditions[0] == "f");			

			console.assert(obj.__orderedRelations["<"][2].length == 2);
			console.assert(obj.__orderedRelations["<"][2][0].name == "q");
			console.assert(obj.__orderedRelations["<"][2][1].name == "u");
			console.assert(obj.__orderedRelations["<"][2].conditions.length == 1);	
			console.assert(obj.__orderedRelations["<"][2].conditions[0] == "f");			

			console.assert(obj.__orderedRelations["<"][3].length == 2);
			console.assert(obj.__orderedRelations["<"][3][0].name == "l");
			console.assert(obj.__orderedRelations["<"][3][1].name == "m");
			console.assert(obj.__orderedRelations["<"][3].conditions == null);			
		},
	
	"Cleaning definitions":
		function()
		{
			var test_object = {"a": "bc"};
			
			test_object._as("|x < y; [p, q]");
			console.assert(test_object.__orderedRelations["<"][0][0].name == "x");
			console.assert(test_object.__orderedRelations["<"][0][1].name == "y");			
			console.assert(test_object.__unorderedRelations["[]"][0][0].name == "p");
			console.assert(test_object.__unorderedRelations["[]"][0][1].name == "q");
			
			test_object._clean();
			
			// No definition an relations list after clean
			console.assert(test_object.__relations == null);
			
			// Re-assign of a definition possible
			test_object._as("|p < w");
			console.assert(test_object.__orderedRelations["<"][0][0].name == "p");
			console.assert(test_object.__orderedRelations["<"][0][1].name == "w");			
		},
		
	"Rebuild definition string":
		function()
		{
			var test_object = {"a": "bc"};
			var other_object = {"a": "bc"};
			var third_object = {"a": "bc"};
			
			test_object._as("|x < y; [[q, ?p, ~r]]");
			other_object._as("|x < y; [[q, ?p, r]]; l < u; [[q, m, r]]");
			third_object._as("|x < y; x: p < c; m,n: q < u");

			console.assert(test_object._def_string() == "|x < y; [[?p, q, ~r]]");
			console.assert(other_object._def_string() == "|x < y; l < u; [[?p, q, r]]; [[m, q, r]]");
			console.assert(third_object._def_string() == "|x < y; x: p < c; m, n: q < u");
		},
	
	"Implicit definitions":
		function()
		{
			var test_object = {__def:	"|foo < bar",	"a": "b"};
			
			test_object._as();
			
			console.assert(test_object.__orderedRelations["<"][0][0].name == "foo");
			console.assert(test_object.__orderedRelations["<"][0][1].name == "bar");			
		},

	"Deriving definitions":
		function()
		{
			var test_string = "abc";
			var test_number = 123;
			var test_boolean = true;
			var test_function = function() { return 0; };
			var test_array = [1, 2, 3];
			var test_object = {a: "b"};
			
			var obj_string = test_string._as();
			var obj_number = test_number._as();			
			var obj_boolean = test_boolean._as();
			var obj_function = test_function._as();			
			var obj_array = test_array._as();			
			var obj_object = test_object._as();			
			
			console.assert(obj_string.__orderedRelations["<"][0][0].name == "text");
			console.assert(obj_number.__orderedRelations["<"][0][0].name == "number");
			console.assert(obj_boolean.__orderedRelations["<"][0][0].name == "boolean");
			console.assert(obj_function.__orderedRelations["<"][0][0].name == "function");
			console.assert(obj_array.__orderedRelations["<"][0][0].name == "list");
			console.assert(obj_object.__orderedRelations["<"][0][0].name == "structure");
		},

	"Building value objects":
		function()
		{
			var test_string = {__def: "|tfoo < text", __value: "abc"};
			var test_number = {__def: "|nfoo < number", __value: 123};
			var test_boolean = {__def: "|bfoo < boolean", __value: true};
			var test_function = {__def: "|ffoo < function", __value: function() { return 456; }};
			var test_array = {__def: "|afoo < list", __value: [1, 2, 3]};
			var test_object = {__def: "|ofoo < structure", __value: {a: "b"}};
			
			var obj_string = test_string._as();
			var obj_number = test_number._as();			
			var obj_boolean = test_boolean._as();
			var obj_function = test_function._as();			
			var obj_array = test_array._as();			
			var obj_object = test_object._as();
			
			console.assert(obj_string.__orderedRelations["<"][0][0].name == "tfoo");
			console.assert(obj_number.__orderedRelations["<"][0][0].name == "nfoo");
			console.assert(obj_boolean.__orderedRelations["<"][0][0].name == "bfoo");
			console.assert(obj_function.__orderedRelations["<"][0][0].name == "ffoo");
			console.assert(obj_array.__orderedRelations["<"][0][0].name == "afoo");
			console.assert(obj_object.__orderedRelations["<"][0][0].name == "ofoo");
			
			console.assert(obj_string.__orderedRelations["<"][0][1].name == "text");
			console.assert(obj_number.__orderedRelations["<"][0][1].name == "number");
			console.assert(obj_boolean.__orderedRelations["<"][0][1].name == "boolean");
			console.assert(obj_function.__orderedRelations["<"][0][1].name == "function");
			console.assert(obj_array.__orderedRelations["<"][0][1].name == "list");
			console.assert(obj_object.__orderedRelations["<"][0][1].name == "structure");			

			console.assert(obj_string instanceof String);
			console.assert(obj_number instanceof Number);
			console.assert(obj_boolean instanceof Boolean);
			console.assert(obj_function instanceof Function);
			console.assert(obj_array instanceof Array);
			console.assert(obj_object instanceof Object);

			console.assert(obj_string == "abc");
			console.assert(obj_number == 123);
			console.assert(obj_boolean == true);
			console.assert(obj_function() == 456);
			console.assert(obj_array[0] == 1);
			console.assert(obj_array[1] == 2);
			console.assert(obj_array[2] == 3);			
			console.assert(obj_object["a"] == "b");
		},
	
	"Building objects recursivley":
		function()
		{
			var test_object = {__def:				"|top < structure",
							   "|a < text":			"my text",
							   "|b < structure":	{
							   						 "|ba < text":		"sub text",
							   						 "|bb < structure":	{
							   						 					 "|bba < text":		"text",
							   						 					 "|bbb < list":		[1, 2, 3]
							   						 					}
							   						},
							   	"|c < list":		[1, 
							   						 "array_text", 
							   						 {__def: "|ca < text", __value:	"foobar"}, 
							   						 {__def: "|cb < structure",
							   						  "|cba < text":		"text",
							   						  "|cbb < structure":	{"|cbba < text":	"123"}
							   						 },
							   						 [4,5,6]
							   						],
							   	"anything":			"this is not seen as semantic object"
							   };
					   
			test_object._as();
			
			// Test if type was correctly assigned
			console.assert(test_object.__orderedRelations["<"][0][0].name == "top");
			console.assert(test_object.__orderedRelations["<"][0][1].name == "structure");

			// Test if definitions are applies to child objects as well
			console.assert(test_object["|a < text"].__orderedRelations["<"][0][0].name == "a");
			console.assert(test_object["|a < text"].__orderedRelations["<"][0][1].name == "text");
			console.assert(test_object["|a < text"] instanceof String);
			console.assert(test_object["|a < text"] == "my text");			
			
			console.assert(test_object["|b < structure"].__orderedRelations["<"][0][0].name == "b");
			console.assert(test_object["|b < structure"].__orderedRelations["<"][0][1].name == "structure");
			console.assert(test_object["|b < structure"].__orderedRelations["<"][0] instanceof Object);
						
			console.assert(test_object["|b < structure"]["|ba < text"].__orderedRelations["<"][0][0].name == "ba");
			console.assert(test_object["|b < structure"]["|ba < text"].__orderedRelations["<"][0][1].name == "text");
			console.assert(test_object["|b < structure"]["|ba < text"] instanceof String);
			console.assert(test_object["|b < structure"]["|ba < text"] == "sub text");			

			console.assert(test_object["|b < structure"]["|bb < structure"].__orderedRelations["<"][0][0].name == "bb");
			console.assert(test_object["|b < structure"]["|bb < structure"].__orderedRelations["<"][0][1].name == "structure");
			console.assert(test_object["|b < structure"]["|bb < structure"] instanceof Object);			

			console.assert(test_object["|b < structure"]["|bb < structure"]["|bba < text"].__orderedRelations["<"][0][0].name == "bba");
			console.assert(test_object["|b < structure"]["|bb < structure"]["|bba < text"].__orderedRelations["<"][0][1].name == "text");
			console.assert(test_object["|b < structure"]["|bb < structure"]["|bba < text"] instanceof String);
			console.assert(test_object["|b < structure"]["|bb < structure"]["|bba < text"] == "text");			

			console.assert(test_object["|b < structure"]["|bb < structure"]["|bbb < list"].__orderedRelations["<"][0][0].name == "bbb");
			console.assert(test_object["|b < structure"]["|bb < structure"]["|bbb < list"].__orderedRelations["<"][0][1].name == "list");
			console.assert(test_object["|b < structure"]["|bb < structure"]["|bbb < list"] instanceof Array);

			console.assert(test_object["|b < structure"]["|bb < structure"]["|bbb < list"][0].__orderedRelations["<"][0][0].name == "number");
			console.assert(test_object["|b < structure"]["|bb < structure"]["|bbb < list"][0] instanceof Number);
			console.assert(test_object["|b < structure"]["|bb < structure"]["|bbb < list"][0] == 1);

			console.assert(test_object["|b < structure"]["|bb < structure"]["|bbb < list"][1].__orderedRelations["<"][0][0].name == "number");
			console.assert(test_object["|b < structure"]["|bb < structure"]["|bbb < list"][1] instanceof Number);
			console.assert(test_object["|b < structure"]["|bb < structure"]["|bbb < list"][1] == 2);

			console.assert(test_object["|b < structure"]["|bb < structure"]["|bbb < list"][2].__orderedRelations["<"][0][0].name == "number");
			console.assert(test_object["|b < structure"]["|bb < structure"]["|bbb < list"][2] instanceof Number);
			console.assert(test_object["|b < structure"]["|bb < structure"]["|bbb < list"][2] == 3);
			
			console.assert(test_object["|c < list"].__orderedRelations["<"][0][0].name == "c");
			console.assert(test_object["|c < list"].__orderedRelations["<"][0][1].name == "list");
			
			console.assert(test_object["|c < list"][0].__orderedRelations["<"][0][0].name == "number");
			console.assert(test_object["|c < list"][0] instanceof Number);
			console.assert(test_object["|c < list"][0] == 1);			

			console.assert(test_object["|c < list"][1].__orderedRelations["<"][0][0].name = "text");
			console.assert(test_object["|c < list"][1] instanceof String);
			console.assert(test_object["|c < list"][1] == "array_text");			

			console.assert(test_object["|c < list"][2].__orderedRelations["<"][0][0].name = "ca");
			console.assert(test_object["|c < list"][2].__orderedRelations["<"][0][1].name = "text");
			console.assert(test_object["|c < list"][2] instanceof String);
			console.assert(test_object["|c < list"][2] == "foobar");			

			console.assert(test_object["|c < list"][3].__orderedRelations["<"][0][0].name = "cb");
			console.assert(test_object["|c < list"][3].__orderedRelations["<"][0][1].name = "structure");
			console.assert(test_object["|c < list"][3] instanceof Object);
			
			console.assert(test_object["|c < list"][3]["|cba < text"].__orderedRelations["<"][0][0].name = "cba");
			console.assert(test_object["|c < list"][3]["|cba < text"].__orderedRelations["<"][0][1].name = "text");
			console.assert(test_object["|c < list"][3]["|cba < text"] instanceof String);
			console.assert(test_object["|c < list"][3]["|cba < text"] == "text");			

			console.assert(test_object["|c < list"][3]["|cbb < structure"].__orderedRelations["<"][0][0].name = "cbb");
			console.assert(test_object["|c < list"][3]["|cbb < structure"].__orderedRelations["<"][0][1].name = "structure");

			console.assert(test_object["|c < list"][3]["|cbb < structure"]["|cbba < text"].__orderedRelations["<"][0][0].name = "cbba");
			console.assert(test_object["|c < list"][3]["|cbb < structure"]["|cbba < text"].__orderedRelations["<"][0][1].name = "text");
			console.assert(test_object["|c < list"][3]["|cbb < structure"]["|cbba < text"] instanceof String);
			console.assert(test_object["|c < list"][3]["|cbb < structure"]["|cbba < text"] == "123");	
			
			console.assert(test_object["|c < list"][4].__orderedRelations["<"][0][0].name = "list");
			console.assert(test_object["|c < list"][4] instanceof Array);

			console.assert(test_object["|c < list"][4][0].__orderedRelations["<"][0][0].name = "number");
			console.assert(test_object["|c < list"][4][0] instanceof Number);
			console.assert(test_object["|c < list"][4][0] == 4);

			console.assert(test_object["|c < list"][4][1].__orderedRelations["<"][0][0].name = "number");
			console.assert(test_object["|c < list"][4][1] instanceof Number);
			console.assert(test_object["|c < list"][4][1] == 5);			

			console.assert(test_object["|c < list"][4][2].__orderedRelations["<"][0][0].name = "number");			
			console.assert(test_object["|c < list"][4][2] instanceof Number);
			console.assert(test_object["|c < list"][4][2] == 6);

			// Never touch an non-prefixed element!
			console.assert(test_object["anything"].__orderedRelations == null);
			console.assert(test_object["anything"] == "this is not seen as semantic object");
		},
		
	"Satisfying ordered definitions":
		function()
		{
			console.assert("|a < b < c"._satisfies("|a < b < c") == 0);
			console.assert("|a < b < c"._satisfies("|?a < b < c") == 1);
			console.assert("|a < b < c"._satisfies("|?a < ?b < c") == 2);
			console.assert("|a < b < c"._satisfies("|?a < ?b < ?c") == 3);
			console.assert("|p < a < b < c"._satisfies("|?a < ?b < ?c") == 3);
			console.assert("|a < b < c"._satisfies("|b < c") == 0);
			console.assert("|a < b < c"._satisfies("|. < c") == 0);
			console.assert("|a < b1 < b < b2 < c"._satisfies("|a < ?b < c") == 1);
			console.assert("|a < b1 < b < b2 < c"._satisfies("|a < ?e < ?q < b < c") == 0);
			console.assert("|a < b1 < b < b2 < c"._satisfies("|a < ?e < ?b < ?b1 < c") == 1);
			console.assert("|a < b1 < b < b2 < c"._satisfies("|a < ?e < ?b1 < ?z < ?b < c") == 2);
			console.assert("|a < b < c"._satisfies("|a < b < +") == 0);
			console.assert("|a < b < c"._satisfies("|a < ?+ < c") == 1);

			console.assert("|a < c"._satisfies("|a < b") == -1);

			console.assert("|a < b < c"._satisfies("|a < ?b < c") == 1);
			console.assert("|a < b < c"._satisfies("|a < b < ?c") == 1);

			// Handling of the * term
			console.assert("|* < c"._satisfies("|a < b < ?c") == 1);
			console.assert("|* < c"._satisfies("|a < ?b < c") == 1);
			console.assert("|* < c"._satisfies("|?a < b < c") == 1);
			console.assert("|* < c"._satisfies("|?a < ?b < c") == 2);

			console.assert("|a < * < c"._satisfies("|a < ?b1 < b2 < c") == 1);

			console.assert("|a < * < c"._satisfies("|a < ?* < c") == 0);
			console.assert("|* < a < b < c"._satisfies("|?* < a < b < c") == 0);
		
			console.assert("|a < b < c < d"._satisfies("|a < b < ?*") == 0);
			console.assert("|a < b < c < d"._satisfies("|?* < c < d") == 0);			
			
			console.assert("|a < b < c"._satisfies("|a < b < c < *") == -1);

			// Multiple relations			
			console.assert("|a < b; d < e"._satisfies("|a < b") == 0);
			console.assert("|a < b; a < b < c < d"._satisfies("|?a < ?b < ?c") == 3);
			console.assert("|a < b; c < d"._satisfies("|e < f; c < d") == -1);
			console.assert("|a < b"._satisfies("|a < b; ?d < ?e") == 0);	

			// Empty second relation
			console.assert("|a < b"._satisfies("|a < b; ?d << ?e") == 0);	
		},

	"Satisfying unordered definitions":
		function()
		{
			console.assert("|[a, b, c]"._satisfies("|[a, b, c]") == 0);
			console.assert("|[a, b, c]"._satisfies("|[?a, b, c]") == 1);
			console.assert("|[a, b, c]"._satisfies("|[?a, ?b, c]") == 2);
			console.assert("|[a, b, c]"._satisfies("|[?a, ?b, ?c]") == 3);			
			console.assert("|[a, b, c]"._satisfies("|[c, ?b, a]") == 1);
			console.assert("|[a, b, c]"._satisfies("|[c, ?a, b]") == 1);
			console.assert("|[c, b, a]"._satisfies("|[a, ?b, c]") == 1);
			console.assert("|[a, b, d]"._satisfies("|[c, b, a]") == -1);

			// Handling of the * term
			console.assert("|[a, b, c, d]"._satisfies("|[?c, ?*, a]") == 1);
			console.assert("|[a, b, c, d]"._satisfies("|[?*, b, a]") == 0);
			console.assert("|[a, b, c, d]"._satisfies("|[d, a, ?*]") == 0);

			console.assert("|[*, b, c, d]"._satisfies("|[x, ?y, b, a]") == 0);
			console.assert("|[*, b, c, d]"._satisfies("|[x, y, b, a]") == 0);
			
			// Multiple relations			
			console.assert("|[a, b]; [d, e]"._satisfies("|[a, b]") == 0);
			console.assert("|[a, b]; [a, b, c, d]"._satisfies("|[?a, ?b, ?c]") == 3);			
			console.assert("|[a, b]; [c, d]"._satisfies("|[e, f]; [c, d]") == -1);
			
			// Empty second relation
			console.assert("|[a, b]"._satisfies("|[a, b]; <(?d, ?e)>") == 0);	
			
		},
		
	"Satisfying variadic definitions (yee side)":
		function()
		{
			console.assert("|a < b < c; [e, f]"._satisfies("|a < b < c; [~p, f]; ?p < ?q < ?r < ?e < ?s < ?t") == 0);
			console.assert("|a < b < c; [e, f]"._satisfies("|a < b < c; [~?p, f]; ?p < ?q < ?r < ?e < ?s < ?t") == 1);
			console.assert("|a < b < c; e << f"._satisfies("|a < b < c; ~p << f; ?p < ?q < ?r < ?e < ?s < ?t") == 0);
			console.assert("|a < b < c; e << f"._satisfies("|a < b < c; ~?p << f; ?p < ?q < ?r < ?e < ?s < ?t") == 1);

			console.assert("|a < b < c; [e, f]"._satisfies("|a < b < c; [~p, f]; ?e < ?q < ?r < ?p < ?s < ?t") == -1);
			console.assert("|a < b < c; e << f"._satisfies("|a < b < c; ~p << f; ?e < ?q < ?r < ?p < ?s < ?t") == -1);

		},
		
	"Satisfying variadic definitions (ier side)":
		function()
		{
			console.assert("|a < b < c; [~p, f]; ?p < ?q < ?r < ?e < ?s < ?t"._satisfies("|a < b < c; [e, f]") == 0);
			console.assert("|a < b < c; [~p, f]; ?p < ?q < ?r < ?e < ?s < ?t"._satisfies("|a < b < c; [?e, f]") == 1);
		},

	"Satisfying variadic definitions (both sides)":
		function()
		{
			console.assert("|a < b < c; [~p, f]; ?p < ?q < ?r < ?e < ?s < ?t"._satisfies("|a < b < c; [~m, f]; ?m < e < s < t") == 0);
			console.assert("|a < b < c; [~p, f]; ?p < ?q < ?r < ?e < ?s < ?t"._satisfies("|a < b < c; [?~m, f]; ?m < e < s < t") == 1);
		},
		
	"Evaluation of preconditions":
		function()
		{
			// Simple preconditions
			console.assert("|a < b; c < d"._satisfies("|a < b; c: q < u") == -1);
			console.assert("|a < b; c < d; [e, f]"._satisfies("|a < b; c: [e, f]") == 0);

			// Multiple preconditions
			console.assert("|a < b; d; [e, f]"._satisfies("|a < b; c: [?e, f]") == 0);			
						
			// Options and preconditions
			console.assert("|a < b; d; [e, f]"._satisfies("|a < b; c, d: [?e, f]") == 1);
			console.assert("|a < b; c < d; [e, f]"._satisfies("|a < b; c: [?e, f]") == 1);
			console.assert("|a < b"._satisfies("|a < b; c: [e, f]") == 0);
			console.assert("|a < b"._satisfies("|a < b; c: [?e, f]") == 0);
			console.assert("|a < b"._satisfies("|a < ?b; c: [?e, f]") == 1);			

			// Ignore preconditions on the ier-side			
			console.assert("|a < b; m: c < d"._satisfies("|a < b; c < d") == 0);
		}
}

