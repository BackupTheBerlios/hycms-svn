<?	if ($_GET["suite"] == "") {?> <html></html> <?} else { ?>
	<html>
	<head>
		
		<?
			$src = file($_GET["suite"]);
			$title = trim(substr($src[0], 3));
			$suite_name = "";
		?>
			<script type='text/javascript' charset='UTF-8'>parent.document.title = "<?=$title?>";</script>
	<!-- Predicate JS engine -->
			<script src="../../src/engine/tagging.js"></script>
			<script src="../../src/engine/serialization.js"></script>
			<script src="../../src/engine/dispatcher.js"></script>

	<!-- Test requirements -->
		<?

		/* Including test requirements */
		$REQUIRES = "// Requires:";
		$TESTS = "// Tests:";
		$SUITE = "// Suite:";
	
		foreach($src as $sline) {
			$line = trim($sline);
			$parameter = "";

			if ($sline == "") continue;
			if (substr($sline, 0, 2) != "//") break;
	
			if (strpos($line, $REQUIRES) !== false) {
				$parameter = trim(substr($line, strlen($REQUIRES)));
			}
			 else if (strpos($line, $TESTS) !== false) {
				$parameter = trim(substr($line, strlen($TESTS)));
			}
 			 else if (strpos($line, $SUITE) !== false) {
				$suite_name = trim(substr($line, strlen($TESTS)));
			}			
			
			if ($parameter != "") {
				echo "\t<script src='../../src/$parameter'></script>\n";
			}
		}
	
		?>

	<!-- The test suite script -->
	<script src='<?=$_GET["suite"]?>'></script>

	</head>
	<body style='font-family:sans serif'>
		<!-- Helper functions of the test system -->
		<script src="./non-firebug.js"></script>
		<script src="./test.js"></script>
		
		<!-- Show title and start test -->
		<h1><?=$title?><br/></h1>
		<script>
	
			if (!non_firebug) {
				document.body.innerHTML += "The test output was written to the firebug console.";
				console.clear();
			}

			doTest({	"<?=$title?>":	<?=$suite_name?>	});
	
		</script>
	
	</body>
	</html>

<? } ?>

