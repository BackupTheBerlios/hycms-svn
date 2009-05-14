<html>
<head>
	<title>View: <? echo $_GET["hycms_content"] ?></title>

	<link rel="stylesheet" type="text/css" href="nocache.css">

<? include "../services/setup.php" ?>	
<? include "../services/packages.php" ?>

	<script type='text/javascript' charset='UTF-8'>
		function viewFunction(content)
		{
			var html = content._view({_returns: ["*", "html", "text"], _features: "?recursive_context"});
				
			document.body.innerHTML = html;
		}
	
		function main(contentPath) {		
			contentPath._downloadContent({ callback: viewFunction });
		}
	</script>
	
</head>
<body onload="main('<?=$_GET['hycms_content']?>')">
 Loading and rendering content...
</body>
</html>

