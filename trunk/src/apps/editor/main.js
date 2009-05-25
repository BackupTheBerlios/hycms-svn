/*
 * Editor application
 *
 */
var mainEditor;


/*
 * mainEditor.onSelectionChanged
 *
 * Will be called, if a new element was selected. This function
 * will update the toolbar according to the selection.
 *
 */
"onSelectionChanged".__declare({
	_whereas:	"this == mainEditor",

_does:
	function ()
	{
		if (this.focussedContent) {
			var uuidArray = [];
			var tagArray = [];

			this.currentSemantics = this.focussedContent.__getTagging();

			for (var idx = 0; idx < this.focussedViewContext.length; idx ++) {
				if (this.focussedViewContext[idx] != null)
					tagArray.splice(0, 0, this.focussedViewContext[idx].__getClassName() );
					
				uuidArray.push(this.focussedViewContext[idx].__uuid);
			}
			tagArray.push(this.focussedContent.__getClassName());
			uuidArray.push(this.focussedContent.__uuid);
		
			document.getElementById("semantics").innerHTML = tagArray.join(" &gt; ") + " - ("+uuidArray.join(" > ") +")";
		}
	}
});

/*
 * Main program
 *
 */
function main(contentPath) 
{
	mainEditor = ["editable_html_controller", "html_controller", "controller"]._construct({view: document.getElementById("container")});

	mainEditor._showReference({contentPath: contentPath});
}
