/*
 * hyObjects(js)
 *
 * Test suite
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
var dispatcherTest =
{
		"Initialization":
			function()
			{
				var dispatcher = new Dispatcher();
				
				console.assert(dispatcher.functions.length == 0);
			},
			
		"Registering functions":
			function()
			{
				var dispatcher = new Dispatcher();
				
				function foo() { return 0; }
				function bar() { return 0; }
				
				foo._as("|a < b");
				bar._as("|c < d");
				
				dispatcher.register(foo);
				dispatcher.register(bar);
				
				console.assert(dispatcher.functions.length == 2);
				console.assert(dispatcher.functions[0] == foo);
				console.assert(dispatcher.functions[1] == bar);				
			},
		
		"Not acceppting other objects":
			function()
			{
				var dispatcher = new Dispatcher();
				
				assertException(function() { dispatcher.register("abc") }, InvalidFunctionError);
			},

		"Not acceppting functions without definition":
			function()
			{
				var dispatcher = new Dispatcher();
				
				assertException(function() { dispatcher.register(function foo() { return 0; }) }, MissingDefinitionError);
			},
					
		"Finding functions":
			function()
			{
				var dispatcher = new Dispatcher();
				
				function f_a() { return 0; }
				function f_b() { return 0; }
				function f_c() { return 0; }
				
				f_a._as("|a < b", ">(~foo)<; foo < text", "<(~bar)>; bar < text");
				f_b._as("|?m < ?a < b", ">(~foo)<; foo < text", "<(~bar)>; bar < text");
				f_c._as("|c < d", ">(~foo)<; foo < text", "<(~bar)>; bar < text");
				
				dispatcher.register(f_a);
				dispatcher.register(f_b);
				dispatcher.register(f_c);

				var node_a = dispatcher.find("|a < b", ">(~foo)<; foo < text", "<(~bar)>; bar < text");
				var node_b = dispatcher.find("|?m < a < b", ">(~foo)<; foo < text", "<(~bar)>; bar < text");

				console.assert(node_a == f_a || node_a == f_b);
				console.assert(node_b == f_b);

				var no = dispatcher.find("|x", ">(~foo)<; foo < text", "<(~bar)>; bar < text");
				console.assert(no == null);
				
				var no_t = dispatcher.find("|x", ">(~foo)<; foo < text", "<(~bar)>; bar < text", true);
				console.assert(no_t == null);
								
				var list_a = dispatcher.find("|b", ">(foo)<; foo < text", "<(bar)>; bar < text", true);
				var list_b = dispatcher.find("|m < a < b", ">(foo)<; foo < text", "<(bar)>; bar < text", true);				
				var list_b1 = dispatcher.find("|?m < a < b", ">(foo)<; foo < text", "<(bar)>; bar < text", true);				
				var list_c = dispatcher.find("|?a < b", ">(foo)<; foo < text", "<(bar)>; bar < text", true);
				
				console.assert(list_a.length == 1);
				console.assert(list_a[0] == f_b);
				
				console.assert(list_b.length == 1);
				console.assert(list_b[0] == f_b);

				console.assert(list_b1.length == 2);

				console.assert(f_a == list_b1[0] || f_a == list_b1[1]);
				console.assert(f_b == list_b1[0] || f_b == list_b1[1]);

				console.assert(list_c.length == 2);
				console.assert(f_a == list_c[0] || f_a == list_c[1]);
				console.assert(f_b == list_c[0] || f_b == list_c[1]);
			},
			
		"Sending a message to a function":
			function()
			{
				var dispatcher = new Dispatcher();
				
				function f_a(input) { input._get("foo"); return input._get("foo"); }
				function f_b(input) { input._get("foo"); return "NON"+input._get("foo"); }
				
				f_a._as("|a < b", ">(~foo)<; ?foo < text");
				f_b._as("|a < b", ">(~foo)<; foo < bar");

				dispatcher.register(f_a);
				dispatcher.register(f_b);
				
				console.assert( dispatcher.send( ["|a < b"], ["xyz"._as("|?foo < text")] ) == "xyz" );
			},
			
		"Sending a message to a function (multiple parameters)":
			function()
			{
				var dispatcher = new Dispatcher();
				
				function f_a(input) { input._get("text"); return input._get("foo") + "+" + input._get("goo"); }
				function f_b(input) {  return input._get("bar") + "-" + input._get("gar"); }
				
				f_a._as("|a < b", ">(~foo, ~goo)<; foo < text; goo < text");
				f_b._as("|a < b", ">(~foo, ~goo)<; ?foo < bar; ?goo < gar");

				dispatcher.register(f_a);
				dispatcher.register(f_b);
				
				console.assert( dispatcher.send( ["|a < b"], ["xyz"._as("|?foo < text"), "pqr"._as("|?goo < text")] ) == "xyz+pqr" );
				console.assert( dispatcher.send( ["|a < b"], ["xyz"._as("|bar"), "pqr"._as("|gar")] ) == "xyz-pqr" );				
			},			
			
		"Watching a function call":
			function()
			{
				var dispatcher = new Dispatcher();
				var befores = new Array();
				var afters = new Array();
				
				function f_a(input) { return "f_a out: "+input._get("foo"); }
				function f_b(input) { return "f_b out: "+input._get("foo"); }
				
				f_a._as("|a < b", ">(~foo)<; foo < text");
				f_b._as("|a < b", ">(~foo)<; foo < bar");

				dispatcher.register(f_a);
				dispatcher.register(f_b);

				var c_a = dispatcher.watch(["|a < b", ">(?*)<; foo < ?*"], ":before", 
					function(receiver, input) { 
						befores.push([receiver, input._get("foo")]); 
						return {"|foo < text": "1"+input._get("foo")}._as("|message < object"); 
					} 
				);
				
				var c_b = dispatcher.watch(["|a < b", ">(?*)<; foo < ?*"], ":after", 
					function(receiver, retval) {
						afters.push([receiver, retval]); 
												
						return retval+"1";
					} 
				);
				
				console.assert( c_a == 2 );
				console.assert( c_b == 2 );
				
				assertException(function() { dispatcher.watch(["|a < b", ">(?*)<"], ":foo", function() { return 0; }); }, InvalidPointcutError);
				
				console.assert( dispatcher.send( ["|a < b"], ["xyz"._as("|foo < ?text")] ) == "f_a out: 1xyz1");
				console.assert( dispatcher.send( ["|a < b"], ["xyz"._as("|foo < ?bar")] ) == "f_b out: 1xyz1");
				
				console.assert( befores[0][0] == f_a );
				console.assert( befores[1][0] == f_b );
				console.assert( befores[0][1] == "xyz" );
				console.assert( befores[1][1] == "xyz" );

				console.assert( afters[0][0] == f_a );
				console.assert( afters[1][0] == f_b );
				console.assert( afters[0][1] == "f_a out: 1xyz" );
				console.assert( afters[1][1] == "f_b out: 1xyz" );
				
			},
			
		"Using the global dispatcher":
			function()
			{
				var befores = new Array();
			
				function f_a(input) { return "f_a out: "+input._get("foo"); }
				
				f_a._register("|a < b", ">(~foo)<; foo < text");
				
				function observer(receiver, input) { 
						befores.push([receiver, input._get("foo")]); 
						return {"|foo < text": "1"+input._get("foo")}._as("|message < object"); 
					} 
				
				console.assert( observer._observe(["|a < b", ">(?*)<; foo < ?*"], ":before") == 1);
				
				console.assert( "|a < b"._send( "xyz"._as("|foo < ?text") ) == "f_a out: 1xyz");

				console.assert( befores[0][0] == f_a );
				console.assert( befores[0][1] == "xyz" );
			}
}

