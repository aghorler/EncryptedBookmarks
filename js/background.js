function userVerify(){
	chrome.storage.local.get('publicKey', function(verify){
		if(verify.publicKey !== undefined){
			addBookmark();
		}
		else{
			chrome.tabs.create({ url: "/html/bookmarks.html" });
		}
	});
}

function addBookmark(){
	chrome.tabs.query({
		'active': true, 
		'lastFocusedWindow': true
	}, function(tabItems){
		chrome.storage.local.get({
			bookmarks: [], 
			publicKey: ""
		}, function(bookmarkItems){
			var tempTitle = tabItems[0].title;
			var title = prompt("Bookmark title", tempTitle);
			if(title !== null){
				var url = tabItems[0].url;

				var optionsTitle = {
					data: title,
					publicKeys: openpgp.key.readArmored(bookmarkItems.publicKey).keys
				};

				openpgp.encrypt(optionsTitle).then(function(ciphertextTitle){
					var optionsUrl = {
						data: url,
						publicKeys: openpgp.key.readArmored(bookmarkItems.publicKey).keys
					};

					openpgp.encrypt(optionsUrl).then(function(ciphertextUrl){
						bookmarkItems.bookmarks['bookmarks'].push({"title": ciphertextTitle.data, "url": ciphertextUrl.data});

						chrome.storage.local.set({bookmarks: bookmarkItems.bookmarks});
					});
				});
			}
			else{
				alert("Title cannot be null.");
			}
		});
	});
}

chrome.runtime.onInstalled.addListener(function(details){
	if(details.reason == "install"){
		chrome.storage.local.set({bookmarks: {"bookmarks": []}});

		var context = "page";
		chrome.contextMenus.create({"title": "Add to Encrypted Bookmarks", "contexts":[context], "id": "context" + context}); 

		chrome.tabs.create({url: "/html/bookmarks.html"});
	}
});

chrome.contextMenus.onClicked.addListener(userVerify);

chrome.browserAction.onClicked.addListener(function(){
	chrome.tabs.create({url: "/html/bookmarks.html"});
});
