/*
 * hyJS
 *
 * Test suite
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
var taggingTest =
{
	"Tagging an object":
		function()
		{
			var someObject = ({a: "abc"});

			someObject.__tag("abc", "def", "hij");

			console.assert( someObject.__def[0] == "abc" );
			console.assert( someObject.__def[1] == "def" );
			console.assert( someObject.__def[2] == "hij" );
			
			console.assert( someObject instanceof Object);
			
			console.assert( someObject.a == "abc" );
		},
		
	"Tagging an string":
		function()
		{
			var someString = "abcdef";
			
			someString = someString.__tag("abc", "def", "hij");
			
			console.assert( someString.__def[0] == "abc" );
			console.assert( someString.__def[1] == "def" );
			console.assert( someString.__def[2] == "hij" );
			
			console.assert( someString instanceof String );
			console.assert( typeof(someString) == "object" );			
			
			console.assert( someString == "abcdef" );
		},
		
	"Tagging a number":
		function()
		{
			var someNumber = 1234;
			
			someNumber = someNumber.__tag("abc", "def", "hij");
			
			console.assert( someNumber.__def[0] == "abc" );
			console.assert( someNumber.__def[1] == "def" );
			console.assert( someNumber.__def[2] == "hij" );
			
			console.assert( someNumber instanceof Number );
			console.assert( typeof(someNumber) == "object" );			
			
			console.assert( someNumber == 1234 );
		},
		
	"Tagging a boolean":
		function()
		{
			var someBool = true;
			
			someBool = someBool.__tag("abc", "def", "hij");
			
			console.assert( someBool.__def[0] == "abc" );
			console.assert( someBool.__def[1] == "def" );
			console.assert( someBool.__def[2] == "hij" );

			console.assert( someBool instanceof Boolean );
			console.assert( typeof(someBool) == "object" );
			
			console.assert( someBool == true );
		},
		
	"Tagging an array":
		function()
		{
			var someArray = [1,2,3,4];
			
			someArray = someArray.__tag("abc", "def", "hij");
			
			console.assert( someArray.__def[0] == "abc" );
			console.assert( someArray.__def[1] == "def" );
			console.assert( someArray.__def[2] == "hij" );

			console.assert( someArray instanceof Array );
			console.assert( typeof(someArray) == "object" );
			
			console.assert( someArray[0] == 1 );
			console.assert( someArray[1] == 2 );
			console.assert( someArray[2] == 3 );
			console.assert( someArray[3] == 4 );						
		},		
	
	"Handling exceptions of __tag":
		function()
		{
			var someString = "abcd";
			assertException(function() { someString.__tag(1234); }, InvalidTagError );

			var someObject = someString.__tag("xyz");
			assertException(function() { someObject.__tag("pqr"); }, AlreadyTaggedError );						
		},
		
	"Clearing tags":
		function()
		{
			var someString = "abcd";
			
			var someObject = someString.__tag("xyz");
			console.assert(someObject.__def[0] == "xyz");

			someObject.__untag();
			console.assert(someObject.__def == null);
			
			someObject.__tag("abc");
			console.assert(someObject.__def[0] == "abc");
		},
		
	"Evaluate a tagging (__taggedAs)":
		function()
		{
			var someString = "A nice tagged string";
			
			someObject = someString.__tag("abc", "def", "ghi", "jkl", "mno");
			
			console.assert( someObject.__taggedAs("abc", "def", "ghi", "jkl", "mno") == 5 );
			console.assert( someObject.__taggedAs("abc", "def", "*", "ghi", "*", "jkl", "mno") == 5 );
			console.assert( someObject.__taggedAs("abc", "def", "*", "ghi", "*", "*", "jkl", "mno") == 5 );
			console.assert( someObject.__taggedAs("abc", "def", "*", "jkl", "mno") == 4 );
			console.assert( someObject.__taggedAs("abc", "def", "jkl", "mno") == -1 );

			console.assert( someObject.__taggedAs("*", "lmn") == -1 );			
			
			console.assert( someObject.__taggedAs("*", "ghi", "jkl", "mno") == 3 );
			console.assert( someObject.__taggedAs("*", "ghi", "*") == 1 );

			console.assert( someObject.__taggedAs("abc", "*", "jkl", "*") == 2 );
			console.assert( someObject.__taggedAs("abc", "*", "jkl") == -1 );
			
			console.assert( someObject.__taggedAs("*", "*", "jkl", "*") == 1 );			

			console.assert( someObject.__taggedAs("abc", "def", "ghi", "+", "mno") == 4 );
			console.assert( someObject.__taggedAs("abc", "def", "ghi", "+", "jkl", "mno") == -1 );
			console.assert( someObject.__taggedAs("abc", "+", "jkl") == -1 );

			console.assert( someObject.__taggedAs("abc", "def", "*", "+", "mno") == 3 );

			console.assert( someObject.__taggedAs("abc", "def", "?ghi", "?qmn", "+", "mno") == 4 );
			console.assert( someObject.__taggedAs("abc", "*", "?jkl", "mno") == 3 );
			console.assert( someObject.__taggedAs("abc", "*", "?lur", "?psf", "mno") == 2 );
			

		},
				
	"Instance testing (__is)":
		function()
		{
			var someString = "A nice thing".__tag("abc", "def", "ghi");
			
			console.assert( someString.__is("def") );
			console.assert( (1234).__is("number") );
			console.assert( "abc".__is("text") );			
			console.assert( [1,2,3].__is("list") );
		}
}

