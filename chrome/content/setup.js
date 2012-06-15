var MoodleR=window.arguments[0].MoodleR;

function onLoad(){
	document.getElementById("host").setAttribute("value",MoodleR.get_var("host",""));
	document.getElementById("dir").setAttribute("value",MoodleR.get_var("dir",""));
	document.getElementById("sem").setAttribute("value",MoodleR.get_var("semester",""));
	
	document.getElementById("host").addEventListener("click",setHost,false);
	document.getElementById("dir").addEventListener("click",setDir,false);
	document.getElementById("sem").addEventListener("click",setSem,false);
}

function setHost(){
	var val=prompt(MoodleR.lang("sethost"),MoodleR.get_var("host",""));
	if(val){
		MoodleR.host=val;
		MoodleR.set_var("host",val);
		document.getElementById("host").setAttribute("value",val);
	}
}

function setDir(){
	var fp=MoodleR.Cc["@mozilla.org/filepicker;1"].createInstance(MoodleR.nsIFilePicker);
	fp.init(window,MoodleR.lang("changedir"),MoodleR.nsIFilePicker.modeGetFolder);
	if(!fp.show()){
		MoodleR.dir=fp.file.path+MoodleR.SL;
		MoodleR.set_var("dir",fp.file.path+MoodleR.SL);
		document.getElementById("dir").setAttribute("value",fp.file.path+MoodleR.SL);
	}
}

function setSem(){
	var val=prompt(MoodleR.lang("changesem"),MoodleR.get_var("semester",""));
	if(val){
		MoodleR.semester=val;
		MoodleR.set_var("semester",val);
		MoodleR.unCache(true);
		document.getElementById("sem").setAttribute("value",val);
	}
}