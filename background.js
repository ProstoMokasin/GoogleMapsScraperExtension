var extensionOn = false;
var listingAmount = 20;
var tabsAmount = 3;
var keywords = [];

//Result Variables
var names = [];
var imgURLs = [];
var categories = [];
var reviewsTotal = [];
var reviewSums = [];
var addresses = [];
var websites = [];
var phoneNumbers = [];
var plusCodes = [];
var textReviewArrays = [];

var windows = [];

chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
	let msgResponse = {
		type:"",
		val:{
		}
	}
	console.log("got handshake message");
	console.log("handshake type: " + msg.type);
	switch(msg.type){
		case "extensionBool":
			msgResponse.type = "extensionBool";
			msgResponse.val.exBool = extensionOn;
			msgResponse.val.listingAmount = listingAmount;
			break;
		case "extensionVal":
			extensionOn = msg.val.exBool;
			console.log("extension is ", msg.val.exBool ? "on" : "off");
			break;
		case "customVals":
			keywords = msg.val.searchInput;
			listingAmount = msg.val.listingsInput;
			tabsAmount = msg.val.tabsInput;
			OpenTabs();
			break;
		case "tabResults":
			names = names.concat(msg.val.valNames);
			imgURLs = imgURLs.concat(msg.val.valImgURLs);
			categories = categories.concat(msg.val.valCategories);
			reviewsTotal = reviewsTotal.concat(msg.val.valReviewsTotal);
			reviewSums = reviewSums.concat(msg.val.valReviewSums);
			addresses = addresses.concat(msg.val.valAddresses);
			websites = websites.concat(msg.val.valWebsites);
			phoneNumbers = phoneNumbers.concat(msg.val.valPhoneNumbers);
			plusCodes = plusCodes.concat(msg.val.valPlusCodes);
			textReviewArrays = textReviewArrays.concat(msg.val.valTextReviewArrays);
			
			chrome.tabs.remove(sender.tab.id);
			break;
		case "downloadResults":
			msgResponse.type = "downloadResults";
			msgResponse.val.names = names;
			msgResponse.val.imgURLs = imgURLs;
			msgResponse.val.categories = categories;
			msgResponse.val.reviewsTotal = reviewsTotal;
			msgResponse.val.reviewSums = reviewSums;
			msgResponse.val.addresses = addresses;
			msgResponse.val.websites = websites;
			msgResponse.val.phoneNumbers = phoneNumbers;
			msgResponse.val.plusCodes = plusCodes;
			msgResponse.val.textReviewArrays = textReviewArrays;
			break;
	}
	sendResponse(msgResponse);
	console.log("sent message back");
	return true;
})

chrome.browserAction.onClicked.addListener(function() {
	chrome.windows.create({
		url: chrome.runtime.getURL("PopUp/popup.html"),
		type: "popup",
		width: 500,
		height: 400
	});
});


chrome.windows.onRemoved.addListener(function(windowID){
	if(windows.includes(windowID)){
		windows = windows.filter(window => window != windowID);
		chrome.windows.create({
			url: "https://google.com/maps/search/" + keywords[0].replace(/ /g, "+") + "/",
			state: "minimized"
		})
		keywords.splice(0,1);
	}
});

function OpenTabs(){
	for(let i=0;i<tabsAmount;i++){
		tmpURL = "https://google.com/maps/search/" + keywords[i].replace(/ /g, "+") + "/";
		chrome.windows.create({
			url: tmpURL,
			state: "minimized"
		}, function(window){
			windows.push(window.id);
		});
	}
	keywords.splice(0,tabsAmount);
}