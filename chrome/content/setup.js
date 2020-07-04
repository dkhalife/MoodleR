var MoodleR=window.arguments[0].MoodleR;

function onLoad(){
	document.getElementById("host").setAttribute("value",MoodleR.getVar("host",""));
	document.getElementById("dir").setAttribute("value",MoodleR.getVar("dir",""));
	document.getElementById("sem").setAttribute("value",MoodleR.getVar("semester",""));
}

function setHost(el){
	var val = el.value.replace("http://", "").replace("www.", "").replace(/\/$/, "");
	
	if(val){
		MoodleR.host=val;
		MoodleR.setVar("host",val);
	}
}

function setDir(el){
	var fp=MoodleR.Cc["@mozilla.org/filepicker;1"].createInstance(MoodleR.nsIFilePicker);
	fp.init(window,MoodleR.lang("changedir"),MoodleR.nsIFilePicker.modeGetFolder);
	
	if(!fp.show()){
		MoodleR.dir=fp.file.path+MoodleR.SL;
		MoodleR.setVar("dir", fp.file.path+MoodleR.SL);
		el.value = fp.file.path+MoodleR.SL;
	}
	
	el.blur();
}

function setSem(el){
	var val = el.value;
	if(val){
		MoodleR.semester=val;
		MoodleR.setVar("semester",val);
		MoodleR.unCache(true);
	}
}