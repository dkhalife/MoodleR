"use strict";
var MoodleR={
	/* Window Handler */
	win : undefined,
	/* Prefs */
	prefs : null,
	running : true,
	launched : false,
	refreshed : false,
	curVersion : "3.0",
	getPrefs : function(){
		try{
			if (!this.prefs) {
				this.prefs = this.prefManager.getBranch('extensions.moodler@twbooster.com.');
			}
			return this.prefs;
		}catch(e){ this.log(e,"getPrefs"); }
	},
	setVar : function(param,to){
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
		}catch(e){ this.log(e,"setVar"); }
	},
	getVar : function(param,type){
		try{
			switch(typeof type){
				case "boolean":
					if(this.getPrefs().prefHasUserValue(param)==false){
						this.setVar(param, type);
					}
					return this.getPrefs().getBoolPref(param);
				break;
				
				case "number":
					if(this.getPrefs().prefHasUserValue(param)==false){
						this.setVar(param, type);
					}
					return this.getPrefs().getIntPref(param);
				break;
				
				default:
					if(this.getPrefs().prefHasUserValue(param)==false){
						this.setVar(param, type);
					}
					return this.getPrefs().getCharPref(param);
				break;
			}
		}catch(e){ this.log(e,"getVar"); }
	},
	decode : function(v){
		try{
			return JSON.parse(v);
		}catch(e){
			return undefined;
		}
	},
	encode : function(v){
		return JSON.stringify(v);
	},
	normalizeString : function(v){
		// Remove accents and format filename
		return v.replace(/[\u0300-\u036f\u1dc0-\u1dff]/g, '').replace(/[,:\/\\*\"<>\|?]/g, '');
	},
	
	/* Setup Functions */
	isConfigured : function(silent){
		this.host=this.getVar("host","");
		this.dir=this.getVar("dir","");
		this.semester=this.getVar("semester","");
		if(this.host=="" || this.dir=="" || this.semester==""){
			if(typeof silent=="undefined"){
				alert(this.lang("configure"));
			}
			
			this.setup();
			
			return false;
		}
		else{
			return true;
		}
	},
	setup : function(save){
		// Open the configuration window
		window.openDialog("chrome://moodler/content/setup.xul", "","chrome,dialog,resizable=yes,centerscreen", window);
	},
	setSemester : function(){
		var val=prompt(this.lang("changesem"),this.getVar("semester",""));
		if(val){
			this.semester=val;
			this.setVar("semester",val);
			this.unCache(true);
		}
	},
	unCache : function(silent){
		this._CACHE={};
		this.setVar("moodler_cache",this.encode(this._CACHE));
		this.loadCache();
		
		if(typeof silent=="undefined"){
			alert(this.lang("un_cache"));
		}
	},
	loadCache : function(){
		this._CACHE=this.decode(this.getVar("moodler_cache",""));
		if(typeof this._CACHE!="object"){
			this._CACHE={};
		}
		if(typeof this._CACHE.COURSES == "undefined") this._CACHE.COURSES = {};
		if(typeof this._CACHE.RESOURCES == "undefined") this._CACHE.RESOURCES = {};
	},
	saveCache : function(){
		this.setVar("moodler_cache",this.encode(this._CACHE));
	},
	
	/* Helper Methods */
	$ : function(sel){
		if(typeof MoodleR.win == "undefined")
			return this.jQuery(sel, content.window.document);
		else
			return this.jQuery(sel, MoodleR.win.window.document);
	},
	gei : function(v){
		return document.getElementById(v);
	},
	log : function(erzx,type){
		this.cs.logStringMessage("[MoodleR]-{"+type+"} -> "+erzx.message);
		
		// Delete handle in case something happened
		delete this.win;
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
	loadURL : function(url){
		if(typeof MoodleR.win == "undefined")
			content.location.href = url;
		else
			MoodleR.win.location.href = url;
	},
	getIconForFile : function(file_name){
		var ext = file_name.match(/\.([a-z0-9]+)$/i);
		
		if(ext == null)	ext=["",""];
		ext[1] = ext[1].toLowerCase();
		
		var url = "resource://moodler-icons/";
		
		switch(ext[1]){
			case "xls":
				url += "xlsx";
			break;
			
			case "rtf":
			case "doc":
				url += "docx";
			break;
			
			case "ppt":
				url += "pptx";
			break;
			
			case "pptx":
			case "docx":
			case "xlsx":
			case "pdf":
			case "zip":
				url += ext[1];
			break;
			
			default :
				url += "unk";
		}
		
		url += ".png";
		
		return this.$("<img />").attr("src", url).css("float", "left").css("margin-right", "20px");
	},
	installButton: function(){
		var id = "Moodler-Icon";
		var toolbar = this.gei("nav-bar");
		
		if(!this.gei(id)){
			toolbar.insertItem(id, null);	// Append to the toolbar
			toolbar.setAttribute("currentset", toolbar.currentSet);
			document.persist(toolbar.id, "currentset");
		}
	},

	/* Initialisation */
	Init : function(){
		try{
			// Shortcuts
			this.Cc=Components.classes;
			this.Ci=Components.interfaces;
			
			// Conflict prevention
			MoodleR.jQuery = jQuery;
			jQuery.noConflict(true);
			
			// Slash
			this.SL=(navigator.platform.indexOf("Linux")==-1 && navigator.platform.indexOf("Mac")==-1)?"\\":"/";
						
			// File handles
			this.dfile=this.Cc["@mozilla.org/file/local;1"].createInstance(this.Ci.nsIFile);
			this.fofile=this.Cc["@mozilla.org/file/local;1"].createInstance(this.Ci.nsIFile);
			
			// Misc Objects
			this.nsIFilePicker=this.Ci.nsIFilePicker;
			this.cs = this.Cc['@mozilla.org/consoleservice;1'].getService(this.Ci.nsIConsoleService);
			this.prefManager=this.Cc['@mozilla.org/preferences-service;1'].getService(this.Ci.nsIPrefService);
			this.mediator=this.Cc['@mozilla.org/appshell/window-mediator;1'].getService(this.Ci.nsIWindowMediator).getMostRecentWindow("navigator:browser");

			// Load Cache
			this.loadCache();

			// Add button for the first time
			var firstRun = this.getVar("firstRun", true);
			if(firstRun){
				this.installButton();
				this.setVar("firstRun", false);
				this.setVar("installedVersion", this.curVersion);
			}
			
			// The processor
			gBrowser.addTabsProgressListener(this.Processor.Listener);
		}catch(e){ this.log(e,"Init"); }
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
			onStateChange : function(browser, aWebProgress,aRequest,aFlag,aStatus){
				// We want every page stop event that occurs on the host provided by the user
				if(aFlag & MoodleR.Processor.STATE_STOP && aRequest!==null && aRequest.URI && aRequest.URI.spec.match(MoodleR.host)){
					MoodleR.Processor.exec(aWebProgress.DOMWindow,aRequest.URI.spec);
					return 0;
				}
				
				// Also lets make sure that on every start we unlock the page to reset all toggle effects
				if(aFlag & MoodleR.Processor.STATE_START){
					MoodleR.unlock();
					return 0;
				}
			},
			onLocationChange : function(browser, aWebProgress,aRequest,aURI){return 0;},
			onProgressChange : function(browser, aWebProgress,aRequest,curSelf,maxSelf,curTot,maxTot){return 0;},
			onStatusChange : function(browser, aWebProgress,aRequest,aStatus,aMessage){return 0;},
			onSecurityChange : function(browser, aWebProgress,aRequest,aState){return 0;}
		},
		start : function(_name,funct,targetURL,KILL){
			if(typeof MoodleR.Processor.processes[_name]!="object"){
				MoodleR.Processor.processes[_name]={"name":_name,"function":funct,"target":targetURL,"kill":KILL};
			}
		},
		stop : function(_name){
			if(typeof MoodleR.Processor.processes[_name]=="object"){
				delete MoodleR.Processor.processes[_name];
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
							MoodleR.Processor.stop(MoodleR._PRO[MoodleR._PXID]["name"]);
						}
						tmp.apply(MoodleR);
					}
				}catch(e){}
			}
		},
	},
	
	/* Regular Tests and Procedures */
	onsite : function(){
		if(typeof MoodleR.win == "undefined")
			return content.document.location.href.match(this.host)!=null;
		else
			return MoodleR.win.document.location.href.match(this.host)!=null;
	},
	lock : function(){
		this.locked=this.screen();
	},
	unlock : function(){
		delete this.locked;
	},
	_lockPage : function(){
		return false;
	},
	lockPage : function(){
		if(typeof MoodleR.win == "undefined"){
			content.addEventListener("beforeunload", MoodleR._lockPage);
		}
		else{
			MoodleR.win.addEventListener("beforeunload", MoodleR._lockPage);
		}
	},
	unlockPage : function(){
		if(typeof MoodleR.win == "undefined"){
			content.removeEventListener("beforeunload", MoodleR._lockPage);
		}
		else{
			MoodleR.win.removeEventListener("beforeunload", MoodleR._lockPage);
		}
	},
	isLoggedIn : function(_silent){
		if(this.onsite() && MoodleR.$(".logininfo a[href*='logout']").length>0){
			return true;
		}
		
		if(typeof _silent=="undefined"){
			alert(this.lang("login"));
		}
		
		return false;
	},
	screen : function(valid){
		try{
			if(typeof MoodleR.win == "undefined")
				var screen = content.document.location.href.split(MoodleR.host+"/")[1].split(".php")[0];
			else{
				var screen = MoodleR.win.document.location.href.split(MoodleR.host+"/")[1].split(".php")[0];
			}		
		}catch(e){
			return (typeof valid == "undefined")?"":false;
		}
		
		if(typeof valid == "undefined"){
			// Return mode
			return screen;
		}
		else{
			// Test mode
			if(typeof valid == "object"){
				// Array
				return valid.indexOf(screen) != -1;
			}
			else{
				return screen == valid;
			}
		}
	},
	
	/* Statuses */
	getCourseStatus : function(course_id){
		if(typeof this._CACHE.COURSES[course_id] == "undefined"){
			// Course is to be parsed
			return true;
		}
		
		return this._CACHE.COURSES[course_id];
	},
	setCourseStatus : function(course_id, status){
		this._CACHE.COURSES[course_id] = status;
		this.saveCache();
	},
	getResourceStatus : function(file_id){
		if(typeof this._CACHE.RESOURCES[file_id] == "undefined"){
			// Course is to be parsed
			return true;
		}
		
		return this._CACHE.RESOURCES[file_id];
	},
	setResourceStatus : function(resource_id, status){
		this._CACHE.RESOURCES[resource_id] = status;
		this.saveCache();
	},
	
	/* Course Selection */
	setCourses : function(){
		try{
			if(this.isConfigured()){
				// Toggle Feedback
				if(this.locked==this.screen()){
					// Invert process
					this.unlock();
					this.$(".moodleR").each(function(){
						MoodleR.$(this).remove();
					});
					return;
				}
				
				if(this.isLoggedIn()){
					if(this.screen(["my/","my/index"], false)){
						this.lock();
						
						// Set the ticks
						this.$("#page-content .coursebox > h3 > a").each(function(){
							var course_id = this.href.match(/id=(\d+)/)[1];
							
							var img = content.document.createElement("img");
							MoodleR.$(img).attr("src", "resource://moodler-icons/"+(MoodleR.getCourseStatus(course_id)?"tick":"minus")+".png")
										  .attr("class", "moodleR")
										  .attr("name", course_id)
										  .attr("width", 20)
										  .css({
											"margin-right": "10px",
											"position": "relative",
											"top": "2px",
											"cursor": "pointer"
										  })
										  .click(function(){
												// On click we need to toggle state
												if(this.src.match("tick")){
													this.src = "resource://moodler-icons/minus.png";
													MoodleR.setCourseStatus(this.getAttribute("name"), false);
												}
												else{
													this.src = "resource://moodler-icons/tick.png";
													MoodleR.setCourseStatus(this.getAttribute("name"), true);
												}
										  });
							
							this.parentNode.insertBefore(img, this);
						});
					}
					else{
						alert(this.lang("screen_invalid"));
					}
				}
			}
		}catch(e){ MoodleR.log(e,"setCourses"); }
	},
	
	/* Resource Selection */
	setResources : function(){
		try{
			if(this.isConfigured()){
				// Toggle Feedback
				if(this.locked==this.screen()){
					// Invert process
					this.unlock();
					this.$(".moodleR").each(function(){
						MoodleR.$(this).remove();
					});
					return;
				}
				
				if(this.isLoggedIn()){
					if(this.screen("course/view",true)){
						this.lock();
						
						this.$(".activity:not(.resource):not(.label):not(.folder) > div").each(function(){
							var img = content.document.createElement("img");
							MoodleR.$(img).attr("src", "resource://moodler-icons/minus.png")
										  .attr("class", "moodleR")
										  .attr("width", 20)
										  .css({
											"margin-right": "10px",
											"position": "relative",
											"top": "2px"
										  });
							
							this.insertBefore(img, this.childNodes[0]);
						});
						
						this.$(".resource > div, .folder > div").each(function(){
							var type = this.childNodes[0].childNodes[0].getAttribute("src").match(/(mht|htm|html|web)/);
							
							if(type == null){
								var resource_id = this.parentNode.getAttribute("id").match(/module-(\d+)/)[1];
								var status = MoodleR.getResourceStatus(resource_id);
							}
							else{
								var status = false;
							}
							
							var img = content.document.createElement("img");
							MoodleR.$(img).attr("src", "resource://moodler-icons/"+(status?"tick":"minus")+".png")
										  .attr("class", "moodleR")
										  .attr("width", 20)
										  .css({
											"margin-right": "10px",
											"position": "relative",
											"top": "2px"
										  });
										  
							if(type == null){
								MoodleR.$(img).attr("name", resource_id)
											  .css("cursor", "pointer")
											  .click(function(){
													// On click we need to toggle state
													if(this.src.match("tick")){
														this.src = "resource://moodler-icons/minus.png";
														MoodleR.setResourceStatus(this.getAttribute("name"), false);
													}
													else{
														this.src = "resource://moodler-icons/tick.png";
														MoodleR.setResourceStatus(this.getAttribute("name"), true);
													}
											  });
							}
							
							this.insertBefore(img, this.childNodes[0]);
						});
					}
					else if(this.screen("mod/folder/view",true)){
						this.lock();
					
						if(typeof MoodleR.win == "undefined")
							var parent_id = content.location.href.match(/id=(\d+)/)[1];
						else
							var parent_id = MoodleR.win.location.href.match(/id=(\d+)/)[1];
							
						this.$(".ygtvcontent > span > a[href]").each(function(){
							// Child resource
							var resource_id = MoodleR.md5(MoodleR.$(this).attr("href"));
							var status = MoodleR.getResourceStatus(parent_id+"#"+resource_id);
							
							var img = content.document.createElement("img");
							MoodleR.$(img).attr("src", "resource://moodler-icons/"+(status?"tick":"minus")+".png")
										  .attr("class", "moodleR")
										  .attr("width", 20)
										  .css({
											"margin-right": "10px",
											"position": "relative",
											"top": "2px"
										  });
										  
							MoodleR.$(img).attr("name", parent_id+"#"+resource_id)
										  .css("cursor", "pointer")
										  .click(function(){
												// On click we need to toggle state
												if(this.src.match("tick")){
													this.src = "resource://moodler-icons/minus.png";
													MoodleR.setResourceStatus(this.getAttribute("name"), false);
												}
												else{
													this.src = "resource://moodler-icons/tick.png";
													MoodleR.setResourceStatus(this.getAttribute("name"), true);
												}
										  });
							
							this.parentNode.insertBefore(img, this);
						});
					}
					else{
						alert(this.lang("screen_invalid"));
					}
				}
			}
		}catch(e){ MoodleR.log(e,"setResources"); }
	},
	
	/* The BOT */
	cancel : function(){
		this.running = false;
		document.getElementById("MoodleR-Launch").setAttribute("disabled", false);
		document.getElementById("MoodleR-Cancel").setAttribute("disabled", true);
	},
	unleash : function(){
		try{
			if(this.isConfigured()){
				// Read all courses except restricted ones
				if(this.isLoggedIn()){
					if(this.launched){
						if(!confirm(this.lang("relaunch"))){
							this.showSummary();
							return;
						}
						else{
							this.launched = false;
						}
					}
				
					document.getElementById("MoodleR-Launch").setAttribute("disabled", true);
					document.getElementById("MoodleR-Cancel").setAttribute("disabled", false);
				
					if(this.screen(["my/","my/index"],true)){
						// Save window handle
						this.win = content;
					
						// Read Courses			
						var i;
						this.LINKS=[];
						this.COURSES=[];
						this.RESOURCES=[];
						var courses=this.$("#page-content .coursebox > h3 > a");

						for(i=0; i<courses.length; i++){
							var course_id = courses[i].href.match(/id=(\d+)/)[1];

							if(this.getCourseStatus(course_id)){
								// We need to add this to the scraping queue
								if(typeof MoodleR.win == "undefined")
									this.LINKS.push(content.location.protocol+"//"+content.location.host+"/course/view.php?id="+course_id);
								else
									this.LINKS.push(MoodleR.win.location.protocol+"//"+MoodleR.win.location.host+"/course/view.php?id="+course_id);
							}
						}
						
						// See if we have a first link and load it
						if(this.LINKS.length>0){
							this.Processor.start("scraper","scraper","*",false);
							this.loadURL(this.LINKS[0]);
						}
						else{
							if(this.refreshed){
								alert(this.lang("nothing"));
							
								document.getElementById("MoodleR-Launch").setAttribute("disabled", false);
								document.getElementById("MoodleR-Cancel").setAttribute("disabled", true);
								
								this.refreshed = false;
							}
							else{
								// Refresh the page, we could be on the summary page using the same URL we are expecting
								this.refreshed = true;
								
								// Save window handle
								this.win = content;
							
								this.Processor.start("router","unleash","*",true);

								// We are sure that the click is on the page so we'll use content here
								this.loadURL(content.location.protocol+"//"+this.host+"/my");
							}
						}
					}
					else{
						// Save window handle
						this.win = content;
					
						this.Processor.start("router","unleash","*",true);

						// We are sure that the click is on the page so we'll use content here
						this.loadURL(content.location.protocol+"//"+this.host+"/my");
					}
				}
			}
		}catch(e){ MoodleR.log(e,"unleash"); }
	},
	scraper : function(){
		try{
			if(this.running){
				if(this.isLoggedIn(true)){
					// Remove current link
					this.LINKS.splice(0,1);
					
					var i;
					if(this.screen("course/view",true)){
						if(typeof MoodleR.win == "undefined")
							var course_id = "R"+content.location.href.match(/id=(\d+)/)[1];
						else
							var course_id = "R"+MoodleR.win.location.href.match(/id=(\d+)/)[1];
						
						// Course acronym
						this.COURSES[course_id] = {
							acronym: this.$(".breadcrumb li:last a").text(),
							resources: {}
						};
						
						// Resources related to this course
						this.$(".resource > div a").each(function(){
							var type = this.childNodes[0].getAttribute("src").match(/(mht|htm|html|web)/);
							
							// Filter out web pages
							if(type != null)
								return;
							
							var resource_id = this.parentNode.parentNode.getAttribute("id").match(/module-(\d+)/)[1];
							
							if(MoodleR.getResourceStatus(resource_id)){
								MoodleR.COURSES[course_id].resources[resource_id] = [this.getAttribute("href")];
							}
						});
						
						// Add subfolders to be scanned later
						MoodleR.LINKS.reverse();
						this.$(".folder > div a").each(function(){
							var resource_id = this.parentNode.parentNode.getAttribute("id").match(/module-(\d+)/)[1];
							
							if(MoodleR.getResourceStatus(resource_id)){
								MoodleR.LINKS.push(MoodleR.$(this).attr("href"));
							}
						});
						MoodleR.LINKS.reverse();
					}
					else if(this.screen("mod/folder/view",true)){
						var course_id = "R" + this.$(".breadcrumb li a:eq(1)").attr("href").match(/\d+/)[0];
						
						if(typeof MoodleR.win == "undefined")
							var parent_id = content.location.href.match(/id=(\d+)/)[1];
						else
							var parent_id = MoodleR.win.location.href.match(/id=(\d+)/)[1];
							
						this.$(".ygtvcontent > span > a[href]").each(function(){
							// Child resource
							var resource_id = MoodleR.md5(MoodleR.$(this).attr("href"));
							
							if(MoodleR.getResourceStatus(parent_id+"#"+resource_id)){
								var path = MoodleR.$(".breadcrumb li a:eq(2)").text() + MoodleR.SL;
								var acronym = MoodleR.COURSES[course_id].acronym;
								
								// Is this in a sub-subfolder?
								if(MoodleR.$(this).parents(".ygtvchildren").parents(".ygtvchildren").length != 0){
									path += MoodleR.$(this).parents(".ygtvchildren").prev().find("span.ygtvlabel").text() + MoodleR.SL;
								}

								// Test to see if the dir is there
								MoodleR.dfile.initWithPath(MoodleR.dir+MoodleR.semester.trim()+MoodleR.SL+acronym.trim()+MoodleR.SL+path);
								if(!MoodleR.dfile.exists() || !MoodleR.dfile.isDirectory()){
									MoodleR.dfile.create(MoodleR.dfile.DIRECTORY_TYPE, 511);
								}
								
								MoodleR.COURSES[course_id].resources[parent_id+"#"+resource_id] = {
									name: MoodleR.$(this).text(),
									href: this.getAttribute("href"),
									path: path
								};
							}
						});
					}
					
					// Move to the next
					if(this.LINKS.length>0){
						this.loadURL(this.LINKS[0]);
					}
					else{
						this.Processor.stop("scraper");
						
						// launch fetcher
						this.lockPage();
						this.fetcher(false);
					}
				}
				else{
					// We somehow got logged out, abort
					this.Processor.stop("scraper");
				}
			}
			else{
				this.running = true;
				this.Processor.stop("scraper");
			}
		}catch(e){ MoodleR.log(e,"scraper"); }
	},
	fetcher : function(cont){
		try{
			if(this.running){
				if(cont != true){
					var i;
					var course;
					var resource;
					this.URLS = [];
					for(course in this.COURSES){
						for(resource in this.COURSES[course].resources){
							// [acronym, [resid, url]]
							this.URLS.push([course, resource, this.COURSES[course].resources[resource]]);
						}
					}
					// Keeping track of total length since we will be splicing
					this.URLSL = this.URLS.length;
					this.lastCourse = 0;
					
					var table = this.$("<table />").attr("id", "MoodleR").addClass("generaltable").addClass("boxaligncenter").css("width", "90%");
					var tr0 = this.$("<tr />");
					var tr1 = this.$("<tr />");
					
					var th0 = this.$("<th />").attr("colspan", 3).addClass("header").css("text-align", "center").text("MoodleR");
					tr0.append(th0);
					
					var th1 = this.$("<th />").attr("id", "MoodleR-Status").attr("colspan", 3).addClass("header").css("text-align", "center").text(this.lang("process",[0,this.URLS.length]));
					tr1.append(th1);
					
					table.append(tr0);
					table.append(tr1);
					
					this.$("#page-content").html("").append(table);
					this.fetcher(true);
				}
				else{
					// Skip all resources that are in subfolders because we already have everything we need
					while(this.URLS.length > 0 && this.URLS[0][1].match("#")){
						var R = MoodleR.COURSES[MoodleR.URLS[0][0]].resources[MoodleR.URLS[0][1]];
						var file_name = this.normalizeString(R.name);
						MoodleR.COURSES[MoodleR.URLS[0][0]].resources[MoodleR.URLS[0][1]] = [R.href, R.path + file_name, R.href];
									
						this.URLS.splice(0, 1);
					}
					
					// Update progress
					this.$("#MoodleR-Status").text(MoodleR.lang("process",[this.URLSL-this.URLS.length,this.URLSL]));
							
					if(this.URLS.length>0){
						// Continue 
						this.jQuery.ajax({
							type: "GET",
							async: true,
							url: this.URLS[0][2],
							success: function(response){
								var f = MoodleR.$(response).find(".resourceworkaround > a");
								var file_name;
								var file_src;
									
								var course = MoodleR.COURSES[MoodleR.URLS[0][0]].acronym;
								
								if(f.length == 1){	// Regular cases where we have link for download
									file_name = f.text();
									file_src = f.attr("href");
								}
								else{	// The object instantiation of a pdf for example
									f = MoodleR.$(response).find("object");
									
									if(f.length == 1){
										file_src = f.attr("data");
										file_name = file_src.split("/").pop();
									}
									// A frameset with a link to the document?
									else if(MoodleR.$(response).length >= 4){
										f = MoodleR.$(response)[3];
										
										if(typeof f != "undefined" && f.nodeName.toLowerCase() == "title"){
											try{
												file_src = response.split("frame src=\"")[2].split("\"")[0];
												file_name = f.textContent.split(course+": ")[1];
												
												var ext = file_src.match(/\.[a-z]+$/i);
												if(ext != null){
													file_name += ext[0];
												}
												else{
													file_src = undefined;
												}
											}catch(e){}
										}
									}
								}
								
								if(course == MoodleR.lastCourse){
									course = " ";
								}
								else{
									MoodleR.lastCourse = course;
								}
								
								if(typeof file_src != "undefined"){
									file_name = MoodleR.normalizeString(file_name);
									MoodleR.COURSES[MoodleR.URLS[0][0]].resources[MoodleR.URLS[0][1]].push(file_name, file_src);
								}
								
								MoodleR.URLS.splice(0,1);
								MoodleR.fetcher(true);
							},
							error: function(){
								// Add log to console
								MoodleR.log({message: "[XHR] Could not load MoodleR URL"}, "fetcher");
																
								MoodleR.URLS.splice(0,1);
								MoodleR.fetcher(true);
							},
						});
					}
					else{
						// Show summary
						MoodleR.I = 5;

						var tr = MoodleR.$("<tr />");
						var td = MoodleR.$("<th />").attr("id", "MoodleR-Counter").attr("colspan", 3).addClass("header").text(MoodleR.lang("showingsum",[5]));
						tr.append(td);
						
						// Disable the cancel
						document.getElementById("MoodleR-Cancel").setAttribute("disabled", true);
						document.getElementById("MoodleR-Launch").setAttribute("disabled", false);
						
						MoodleR.$("#MoodleR").append(tr);
						MoodleR.Int = window.setInterval(function(){
							--MoodleR.I;
							MoodleR.$("#MoodleR-Counter").text(MoodleR.lang("showingsum",[MoodleR.I]));
							
							if(MoodleR.I == 0){
								MoodleR.launched = true;
								window.clearInterval(MoodleR.Int);
								delete MoodleR.Int;
								delete MoodleR.I;
								
								// Show Summary
								MoodleR.unlockPage();
								MoodleR.showSummary();
							}
						},1000);
					}
				}
			}
			else{
				this.running = true;
			}
		}catch(e){ MoodleR.log(e,"fetcher"); }
	},
	
	/* The GUI */
	showSummary : function(){
		try{
			// Create semester dir if it does not exist
			this.dfile.initWithPath(this.dir+this.semester.trim());
			if(!this.dfile.exists() || !this.dfile.isDirectory()){
				this.dfile.create(this.dfile.DIRECTORY_TYPE, 511);
			}
			
			var i, course_id, _course_id, res_id;
			
			var total_here=0, total_todl=0, total_err=0;
			var size_here=0;
			
			var course3 = 0;
			
			var last_course1 = '', last_course2 = '', last_course3 = '';
			
			var todl = [];
			var openD = [];
			var actions = [];
			
			var table = this.$("<table />").css("width", "80%").addClass("generaltable").addClass("boxaligncenter");
			var tbodyHERE = this.$("<tbody />").attr("id", "MoodleR");
			var tr1 = this.$("<tr />");
			var th1 = this.$("<th />").attr("colspan", 4).attr("id", "MoodleR-HERE-Count").addClass("header").css("vertical-align", "top").css("text-align", "center").text(this.lang("fileswehave")+': '+this.lang("sizef",[size_here, total_here]));
			tr1.append(th1);
			tbodyHERE.append(tr1);
			
			var tr2 = this.$("<tr />");
			var th1 = this.$("<th />").addClass("header").css("vertical-align", "top").css("text-align", "center").text(this.lang("course"));
			var th2 = this.$("<th />").addClass("header").css("vertical-align", "top").css("text-align", "left").css("padding-left", "20px").text(this.lang("filename"));
			var th3 = this.$("<th />").addClass("header").css("vertical-align", "top").css("text-align", "left").text(this.lang("size"));
			var th4 = this.$("<th />").addClass("header").css("vertical-align", "top").css("text-align", "center").text(this.lang("options"));
			tr2.append(th1).append(th2).append(th3).append(th4);
			tbodyHERE.append(tr2);
			
			var tbodyDL = this.$("<tbody />").attr("id", "MoodleR-ToDL");
			var tr1 = this.$("<tr />");
			var th1 = this.$("<th />").attr("colspan", 4).attr("id", "MoodleR-TODL-Count").addClass("header").css("vertical-align", "top").css("text-align", "center").text(this.lang("filestodl")+': '+this.lang("fcount",[total_todl]));
			tr1.append(th1);
			tbodyDL.append(tr1);
			
			var tr2 = this.$("<tr />");
			var th1 = this.$("<th />").addClass("header").css("vertical-align", "top").css("text-align", "center").text(this.lang("course"));
			var th2 = this.$("<th />").addClass("header").css("vertical-align", "top").css("text-align", "left").css("padding-left", "20px").text(this.lang("filename"));
			var th3 = this.$("<th />").attr("id", "MoodleR-DL-TH").attr("colspan", 2).addClass("header").css("vertical-align", "top").css("text-align", "center").text(this.lang("download"));
			tr2.append(th1).append(th2).append(th3);
			tbodyDL.append(tr2);
			
			var tbodyERR = this.$("<tbody />");
			var tr = this.$("<tr />");
			var th = this.$("<th />").attr("colspan", 4).addClass("header").css("vertical-align", "top").css("text-align", "center").text(this.lang("fileserr"));
			tr.append(th);
			tbodyERR.append(tr);
			
			var tr2 = this.$("<tr />");
			var th1 = this.$("<th />").addClass("header").css("vertical-align", "top").css("text-align", "center").text(this.lang("course"));
			var th2 = this.$("<th />").attr("colspan", 3).addClass("header").css("vertical-align", "top").css("text-align", "center").text(this.lang("link"));
			tr2.append(th1).append(th2);

			for(_course_id in this.COURSES){
				course_id = _course_id.replace("R", "");
				
				// Create course dir if it does not exist
				var acronym = this.COURSES[_course_id].acronym;
				this.dfile.initWithPath(this.dir+this.semester.trim()+this.SL+acronym);
				if(!this.dfile.exists() || !this.dfile.isDirectory()){
					this.dfile.create(this.dfile.DIRECTORY_TYPE, 511);
				}
				
				for(res_id in this.COURSES[_course_id].resources){
					// Did we get the DL URL ?
					if(this.COURSES[_course_id].resources[res_id].length == 3){
						var tmp=this.COURSES[_course_id].resources[res_id][2].split(this.SL);
						for(i=0; i<tmp.length; i++){
							tmp[i]=tmp[i].trim();
						}
						this.COURSES[_course_id].resources[res_id][2] = tmp.join(this.SL);
						
						var filename=this.COURSES[_course_id].resources[res_id][1].trim();
						var file_on_disk=this.dir+this.semester+this.SL+acronym+this.SL+filename;
						this.dfile.initWithPath(file_on_disk);
						
						// Is the file already downloaded?
						if(this.dfile.exists() && this.dfile.isFile()){
							// File is here
							++total_here;
							
							var tr = this.$("<tr />").attr("id", "res_"+res_id).attr("name", course_id);
							var td = this.$("<td />").addClass("cell").css("width", "150px").css("text-align", "center").css("vertical-align", "middle");

							if(acronym==last_course1){
								td.text(" ");
							}
							else{
								last_course1=acronym;
								var img = this.$("<img />").attr("id", "course_"+course_id).attr("src", "resource://moodler-icons/directory.png").css("cursor", "pointer").css("margin-right", "10px").css("position", "relative").css("top", "5px").css("height", "26px").css("width", "26px");
								td.append(img);
								var span = this.$("<span />").text(acronym);
								td.append(span);
								
								openD.push("course_"+course_id);
							}
							tr.append(td);
							
							var td = this.$("<td />").addClass("cell").css("padding-left", "20px").css("text-align", "left").css("line-height", "32px");
							td.append(this.getIconForFile(filename).css("position", "relative").css("top", "5px"));
							var span = this.$("<span />").text(filename);
							td.append(span);
							tr.append(td);
							
							size_here-=-this.dfile.fileSize;
							var size=this.formatSize(this.dfile.fileSize);
							actions.push(course_id+'-'+res_id);
							
							var td = this.$("<td />").addClass("cell").css("width", "100px").css("text-align", "center").css("vertical-align", "middle").text(size);
							tr.append(td);
							
							var td = this.$("<td />").addClass("cell").css("width", "160px").css("text-align", "center").css("vertical-align", "middle");
							var img1 = this.$("<img />").attr("id", "open-"+course_id+"-"+res_id).attr("src", "resource://moodler-icons/open.png").css("cursor", "pointer").css("margin-right", "20px").css("width", "29px").css("height", "26px");
							var img3 = this.$("<img />").attr("id", "delete-"+course_id+"-"+res_id).attr("src", "resource://moodler-icons/minus.png").css("cursor", "pointer").css("margin-right", "20px").css("width", "29px").css("height", "26px");
							td.append(img1).append(img3);
							tr.append(td);
							
							tbodyHERE.append(tr);
						}
						else{
							// File needs to be download
							total_todl++;
							
							var tr = this.$("<tr />").attr("id", "res_"+res_id).attr("name", course_id);
							if(MoodleR.getResourceStatus(res_id)){
								tr.addClass("notCompleted");
							}
							var td = this.$("<td />").addClass("cell").css("width", "150px").css("text-align", "center").css("vertical-align", "middle");

							if(acronym==last_course2){
								td.text(" ");
							}
							else{
								last_course2 = acronym;
								
								var img = this.$("<img />").attr("id", "course_"+course_id).attr("src", "resource://moodler-icons/directory.png").css("cursor", "pointer").css("margin-right", "10px").css("position", "relative").css("top", "5px").css("height", "26px").css("width", "26px");
								td.append(img);
								var span = this.$("<span />").text(acronym);
								td.append(span);
							}
							todl.push(res_id);
							tr.append(td);
							
							var status = this.getResourceStatus(res_id);
							var url = status?"resource://moodler-icons/tick.png":"resource://moodler-icons/minus.png";
							
							var td = this.$("<td />").addClass("cell").css("padding-left", "20px").css("text-align", "left").css("line-height", "32px");
							td.append(MoodleR.getIconForFile(filename).css("position", "relative").css("top", "5px"));
							var span = this.$("<span />").text(filename);
							td.append(span);
							tr.append(td);
							
							var td = this.$("<td />").attr("colspan", 2).addClass("cell").css("text-align", "center").css("vertical-align", "middle");
							var img = this.$("<img />").attr("id", res_id).attr("src", url).css("cursor", "pointer").css("margin-right", "10px").css("height", "26px").css("width", "26px").addClass("MoodleR").addClass("activityicon").addClass(status?"true":"");
							
							td.append(img);
							tr.append(td);
							tbodyDL.append(tr);
						}
					}
					else{
						// Failed to get DL URL
						++total_err;
						
						if(acronym==last_course3){
							course3=" ";
						}
						else{
							course3 = acronym;
							last_course3 = acronym;
						}
						
						var tr = this.$("<tr />").attr("id", "res_"+res_id);
						var td = this.$("<td />").addClass("cell").css("text-align", "center").css("vertical-align", "middle").text(course3);
						tr.append(td);
						
						if(typeof MoodleR.win == "undefined")
							var tmp = content.location.protocol+"//"+content.location.host + "/mod/resource/view.php?id="+res_id
						else
							var tmp = MoodleR.win.location.protocol+"//"+MoodleR.win.location.host + "/mod/resource/view.php?id="+res_id
							
						var td = this.$("<td />").attr("colspan", 3).addClass("cell").css("text-align", "center").css("line-height", "32px");
						var a = this.$("<a />").attr("target", "_blank").attr("href", tmp).text(tmp);
						td.append(a);
						tr.append(td);
						tbodyERR.append(tr);
					}
				}
			}
			
			// Transform size into Kb / Mb in a string
			size_here=this.formatSize(size_here);

			// After HERE section
			var tr = this.$("<tr />");
			var th = this.$("<th />").attr("colspan", 4).css("border", "none").text(" ");
			tr.append(th);
			tbodyHERE.append(tr);
			
			var tr = this.$("<tr />").attr("id", "MoodleR-IB").css("display", "none");
			var th = this.$("<th />").attr("colspan", 4).css("border", "none").text(" ");
			tr.append(th);
			tbodyHERE.append(tr);
			
			var tr = this.$("<tr />").attr("id", "MoodleR-Here-Sep").css("display", "none");
			var th = this.$("<th />").attr("colspan", 4).css("border", "none").text(" ");
			tr.append(th);
			tbodyHERE.append(tr);

			// After TODL section
			var tr = this.$("<tr />").attr("id", "MoodleR-Dl-Sep");
			var th = this.$("<th />").attr("colspan", 4).css("border", "none").text(" ");
			tr.append(th);
			tbodyDL.append(tr);
			
			// After ERR section
			var tr = this.$("<tr />");
			var th = this.$("<th />").attr("colspan", 4).addClass("header").text(this.lang("fcount",[total_err]));
			tr.append(th);
			tbodyERR.append(tr);
			
			var tr = this.$("<tr />").attr("id", "MoodleR-Err-Sep").css("display", "none");
			var th = this.$("<th />").attr("colspan", 4).addClass("header").text(" ");
			tr.append(th);
			tbodyERR.append(tr);

			// Append the sections
			table.append(tbodyHERE);
			table.append(tbodyDL);
			table.append(tbodyERR);
			
			// Overwrite the page
			this.$("#page-content").html("").append(table);

			// Add clickability to the images for download
			for(i=0; i<todl.length; i++){
				this.$("#"+todl[i]).click(function(){
					if(MoodleR.$(this).hasClass("true")){
						MoodleR.$(this).removeClass("true").parents("tr").removeClass("notCompleted");
						MoodleR.$(this).attr("src", "resource://moodler-icons/minus.png");
						MoodleR.setResourceStatus(MoodleR.$(this).attr("id"), false);
					}
					else{
						MoodleR.$(this).addClass("true").parents("tr").addClass("notCompleted");
						MoodleR.$(this).attr("src", "resource://moodler-icons/tick.png");
						MoodleR.setResourceStatus(MoodleR.$(this).attr("id"), true);
					}
				});
			}
			
			// Add Open Directory for courses
			for(i=0; i<openD.length; i++){
				this.$("#"+openD[i]).click(function(){
					MoodleR.openDir(MoodleR.$(this).attr("id").split("course_")[1]);
				});
			}
			
			// Add Open / Rename / Delete (+ Restrict at the same time)
			for(i=0; i<actions.length; i++){
				this.$("#delete-"+actions[i]).click(function(){
					MoodleR.deleteFile(MoodleR.$(this).attr("id"));
				});
				
				this.$("#open-"+actions[i]).click(function(){
					MoodleR.openFile(MoodleR.$(this).attr("id"));
				});
			}
			
			// Update counts
			this.$("#MoodleR-HERE-Count").text(this.lang("fileswehave")+': '+this.lang("sizef",[size_here, total_here]));
			this.$("#MoodleR-TODL-Count").text(this.lang("filestodl")+': '+this.lang("fcount",[total_todl]));
			
			// Add Download image
			if(total_todl>0){
				var br = this.$("<br />");
				var div = this.$("<div />").css("text-align", "center");
				var img = this.$("<img />").attr("id", "MoodleR-DL").attr("src", "resource://moodler-icons/download.png").css("cursor", "pointer");
				div.append(img);
				
				this.$("#page-content").append(br).append(div);
				this.$("#MoodleR-DL").click(function(){
					MoodleR.startDL();
				});
			}
			
			// Destroy handle
			delete this.win;
		}catch(e){ MoodleR.log(e,"Summary"); }
	},
	
	/* Download Manager */
	startDL : function(){
		try{
			// Save window handle
			this.win = content;
			
			// Remove the download button
			this.$("#MoodleR-DL").remove();
			
			// Remove the not to download from the list
			this.$("#MoodleR-ToDL tr[id^='res_']:has(img.false)").fadeOut().remove();
			
			var left=this.$("#MoodleR-ToDL tr[id^='res_'].notCompleted");
			if(left.length>0){
				// Enable the cancel button
				document.getElementById("MoodleR-Cancel").setAttribute("disabled", false);
				document.getElementById("MoodleR-Launch").setAttribute("disabled", true);
			
				// Patch CSS for the progress bars
				this.progress.addCss(content);
				
				// Update Download ? column header
				this.$("#MoodleR-DL-TH").text(this.lang("progress"));
				
				// Put a span instead of each Download ? icon and fill it with 0
				this.$("#MoodleR-ToDL tr[id^='res_'] img.true").each(function(){
					MoodleR.progress.display(this.parentNode,"MoodleR-"+MoodleR.$(this).attr("id"),0);
				});
				
				// Scroll to DL row
				this.$("html, body").animate({
					scrollTop: this.$("#MoodleR-ToDL").offset().top
				}, 2000);
				
				// Start the download
				this.download();
				this.lockPage();
			}
		}catch(e){ MoodleR.log(e,"startDL"); }
	},
	download : function(){
		try{
			if(this.running){
				var left=this.$("#MoodleR-ToDL tr[id^='res_'].notCompleted");
				if(left.length>0){
					var course_id = left[0].getAttribute("name");
					var res_id = left[0].getAttribute("id").split("res_")[1];
					this.currentDL = course_id + "-" + res_id;
			
					var nsIWBP = this.Ci.nsIWebBrowserPersist;
					this.persist = this.Cc["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(this.Ci.nsIWebBrowserPersist);
					this.persist.persistFlags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES | nsIWBP.PERSIST_FLAGS_FROM_CACHE;
					
					var acronym = this.COURSES["R"+course_id].acronym;
					
					this.dfile.initWithPath(this.dir+this.semester.trim()+this.SL+acronym.trim()+this.SL+this.COURSES["R"+course_id].resources[res_id][1]);
					
					var obj_URI=this.Cc["@mozilla.org/network/io-service;1"].getService(this.Ci.nsIIOService).newURI(this.COURSES["R"+course_id].resources[res_id][2], null, null);
					
					this.persist.progressListener = {
						onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress){
							var percentComplete=Math.ceil(100*aCurTotalProgress/aMaxTotalProgress);
							// Show percentage
							MoodleR.progress.fillProgress('MoodleR-'+MoodleR.currentDL.split("-")[1], percentComplete);
							
							return 0;
						},
						onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus){
							if((aStateFlags & 0x10) != 0){
								MoodleR.downloadComplete();
							}
							return 0;
						},
						onStatusChange: function(aWebProgress, aRequest, aStateFlags, aStatus){return 0;}
					}

					if(typeof MoodleR.win == "undefined")
						this.persist.saveURI(obj_URI, null, content.document.documentURIObject, null, "", this.dfile);
					else
						this.persist.saveURI(obj_URI, null, MoodleR.win.document.documentURIObject, null, "", this.dfile);
				}
				else{
					// Refresh summary
					this.showSummary();
					
					// Unlock page
					this.unlockPage();
					
					// Reset
					delete this.currentDL;
					
					// Destroy handle
					delete this.win;
					
					// Disable the cancel again
					document.getElementById("MoodleR-Launch").setAttribute("disabled", false);
					document.getElementById("MoodleR-Cancel").setAttribute("disabled", true);
				
					// Show notification below
					this.Cc['@mozilla.org/alerts-service;1'].getService(this.Ci.nsIAlertsService).showAlertNotification("chrome://moodler/skin/default/hat.png", this.lang('mainbutton'), this.lang('finish_text'), false, '', null); 
				}
			}
			else{
				this.running = true;
			}
		}catch(e){ MoodleR.log(e,"download"); }
	},
	downloadComplete : function(){
		try{
			var course_id = this.currentDL.split("-")[0];
			var res_id = this.currentDL.split("-")[1];
			var acronym = this.COURSES["R"+course_id].acronym.trim();
			var filename = this.COURSES["R"+course_id].resources[res_id][1].trim();
			
			// Set size in the last col
			var row=this.$("tr[name='"+course_id+"'][id='res_"+res_id+"']");
			row.find("td:last").text(this.formatSize(this.dfile.fileSize)).attr("colspan","1");
			row.removeClass("notCompleted");
			
			// Then add the interactions icon
			var td = this.$("<td />").addClass("cell").css("width", "160px").css("text-align", "center").css("vertical-align", "middle");
			var img1 = this.$("<img />").attr("id", "open-"+course_id+"-"+res_id).attr("src", "resource://moodler-icons/open.png").css("cursor", "pointer").css("margin-right", "20px").css("height", "26px").css("width", "29px");
			td.append(img1);
			var img3 = this.$("<img />").attr("id", "delete-"+course_id+"-"+res_id).attr("src", "resource://moodler-icons/minus.png").css("cursor", "pointer").css("margin-right", "20px").css("height", "26px").css("width", "26px");
			td.append(img3);
			row.append(td);
			
			this.$("#delete-"+course_id+'-'+res_id).click(function(){
				MoodleR.deleteFile(MoodleR.$(this).attr("id"));
			});
			
			this.$("#open-"+course_id+'-'+res_id).click(function(){
				MoodleR.openFile(MoodleR.$(this).attr("id"));
			});
			
			// Launch next
			MoodleR.download();
		}catch(e){ MoodleR.log(e,"downloadComplete"); }
	},
	
	/* The GUI Functions */
	openFile : function(ids){
		try{
			ids = ids.split("-");
			var course_id = ids[1];
			var res_id = ids[2];
			
			MoodleR.fofile.initWithPath(MoodleR.dir+MoodleR.semester+MoodleR.SL+MoodleR.COURSES["R"+course_id].acronym.trim()+MoodleR.SL+MoodleR.COURSES["R"+course_id].resources[res_id][1]);
			MoodleR.fofile.launch()
		}catch(e){ MoodleR.log(e,"openFile"); }
	}, 
	openDir : function(course_id){
		try{
			MoodleR.fofile.initWithPath(MoodleR.dir+MoodleR.semester.trim()+MoodleR.SL+MoodleR.COURSES["R"+course_id].acronym.trim());
			MoodleR.fofile.reveal();
		}catch(e){ MoodleR.log(e,"openDir"); }
	},
	deleteFile : function(ids){
		try{
			if(confirm(MoodleR.lang("deletecf"))){
				ids = ids.split("-");
				var course_id = ids[1];
				var res_id = ids[2];
				
				// Delete the file
				MoodleR.fofile.initWithPath(MoodleR.dir+MoodleR.semester+MoodleR.SL+MoodleR.COURSES["R"+course_id].acronym.trim()+MoodleR.SL+MoodleR.COURSES["R"+course_id].resources[res_id][1]);
				MoodleR.fofile.remove(true)
				
				// Restrict it
				MoodleR.setResourceStatus(res_id, false);

				// Get the row
				var row = MoodleR.$("#res_"+res_id);
				
				// We might need to set the next cell's course id if this one has it
				if(row.find("td").text() != " " && row.next().length == 1 && row.next().find("td").text() == " "){
					MoodleR.$(row.next().find("td")[0]).html(row.find("td").html());
					
					// Add the open button
					row.next().find("td #course_"+course_id).click(function(){
						MoodleR.openDir(MoodleR.$(this).attr("id").split("course_")[1]);
					});
				}
				
				// Remove the row
				row.remove();
			}
		}catch(e){ MoodleR.log(e,"deleteFile"); }
	}
};

window.addEventListener("load",function(){ MoodleR.Init(); },false);