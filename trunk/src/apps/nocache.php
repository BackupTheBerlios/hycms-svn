<html>
<head>
	<title>View: <? echo $_GET["hycms_content"] ?></title>

	<link rel="stylesheet" type="text/css" href="nocache.css">

<? include "../services/setup.php" ?>	
<? include "../services/packages.php" ?>

	<script type='text/javascript' charset='UTF-8'>
		function viewFunction(content)
		{
			var html = content._view(Request(["*", "html", "text"], "?recursive_context"));
				
			document.body.innerHTML = html;
		}
	
		function main(contentPath) {		
			contentPath._downloadContent( viewFunction );
		}
	</script>
	
</head>
<body onload="main('<?=$_GET['hycms_content']?>')">
 Loading and rendering content...
</body>
</html>

