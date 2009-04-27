/*
 * hyObjects(js)
 *
 * Test suite
 *
 * Copyright(C) 2009 by Friedrich Gräter
 * Published under the terms of the GNU General Public License v2
 *
 */
function doTest(test_suites)
{
	for (var suite_id in test_suites) {
		var test_count = 0;
		var failed_tests = 0;	
		var suite = test_suites[suite_id];
		
		if (test_suites.__proto__[suite_id] == suite)
			continue;
	
		console.group("Test suite: "+suite_id);
		
		for (var item in suite) {
			if (suite.__proto__[item] == suite[item])
				continue;

			console.group("Testing "+item);
			
			try {
				suite[item]();
			}
			 catch(e) {
			 	console.log(e);
			 	failed_tests ++;
			}
			
			test_count ++;
			
			console.groupEnd();
		}
		
		console.log(failed_tests+"/"+test_count+" tests failed.");				
		console.groupEnd();
	}
}

function assertException(func, expected, output)
{
	var catched = false;

	if (output == null)
		output = "Exception not catched";

	try {
		func();
	}
	 catch(e) {
	 	console.assert(e instanceof expected, output+" - "+e);
	 	catched = true;
	}
	
	if (catched == false)
		console.assert(false, output+" - "+"No exception retrieved");
}

