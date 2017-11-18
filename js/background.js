/* Function to verify that a user has created a keypair, and act accordingly. */
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

/* Function to encrypt and add a bookmark. */
function addBookmark(){
  /* Query active tab. */
  chrome.tabs.query({
    'active': true, 
    'lastFocusedWindow': true
  }, function(tabItems){
    chrome.storage.local.get({
      bookmarks: [], 
      publicKey: ""
    }, function(bookmarkItems){
      /* Generate bookmark from tab. */
      var tempTitle = tabItems[0].title;
      var title = prompt("Bookmark title", tempTitle);

      if(title !== null){
        var url = tabItems[0].url;

        /* Prepare tab title for encryption. */
        var optionsTitle = {
          data: title,
          publicKeys: openpgp.key.readArmored(bookmarkItems.publicKey).keys
        };

        /* Encrypt tab title, and then proceed further. */
        openpgp.encrypt(optionsTitle).then(function(ciphertextTitle){
          /* Prepare tab url for encryption. */
          var optionsUrl = {
            data: url,
            publicKeys: openpgp.key.readArmored(bookmarkItems.publicKey).keys
          };

          /* Encrypt tab title, and then store encrypted bookmark. */
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

/* Preform various tasks on first installation. */
chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason == "install"){
    chrome.storage.local.set({bookmarks: {"bookmarks": []}});

    var context = "page";
    chrome.contextMenus.create({"title": "Add to Encrypted Bookmarks", "contexts":[context], "id": "context" + context}); 

    chrome.tabs.create({url: "/html/bookmarks.html"});
  }
});

/* Call userVerify() on context meny click. */
chrome.contextMenus.onClicked.addListener(userVerify);

/* Open bookmarks page on extension toolbar icon click. */
chrome.browserAction.onClicked.addListener(function(){
  chrome.tabs.create({url: "/html/bookmarks.html"});
});
