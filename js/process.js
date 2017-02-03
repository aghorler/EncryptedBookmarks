function checkForNewUser(){
	chrome.storage.local.get('encryptionPassword', function(passwordCheck){
		if(passwordCheck.encryptionPassword !== undefined){
			document.getElementById("create-password").style.display = 'none';
			document.getElementById("decrypt").addEventListener("click", decryptionPasswordVerify);
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
			var passwordHash = CryptoJS.SHA512(newPassword).toString();
			chrome.storage.local.set({encryptionPassword: passwordHash});

			location.reload();
		}
		else{
			alert("Passwords do not match.")
		}
	}
	else{
		alert("Password cannot be null");
	}
}

function decryptionPasswordVerify(){
	chrome.storage.local.get('encryptionPassword', function(verify){
		var password = document.getElementById("password").value;
		var passwordHash = CryptoJS.SHA512(password).toString();

		if(passwordHash == verify.encryptionPassword){
			loadBookmarks(password);
		}
		else{
			alert("Incorrect password.")
		}
	});
}

function loadBookmarks(decryptionPassword){
	document.getElementById("submit").style.display = 'none';

	chrome.storage.local.get('bookmarks', function(items){
		var testing = items.bookmarks;
		if(testing['bookmarks'].length > 0){
			for (i = 0; i < testing['bookmarks'].length; i++){
				var urlEnc = testing['bookmarks'][i].url;
				var url = CryptoJS.AES.decrypt(urlEnc, decryptionPassword);
				var titleEnc = testing['bookmarks'][i].title;
				var title = CryptoJS.AES.decrypt(titleEnc, decryptionPassword);

				var p1 = document.createElement("p");
				var span1 = document.createElement("span");
				var span2 = document.createElement("span");
				var span3 = document.createElement("span");
				var a1 = document.createElement("a");
				var a2 = document.createElement("a");
				var display = document.getElementById("content");

				p1.id = "b" + i;
				span2.textContent = " | ";
				a1.href = url.toString(CryptoJS.enc.Utf8);
				a1.target = "_blank"
				a1.textContent = title.toString(CryptoJS.enc.Utf8);
				a2.href = "#";
				a2.textContent = "Delete";
				a2.id = i;
				a2.style.color = "red";
				
				p1.appendChild(span1);
				p1.appendChild(span2);
				p1.appendChild(span3);
				span1.appendChild(a1);
				span3.appendChild(a2);
				display.appendChild(p1);

				document.getElementById(i).addEventListener("click", deleteBookmark);
			}
		}
		else{
			document.getElementById("content").textContent = "You have no bookmarks. Create some using the right-click context menu on any page.";
		}
		
	});
}

function deleteBookmark(){
	var index = this.id;
	chrome.storage.local.get('bookmarks', function(items){
		var testing = items.bookmarks;
		testing['bookmarks'].splice(0, 1);
		chrome.storage.local.set({bookmarks: items.bookmarks});

		document.getElementById("b" + index).style.display = 'none';
	});
}

document.addEventListener('DOMContentLoaded', checkForNewUser);
