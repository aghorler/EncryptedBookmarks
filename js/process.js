/* Function to verify that a user has created a keypair, and alter the page accordingly. */
function checkForNewUser(){
  chrome.storage.local.get('publicKey', function(passwordCheck){
    if(passwordCheck.publicKey !== undefined){
      document.getElementById("create-password").style.display = 'none';
      document.getElementById("decrypt").addEventListener("click", loadBookmarks);
    }
    else{
      document.getElementById("submit").style.display = 'none';
      document.getElementById("setup-account").addEventListener("click", generateKeyPair);
    }
  });
}

/* Function to generate a keypair. */
function generateKeyPair(){
  var newPassword = document.getElementById("new-password").value;
  var newPasswordRepeat = document.getElementById("new-password-repeat").value;

  /* Verify private key encryption password. */
  if(newPassword !== ""){
    if(newPassword === newPasswordRepeat){
      document.getElementById("setup-account").innerHTML = "Generating keys";
      document.getElementById("setup-account").disabled = true;

      /* Prepare to generate keypair. */
      var options = {
        userIds: [{ name:'Encrypted Bookmarks User', email:'example@example.com' }],
        numBits: 2048,
        passphrase: newPassword
      };

      /* Generate keypair, store, and reload the page. */
      openpgp.generateKey(options).then(function(key){
        var privkey = key.privateKeyArmored;
        var pubkey = key.publicKeyArmored;

        chrome.storage.local.set({privateKey: privkey});
        chrome.storage.local.set({publicKey: pubkey});

        location.reload();
      });
    }
    else{
      alert("Passwords do not match.");
    }
  }
  else{
    alert("Password cannot be null");
  }
}

/* Function to retrieve and decrypt bookmarks. */
function loadBookmarks(){
  chrome.storage.local.get({
    privateKey: "",
    bookmarks: []
  }, function(items){
    var password = document.getElementById("password").value;

    if(password !== ""){
      /* Decrypt private key with entered password. */
      var privKeyObj = openpgp.key.readArmored(items.privateKey).keys[0];
      privKeyObj.decrypt(password);

      /* Hide submit button. */
      document.getElementById("submit").style.display = 'none';

      /* Manual loop to resolve asynchronous issues. */
      var store = items.bookmarks;
      if(store['bookmarks'].length > 0){

        /* Function to decrypt the title and url of a bookmark, and write it to the page. */
        var i = 0;
        function decryptBookmark(){
          /* Only proceed if i does not exceed the total number of bookmarks. */
          if(i < store['bookmarks'].length){
            /* Create various HTML elements. */
            var p1 = document.createElement("p");
            var span1 = document.createElement("span");
            var span2 = document.createElement("span");
            var span3 = document.createElement("span");
            var a1 = document.createElement("a");
            var a2 = document.createElement("a");
            var display = document.getElementById("content");

            /* Add various HTML elements to page. */
            p1.appendChild(span1);
            p1.appendChild(span2);
            p1.appendChild(span3);
            span1.appendChild(a1);
            span3.appendChild(a2);
            display.appendChild(p1);

            /* Assign each bookmark link a chronological id. */
            a1.id = "a" + i;

            var urlEnc = store['bookmarks'][i].url;
            var titleEnc = store['bookmarks'][i].title;
            
            /* Prepare url for decryption. */
            optionsUrl = {
              message: openpgp.message.readArmored(urlEnc),
              privateKey: privKeyObj
            };

            /* Decrypt url, and then proceed. */
            openpgp.decrypt(optionsUrl).then(function(plaintextUrl){
              /* Write url to page. */
              document.getElementById("a" + i).href = plaintextUrl.data;

              /* Prepare title for decryption. */
              optionsTitle = {
                message: openpgp.message.readArmored(titleEnc),
                privateKey: privKeyObj
              };

              /* Decrypt title, and then proceed. */
              openpgp.decrypt(optionsTitle).then(function(plaintextTitle){
                /* Write title to page. */
                document.getElementById("a" + i).textContent = plaintextTitle.data;

                /* Write various other things to page. */
                a1.target = "_blank";
                a2.href = "#";
                a2.textContent = "Delete";
                a2.id = i;
                a2.style.color = "red";
                p1.id = "b" + i;
                span2.textContent = " | ";
                
                /* Add EventListener to each delete link. */
                document.getElementById(i).addEventListener("click", deleteBookmark);

                /* Increment i, and call function again. */
                i++;
                decryptBookmark();
              });
            });
          }
        }
        /* Call function first time. */
        decryptBookmark();
      }
      else{
        document.getElementById("content").textContent = "You have no bookmarks. Create some using the right-click context menu on any page.";
      }
    }
    else{
      alert("Password cannot be null");
    }
  });
}

/* Function to delete a bookmark. */
function deleteBookmark(){
  var index = this.id;
  chrome.storage.local.get('bookmarks', function(items){
    var set = items.bookmarks;
    set['bookmarks'].splice(0, 1);
    chrome.storage.local.set({bookmarks: items.bookmarks});

    document.getElementById("b" + index).style.display = 'none';

    if(set['bookmarks'].length == 0){
      document.getElementById("content").textContent = "You have no bookmarks. Create some using the right-click context menu on any page.";
    }
  });
}

/* Call checkForNewUser on page load. */
document.addEventListener('DOMContentLoaded', checkForNewUser);
