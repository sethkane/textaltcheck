let showAlt = document.getElementById('showAlt');
let logIssue = document.getElementById('logIssue');
let popup = document.body;

function createCookie(name,value,minutes) {
    if (minutes) {
        var date = new Date();
        date.setTime(date.getTime()+(minutes*60*1000));
        var expires = ";expires="+date.toGMTString();
    } else {
        var expires = "";
    }
    document.cookie = name+"="+value+expires+";path=/";
}

var cookie = document.cookie;
if( cookie.split(';').length > 1){
	setTimeout(function(){
		showAlt.click();
	}, 500);
};


logIssue.onclick = function(element) {
	ga('send', 'event', 'logIssue', 'click', url);
};

var theTab,url,title;
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

	title = tabs[0].title;
	url = tabs[0].url;
	ga('send',
	 	'pageview', {
  		'page': url,
  		'title': title
  	});
	ga('send', 'event', 'altDialog', 'open', url);
	
	chrome.tabs.executeScript(
		tabs[0].id,
		{code:
			`
			var body = document.body;
			var head = document.head || document.getElementsByTagName('head')[0];
			
			var createStyles = document.createElement('link');
			createStyles.setAttribute('id','textaltcheck');
			createStyles.setAttribute('rel','stylesheet');
			createStyles.setAttribute('href', chrome.runtime.getURL('styles.css'));

			var imgLinkSrc = chrome.runtime.getURL('images/link.svg');
			var imgReviewSrc = chrome.runtime.getURL('images/caution.svg');
			var imgNullSrc = chrome.runtime.getURL('images/police.svg');
			var imgDefaultSrc = chrome.runtime.getURL('images/image.svg');


			var css = '';
			var val = false;
			`
		}
	);
});

showAlt.onclick = function(element) {

	if( !popup.classList.contains('textaltcheck') ){
		
		ga('send', 'event', 'showAlt', 'click', url);
		createCookie('alt', 'on', 1);
		popup.classList.add('textaltcheck');
		
		

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.executeScript(
			tabs[0].id,
			{code:
					`

					function traverseForBackgrounds(){
						var els = document.querySelectorAll('figure,section,span,div,a');
						for(var i = 0; i < els.length; i++){
							var el = els[i];
							if(window.getComputedStyle(el).backgroundImage !== 'none'){
								el.classList.add('altDecoration');
								var decoration = document.createElement('span');
								decoration.classList.add('decoration');
								decoration.setAttribute('style', 'width:' + window.getComputedStyle(el).width + '; height:' + window.getComputedStyle(el).height + ';');
								el.prepend(decoration);
							}
							
						}
					};
					
					var images = Array.from(document.querySelectorAll('img'));

					function traverseChildren(node,type){

						if(node.classList.contains('altSpan')){

							var imgLink = new Image(16, 16);
								imgLink.classList.add('imgLink');
								imgLink.src = imgLinkSrc;
								imgLink.alt = 'Icon that indicuates this image has a link';
								node.appendChild(imgLink);

							switch (type){
								case 'isNull':
									var imgNull = new Image(16, 16);
									imgNull.classList.add('imgNull');
									imgNull.src = imgNullSrc;
									imgNull.alt = 'Icon that indicates this image that has a null ALT';
									node.appendChild(imgNull);
									break;

								default:
									var imgReview = new Image(16, 16);
									imgReview.classList.add('imgReview');
									imgReview.src = imgReviewSrc;
									imgReview.alt = 'Icon that indicates this image needs review';
									node.appendChild(imgReview);
									break;
							}

						}


						for (var i = 0, count = node.children.length; i < count; i++) {
						  traverseChildren(node.children[i], type)
						}

					}

					function traverseParents(node, alt, action){
						if(node.nodeName === 'A'){

							if(action === 'add'){
								if( alt === 'No Alt Provided' ) {
									node.classList.add('hasLink')
									node.classList.add('isNull');
									traverseChildren(node, 'isNull');
								} else {
									node.classList.add('hasLink');
									traverseChildren(node, 'hasLink');
								}
							} else {
								node.classList.remove('hasLink');
								node.classList.remove('isNull');
								node.classList.remove('isIgnored');
							}

						} else {
							node.parentElement ? traverseParents(node.parentElement, alt, action) : null;
						}
					}

					function wrap(el,alt) {
						var div = document.createElement('div');
						var span = document.createElement('span');

						/// Add Image Icons
						var imgDefault = new Image(16, 16);
							imgDefault.classList.add('imgDefault');
							imgDefault.src = imgDefaultSrc;
							imgDefault.alt = 'Icon that indicates this is an image';

						span.innerHTML = alt;
						span.prepend(imgDefault);
						span.classList.add('altSpan');
						div.classList.add('altWrapper');

					    el.parentNode.insertBefore(div, el);
					    el.classList.add('altImage');

					    div.appendChild(span);
					    div.appendChild(el);
					    traverseParents(el, alt, 'add');
					}

					if( !body.classList.contains('textaltcheck') ){
						body.appendChild(createStyles);
						body.classList.add('textaltcheck');
						traverseForBackgrounds();
						images.forEach(image => {
							if( image.offsetParent !== null){
								let alt = image.alt || 'No Alt Provided';
								wrap(image, alt)
							}
						});
					}
					`
				}
			);
		});

	} else {

		ga('send', 'event', 'hideAlt', 'click', url);
		popup.classList.remove('textaltcheck');
		document.cookie = "alt=;expires = Thu, 01 Jan 1970 00:00:00 GMT"

		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.executeScript(
			tabs[0].id,
			{code:
				`
				var styles = document.getElementById('textaltcheck');
				styles.remove();
				if (body.classList.contains('textaltcheck')){
					images = Array.from(document.querySelectorAll('img.altImage'));
					body.classList.remove('textaltcheck');
					function unWrap(el) {
						el.classList.remove('altImage');
						var parent = el.parentNode;
						parent.parentNode.insertBefore(el, parent.nextSibling);
						parent.remove();
						traverseParents(el,'remove');
					}

					images.forEach(image => {
						unWrap(image)
					});

					var decorations = document.querySelectorAll('.decoration');
					for(var i = 0; i < decorations.length; i++){
						decorations[i].remove();
					}

					var altDecoration = document.querySelectorAll('.altDecoration');
					for(var i = 0; i < altDecoration.length; i++){
						altDecoration[i].classList.remove('altDecoration');
					}


					}
					`
				}
			);
		});


	}
	
};