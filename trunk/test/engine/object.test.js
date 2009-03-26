/*
 * hyObjects(js)
 *
 * Test suite
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
var objectTest =
{
	"Getter":
		function()
		{
			var test_object = {"|a < text":		"foo",
							   "|b < text":		"foobar",
							   "|c < bar":		"cbar"
							  };
			
			test_object._as();
							  
			console.assert(test_object._get("text") == "foo");
			console.assert(test_object._get("a") == "foo");
			console.assert(test_object._get("b") == "foobar");
			console.assert(test_object._get("bar") == "cbar");
			console.assert(test_object._get("d") == null);			
		},

	"Getter (All)":
		function()
		{
			var test_object = {"|a < text":		"foo",
							   "|b < text":		"foobar",
							   "|c < bar":		"else"
							  };
			
			test_object._as();

			console.assert(test_object._getAll("text").length == 2);							  
			console.assert(test_object._getAll("text")[0] == "foo");
			console.assert(test_object._getAll("text")[1] == "foobar");
		},
		
	"Iterate (Object)":
		function()
		{
			var test_object = {"x":				"not iterated",
							   "|a < text":		"foo",
							   "|b < text":		"foobar",
							   "|c < bar":		"else",
							   "|d < e":		"blubb"
							  };
				
			var has_key = {"x":				null,
						   "|a < text":		null,
						   "|b < text":		null,
						   "|c < bar":		null,
						   "|d < e":		null
						  };
			
			test_object._as();

			var num =
				test_object._iterate( function(element, key) {
					has_key[key] = element;

					if (key == "|c < bar")
						return -1;
				});

			console.assert(num == 3);		
			console.assert(has_key["|a < text"] == "foo");
			console.assert(has_key["|b < text"] == "foobar");
			console.assert(has_key["|c < bar"] == "else");
			console.assert(has_key["|d < e"] == null);
			console.assert(has_key["x"] == null);			
		},	
		
	"Iterate (Array)":
		function()
		{
			var test_array = [1, 2, 3, 4];
			var has_key = [];
			
			var num =
				test_array._iterate( function(element, key) {
					has_key[key] = element;
				
					if (element == 3)
						return -1;	
				});
			
			console.assert(num == 3);
			console.assert(has_key[0] == 1);
			console.assert(has_key[1] == 2);
			console.assert(has_key[2] == 3);
			console.assert(has_key[3] == null);			
		},
		
	"Setter":
		function()
		{
			var test_object = {"|a < text":		"foo",
							   "|b < text":		"foobar",
							   "|c < bar":		"cbar"
							  };

			test_object._as();				  

			test_object._set("a", "faa");
			console.assert( test_object._get("a") == "faa" );
			console.assert( test_object._get("b") == "foobar" );
			console.assert( test_object._get("c") == "cbar" );					

			test_object._set("b", "fbb");
			console.assert( test_object._get("a") == "faa" );
			console.assert( test_object._get("b") == "fbb" );
			console.assert( test_object._get("c") == "cbar" );					

			test_object._set("text", "fuu");
			console.assert( test_object._get("a") == "fuu" );
			console.assert( test_object._get("b") == "fbb" );
			console.assert( test_object._get("c") == "cbar" );					

			assertException( function() { test_object._set("r", 1) }, ElementNotExistsError );
		},

	"Append":
		function()
		{
			var test_object = {"|a < text":		"foo",
							   "|b < text":		"foobar",
							   "|c < bar":		"cbar"
							  };

			test_object._as();				  

			test_object._append("fdd"._as("|d < bar"));
			console.assert( test_object._get("a") == "foo" );
			console.assert( test_object._get("b") == "foobar" );
			console.assert( test_object._get("c") == "cbar" );					
			console.assert( test_object._get("d") == "fdd" );

			assertException( function() { test_object._append("abc"._as("|d < bar")); }, ElementAlreadyExistsError );
		}
}

