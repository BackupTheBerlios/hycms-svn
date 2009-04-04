/*
 * hyObjects(js)
 *
 * Test suite
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
var basicViewTest =
{
	"Plain data type views":
		function()
		{
			console.assert( testView( "abc", "|text", "\"abc\"" ) );
			console.assert( testView( "a\"bc", "|text", "\"a\\\"bc\"" ) );

			console.assert( testView( "abc", "|?foobar < text", "{__def: \"|?foobar < text\", __value: \"abc\"}" ) );

			console.assert( testView( true, "|boolean", "true" ) );
			console.assert( testView( true, "|?foobar < boolean", "{__def: \"|?foobar < boolean\", __value: true}" ) );
			
			console.assert( testView( 1234, "|number", "1234" ) );
			console.assert( testView( 1234.5678, "|number", "1234.5678" ) );
			console.assert( testView( 4321, "|?foobar < number", "{__def: \"|?foobar < number\", __value: 4321}" ) );


		},
		
	"Structure view":
		function()
		{
			var abc = "abc"._as("|?xyz < text");
			var def = "def"._as("|?b < text");
		
			console.assert( testView( {"|?xyz < text": abc, "|?b < text": def },
									  "|?foo < structure",
									       "{__def:\t\t\"|?foo < structure\",\n"
									    +  " \"|?xyz < text\":\t{__def: \"|?xyz < text\", __value: \"abc\"},\n"
									    +  " \"|?b < text\":\t{__def: \"|?b < text\", __value: \"def\"}\n"
									    +  "}"
									)
						  );
		},
		
	"List view":
		function()
		{
			var abc = "abc"._as("|?xyz < text");
			var def = "def"._as("|?b < text");
		
			console.assert( testView( [abc, def],
									  "|?foo < list",
									       "{__def: \"|?foo < list\",\n"
									    +  " __value:\n"
									    +  "\t[\n"  
									    +  "\t {__def: \"|?xyz < text\", __value: \"abc\"},\n"
									    +  "\t {__def: \"|?b < text\", __value: \"def\"}\n"
									    +  " \t]\n"
									    +  "}"
									)
						  );		
		}
		
}

