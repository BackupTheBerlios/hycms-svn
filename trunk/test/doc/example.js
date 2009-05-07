// Name of the test suite
// Suite:		theTestSuiteObject
// Requires:	path/to/some/requirement
// Tests:		path/to/the/file/to/test
var theTestSuiteObject =
{
	"Test of some conditions":
		function()
		{
			doAnything();
		
			console.assert( some_condition_a );
			console.assert( some_condition_b );
		},

	"Test of some exception":
		function()
		{
			assertException( function() { do_something_here }, ThisExceptionShouldHaveBeenCatched );			
		},
		
}

/*
 * For writing a test suite, you have to do the following things:
 *
 *	A. Header
 *	---------
 *	Each test suite has a header area. This area are the first javascript lines, which are
 *	commented out with "//"
 *
 *	The content of the header is structured as follows:
 *
 *	- The first line contains a short description of the test suite.
 *	- The second line contains: "Suite: objName", whereas objName is the name of the object
 *	  containing the test suite
 *
 *	- After that it is possible to place an arbitrary number of 'Requires' and 'Tests' line.
 *	  Lines prefixed by "Requires:" containing requirements for the test. Lines prefixed by
 *	  "Tests:" containing the modules to test. The test application will automatically load
 *	  these modules from the directory "src/".
 *
 *  B. The test suite
 *  -----------------
 *	The test suite is represented by a simple object. Each element is a particular test. The
 *	identifier of the element is used as the title of the particular test. For each element,
 *	the test application will execute the function referenced by the element.
 *
 *	Inside a test function you could use:
 *		console.assert( condition )								To test, if a certain condition was met
 *		assertException( code_block, expected_exception )		To test, if a code block throws an expected exception
 *
 *	Normally each particular test is used to test one particular aspect of the module (e.g. one
 *	particular method or operation). After execution of this operation, certain conditions should
 *  be tested using "console.assert()". 
 *
 *	Please note, that each particular test should be use a separate instance of the module to test. No
 *	global variables or state should be used inside a test, to prevent unclear or implicit state between 
 *  the tests.
 *
 */
