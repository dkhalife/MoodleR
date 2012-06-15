/* MoodleR Progress Extension */
MoodleR.Progress={
	initial : -120,
	imageWidth : 240,
	add_css : function(_window){
		pa=_window.document.getElementsByTagName('head')[0];
		el=_window.document.createElement('style');
		el.type='text/css';
		el.media='screen';
		str='img.percentImage{';
		str+='		background: white url(http://www.webappers.com/progressBar/images/percentImage_back4.png) top left no-repeat;';
		str+='		padding: 0;';
		str+='		margin: 5px 0 0 0;';
		str+='		background-position: 1px 0;';
		str+='}';
		el.appendChild(_window.document.createTextNode(str));
		pa.appendChild(el);
	},
	setText : function(element, percent){
		element.innerHTML = percent+"%";
	},
	passThrew : function(element){
		return MoodleR.Xpath("//span[@id='"+element.id+"Text']",9);
	},
	display : function (element,id,percentage){
		var percentageWidth=this.eachPercent*percentage;
		actualWidth=this.initial+percentageWidth;
		element.innerHTML='<img id="'+id+'" src="http://www.webappers.com/progressBar/images/percentImage.png" alt="'+percentage+'%" class="percentImage" style="background-position: '+actualWidth+'px 0pt;"/>&nbsp;<span id="'+id+'Text">'+percentage+'%</span>';
	},
	emptyProgress : function(element){
		var newProgress=this.initial+'px';
		element.style.backgroundPosition=newProgress+' 0';
		this.setText(this.passThrew(element),'0');
	},
	getProgress : function(element){
		var nowWidth=element.style.backgroundPosition.split("px");
		return (Math.floor(100+(nowWidth[0]/this.eachPercent))+'%');
	},
	setProgress : function(element, percentage){
		var percentageWidth=this.eachPercent*percentage;
		var newProgress=(this.initial-(-percentageWidth))+'px';
		element.style.backgroundPosition=newProgress+' 0';
		this.setText(this.passThrew(element),percentage);
	},
	plus : function(element,percentage){
		var nowWidth=element.style.backgroundPosition.split("px");
		var nowPercent=Math.floor(100+(nowWidth[0]/this.eachPercent))-(-percentage);
		var percentageWidth=this.eachPercent*percentage;
		var actualWidth=nowWidth[0]-(-percentageWidth);
		var newProgress=actualWidth+'px';
		if(actualWidth>=0 && percentage <100){
			var newProgress=1+'px';
			element.style.backgroundPosition=newProgress+' 0';
			this.setText(this.passThrew(element),100);
		}
		else{
			element.style.backgroundPosition=newProgress+' 0';
			this.setText(this.passThrew(element),nowPercent);
		}
	},
	minus : function(element, percentage){
		var nowWidth=element.style.backgroundPosition.split("px");
		var nowPercent=Math.floor(100+(nowWidth[0]/this.eachPercent))-percentage;
		var percentageWidth=this.eachPercent*percentage;
		var actualWidth=nowWidth[0]-(-percentageWidth);
		var newProgress=actualWidth+'px';
		if(actualWidth<=-120){
			var newProgress=-120+'px';
			element.style.backgroundPosition=newProgress+' 0';
			this.setText(this.passThrew(element),0);
		}
		else{
			element.style.backgroundPosition=newProgress+' 0';
			this.setText(this.passThrew(element),nowPercent);
		}
	},
	fillProgress : function(element_id, endPercent){
		var element=MoodleR.Xpath("//img[@id='"+element_id+"']",9);
		if(!element){ 
			return;
		}
		var nowWidth=element.style.backgroundPosition.split("px");
		var startPercent=Math.ceil(100+(nowWidth[0]/this.eachPercent))-(-1);
		var actualWidth=this.initial+(this.eachPercent*endPercent);
		if(startPercent <=endPercent && nowWidth[0]<=actualWidth){
			this.plus(element,'1');
			this.setText(element,startPercent);
			setTimeout("MoodleR.Progress.fillProgress('"+element_id+"',"+endPercent+")",5);
		}
	}
};

MoodleR.Progress.eachPercent=(MoodleR.Progress.imageWidth/2)/100;