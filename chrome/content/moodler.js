"use strict";
var MoodleR={
	/* Prefs */
	prefs : null,
	getPrefs : function(){
		try{
			if (!this.prefs) {
				this.prefs = this.prefManager.getBranch('extensions.moodler@twbooster.');
			}
			return this.prefs;
		}catch(e){ this.log(e,"getPrefs"); }
	},
	set_var : function(param,to){
		try{
			switch(typeof to){
				case "boolean":
					this.getPrefs().setBoolPref(param, to);
				break;
				
				case "number":
					this.getPrefs().setIntPref(param, to);
				break;
				
				default:
					this.getPrefs().setCharPref(param, to);
				break;
			}
		}catch(e){ this.log(e,"set_var"); }
	},
	get_var : function(param,type){
		try{
			switch(typeof type){
				case "boolean":
					if(this.getPrefs().prefHasUserValue(param)==false){
						this.set_var(param, type);
					}
					return this.getPrefs().getBoolPref(param);
				break;
				
				case "number":
					if(this.getPrefs().prefHasUserValue(param)==false){
						this.set_var(param, type);
					}
					return this.getPrefs().getIntPref(param);
				break;
				
				default:
					if(this.getPrefs().prefHasUserValue(param)==false){
						this.set_var(param, type);
					}
					return this.getPrefs().getCharPref(param);
				break;
			}
		}catch(e){ this.log(e,"get_var"); }
	},
	decode : function(v){
		try{
			return this.nativeJSON.decode(v);
		}catch(e){
			return undefined;
		}
	},
	encode : function(v){
		return this.nativeJSON.encode(v);
	},
	/* Setup Functions */
	configured : function(silent){
		this.host=this.get_var("host","");
		this.dir=this.get_var("dir","");
		this.semester=this.get_var("semester","");
		if(this.host=="" || this.dir=="" || this.semester==""){
			if(typeof silent=="undefined"){
				alert(this.lang("configure"));
			}
			return false;
		}
		else{
			return true;
		}
	},
	setup : function(save){
		if(save!=1){
			// Open the configuration window
			window.openDialog("chrome://moodler/content/setup.xul", "","chrome,dialog,resizable=yes", window);
		}
		else{
			this.showlive=!this.showlive;
			this.set_var("showlive",this.showlive);			
		}
	},
	setSem : function(){
		var val=prompt(this.lang("changesem"),this.get_var("semester",""));
		if(val){
			this.semester=val;
			this.set_var("semester",val);
			this.unCache(true);
		}
	},
	unCache : function(silent){
		this._CACHE={};
		this.set_var("cachev2",this.encode(this._CACHE));
		if(typeof silent=="undefined"){
			alert(this.lang("un_cache"));
		}
	},
	/* Images */
	images : {
		yes : "http://www.essayzone.co.uk/images/cool-green-tick.png",
		no : "http://www.essayzone.co.uk/images/cool-red-tick.png",
		open : "http://www.genie9.com/images/open_file.jpg",
		dir : "http://www.livemanual.info/book_icons/file_open.png",
		rename : "http://files.softicons.com/download/application-icons/led-icon-set-by-led24.de/png/16/textfield_rename.png",
		load : "http://preloaders.net/generator.php?image=123&speed=7&fore_color=1B06D3&back_color=999999&size=34x16&transparency=0&reverse=0&orig_colors=0&uncacher=63.319508105260546",
		dl : "http://www.mricons.com/store/png/14486_14230_128_ktorrent_download_down_arrow_icon.png",
		tu : "http://messenger.msn.com/MMM2006-04-19_17.00/Resource/emoticons/thumbs_up.gif",
		td : "http://messenger.msn.com/MMM2006-04-19_17.00/Resource/emoticons/thumbs_down.gif",
		unknown : "http://www.essayzone.co.uk/images/bluequestion.png",
		files : {
			web : "https://moodle.polymtl.ca/theme/moodle_poly/pix/f/web.gif",
			zip : "https://moodle.polymtl.ca/theme/moodle_poly/pix/f/zip.gif",
			html : "https://moodle.polymtl.ca/theme/moodle_poly/pix/f/html.gif",
			pdf : "https://moodle.polymtl.ca/theme/moodle_poly/pix/f/pdf.gif",
			text : "https://moodle.polymtl.ca/theme/moodle_poly/pix/f/text.gif",
			unknown : "https://moodle.polymtl.ca/theme/moodle_poly/pix/f/unknown.gif",
			excel : "https://moodle.polymtl.ca/theme/moodle_poly/pix/f/excel.gif",
			docx : "https://moodle.polymtl.ca/theme/moodle_poly/pix/f/docx.gif",
			word : "https://moodle.polymtl.ca/theme/moodle_poly/pix/f/word.gif",
			xlsx : "https://moodle.polymtl.ca/theme/moodle_poly/pix/f/xlsx.gif",
			flash : "https://moodle.polymtl.ca/theme/moodle_poly/pix/f/flash.gif",
			audio : "https://moodle.polymtl.ca/theme/moodle_poly/pix/f/audio.gif",
			powerpoint : "https://moodle.polymtl.ca/theme/moodle_poly/pix/f/powerpoint.gif",
			pptx : "https://moodle.polymtl.ca/theme/moodle_poly/pix/f/pptx.gif",
		}
	},
	FileImage : function(type){
		if(typeof this.images.files[type]!="undefined"){
			return this.images.files[type];
		}
		return this.images.files.unknown;
	},
	/* Core */
	gei : function(v){
		return window.document.getElementById(v);
	},
	log : function(erzx,type){
		var csClass=this.Cc['@mozilla.org/consoleservice;1'];
		var cs = csClass.getService(this.Ci.nsIConsoleService);
		cs.logStringMessage("[MoodleR]-{"+type+"} -> "+erzx.message);
		return true;
	},
	lang : function(v,ar){
		// ar can hold params that go inside the bundle defined with text and %S multiple times
		ar=(typeof ar!="undefined")?ar:[];
		try{
			return this.gei("MoodleR-Lang").getFormattedString(v, ar);
		}catch(e){
			// If it was not found
			return null;
		}
	},
	formatSize : function(size){
		var str=" B";
		if(size>1024){
			str=" Kb";
			size/=1024;
		}
		if(size>1024){
			str=" Mb";
			size/=1024;
		}
		if(size>1024){
			str=" Gb";
			size/=1024;
		}
		size=Math.round(100*size)/100;
		return size+str;
	},
	getFileName : function(cid,rid){
		try{
			if(typeof this._CACHE.FILES[cid+"-"+rid]!="undefined"){
				return this._CACHE.FILES[cid+"-"+rid];
			}
		}catch(e){}
		return this._CACHE.COURSES[cid].files[rid].name;
	},
	Load_Url : function(url,_win){
		_win=(typeof _win=="undefined")?content:_win;
		_win.window.location.href=url;
	},
	Load_Master_Url : function(url){
		if(window._content.document.location.href=="about:blank"){
			window._content.document.location.href=url;
		}
		else{
			this.WINX.openUILinkIn(url, 'tab');
		}
	},
	Init : function(){
		try{
			// Initialize objects
			this.Cc=Components.classes;
			this.Ci=Components.interfaces;
			this.SL=(navigator.platform.indexOf("Linux")==-1 && navigator.platform.indexOf("Mac")==-1)?"\\":"/";
			this.nativeJSON=this.Cc["@mozilla.org/dom/json;1"].createInstance(this.Ci.nsIJSON);
			this.prefManager=this.Cc['@mozilla.org/preferences-service;1'].getService(this.Ci.nsIPrefService);
			this.WINX=this.Cc['@mozilla.org/appshell/window-mediator;1'].getService(this.Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");
			this.nsIFilePicker=this.Ci.nsIFilePicker;
			this.dfile=this.Cc["@mozilla.org/file/local;1"].createInstance(this.Ci.nsILocalFile);
			this.fofile=this.Cc["@mozilla.org/file/local;1"].createInstance(this.Ci.nsILocalFile);
			
			// Make sure MoodleR is configured
			this.showlive=this.get_var("showlive",true);
			this.gei("MoodleR-ShowSum").setAttribute("checked",this.showlive);
			if(!this.configured(true)){
				this.setup();
			}
			// Load Cache
			this._CACHE=this.decode(this.get_var("cachev2",""));
			if(typeof this._CACHE!="object"){
				this._CACHE={};
			}
			// Start the processor
			gBrowser.addProgressListener(this.Processor.Listener); // Update to 5.0
			// Suggestion by kmaglione [To avoid conflict and easier]
			let jsLoader=this.Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(this.Ci.mozIJSSubScriptLoader);
			jsLoader.loadSubScript("chrome://moodler/content/jquery.js", MoodleR);
			this.$=$;
			this.jQuery=jQuery;
			jQuery.noConflict();

			if(this.get_var("firstrun",true)==true){
				var Bar=document.getElementById("nav-bar");
				var toolbox=document.getElementById("navigator-toolbox");
				var myId="Moodler-Icon";
				var curSet=Bar.currentSet.split(",");
				if(curSet.indexOf(myId)==-1){
					Bar.insertItem(myId, null, null, false);
				}
				document.persist(Bar.id, "currentset");
				try{
					window.setTimeout(function(){
						BrowserToolboxCustomizeDone(true);
					},10);
				}catch(e){}
				this.set_var("firstrun",false);
			}
			
			this.Processor.start("fileinfo","Fileinfo","*",false);
		}catch(e){ this.log(e,"Init"); }
	},
	Xpath : function(xpath, n, target, reference){
		try{
			target=(typeof target!="undefined") ? target : content.document;
			if(n==9){
				return target.evaluate(xpath,target,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue;
			}
			if(n==6){
				var item;
				var arr = [];
				var xpr = target.evaluate(xpath, target, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
				for (var i=0; item=xpr.snapshotItem(i); i++){
					arr.push(item);
				}
				return arr;
			}
		}catch(e){ this.log(e,"Xpath"); }
	},
	/* Processor */
	Processor : {
		STATE_START : this.Ci.nsIWebProgressListener.STATE_START,
		STATE_STOP : this.Ci.nsIWebProgressListener.STATE_STOP,
		processes : {},
		Listener : {
			QueryInterface : function(aIID) {
				if(aIID.equals(this.Ci.nsIWebProgressListener) ||
				   aIID.equals(this.Ci.nsISupportsWeakReference) ||
				   aIID.equals(this.Ci.nsISupports)){
					return this;
				}
				throw Components.results.NS_NOINTERFACE;  
			},
			onStateChange : function(aWebProgress,aRequest,aFlag,aStatus){
				if(aFlag & MoodleR.Processor.STATE_STOP && aRequest!==null && aRequest.URI){
					MoodleR.Processor.exec(aWebProgress.DOMWindow,aRequest.URI.spec);
					return 0;
				}
				if(aFlag & MoodleR.Processor.STATE_START){
					delete MoodleR.locked;
					delete MoodleR.tar;
					return 0;
				}
			},
			onLocationChange : function(aWebProgress,aRequest,aURI){return 0;},
			onProgressChange : function(aWebProgress,aRequest,curSelf,maxSelf,curTot,maxTot){return 0;},
			onStatusChange : function(aWebProgress,aRequest,aStatus,aMessage){return 0;},
			onSecurityChange : function(aWebProgress,aRequest,aState){return 0;}
		},
		start : function(nemo,funct,targetURL,KILL){
			if(typeof MoodleR.Processor.processes[nemo]!="object"){
				MoodleR.Processor.processes[nemo]={"name":nemo,"function":funct,"target":targetURL,"kill":KILL};
			}
		},
		stop : function(nemo){
			if(typeof MoodleR.Processor.processes[nemo]=="object"){
				delete MoodleR.Processor.processes[nemo];
			}
		},
		exec : function(pWIN,pURL){
			MoodleR._PRO=MoodleR.Processor.processes;
			for(MoodleR._PXID in MoodleR._PRO){
				try{
					if(MoodleR._PRO[MoodleR._PXID]["target"]=="*" || (typeof MoodleR._PRO[MoodleR._PXID]["target"]=="string" && pURL.indexOf(MoodleR._PRO[MoodleR._PXID]["target"])>-1)){
						var func=MoodleR._PRO[MoodleR._PXID].function.split(".");
						var tmp=MoodleR;
						var iter;
						for(iter=0; iter<func.length; iter++){
							tmp=tmp[func[iter]];
						}
						if(MoodleR._PRO[MoodleR._PXID]["kill"]==true){
							window.setTimeout("MoodleR.Processor.stop('"+MoodleR._PRO[MoodleR._PXID]["name"]+"');",100);
						}
						tmp.apply(MoodleR);
					}
				}catch(e){}
			}
		},
	},
	/* Regular Tests and Procedures */
	onsite : function(){
		return content.document.location.href.match(this.host)!=null;
	},
	lock : function(){
		this.locked=this.Screen();
	},
	unlock : function(){
		delete this.locked;
	},
	lockPage : function(){
		content.wrappedJSObject.onbeforeunload = function(){
			return false;
		}
	},
	unlockPage : function(){
		content.wrappedJSObject.onbeforeunload = null;
	},
	loggedIn : function(silent){
		if(this.onsite() && this.Xpath("//a[contains(@href,'login/index')]",9)==null){
			return true;
		}
		if(typeof silent=="undefined"){
			alert(this.lang("login"));
		}
		return false;
	},
	Screen : function(accept,silent){
		var i;
		var test=false;
		var current=content.document.location.href.split(this.host+"/")[1].split(".php")[0];
	
		switch(typeof accept){
			case "string" :
				if(current!=accept){
					if(typeof silent=="undefined"){
						alert(this.lang("screen_invalid"));
					}
					return false;
				}
				return true;
			break;
			
			case "object" : 
				for(i=0; i<accept.length; i++){
					if(current==accept[i]){
						test=true;
						break;
					}
				}
				
				if(!test){
					if(typeof silent=="undefined"){
						alert(this.lang("screen_invalid"));
					}
					return false;
				}
				return true;
			break;
			
			default : return current;
		}
	},
	/* Course Checkup */
	getCourse_Status : function(cid){
		if(typeof this._CACHE.COURSES=="undefined"){
			this._CACHE.COURSES={};
		}
		try{
			return this._CACHE.COURSES[cid].enabled;
		}catch(e){
			// Default is true
			return true;
		}
	},
	setCourse_Status : function(cid,status){
		this._CACHE.COURSES[cid].enabled=status;
		this.set_var("cachev2",this.encode(this._CACHE));
	},
	/* Resource Checkup */
	getChapter_Status : function(cid,rid){
		if(typeof this._CACHE.COURSES=="undefined"){
			this._CACHE.COURSES={};
		}
		try{
			return this._CACHE.COURSES[cid].files[rid].enabled;
		}catch(e){
			// Default is true
			return true;
		}
	},
	setChapter_Status : function(cid,rid,status){
		this._CACHE.COURSES[cid].files[rid].enabled=status;
		this.set_var("cachev2",this.encode(this._CACHE));
	},
	/* Course Selection */
	setCourses : function(){
		try{
			if(this.configured()){
				if(this.locked==this.Screen()){
					// Invert process
					this.unlock();
					this.$(this.Xpath("//*[contains(@class,'MoodleR')]",6)).each(function(){
						MoodleR.$(this).remove();
					});
					return;
				}
				
				if(this.loggedIn() && this.Screen(["my/","my/index"])){
					this.lock();
					// Logged in and on courses page
					// Start by setting up the ticks
					var i;
					if(typeof this._CACHE.COURSES=="undefined"){
						this._CACHE.COURSES={};
					}
					var courses=this.Xpath("//div[contains(@class,'coursebox')]//h2//a",6);
					for(i=0; i<courses.length; i++){
						var cid = courses[i].href.match(/id=(\d+)/)[1];
						if(typeof this._CACHE.COURSES[cid]=="undefined"){
							this._CACHE.COURSES[cid]={
								enabled : true,
								//name : courses[i].innerHTML.split(" - ")[0],
								files : {},
							}
						}
						var check = content.document.createElement("img");
						this.$(check).css("cursor","pointer").css("padding-right","10px").attr("height","20").attr("width","20").attr("id",cid).addClass("MoodleR");
						this.$(check).click(function(){
							if(MoodleR.$(this).attr("src")==MoodleR.images.yes){
								MoodleR.$(this).attr("src",MoodleR.images.no);
								MoodleR.setCourse_Status(MoodleR.$(this).attr("id"),false);
							}
							else{
								MoodleR.$(this).attr("src",MoodleR.images.yes);
								MoodleR.setCourse_Status(MoodleR.$(this).attr("id"),true);
							}
						});
						if(this.getCourse_Status(cid)){
							check.setAttribute("src",this.images.yes);
						}
						else{
							check.setAttribute("src",this.images.no);
						}
						courses[i].parentNode.insertBefore(check,courses[i]);
					}
				}
			}
		}catch(e){ MoodleR.log(e,"setCourses"); }
	},
	/* Resource Selection */
	setChapters : function(){
		try{
			if(this.configured()){
				if(this.locked==this.Screen()){
					// Invert process
					this.unlock();
					this.$(this.Xpath("//*[contains(@class,'MoodleR')]",6)).each(function(){
						MoodleR.$(this).remove();
					});
					return;
				}
				
				if(this.loggedIn()){
					// Logged in and on a course page
					if(typeof this._CACHE.COURSES=="undefined"){
						this._CACHE.COURSES={};
					}
					var i;
					
					if(this.Screen("course/view",true)){
						this.lock();
						var cid = content.location.href.match(/id=(\d+)/)[1];
						if(typeof this._CACHE.COURSES[cid]=="undefined"){
							this._CACHE.COURSES[cid]={
								enabled : true,
								files : {},
							}
						}
						// Make sure that we have the correct name for the course
						this._CACHE.COURSES[cid].name=this.Xpath("//div[contains(@class,'breadcrumb')]/ul/li[2]",9).childNodes[3].textContent.trim();
						// Start by setting up the ticks
						var res=this.Xpath("//img[contains(@class,'activityicon')]",6);
						for(i=0; i<res.length; i++){
							var src=res[i].getAttribute("src");
							if(src.match("assignment/icon") || src.match("forum/icon") || src.match("resource/icon") || src.match("quiz/icon") || src.match("web")){
								var check = content.document.createElement("img");
								this.$(check).css("cursor","pointer").css("padding-right","10px").attr("height","15").attr("width","15").addClass("MoodleR activityicon");
								check.setAttribute("src",this.images.unknown);
								res[i].parentNode.parentNode.insertBefore(check,res[i].parentNode);
								continue;
							}
							
							var rid=res[i].parentNode.parentNode.getAttribute("id").match(/\d+/)[0];
							if(typeof this._CACHE.COURSES[cid].files[rid]=="undefined"){
								this._CACHE.COURSES[cid].files[rid]={
									type : res[i].getAttribute("src").match(/(\w+)\.(png|gif|jpg)/)[1],
									enabled : true,
									path : this.SL
								}
							}
							var check = content.document.createElement("img");
							this.$(check).css("cursor","pointer").css("padding-right","10px").attr("height","15").attr("width","15").attr("id",cid+"-"+rid).addClass("MoodleR activityicon");
							this.$(check).click(function(){
								if(MoodleR.$(this).attr("src")==MoodleR.images.yes){
									MoodleR.$(this).attr("src",MoodleR.images.no);
									var tmp=MoodleR.$(this).attr("id").split("-");
									MoodleR.setChapter_Status(tmp[0],tmp[1],false);
								}
								else{
									MoodleR.$(this).attr("src",MoodleR.images.yes);
									var tmp=MoodleR.$(this).attr("id").split("-");
									MoodleR.setChapter_Status(tmp[0],tmp[1],true);
								}
							});
							if(this.getChapter_Status(cid,rid)){
								check.setAttribute("src",this.images.yes);
							}
							else{
								check.setAttribute("src",this.images.no);
							}
							res[i].parentNode.parentNode.insertBefore(check,res[i].parentNode);
						}
					}
					else{
						if(this.Screen("mod/resource/view",true)){
							if(!content.location.href.match("subdir")){
								this.lock();
								var cid = this.Xpath("//div[contains(@class,'breadcrumb')]/ul/li[2]//a",9).href.match(/id=(\d+)/)[1];
								if(typeof this._CACHE.COURSES[cid]=="undefined"){
									this._CACHE.COURSES[cid]={
										enabled : true,
										files : {},
									}
								}
								// Start by setting up the ticks
								var res=this.Xpath("//td[contains(@class,'name')]//img[contains(@class,'icon')]",6);
								for(i=0; i<res.length; i++){
									var src=res[i].getAttribute("src");
									if(src.match("assignment/icon") || src.match("forum/icon") || src.match("resource/icon") || src.match("quiz/icon") || src.match("web")){
										var check = content.document.createElement("img");
										this.$(check).css("cursor","pointer").css("padding-right","10px").attr("height","15").attr("width","15").addClass("MoodleR activityicon");
										check.setAttribute("src",this.images.unknown);
										res[i].parentNode.parentNode.insertBefore(check,res[i].parentNode);
										continue;
									}

									var type=res[i].getAttribute("src").match(/(\w+)\.(png|gif|jpg)/)[1];
									if(type!="folder"){
										var rid=res[i].parentNode.getAttribute("href").split("/");
										rid=rid.splice(rid.length-2,2).join("_");
									}
									else{
										var folder=res[i].parentNode.href.match(/subdir=\/(\w+)/)[1];
										var rid=content.location.href.match(/id=(\d+)/)[1]+"_"+folder;
									}
									
									if(typeof this._CACHE.COURSES[cid].files[rid]=="undefined"){
										this._CACHE.COURSES[cid].files[rid]={
											type : res[i].getAttribute("src").match(/(\w+)\.(png|gif|jpg)/)[1],
											enabled : true
										}
									}
									
									var check = content.document.createElement("img");
									this.$(check).css("cursor","pointer").css("padding-right","10px").attr("height","15").attr("width","15").attr("id",cid+"-"+rid).addClass("MoodleR activityicon");
									this.$(check).click(function(){
										if(MoodleR.$(this).attr("src")==MoodleR.images.yes){
											MoodleR.$(this).attr("src",MoodleR.images.no);
											var tmp=MoodleR.$(this).attr("id").split("-");
											MoodleR.setChapter_Status(tmp[0],tmp[1],false);
										}
										else{
											MoodleR.$(this).attr("src",MoodleR.images.yes);
											var tmp=MoodleR.$(this).attr("id").split("-");
											MoodleR.setChapter_Status(tmp[0],tmp[1],true);
										}
									});
									if(this.getChapter_Status(cid,rid)){
										check.setAttribute("src",this.images.yes);
									}
									else{
										check.setAttribute("src",this.images.no);
									}
									res[i].parentNode.parentNode.insertBefore(check,res[i].parentNode);
								}
							}
							else{
								this.lock();
								var cid = this.Xpath("//div[contains(@class,'breadcrumb')]/ul/li[2]//a",9).href.match(/id=(\d+)/)[1];
								if(typeof this._CACHE.COURSES[cid]=="undefined"){
									this._CACHE.COURSES[cid]={
										enabled : true,
										files : {},
									}
								}
								// Start by setting up the ticks
								var res=this.Xpath("//td[contains(@class,'name')]//img[contains(@class,'icon')]",6);
								for(i=0; i<res.length; i++){
									var src=res[i].getAttribute("src");
									if(src.match("assignment/icon") || src.match("forum/icon") || src.match("resource/icon") || src.match("quiz/icon") || src.match("web")){
										var check = content.document.createElement("img");
										this.$(check).css("cursor","pointer").css("padding-right","10px").attr("height","15").attr("width","15").addClass("MoodleR activityicon");
										check.setAttribute("src",this.images.unknown);
										res[i].parentNode.parentNode.insertBefore(check,res[i].parentNode);
										continue;
									}
									
									var type=res[i].getAttribute("src").match(/(\w+)\.(png|gif|jpg)/)[1];
									if(type!="folder"){
										var rid=res[i].parentNode.getAttribute("href").split("/");
										rid=rid.splice(rid.length-2,2).join("_");

										if(typeof this._CACHE.COURSES[cid].files[rid]=="undefined"){
											this._CACHE.COURSES[cid].files[rid]={
												type : res[i].getAttribute("src").match(/(\w+)\.(png|gif|jpg)/)[1],
												enabled : true
											}
										}
										
										var check = content.document.createElement("img");
										this.$(check).css("cursor","pointer").css("padding-right","10px").attr("height","15").attr("width","15").attr("id",cid+"-"+rid).addClass("MoodleR activityicon");
										this.$(check).click(function(){
											if(MoodleR.$(this).attr("src")==MoodleR.images.yes){
												MoodleR.$(this).attr("src",MoodleR.images.no);
												var tmp=MoodleR.$(this).attr("id").split("-");
												MoodleR.setChapter_Status(tmp[0],tmp[1],false);
											}
											else{
												MoodleR.$(this).attr("src",MoodleR.images.yes);
												var tmp=MoodleR.$(this).attr("id").split("-");
												MoodleR.setChapter_Status(tmp[0],tmp[1],true);
											}
										});
										if(this.getChapter_Status(cid,rid)){
											check.setAttribute("src",this.images.yes);
										}
										else{
											check.setAttribute("src",this.images.no);
										}
										res[i].parentNode.parentNode.insertBefore(check,res[i].parentNode);
									}
								}
							}
						}
						else{
							alert(this.lang("screen_invalid"));
						}
					}
				}
			}
		}catch(e){ MoodleR.log(e,"setChapters"); }
	},
	/* The BOT */
	Launch : function(){
		try{
			if(this.configured()){
				// Read all courses except restricted ones
				if(this.loggedIn()){
					if(this.Screen(["my/","my/index"],true)){
						// Read Courses			
						var i;
						this.LINKS=[];
						this.URLS=[];
						var courses=this.Xpath("//div[contains(@class,'coursebox')]//h2//a",6);
						if(typeof this._CACHE.COURSES=="undefined"){
							this._CACHE.COURSES={};
						}
						for(i=0; i<courses.length; i++){
							var cid = courses[i].href.match(/id=(\d+)/)[1];
							if(typeof this._CACHE.COURSES[cid]=="undefined"){
								this._CACHE.COURSES[cid]={
									enabled : true,
									//name : courses[i].innerHTML.split(" - ")[0],
									files : {},
								}
							}
							if(this.getCourse_Status(cid)){
								// We need to add this to the scraping queue
								this.LINKS.push(content.location.protocol+"//"+content.location.host+"/course/view.php?id="+cid);
							}
						}
						// See if we have a first link and load it
						if(this.LINKS.length>0){
							this.Processor.start("launch","Scraper","*",false);
							this.Load_Url(this.LINKS[0]);
							this.LINKS.splice(0,1);
						}
						else{
							delete this.LINKS;
							delete this.URLS;
							alert(this.lang("nothing"));
						}
					}
					else{
						this.Load_Url(content.location.protocol+"//"+this.host+"/my");
						this.Processor.start("router","Launch","*",true);
					}
				}
			}
		}catch(e){ MoodleR.log(e,"Launch"); }
	},
	Scraper : function(){
		try{
			if(this.loggedIn(true)){
				var i;
				if(this.Screen("course/view",true)){
					var cid = content.location.href.match(/id=(\d+)/)[1];
					// Normal course page
					if(typeof this._CACHE.COURSES[cid].files=="undefined"){
						this._CACHE.COURSES[cid].files={};
					}
					// Make sure that we have the correct name for the course
					this._CACHE.COURSES[cid].name=this.Xpath("//div[contains(@class,'breadcrumb')]/ul/li[2]",9).childNodes[3].textContent.trim();
					
					var res=this.Xpath("//img[contains(@class,'activityicon')]",6);
					for(i=0; i<res.length; i++){
						var src=res[i].getAttribute("src");
						if(src.match("assignment/icon") || src.match("forum/icon") || src.match("resource/icon") || src.match("quiz/icon") || src.match("web")){
							continue;
						}
						
						var rid=res[i].parentNode.parentNode.getAttribute("id").match(/\d+/)[0];
						var type=res[i].getAttribute("src").match(/(\w+)\.(png|gif|jpg)/)[1];
						if(typeof this._CACHE.COURSES[cid].files[rid]=="undefined"){
							this._CACHE.COURSES[cid].files[rid]={
								type : type,
								enabled : true,
								path : this.SL
							}
						}
						else{
							this._CACHE.COURSES[cid].files[rid].type=res[i].getAttribute("src").match(/(\w+)\.(png|gif|jpg)/)[1];
							this._CACHE.COURSES[cid].files[rid].path=this.SL;
						}
						if(type!="web" && this.getChapter_Status(cid,rid)){
							// We need to add this resource
							if(this._CACHE.COURSES[cid].files[rid].type!="folder"){
								if(typeof this._CACHE.COURSES[cid].files[rid].name=="undefined"){ // We only need to fetch those that have not been fetched before
									this.URLS.push([cid,rid]);
								}
							}
							else{
								// This is a folder, lets add it to the scraper at the first position
								this.LINKS.reverse();
								this.LINKS.push(content.location.protocol+"//"+content.location.host+"/mod/resource/view.php?id="+rid);
								this.LINKS.reverse();
							}
						}
						if(type=="web"){
							// Add the url to it and we'll add the file as a link
							this._CACHE.COURSES[cid].files[rid].url=res[i].parentNode.href;
						}
					}
				}
				if(this.Screen("mod/resource/view",true)){
					// Subfolder of a course page
					// Also watch for subfolders
					if(!content.location.href.match("subdir")){
						var cid = this.Xpath("//div[contains(@class,'breadcrumb')]/ul/li[2]//a",9).href.match(/id=(\d+)/)[1];
						if(typeof this._CACHE.COURSES[cid].files=="undefined"){
							this._CACHE.COURSES[cid].files={};
						}
						
						var res=this.Xpath("//td[contains(@class,'name')]//img[contains(@class,'icon')]",6);
						for(i=0; i<res.length; i++){
							var src=res[i].getAttribute("src");
							if(src.match("assignment/icon") || src.match("forum/icon") || src.match("resource/icon") || src.match("quiz/icon") || src.match("web")){
								continue;
							}
							
							var type=res[i].getAttribute("src").match(/(\w+)\.(png|gif|jpg)/)[1];
							var link=null;
							var fname=null;
							if(type!="folder"){
								var rid=res[i].parentNode.getAttribute("href").split("/");
								rid=rid.splice(rid.length-2,2).join("_");
								var link=res[i].parentNode.getAttribute("href");
								var fname=res[i].parentNode.getAttribute("href").split("/");
								fname=fname[fname.length-1];
							}
							else{
								var folder=res[i].parentNode.href.match(/subdir=\/(\w+)/)[1];
								var rid=content.location.href.match(/id=(\d+)/)[1]+"_"+folder;
							}
							if(typeof this._CACHE.COURSES[cid].files[rid]=="undefined"){
								this._CACHE.COURSES[cid].files[rid]={
									enabled : true,
									type : type,
									path : this.SL+this.Xpath("//div[contains(@class,'breadcrumb')]/ul/li[4]/span[2]",9).nextSibling.textContent.trim()+this.SL
								}
							}
							else{
								this._CACHE.COURSES[cid].files[rid].type=type;
								this._CACHE.COURSES[cid].files[rid].path=this.SL+this.Xpath("//div[contains(@class,'breadcrumb')]/ul/li[4]/span[2]",9).nextSibling.textContent.trim()+this.SL;
							}
							
							if(link!=null){
								this._CACHE.COURSES[cid].files[rid].url=link;
							}
							if(fname!=null){
								this._CACHE.COURSES[cid].files[rid].name=fname;
							}
							if(type!="web" && this.getChapter_Status(cid,rid)){
								// We need to add this resource
								if(this._CACHE.COURSES[cid].files[rid].type!="folder"){
									if(link==null){ // If we already have the link, we don't need to fetch it, right?
										if(typeof this._CACHE.COURSES[cid].files[rid].url=="undefined"){ // We only need to fetch those that have not been fetched before
											this.URLS.push([cid,rid]);
										}
									}
								}
								else{
									// This is a folder, lets add it to the scraper at the first position
									this.LINKS.reverse();
									this.LINKS.push(content.location.protocol+"//"+content.location.host+"/mod/resource/view.php?id="+rid+"&subdir=/"+folder);
									this.LINKS.reverse();
								}
							}
							if(type=="web"){
								// Add the url to it and we'll add the file as a link
								this._CACHE.COURSES[cid].files[rid].url=res[i].parentNode.href;
							}
						}
					}
					else{
						// Subdir of a subdir
						var cid = this.Xpath("//div[contains(@class,'breadcrumb')]/ul/li[2]//a",9).href.match(/id=(\d+)/)[1];
						if(typeof this._CACHE.COURSES[cid].files=="undefined"){
							this._CACHE.COURSES[cid].files={};
						}
						
						var res=this.Xpath("//td[contains(@class,'name')]//img[contains(@class,'icon')]",6);
						for(i=0; i<res.length; i++){
							var src=res[i].getAttribute("src");
							if(src.match("assignment/icon") || src.match("forum/icon") || src.match("resource/icon") || src.match("quiz/icon") || src.match("web")){
								continue;
							}
							
							var type=res[i].getAttribute("src").match(/(\w+)\.(png|gif|jpg)/)[1];
							var link=null;
							var fname=null;
							if(type!="folder"){ // Even though this is always true (limitation of moodle), lets check
								var rid=res[i].parentNode.getAttribute("href").split("/");
								rid=rid.splice(rid.length-2,2).join("_");
								var link=res[i].parentNode.getAttribute("href");
								var fname=res[i].parentNode.getAttribute("href").split("/");
								fname=fname[fname.length-1];
								if(typeof this._CACHE.COURSES[cid].files[rid]=="undefined"){
									this._CACHE.COURSES[cid].files[rid]={
										type : type,
										enabled : true,
										path : this.SL+this.Xpath("//div[contains(@class,'breadcrumb')]/ul/li[4]/a",9).textContent+this.SL+content.location.href.match(/subdir=\/(\w+)/)[1]+this.SL
									}
								}
								else{
									this._CACHE.COURSES[cid].files[rid].type=type;
									this._CACHE.COURSES[cid].files[rid].path=this.SL+this.Xpath("//div[contains(@class,'breadcrumb')]/ul/li[4]/a",9).textContent+this.SL+content.location.href.match(/subdir=\/(\w+)/)[1]+this.SL;
								}
								
								if(link!=null){
									this._CACHE.COURSES[cid].files[rid].url=link;
								}
								if(fname!=null){
									this._CACHE.COURSES[cid].files[rid].name=fname;
								}
								if(type!="web" && this.getChapter_Status(cid,rid)){
									// We need to add this resource
									if(this._CACHE.COURSES[cid].files[rid].type!="folder"){
										if(link==null){ // If we already have the link, we don't need to fetch it, right?
											if(typeof this._CACHE.COURSES[cid].files[rid].url=="undefined"){ // We only need to fetch those that have not been fetched before
												this.URLS.push([cid,rid]);
											}
										}
									}
								}
								if(type=="web"){
									// Add the url to it and we'll add the file as a link
									this._CACHE.COURSES[cid].files[rid].url=res[i].parentNode.href;
								}
							}
						}	
					}
				}
				if(this.LINKS.length>0){
					this.Load_Url(this.LINKS[0]);
					this.LINKS.splice(0,1);
				}
				else{
					this.Processor.stop("launch");
					delete this.LINKS;
					// Save 
					this.set_var("cachev2",this.encode(this._CACHE));
					// Launch Fetcher
					this.lockPage();
					this.Fetcher();
				}
			}
		}catch(e){ MoodleR.log(e,"Scraper"); }
	},
	Fetcher : function(flag){
		try{
			if(typeof flag=="undefined"){
				// 1) Include jQuery and jQuery UI and wait for them to load before continuing
				var script=content.document.createElement("script");
				script.setAttribute("type","text/javascript");
				script.setAttribute("src","http://code.jquery.com/jquery-1.6.1.min.js");
				content.document.head.appendChild(script);
				script.addEventListener("load",function(){
					(function(){
						var script=content.document.createElement("script");
						script.setAttribute("type","text/javascript");
						script.setAttribute("src","http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.13/jquery-ui.min.js");
						script.addEventListener("load",function(){
							(function(){
								// Clear the page we are on and insert the MoodleR Table
								content.wrappedJSObject.$("#content").html('<table width="90%" cellspacing="1" cellpadding="5" class="generaltable boxaligncenter"><tbody id="MoodleR"><tr><th colspan="3" class="header" style="vertical-align:top; text-align:center; white-space:nowrap;" id="MoodleR-Status"><img id="MoodleR-Load" style="padding-right: 10px" src="'+this.images.load+'">'+this.lang("process",[0,this.URLS.length])+'</th></tr><tr><th class="header" style="vertical-align:top; text-align:center; white-space:nowrap;">'+this.lang("course")+'</th><th class="header" style="vertical-align:top; text-align:left; white-space:nowrap;">'+this.lang("fileid")+'</th><th class="header" style="vertical-align:top; text-align:left; white-space:nowrap;">'+this.lang("filename")+'</th></tr></tbody></table><br>');
								this.Fetcher(true);
							}).apply(MoodleR);
						},false);
						content.document.head.appendChild(script);
					}).apply(MoodleR);
				},false);
				this.lastCourse="";
				this.URLSL=this.URLS.length;
				return;
			}
			
			if(this.URLS.length>0){
				content.wrappedJSObject.$.ajax({
					type : "GET",
					async : true,
					cache : false,
//					url : content.location.protocol+"//"+content.location.host+"/mod/resource/view.php?inpopup=true&id="+MoodleR.URLS[0][1],
					url : "https://moodle.polymtl.ca/mod/resource/view.php?id=93854",
					complete : function(xhr, status){
alert(1);
						var course=(MoodleR.lastCourse==MoodleR._CACHE.COURSES[MoodleR.URLS[0][0]].name)?"&nbsp;":MoodleR._CACHE.COURSES[MoodleR.URLS[0][0]].name;
						MoodleR.lastCourse=MoodleR._CACHE.COURSES[MoodleR.URLS[0][0]].name;
						if(status!="error"){
							try{								
								MoodleR._CACHE.COURSES[MoodleR.URLS[0][0]].files[MoodleR.URLS[0][1]].name=xhr.getResponseHeader("Content-disposition").match(/"(.+)"/)[1];
								//MoodleR._CACHE.COURSES[MoodleR.URLS[0][0]].files[MoodleR.URLS[0][1]].url=content.location.protocol+"//"+content.location.host+"/file.php/"+MoodleR.URLS[0][0]+"/"+xhr.getResponseHeader("Content-disposition").match(/"(.+)"/)[1];
								MoodleR._CACHE.COURSES[MoodleR.URLS[0][0]].files[MoodleR.URLS[0][1]].url=xhr.channel.name;
								// Add Row with success effect
								content.wrappedJSObject.$("#MoodleR").append('<tr id="MoodleR_'+MoodleR.URLS[0][1]+'"><td class="cell" style="text-align:center;">'+course+'</td><td class="cell" style="text-align:center;">'+MoodleR.URLS[0][1]+'</td><td class="cell" style="text-align:center;">'+xhr.getResponseHeader("Content-disposition").match(/"(.+)"/)[1]+'</td></tr>');
								content.wrappedJSObject.$("#MoodleR_"+MoodleR.URLS[0][1]+" td").effect("highlight", {color: '#10FF40'}, 5000);
							}catch(e){
								MoodleR.log(e,"XHR ["+MoodleR.URLS[0][0]+"|"+MoodleR.URLS[0][1]+"]");
								// Add Row with fail effect
								content.wrappedJSObject.$("#MoodleR").append('<tr id="MoodleR_'+MoodleR.URLS[0][1]+'"><td class="cell" style="text-align:center;">'+course+'</td><td class="cell" style="text-align:center;">'+MoodleR.URLS[0][1]+'</td><td class="cell" style="text-align:center;">-</td></tr>');
								content.wrappedJSObject.$("#MoodleR_"+MoodleR.URLS[0][1]+" td").effect("highlight", {color: '#FF4040'}, 5000);
							}
						}
						else{
							// Add row with fail effect
							content.wrappedJSObject.$("#MoodleR").append('<tr id="MoodleR_'+MoodleR.URLS[0][1]+'"><td class="cell" style="text-align:center;">'+course+'</td><td class="cell" style="text-align:center;">'+MoodleR.URLS[0][1]+'</td><td class="cell" style="text-align:center;">-</td></tr>');
							content.wrappedJSObject.$("#MoodleR_"+MoodleR.URLS[0][1]+" td").effect("highlight", {color: '#FF4040'}, 5000);
						}
						// Update progress
						content.wrappedJSObject.$("#MoodleR-Status").html('<img id="MoodleR-Load" style="padding-right: 10px" src="'+MoodleR.images.load+'">'+MoodleR.lang("process",[MoodleR.URLSL-MoodleR.URLS.length,MoodleR.URLSL]));
						MoodleR.URLS.splice(0,1);
						MoodleR.Fetcher(true);
					}
				});
			}
			else{
				// Hide Moodler Load Icon and make sure we have x/x
				content.wrappedJSObject.$("#MoodleR-Load").hide();
				content.wrappedJSObject.$("#MoodleR-Status").html('<img id="MoodleR-Load" style="padding-right: 10px" src="'+MoodleR.images.load+'">'+MoodleR.lang("process",[MoodleR.URLSL,MoodleR.URLSL]));
				// Delete URLS and LINKS 
				delete this.URLS;
				delete this.URLSL;
				delete this.LINKS;
				// Save 
				this.set_var("cachev2",this.encode(this._CACHE));
				// Timeout to show summary
				content.wrappedJSObject.$("#MoodleR").append('<tr><th class="header" style="text-align:center;" colspan="3" id="MoodleR-Counter">'+MoodleR.lang("showingsum",[5])+'</th></tr>');
				window.setTimeout(function(){
					content.wrappedJSObject.$("#MoodleR-Counter").html(MoodleR.lang("showingsum",[4]));
				},1000);
				window.setTimeout(function(){
					content.wrappedJSObject.$("#MoodleR-Counter").html(MoodleR.lang("showingsum",[3]));
				},2000);
				window.setTimeout(function(){
					content.wrappedJSObject.$("#MoodleR-Counter").html(MoodleR.lang("showingsum",[2]));
				},3000);
				window.setTimeout(function(){
					content.wrappedJSObject.$("#MoodleR-Counter").html(MoodleR.lang("showingsum",[1]))
				},4000);
				window.setTimeout(function(){
					// Show Summary
					MoodleR.unlockPage();
					MoodleR.Show_Summary();
				},5000);
			}
		}catch(e){ MoodleR.log(e,"Fetcher"); }
	},
	/* The GUI */
	Show_Summary : function(){
		try{
			var i;
			var cid;
			var rid;
			
			var total_here=0;
			var total_todl=0;
			var total_err=0;
			
			var size_here=0;
			
			var files_here='';
			var files_todl='';
			var files_err='';
			
			var last_course1='';
			var last_course2='';
			var last_course3='';
			
			var effect = [];
			var todl = [];
			var actions = [];
			var openD = [];
			
			// Check if semester has a dir
			this.dfile.initWithPath(this.dir+this.semester.trim());
			if(!this.dfile.exists() || !this.dfile.isDirectory()){
				this.dfile.create(this.dfile.DIRECTORY_TYPE, 511);
			}
			
			for(cid in this._CACHE.COURSES){
				if(this.getCourse_Status(cid)){
					// Check if course has a dir
					var course=this._CACHE.COURSES[cid].name;
					this.dfile.initWithPath(this.dir+this.semester.trim()+this.SL+course.trim());
					if(!this.dfile.exists() || !this.dfile.isDirectory()){
						this.dfile.create(this.dfile.DIRECTORY_TYPE, 511);
					}
					for(rid in this._CACHE.COURSES[cid].files){
						if(this.getChapter_Status(cid,rid)){
							if(this._CACHE.COURSES[cid].files[rid].type=="folder" || this._CACHE.COURSES[cid].files[rid].type=="web"){
								continue;
							}
							
							course=this._CACHE.COURSES[cid].name;
							if(typeof this._CACHE.COURSES[cid].files[rid].url!="undefined" && typeof this._CACHE.COURSES[cid].files[rid].name!="undefined"){
								// We need to trim the file path folder by folder because we don't have spaces at the end, sometimems this causes an error
								var tmp=this._CACHE.COURSES[cid].files[rid].path.split(this.SL);
								for(i=0; i<tmp.length; i++){
									tmp[i]=tmp[i].trim();
								}
								this._CACHE.COURSES[cid].files[rid].path=tmp.join(this.SL);
								// Check if path is a valid dir
								this.dfile.initWithPath(this.dir+this.semester.trim()+this.SL+course.trim()+this._CACHE.COURSES[cid].files[rid].path);
								if(!this.dfile.exists() || !this.dfile.isDirectory()){
									this.dfile.create(this.dfile.DIRECTORY_TYPE, 511);
								}
								
								var filename=this.getFileName(cid,rid);
								var type=this._CACHE.COURSES[cid].files[rid].type;
								var file_on_disk=this.dir+this.semester+this.SL+course.trim()+this._CACHE.COURSES[cid].files[rid].path+filename.trim();
								this.dfile.initWithPath(file_on_disk);
								
								if(this.dfile.exists() && this.dfile.isFile()){
									// File is here
									total_here++;
									if(course==last_course1){
										course="";
									}
									else{
										last_course1=course;
										course='<img id="course_'+cid+'" src="'+this.images.dir+'" style="cursor: pointer; padding-right: 10px" height="26" width="26">'+course;
										openD.push("course_"+cid);
									}
									size_here-=-this.dfile.fileSize;
									var size=this.formatSize(this.dfile.fileSize);
									actions.push(cid+'-'+rid);
									files_here+='<tr id="'+rid+'"><td class="cell" style="width: 150px; text-align:center; vertical-align:middle">'+course+'</td><td class="cell" style="text-align:left; vertical-align:middle"><img src="'+this.FileImage(type)+'" style="padding-right: 10px">'+(this._CACHE.COURSES[cid].files[rid].path.substr(1)+filename.trim())+'</td><td class="cell" style="text-align:center; vertical-align:middle; width: 100px">'+size+'</td><td class="cell" style="width: 160px; text-align:center; vertical-align:middle"><img id="open-'+cid+'-'+rid+'" src="'+this.images.open+'" style="cursor: pointer; padding-right: 20px" height="26" width="29"><img id="rename-'+cid+'-'+rid+'" src="'+this.images.rename+'" style="cursor: pointer; padding-right: 20px" height="26" width="26"><img id="delete-'+cid+'-'+rid+'" src="'+this.images.no+'" style="cursor: pointer; padding-right: 20px" height="26" width="26"></td></tr>';
								}
								else{
									// File needs to be download
									total_todl++;
									if(course==last_course2){
										course="";
									}
									else{
										last_course2=course;
									}
									todl.push(cid+'-'+rid);
									files_todl+='<tr id="'+rid+'" name="'+cid+'"><td class="cell" style="text-align:center; vertical-align:middle">'+course+'</td><td class="cell" style="text-align:left; vertical-align:middle"><img src="'+this.FileImage(type)+'" style="padding-right: 10px">'+(this._CACHE.COURSES[cid].files[rid].path.substr(1)+filename.trim())+'</td><td class="cell" style="text-align:center; vertical-align:middle" colspan="2"><img id="'+cid+'-'+rid+'" src="'+this.images.yes+'" style="cursor: pointer; padding-right: 10px" height="26" width="26" class="MoodleR activityicon"></td></tr>';
								}
							}
							else{
								// Failed Download
								total_err++;
								if(course==last_course3){
									course="";
								}
								else{
									last_course3=course;
								}
								effect.push(rid);
								files_err+='<tr id="'+rid+'"><td class="cell" style="text-align:center;">'+course+'</td><td class="cell" style="text-align:center;" colspan="3"><a target="_blank" href="'+content.location.protocol+"//"+content.location.host+"/mod/resource/view.php?inpopup=true&id="+rid+'">'+rid+'</a></td></tr>';
							}
						}
					}
				}
			}
			
			// Transform size into Kb / Mb in a string
			size_here=this.formatSize(size_here);			
			
			content.wrappedJSObject.$("#content").html('<table width="80%" cellspacing="1" cellpadding="5" class="generaltable boxaligncenter"><tbody id="MoodleR"><tr><th colspan="4" class="header" style="vertical-align:top; text-align:center; white-space:nowrap;">'+this.lang("fileswehave")+'</th></tr><tr><th class="header" style="vertical-align:top; text-align:center; white-space:nowrap;">'+this.lang("course")+'</th><th class="header" style="vertical-align:top; text-align:left; white-space:nowrap;">'+this.lang("filename")+'</th><th class="header" style="vertical-align:top; text-align:left; white-space:nowrap;">'+this.lang("size")+'</th><th class="header" style="vertical-align:top; text-align:left; white-space:nowrap;">'+this.lang("options")+'</th></tr>'+files_here+'<tr><th class="header" colspan="4"><hr style="color: #FFFFFF"></th></tr><tr id="MoodleR-IB"><th colspan="4" class="header">'+this.lang("sizef",[total_here,size_here])+'</th></tr><tr id="MoodleR-Here-Sep"><th colspan="4" class="header">&nbsp;</th></tr></tbody><tbody id="MoodleR-ToDL"><tr><th colspan="4" class="header" style="vertical-align:top; text-align:center; white-space:nowrap;">'+this.lang("filestodl")+'</th></tr><tr><th class="header" style="vertical-align:top; text-align:center; white-space:nowrap;">'+this.lang("course")+'</th><th class="header" style="vertical-align:top; text-align:left; white-space:nowrap;">'+this.lang("filename")+'</th><th class="header" style="vertical-align:top; text-align:left; white-space:nowrap;" colspan="2" id="MoodleR-DL-TH">'+this.lang("download")+'</th></tr>'+files_todl+'<tr><th colspan="4" class="header">'+this.lang("fcount",[total_todl])+'</th></tr><tr id="MoodleR-Dl-Sep"><th colspan="4" class="header">&nbsp;</th></tr></tbody><tbody><tr><th colspan="4" class="header" style="vertical-align:top; text-align:center; white-space:nowrap;">'+this.lang("fileserr")+'</th></tr><tr><th class="header" style="vertical-align:top; text-align:center; white-space:nowrap;">'+this.lang("course")+'</th><th class="header" style="vertical-align:top; text-align:left; white-space:nowrap;" colspan="3">'+this.lang("link")+'</th></tr>'+files_err+'<tr><th colspan="4" class="header">'+this.lang("fcount",[total_err])+'</th></tr><tr id="MoodleR-Err-Sep"><th colspan="4" class="header">&nbsp;</th></tr></tbody></table><br>');
			// Add effect to those who have failed
			for(i=0; i<effect.length; i++){
				content.wrappedJSObject.$("[id='"+effect[i]+"']").effect("highlight", {color: '#FF4040'}, 5000);
			}
			// Add clickability to the images for download
			for(i=0; i<todl.length; i++){
				content.wrappedJSObject.document.getElementById(todl[i]).addEventListener("click",function(){
					if(MoodleR.$(this).attr("src")==MoodleR.images.yes){
						MoodleR.$(this).attr("src",MoodleR.images.no);
						var tmp=MoodleR.$(this).attr("id").split("-");
						MoodleR.setChapter_Status(tmp[0],tmp[1],false);
					}
					else{
						MoodleR.$(this).attr("src",MoodleR.images.yes);
						var tmp=MoodleR.$(this).attr("id").split("-");
						MoodleR.setChapter_Status(tmp[0],tmp[1],true);
					}
				},false);
			}
			// Add Open / Rename / Delete (+ Restrict at the same time)
			for(i=0; i<actions.length; i++){
				// 1 for each icon
				content.wrappedJSObject.document.getElementById("delete-"+actions[i]).addEventListener("click",function(){
					MoodleR.Delete(this.getAttribute("id"));
				},false);
				content.wrappedJSObject.document.getElementById("rename-"+actions[i]).addEventListener("click",function(){
					MoodleR.Rename(this.getAttribute("id"));
				},false);
				content.wrappedJSObject.document.getElementById("open-"+actions[i]).addEventListener("click",function(){
					MoodleR.Open(this.getAttribute("id"));
				},false);
			}
			// Add Open Directory for courses
			for(i=0; i<openD.length; i++){
				content.wrappedJSObject.document.getElementById(openD[i]).addEventListener("click",function(){
					MoodleR.OpenDir(this.getAttribute("id").match(/\d+/)[0]);
				},false);
			}
			// Add Download image
			if(total_todl>0){
				content.wrappedJSObject.$("#content").append("<br><div align=center><img style='cursor : pointer;' id='MoodleR-DL' src='"+this.images.dl+"'></div>");
				content.wrappedJSObject.$("#MoodleR-DL")[0].addEventListener("click",function(){
					MoodleR.Start_DL();
				},false);
			}
		}catch(e){ MoodleR.log(e,"Summary"); }
	},
	updateCounts : function(){
		var cid;
		var rid;
		var size=0;
		var total=0;
		var total2=0;
		for(cid in this._CACHE.COURSES){
			if(this.getCourse_Status(cid)){
				for(rid in this._CACHE.COURSES[cid].files){
					if(this.getChapter_Status(cid,rid)){
						if(this._CACHE.COURSES[cid].files[rid].type=="folder" || this._CACHE.COURSES[cid].files[rid].type=="web"){
							continue;
						}
						if(typeof this._CACHE.COURSES[cid].files[rid].url!="undefined" && typeof this._CACHE.COURSES[cid].files[rid].name!="undefined"){
							var course=this._CACHE.COURSES[cid].name;
							var filename=this.getFileName(cid,rid);
							var file_on_disk=this.dir+this.semester+this.SL+course.trim()+this._CACHE.COURSES[cid].files[rid].path+filename.trim();
							this.fofile.initWithPath(file_on_disk);
							if(this.fofile.exists() && this.fofile.isFile()){
								total++;
								size-=-this.fofile.fileSize;
							}
							else{
								total2++;
							}
						}
					}
				}
			}
		}
		content.wrappedJSObject.$("#MoodleR-Here-Sep")[0].previousSibling.childNodes[0].innerHTML=this.lang("sizef",[total,this.formatSize(size)]);
		content.wrappedJSObject.$("#MoodleR-Dl-Sep")[0].previousSibling.childNodes[0].innerHTML=this.lang("fcount",[total2]);
	},
	/* Download Manager */
	Start_DL : function(){
		// Remove the download button
		content.wrappedJSObject.$("div #MoodleR-DL").remove();
		// Remove the not to download from the list
		var i;
		var rem=this.Xpath("//img[contains(@class,'MoodleR') and contains(@src,'red')]",6);
		for(i=0; i<rem.length; i++){
			// If this row has the course name and the next row doesn't , this means they belong to the same course, lets move the name to the next row then
			if(rem[i].parentNode.parentNode.childNodes[0].innerHTML!="" && rem[i].parentNode.parentNode.nextSibling.childNodes[0].innerHTML==""){
				rem[i].parentNode.parentNode.nextSibling.childNodes[0].innerHTML=rem[i].parentNode.parentNode.childNodes[0].innerHTML;
			}
			rem[i].parentNode.parentNode.parentNode.removeChild(rem[i].parentNode.parentNode);
		}
		// Patch CSS for the progress bars
		this.Progress.add_css(content);
		// Update Download ? column header
		content.wrappedJSObject.$("#MoodleR-DL-TH").html(this.lang("progress"));
		// Put a span instead of each Download ? icon and fill it with 0
		var rem=this.Xpath("//img[contains(@class,'MoodleR') and contains(@src,'green')]",6);
		for(i=0; i<rem.length; i++){
			this.Progress.display(rem[i].parentNode,"MoodleR-#"+rem[i].getAttribute("id"),0);
		}
		// Move to DL row
		content.wrappedJSObject.$("html, body").animate({
			scrollTop: content.wrappedJSObject.$("#MoodleR-ToDL").offset().top
		}, 2000, "easeInOutSine");
		
		window.setTimeout(function(){
			MoodleR.Download();
		},2500);
		this.lockPage();
	},
	Download : function(){
		var left=this.Xpath("//*[@id='MoodleR-ToDL']//tr[@id and @name]",6);
		if(left.length>0){
				var cid = left[0].getAttribute("name");
				var rid = left[0].getAttribute("id");
				this.current_dl=cid+'-'+rid;
		
				var nsIWBP=this.Ci.nsIWebBrowserPersist;
				var flags=nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
				var persist=this.Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(this.Ci.nsIWebBrowserPersist);
				persist.persistFlags = flags | nsIWBP.PERSIST_FLAGS_FROM_CACHE;
				
				var course=this._CACHE.COURSES[cid].name;
				this.dfile.initWithPath(this.dir+this.semester.trim()+this.SL+course.trim()+this._CACHE.COURSES[cid].files[rid].path+MoodleR._CACHE.COURSES[cid].files[rid].name);
				if(!this.SAMPLE) this.SAMPLE=MoodleR._CACHE.COURSES[cid].files[rid].url;
				var obj_URI=this.Cc["@mozilla.org/network/io-service;1"].getService(this.Ci.nsIIOService).newURI(MoodleR._CACHE.COURSES[cid].files[rid].url, null, null);
				
				persist.progressListener = {
					onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress){
						MoodleR.Download_progress(aCurTotalProgress,aMaxTotalProgress);
					},
					onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus){}
				}

				persist.saveURI(obj_URI, null, content.document.documentURIObject, null, "", this.dfile);
				
		}
		else{
			this.unlockPage();
			delete this.current_dl;
			this.Cc['@mozilla.org/alerts-service;1'].getService(this.Ci.nsIAlertsService).showAlertNotification(null, this.lang('mainbutton'), this.lang('finish_text'), false, '', null); 
		}
	},
	Download_progress : function(aCurTotalProgress,aMaxTotalProgress){
		try{
			var i;
			var percentComplete=Math.round(100*aCurTotalProgress/aMaxTotalProgress);
			// Show percentage
			this.Progress.fillProgress('MoodleR-#'+this.current_dl,percentComplete);
			if(percentComplete==100){
				// Animate
				var cid=this.current_dl.match(/(\d+)\-/)[1];
				var rid=this.current_dl.split(cid+"-")[1];
				var course=this._CACHE.COURSES[cid].name;
				var filename=this.getFileName(cid,rid);
				// Move to the top
				var tmp=this._CACHE.COURSES[cid].files[rid].path.split(this.SL);
				for(i=0; i<tmp.length; i++){
					tmp[i]=tmp[i].trim();
				}
				this._CACHE.COURSES[cid].files[rid].path=tmp.join(this.SL);
				window.setTimeout(function(){
					(function(){
						var file_on_disk=this.dir+this.semester+this.SL+course.trim()+this._CACHE.COURSES[cid].files[rid].path+filename.trim();
						this.fofile.initWithPath(file_on_disk);
						var row=content.wrappedJSObject.$("tr[name='"+cid+"'][id='"+rid+"']");
						row.find("td:last").html(this.formatSize(this.fofile.fileSize)).attr("colspan","1");
						row.append('<td class="cell" style="text-align:center; vertical-align:middle"><img id="open-'+cid+'-'+rid+'" src="'+this.images.open+'" style="cursor: pointer; padding-right: 20px" height="26" width="29"><img id="rename-'+cid+'-'+rid+'" src="'+this.images.rename+'" style="cursor: pointer; padding-right: 20px" height="26" width="26"><img id="delete-'+cid+'-'+rid+'" src="'+this.images.no+'" style="cursor: pointer; padding-right: 20px" height="26" width="26"></td>');
						content.wrappedJSObject.$("#MoodleR-IB").before(row);
						row.find("td").effect("highlight", {color: '#10FF40'}, 2000);
						content.wrappedJSObject.document.getElementById("delete-"+cid+'-'+rid).addEventListener("click",function(){
							MoodleR.Delete(this.getAttribute("id"));
						},false);
						content.wrappedJSObject.document.getElementById("rename-"+cid+'-'+rid).addEventListener("click",function(){
							MoodleR.Rename(this.getAttribute("id"));
						},false);
						content.wrappedJSObject.document.getElementById("open-"+cid+'-'+rid).addEventListener("click",function(){
							MoodleR.Open(this.getAttribute("id"));
						},false);
						// Update size and number
						this.updateCounts();
						window.setTimeout(function(){
							MoodleR.Download();
						},505);
					}).apply(MoodleR);
				},50);
			}
		}catch(e){ MoodleR.log(e,"Download_progress"); }
	},
	/* The GUI Functions */
	Open : function(ids){
		try{
			ids=ids.split("-");
			var cid=ids.splice(0,2).splice(1,1);
			var rid=ids.join("-");
			this.fofile.initWithPath(this.dir+this.semester+this.SL+this._CACHE.COURSES[cid].name.trim()+this._CACHE.COURSES[cid].files[rid].path+this.getFileName(cid,rid).trim());
			this.fofile.launch()
		}catch(e){ MoodleR.log(e,"Open"); }
	},
	OpenDir : function(cid){
		try{
			this.fofile.initWithPath(this.dir+this.semester.trim()+this.SL+this._CACHE.COURSES[cid].name.trim());
			this.fofile.reveal();
		}catch(e){ MoodleR.log(e,"OpenDir"); }
	},
	Rename : function(ids){
		try{
			ids=ids.split("-");
			var cid=ids.splice(0,2).splice(1,1);
			var rid=ids.join("-");
			var name=this.getFileName(cid,rid).split(".");
			var ext=name.splice(name.length-1,1);
			name=name.join(".");
			var name=prompt(this.lang("rename"),name);
			if(name){
				// Rename file
				name=name.trim();
				this.fofile.initWithPath(this.dir+this.semester+this.SL+this._CACHE.COURSES[cid].name.trim()+this._CACHE.COURSES[cid].files[rid].path+this.getFileName(cid,rid).trim());
				this.fofile.moveTo(null,name+"."+ext);
				// Add to cache
				if(typeof this._CACHE.FILES=="undefined"){
					this._CACHE.FILES={};
				}
				this._CACHE.FILES[cid+"-"+rid]=name+"."+ext;
				// Save 
				this.set_var("cachev2",this.encode(this._CACHE));
				// Rename on page
				var row=this.Xpath("//img[@id='rename-"+cid+"-"+rid+"']",9).parentNode.parentNode;
				row.childNodes[1].childNodes[1].textContent=this._CACHE.COURSES[cid].files[rid].path.substr(1)+name+"."+ext;
			}
		}catch(e){ MoodleR.log(e,"Rename"); }
	},
	Delete : function(ids){
		try{
			if(confirm(this.lang("deletecf"))){
				ids=ids.split("-");
				var cid=ids.splice(0,2).splice(1,1);
				var rid=ids.join("-");
				var row=this.Xpath("//img[@id='delete-"+cid+"-"+rid+"']",9).parentNode.parentNode;
				this.fofile.initWithPath(this.dir+this.semester+this.SL+this._CACHE.COURSES[cid].name.trim()+this._CACHE.COURSES[cid].files[rid].path+this.getFileName(cid,rid).trim());
				this.fofile.remove(true)
				// Restrict it
				this.setChapter_Status(cid,rid,false);
				// Save 
				this.set_var("cachev2",this.encode(this._CACHE));
				// Remove the row
				// If this row has the course name and the next row doesn't , this means they belong to the same course, lets move the name to the next row then
				if(row.childNodes[0].innerHTML!="" && row.nextSibling.childNodes[0].innerHTML==""){
					// Remove the first cell from the second row
					row.nextSibling.removeChild(row.nextSibling.childNodes[0]);
					// Move the course cell to the next row's first position
					row.nextSibling.insertBefore(row.childNodes[0],row.nextSibling.firstChild);			
				}
				// Delete our row
				row.parentNode.removeChild(row);
			}
		}catch(e){ MoodleR.log(e,"Delete"); }
	},
	Fileinfo : function(){
		var i, j, isThere, courseName, path;
		if(this.loggedIn(true) && this.showlive){
			if(this.Screen("course/view",true)){
				var cid = content.location.href.match(/id=(\d+)/)[1];
				if(typeof this._CACHE.COURSES[cid]=="undefined" || typeof this._CACHE.COURSES[cid].files=="undefined"){
					return;
				}
				courseName=this._CACHE.COURSES[cid].name;
				var res=this.Xpath("//img[contains(@class,'activityicon')]",6);
				for(i=0; i<res.length; i++){
					var src=res[i].getAttribute("src");
					if(src.match("assignment/icon") || src.match("forum/icon") || src.match("resource/icon") || src.match("quiz/icon") || src.match("web") || src.match("folder")){
						continue;
					}
					var rid=res[i].parentNode.parentNode.getAttribute("id").match(/\d+/)[0];
					try{
						this.fofile.initWithPath(this.dir+this.semester+this.SL+courseName+this.SL+this.getFileName(cid,rid).trim());
						isThere=this.fofile.exists();
					}catch(e){
						isThere=false;
					}
					
					if(isThere){
						res[i].parentNode.parentNode.innerHTML+='<span style="float:right; padding-right : 20px"><img src="'+this.images.tu+'"></span>';
					}
					else{
						res[i].parentNode.parentNode.innerHTML+='<span style="float:right; padding-right : 20px"><img src="'+this.images.td+'"></span>';
					}
				}
			}
			if(this.Screen("mod/resource/view",true)){
				if(!content.location.href.match("subdir")){
					var cid = this.Xpath("//div[@id='page']/div[2]/div/ul/li[2]/a",9).href.match(/id=(\d+)/)[1];
					if(typeof this._CACHE.COURSES[cid]=="undefined" || typeof this._CACHE.COURSES[cid].files=="undefined"){
						return;
					}
					courseName=this._CACHE.COURSES[cid].name;
					var res=this.Xpath("//td[contains(@class,'name')]//img[contains(@class,'icon')]",6);
					for(i=0; i<res.length; i++){
						var src=res[i].getAttribute("src");
						if(src.match("assignment/icon") || src.match("forum/icon") || src.match("resource/icon") || src.match("quiz/icon") || src.match("web") || src.match("folder")){
							continue;
						}
						var rid=res[i].parentNode.getAttribute("href").split("/");
						rid=rid.splice(rid.length-2,2).join("_");
						path=this._CACHE.COURSES[cid].files[rid].path;
						
						try{
							this.fofile.initWithPath(this.dir+this.semester+this.SL+courseName+path+this.getFileName(cid,rid).trim());
							isThere=this.fofile.exists();
						}catch(e){
							isThere=false;
						}
						
						if(isThere){
							res[i].parentNode.parentNode.innerHTML+='<span style="float:right; padding-left : 20px"><img src="'+this.images.tu+'"></span>';
						}
						else{
							res[i].parentNode.parentNode.innerHTML+='<span style="float:right; padding-left : 20px"><img src="'+this.images.td+'"></span>';
						}
					}
				}
				else{
					// Subdir of a subdir
					var cid = this.Xpath("//div[@id='page']/div[2]/div/ul/li[2]/a",9).href.match(/id=(\d+)/)[1];
					if(typeof this._CACHE.COURSES[cid]=="undefined" || typeof this._CACHE.COURSES[cid].files=="undefined"){
						return;
					}
					courseName=this._CACHE.COURSES[cid].name;
					var res=this.Xpath("//td[contains(@class,'name')]//img[contains(@class,'icon')]",6);
					for(i=0; i<res.length; i++){
						var src=res[i].getAttribute("src");
						if(src.match("assignment/icon") || src.match("forum/icon") || src.match("resource/icon") || src.match("quiz/icon") || src.match("web")){
							continue;
						}
						
						var type=src.match(/(\w+)\.(png|gif|jpg)/)[1];
						if(type!="folder"){
							var rid=res[i].parentNode.getAttribute("href").split("/");
							rid=rid.splice(rid.length-2,2).join("_");
							path=this._CACHE.COURSES[cid].files[rid].path.split(this.SL);
							var tmp=[];
							for(j=0; j<path.length; j++){
								tmp[j]=path[j].trim();
							}
							path=tmp.join(this.SL);
							
							try{
								this.fofile.initWithPath(this.dir+this.semester+this.SL+courseName+path+this.getFileName(cid,rid).trim());
								isThere=this.fofile.exists();
							}catch(e){
								isThere=false;
							}
							
							if(isThere){
								res[i].parentNode.parentNode.innerHTML+='<span style="float:right; padding-left : 20px"><img src="'+this.images.tu+'"></span>';
							}
							else{
								res[i].parentNode.parentNode.innerHTML+='<span style="float:right; padding-left : 20px"><img src="'+this.images.td+'"></span>';
							}
						}
					}	
				}
			}
		}
	}
};

window.addEventListener("load",function(){ MoodleR.Init(); },false);