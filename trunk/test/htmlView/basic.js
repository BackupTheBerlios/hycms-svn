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
	"Plain text views":
		function()
		{
			console.assert( testView( "abc", "|text", "<span class='text' uuid='$UUID'>abc</span>" ) );
			console.assert( testView( "abc", "|?foobar < text", "<span class='text' uuid='$UUID'>abc</span>" ) );

			console.assert( testView( true, "|boolean", "<span class='boolean' uuid='$UUID'>true</span>" ) );

			console.assert( testView( 1234, "|number", "<span class='number' uuid='$UUID'>1234</span>" ) );
			console.assert( testView( 1234.5678, "|number", "<span class='number' uuid='$UUID'>1234.5678</span>" ) );

			console.assert( testView( "abc", "|important_text < text", "<b class='important_text' uuid='$UUID'>abc</b>" ) );
			console.assert( testView( "abc", "|identifier < text", "<i class='identifier' uuid='$UUID'>abc</i>" ) );
			console.assert( testView( "abc", "|error < text", "<b class='error' uuid='$UUID'>abc</b>" ) );


			console.assert( testView( "http://google.de", "|url < text", "<a class='url' uuid='$UUID' href='http://google.de'>http://google.de</a>" ) );
		},
		
	"Structure view":
		function()
		{
			var abc = "abc"._as("|?xyz < text");
			var def = "def"._as("|?b < text");
		
			console.assert( testView( {"|?xyz < text": abc, "|?b < text": def },
									  "|?foo < structure",
									    "<table class='structure' uuid='$UUID'>"
									  + "<tr><td>Xyz</td><td><span class='text' uuid='"+abc.__uuid+"'>abc</span></td></tr>"
									  + "<tr><td>B</td><td><span class='text' uuid='"+def.__uuid+"'>def</span></td></tr>"
									  + "</table>"
									)
						  );
		
			var recursive = "pqr"._as("|?recursion_test < text");
		
			console.assert( testRecursiveView( {"|?recursion_test < text": recursive},
										   	   "|structure",
									    	    "<table class='structure' uuid='$UUID'>"
									  		  + "<tr><td>Recursion test</td><td><span class='recursion_test' uuid='"+recursive.__uuid+"' recursion_test='true'>pqr</span></td></tr>"
									  		  + "</table>"
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
									    "<table class='list' uuid='$UUID'>"
									  + "<tr><td>0</td><td><span class='text' uuid='"+abc.__uuid+"'>abc</span></td></tr>"
									  + "<tr><td>1</td><td><span class='text' uuid='"+def.__uuid+"'>def</span></td></tr>"
									  + "</table>"
									)
						  );
		
			var recursive = "pqr"._as("|?recursion_test < text");
		
			console.assert( testRecursiveView( [recursive],
										   	   "|list",
									    	    "<table class='list' uuid='$UUID'>"
									  		  + "<tr><td>0</td><td><span class='recursion_test' uuid='"+recursive.__uuid+"' recursion_test='true'>pqr</span></td></tr>"
									  		  + "</table>"
											 )
						  );
		}
		
}

