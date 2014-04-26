/* MoodleR Progress Extension */
MoodleR.progress={
	initial : -120,
	imageWidth : 240,
	
	/* Imports css into page */
	addCss : function(_window){
		var pa=_window.document.getElementsByTagName('head')[0];
		var el=_window.document.createElement('style');
		el.type='text/css';
		el.media='screen';
		var str='div.percentImage{';
		str+='		background: white url(resource://moodler-icons/percentImage.png) top left no-repeat;';
		str+='		padding: 0px;';
		str+='		width: 120px;';
		str+='		margin: auto;';
		str+='		line-height: 10px;';
		str+='		border: 1px solid #999;';
		str+='		background-position: 0px -1px;';
		str+='}';
		el.appendChild(_window.document.createTextNode(str));
		pa.appendChild(el);
	},
	
	/* Display the progress bar */
	display : function (element,id,percentage){
		var percentageX=this.eachPercent*percentage;
		var positionX=this.initial+percentageX;
		
		var d = MoodleR.$("<div />");
		d.attr('id', id).addClass('percentImage').css("background-position", positionX+'px -1px').html("&nbsp;");
		element.removeChild(element.childNodes[0]);
		element.appendChild(d[0]);
	},
	
	/* Fill the progress */
	fillProgress : function(element_id, targetPercent){	
		// Make sure the element is there
		var element=MoodleR.$("div[id='"+element_id+"']");
		if(element.length == 0) return;
		
		if(targetPercent <= 100){
			var currentX = targetPercent * this.eachPercent + this.initial;
			
			element.css("background-position", currentX + "px -1px")
		}
	}
};

MoodleR.progress.eachPercent=(MoodleR.progress.imageWidth/2)/100;