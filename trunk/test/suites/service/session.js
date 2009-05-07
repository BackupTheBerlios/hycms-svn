/*
 * hyObjects(js)
 *
 * Test suite
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
var sessionTest =
{
	"A simple test":
		function()
		{
			// With console.assert() you can test, if a certain condition is TRUE or not. If it is false, you will get an error message with firebug
			console.assert("|a < b; c < d"._satisfies("|a < b; c: q < u") == -1);

			// assertException() tests whether the given function in the first parameter raises an exception or not. If it raises
			// an exception, it should be the exception from the second parameter (in this case the given function should raise
			// InvalidDefinitionError
			assertException( function() { var a = "my_text"; a._as("|foo < ??bar"); }, InvalidDefinitionError );
		}
}

