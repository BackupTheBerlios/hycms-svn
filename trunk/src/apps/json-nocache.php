<html>
<head>
	<title>JSON-View: <? echo $_GET["hycms_content"] ?></title>

	<link rel="stylesheet" type="text/css" href="nocache.css">

<? include "../services/setup.php" ?>	
<? include "../services/packages.php" ?>

	<script type='text/javascript' charset='UTF-8'>
		function viewFunction(content)
		{
			console.profile();
			var html = "|View; <(json)>; json < text"._send ( content );
			console.profileEnd();
				
			document.body.innerHTML = "<div style='white-space:pre; font-family:monospace'>"+html.html_text()+"</div>";
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

