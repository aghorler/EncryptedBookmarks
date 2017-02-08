chrome.runtime.onInstalled.addListener(function(details){
	if(details.reason == "install"){
		var test = {"bookmarks": []};
		chrome.storage.local.set({bookmarks: test});

		var context = "page";
		chrome.contextMenus.create({"title": "Add to Encrypted Bookmarks", "contexts":[context], "id": "context" + context}); 

		chrome.tabs.create({ url: "/html/bookmarks.html" });
	}
});

chrome.contextMenus.onClicked.addListener(encryptionPasswordVerify);

chrome.browserAction.onClicked.addListener(function(){
	chrome.tabs.create({ url: "/html/bookmarks.html" });
});

function encryptionPasswordVerify(){
	chrome.storage.local.get('encryptionPassword', function(verify){
		if(verify.encryptionPassword !== undefined){
			var password = prompt("Encryption password", "");
			var passwordHash = CryptoJS.SHA512(password).toString();

			if(passwordHash == verify.encryptionPassword){
				addBookmark(password);
			}
			else{
				alert("Incorrect password.")
			}
		}
		else{
			chrome.tabs.create({ url: "/html/bookmarks.html" });
		}
	});
}

function addBookmark(encryptionPassword){
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function(tabItems){
		chrome.storage.local.get('bookmarks', function(bookmarkItems){
			var tempTitle = tabItems[0].title;
			var title = prompt("Bookmark title", tempTitle);
			if(title !== null){
				var encryptedTitle = CryptoJS.AES.encrypt(title, encryptionPassword);
				var url = tabItems[0].url;
				var encryptedUrl = CryptoJS.AES.encrypt(url, encryptionPassword);

				bookmarkItems.bookmarks['bookmarks'].push({"title": encryptedTitle, "url": encryptedUrl});

				chrome.storage.local.set({bookmarks: bookmarkItems.bookmarks});
			}
			else{
				alert("Title cannot be null.");
			}
		});
	});
}
