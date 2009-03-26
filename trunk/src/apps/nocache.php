<html>
<head>
	<title>View: <? echo $_GET["hycms_content"] ?></title>

	<link rel="stylesheet" type="text/css" href="nocache.css">

<? include "../services/setup.php" ?>	
<? include "../services/packages.php" ?>

	<script type='text/javascript' charset='UTF-8'>
		function viewFunction(content)
		{
			var html = "|View; <(~html)>; ?html < text"._send ( content );
				
			document.body.innerHTML = html;
		}
	
		function main(content_path) {
			"|?SemanticDataProvider < DataProvider"._send ( content_path._as("|path < text"), 
															viewFunction._as("|callback < function") 
														  );
		
											  
		}
	</script>
	
</head>
<body onload="main('<?=$_GET['hycms_content']?>')">
 Loading and rendering content...
</body>
</html>

