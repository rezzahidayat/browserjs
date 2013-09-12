// b8mT0OpT1mNis3krnEtmVoBqczCz8HpGdjTd9/eIKKGmXJbWLKBAngc8BkW+Qtq7OvK9ra/6t7vqEB8aa8fFcb6WdU48YEmv0WnuDQbJzSKvByOlGUc9WSugHRi89X3OmBFtS1Dhx1z7HSI1kzNT911QpIs3HzB8w8c1wuDNv+zqRXlsHVlxzdP5eXzc2uGynXKIK/OALajEmjKcSNrgh95mlniQjZcqNuJ2ftbfdI9fp5klL+FClAGHi9dJxCP42WHtOvJkV7XQ678TAO8Q38jbulAtot5oMjzQpKoD8NgqSs7PR2E7dWETgXazY0p6D8TLFPpVBNAvL8+NQWsXeA==
/**
** Copyright (C) 2000-2013 Opera Software ASA.  All rights reserved.
**
** This file is part of the Opera web browser.
**
** This script patches sites to work better with Opera
** For more information see http://www.opera.com/docs/browserjs/
**
** If you have comments on these patches (for example if you are the webmaster
** and want to inform us about a fixed site that no longer needs patching) please
** report issues through the bug tracking system
** https://bugs.opera.com/
**
** DO NOT EDIT THIS FILE! It will not be used by Opera if edited.
**/
// Generic fixes (mostly)
(function(){
	var bjsversion=' Opera OPRDesktop 15.0 core 1147.104, September 12, 2013. Active patches: 8 ';
	// variables and utility functions
	var navRestore = {}; // keep original navigator.* values
	var shouldRestore = false;
	var hostname = {
		value:location.hostname, 
		toString:function(){return this.value;},
		valueOf:function(){return this.value;}, 
		indexOf:function(str){return this.value.indexOf(str);},
		match: function(rx){ return this.value.match(rx); },
		contains:function(str){ return this.value.indexOf(str)>-1; },
		endsWith:function(str){ var pos=this.value.indexOf(str);return pos>-1 && this.value.length===pos+str.length; }
	}
	var href = location.href;
	var pathname=location.pathname;
	var call = Function.prototype.call,
	getElementsByTagName=Document.prototype.getElementsByTagName,
	addEventListener=Window.prototype.addEventListener,
	createElement=Document.prototype.createElement,
	createTextNode=Document.prototype.createTextNode,
	insertBefore=Node.prototype.insertBefore,
	setAttribute=Element.prototype.setAttribute,
	appendChild=Node.prototype.appendChild,
	setTimeout=window.setTimeout;
	function log(str){if(self==top && !str.match(/^0,/))console.log('Opera has modified script or content on '+hostname+' ('+str+'). See browser.js for details');}


	// Utility functions

	function addCssToDocument2(cssText, doc, mediaType){
		getElementsByTagName.call=addEventListener.call=createElement.call=createTextNode.call=insertBefore.call=setAttribute.call=appendChild.call=call;
		doc = doc||document;
		mediaType = mediaType||'';
		addCssToDocument2.styleObj=addCssToDocument2.styleObj||{};
		var styles = addCssToDocument2.styleObj[mediaType];
		if(!styles){
			var head = getElementsByTagName.call(doc, "head")[0];
			if( !head ){
				var docEl = getElementsByTagName.call(doc, "html")[0];
				if(!docEl){
					// :S this shouldn't happen - see if document hasn't loaded
					addEventListener.call(doc, 'DOMContentLoaded',
					function(){ addCssToDocument2(cssText, doc); },false);
					return;
				}
				head = createElement.call(doc, "head");
				if(head) insertBefore.call(docEl, head,docEl.firstChild);
				else head = docEl;
			}
			addCssToDocument2.styleObj[mediaType] = styles = createElement.call(doc, "style");
			setAttribute.call(styles, "type","text/css");
			if(mediaType)setAttribute.call(styles, "media", mediaType);
			appendChild.call(styles, createTextNode.call(doc,' '));
			appendChild.call(head, styles)
		}
		styles.firstChild.nodeValue += cssText+"\n";
		return true;
	}



	if(hostname.endsWith('my.tnt.com')){
		var _orig_clearPrintBlock;
		function handleMediaChange(mql) {
			if (mql.matches) {
				if(typeof clearPrintBlock == "function"){
					_orig_clearPrintBlock = clearPrintBlock;
					clearPrintBlock = function(){}
				}
			} else {
				if(typeof _orig_clearPrintBlock == "function"){
					setTimeout(_orig_clearPrintBlock, 500);
				}
			}
		}
		
		document.addEventListener('DOMContentLoaded', function() {
			var mpl = window.matchMedia("print");
			mpl.addListener(handleMediaChange);
		},false);
		log('PATCH-1156, my.tnt.com - fix empty printout');
	} else if(hostname.endsWith('vine.co')){
		addCssToDocument2('.video-container .overlay{z-index:0 !important}');
		log('PATCH-1155, vine.co - overlay kills click-to-play video');
	} else if(hostname.endsWith('www.stanserhorn.ch')){
		navigator.__defineGetter__('vendor',function(){return 'Google Inc.'});
		log('OTWK-21, stanserhorn.ch - fix UDM sniffing');
	} else if(hostname.indexOf('.google.')>-1){
		/* Google */
	
	
		if(hostname.contains('docs.google.')){
			document.addEventListener('DOMContentLoaded',function(){
				var elm = document.querySelector('a[href="http://whatbrowser.org"] + a + a');
				if(elm){elm.click();}
			},false);
			log('PATCH-1032, Google Docs - auto-close unsupported browser message');
		}
		if(hostname.contains('translate.google.')){
			document.addEventListener('DOMContentLoaded',
				function(){
					var obj = '<object type="application/x-shockwave-flash" data="//ssl.gstatic.com/translate/sound_player2.swf" width="18" height="18" id="tts"><param value="//ssl.gstatic.com/translate/sound_player2.swf" name="movie"><param value="sound_name_cb=_TTSSoundFile" name="flashvars"><param value="transparent" name="wmode"><param value="always" name="allowScriptAccess"></object>';
					var aud = document.getElementById('tts');
					if(aud && aud instanceof HTMLAudioElement && aud.parentNode.childNodes.length == 1){
						aud.parentNode.innerHTML = obj;
					}
				}
			,false);
			log('PATCH-1148, Google Translate: use flash instead of mp3-audio');
		}
		log('0, Google');
	} else if(hostname.indexOf('opera.com')>-1&& pathname.indexOf('/docs/browserjs/')==0){
		document.addEventListener('DOMContentLoaded',function(){
			if(document.getElementById('browserjs_active')){
				document.getElementById('browserjs_active').style.display='';
				document.getElementById('browserjs_active').getElementsByTagName('span')[0].appendChild(document.createTextNode(bjsversion));
				document.getElementById('browserjs_status_message').style.display='none';
			}else if(document.getElementById('browserjs_status_message')){
				document.getElementById('browserjs_status_message').firstChild.data='Browser.js is enabled! '+bjsversion;
			}
		}, false);
		log('1, Browser.js status and version reported on browser.js documentation page');
	} else if(href==='https://bugs.opera.com/wizarddesktop/'){
		document.addEventListener('DOMContentLoaded', function(){
			var frm;
			if(document.getElementById('bug') instanceof HTMLFormElement){
				frm=document.getElementById('bug');
				if(frm.auto)frm.auto.value+='\n\nBrowser JavaScript: \n'+bjsversion;
			}
		}, false);
		log('PATCH-221, Include browser.js timestamp in bug reports');
	}

})();