
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-1146456-72', 'auto');
ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
ga('require', 'displayfeatures');

let logIssue = document.getElementById('logIssue');
logIssue.onclick = function(element) {
	ga('send', 'event', 'logIssue', 'click', url);
	alert('Issue Logged.  Thank you!');
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
			var style = document.createElement('style');

			var imgLinkSrc = chrome.runtime.getURL('images/link.svg');
			var imgReviewSrc = chrome.runtime.getURL('images/caution.svg');
			var imgNullSrc = chrome.runtime.getURL('images/police.svg');


			var css = '';
			var val = false;
			`
		}
	);
});



let hideAlt = document.getElementById('hideAlt');

hideAlt.onclick = function(element) {

	ga('send', 'event', 'hideAlt', 'click', url);
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.executeScript(
			tabs[0].id,
			{code:
				`
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
				}
				`
			}
		);
	});
};

let showAlt = document.getElementById('showAlt');

showAlt.onclick = function(element) {

	ga('send', 'event', 'showAlt', 'click', url);
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.executeScript(
			tabs[0].id,
			{code:
					`
					var images = Array.from(document.querySelectorAll('img'));

					css = '.textaltcheck a, .textaltcheck div, .textaltcheck span {background-image: none !important;}';
					css += '.textaltcheck .altImage{outline: 2px dotted #32CD32 !important; outline-offset: -4px !important;  background: #fff !important; opacity: .5 !important;}';
					css += '.textaltcheck .altWrapper{padding: 2px !important; margin: -2px !important; position: relative !important;}';
					css += '.textaltcheck .altWrapper .altImage{position: relative !important;}';
					css += '.textaltcheck .altWrapper .altSpan{height: auto !important; width: auto !important; line-height: 1em !important; z-index: 1; position: absolute !important; top: 5px !important; left: 5px !important; border: 1px solid #fff !important; background: #008000 !important; color: #fff !important; padding: 2px 8px !important; margin: 2px 8px !important; font-size: 14px !important; font-weight: normal !important; font-family: arial !important; text-transform: none  !important;}';
					css += '.textaltcheck .hasLink{border: 2px dotted #e71836 !important;}';
					css += '.textaltcheck .hasLink .altImage{outline: 0px !important;}';
					css += '.textaltcheck .hasLink .altSpan{background: #e71836 !important;}';
					css += '.textaltcheck .imgLink, .textaltcheck .imgNull, .textaltcheck .imgReview {max-width: 16px !important; max-height: 16px !important; height: auto !important; display: inline !important; margin: 5px 4px !important; width: auto !important; max-width: auto !important; vertical-align: middle; position: relative !important;}'

					style.innerHTML = css;

					head.appendChild(style);

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
								if( alt === 'Null' ) {
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
						span.classList.add('altSpan');
						span.innerHTML = alt;
						div.classList.add('altWrapper');

					    el.parentNode.insertBefore(div, el);
					    el.classList.add('altImage');

					    div.appendChild(span);
					    div.appendChild(el);
					    traverseParents(el, alt, 'add');
					}

					if( !body.classList.contains('textaltcheck') ){
						body.classList.add('textaltcheck');
						images.forEach(image => {
							let alt = image.alt || 'Null';
							wrap(image, alt)
						});
					}
					`
			}
		);
	});
};