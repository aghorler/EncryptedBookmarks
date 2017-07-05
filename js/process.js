function checkForNewUser(){
	chrome.storage.local.get('publicKey', function(passwordCheck){
		if(passwordCheck.publicKey !== undefined){
			document.getElementById("create-password").style.display = 'none';
			document.getElementById("decrypt").addEventListener("click", loadBookmarks);
		}
		else{
			document.getElementById("submit").style.display = 'none';
			document.getElementById("setup-account").addEventListener("click", createPassword);
		}
	});
}

function createPassword(){
	var newPassword = document.getElementById("new-password").value;
	var newPasswordRepeat = document.getElementById("new-password-repeat").value;

	if(newPassword !== ""){
		if(newPassword === newPasswordRepeat){
			document.getElementById("setup-account").innerHTML = "Generating keys";
			document.getElementById("setup-account").disabled = true;

			var options = {
				userIds: [{ name:'Encrypted Bookmarks User', email:'example@example.com' }],
				numBits: 2048,
				passphrase: newPassword
			};

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

function loadBookmarks(){
	chrome.storage.local.get({
		privateKey: "",
		bookmarks: []
	}, function(items){
		var password = document.getElementById("password").value;

		if(password !== ""){
			var privKeyObj = openpgp.key.readArmored(items.privateKey).keys[0];
			privKeyObj.decrypt(password);

			document.getElementById("submit").style.display = 'none';

			var store = items.bookmarks;
			if(store['bookmarks'].length > 0){
				var i = 0;
				function decryptBookmark(){
					if(i < store['bookmarks'].length){
						var p1 = document.createElement("p");
						var span1 = document.createElement("span");
						var span2 = document.createElement("span");
						var span3 = document.createElement("span");
						var a1 = document.createElement("a");
						var a2 = document.createElement("a");
						var display = document.getElementById("content");

						p1.appendChild(span1);
						p1.appendChild(span2);
						p1.appendChild(span3);
						span1.appendChild(a1);
						span3.appendChild(a2);
						display.appendChild(p1);

						a1.id = "a" + i;

						var urlEnc = store['bookmarks'][i].url;
						var titleEnc = store['bookmarks'][i].title;
						
						optionsUrl = {
							message: openpgp.message.readArmored(urlEnc),
							privateKey: privKeyObj
						};

						openpgp.decrypt(optionsUrl).then(function(plaintextUrl){
							document.getElementById("a" + i).href = plaintextUrl.data;

							optionsTitle = {
								message: openpgp.message.readArmored(titleEnc),
								privateKey: privKeyObj
							};

							openpgp.decrypt(optionsTitle).then(function(plaintextTitle){
								document.getElementById("a" + i).textContent = plaintextTitle.data;

								a1.target = "_blank";
								a2.href = "#";
								a2.textContent = "Delete";
								a2.id = i;
								a2.style.color = "red";
								p1.id = "b" + i;
								span2.textContent = " | ";
								
								document.getElementById(i).addEventListener("click", deleteBookmark);

								i++;
								decryptBookmark();
							});
						});
					}
				}
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

document.addEventListener('DOMContentLoaded', checkForNewUser);
