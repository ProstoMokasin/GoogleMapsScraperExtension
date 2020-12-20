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

var listingsChecking = 10;

console.log("extension started");

chrome.runtime.onMessage.addListener(function(msg,sender,sendResponse){
	let msgResponse = {
		type:"",
		val:""
	}
	console.log("got handshake message");
	switch(msg.type){
	}
	sendResponse(msgResponse);
	console.log("sent message back");
	return true;
});

OnLoad();

function OnLoad(){
	console.log("loaded OnLoad()");
	let msg = {
		type:"extensionBool"
	}
	chrome.runtime.sendMessage(msg,function(response){
		GotMessage(response);
	});
	console.log("sent handshake message");
}

function GotMessage(msg){
	console.log("got message return");
	console.log("message type: " + msg.type);
	switch(msg.type){
		case "extensionBool":
			listingsChecking = msg.val.listingAmount;
			if(msg.val.exBool){
				setTimeout(ScrapePage, 3000);
				console.log("he ended");
			}
			break;
	}
}

function ScrapePage(){
	console.log("extension loading right elements");
	//Doing it because listings is actually a HTMLCollection which cant be easily an array
	var listings = document.getElementsByClassName("section-result");
	console.log("extension loaded right elements");
	console.log(listings);
	
	//Going to each page for 5 seconds (5 in overall, because everything is asynchronous)
	let n = 0
	var pageInverval = setInterval(function(){
		if(n >= listingsChecking-1){
			EndCheckingPages();
		}
		console.log(n);
		GoToPage(n);
		SaveValues();
		GoBack(n);
		n++;
	},9000)

	function EndCheckingPages(){
		setTimeout(() => {
			clearInterval(pageInverval);
			console.log("i tried to end it");
			SendValues();
		}, 8000);
	}
}

function SendValues(){
	let msg = {
		type:"tabResults",
		val:{
			 valNames: names,
			 valImgURLs: imgURLs,
			 valCategories: categories,
			 valReviewsTotal: reviewsTotal,
			 valReviewSums: reviewSums,
			 valAddresses: addresses,
			 valWebsites: websites,
			 valPhoneNumbers: phoneNumbers,
			 valPlusCodes: plusCodes,
			 valTextReviewArrays: textReviewArrays
		}
	}
	chrome.runtime.sendMessage(msg,function(response){
		GotMessage(response);
	});
}

function GoBack(n){
	setTimeout(() => {
		console.log("going back");
		document.getElementsByClassName("section-back-to-list-button blue-link noprint")[0].click();
	}, 8000);
}

function SaveValues(){
	setTimeout(() => {
		console.log("saving values");
		//Name
		let tmpName = document.getElementsByClassName("section-hero-header-title-title")[0]?.childNodes[1]?.innerHTML;
		names.push(tmpName);
		//Image URL
		let tmpImgURL = document.getElementsByClassName("collapsible-hero-image")[0]?.childNodes[1]?.childNodes[0]?.getAttribute("src");
		imgURLs.push(tmpImgURL);
		//Category
		let tmpCtg = document.querySelectorAll('[jsaction="pane.rating.category"]')[0]?.innerHTML;
		categories.push(tmpCtg);
		//Review
		let tmpReview = document.getElementsByClassName("section-star-display")[0]?.innerHTML;
		reviewsTotal.push(tmpReview);
		//Review Sums
		let tmpReviewSum = document.querySelectorAll('[jsaction="pane.rating.moreReviews"]')[0]?.innerHTML;
		reviewSums.push(tmpReviewSum);
		console.log(tmpReviewSum);
		//Address
		let tmpAddress = document.querySelectorAll('[data-item-id="address"]')[0]?.getAttribute("aria-label");
		addresses.push(tmpAddress);
		//Website
		let tmpWebsite = document.querySelectorAll('[data-item-id="authority"]')[0]?.getAttribute("aria-label");
		websites.push(tmpWebsite);
		//Phone Number
		let tmpPhoneNum = document.querySelectorAll('[data-item-id^="phone:tel:"]')[0]?.getAttribute("aria-label");
		phoneNumbers.push(tmpPhoneNum);
		//Plus Code
		let tmpPlusCode = document.querySelectorAll('[data-item-id="oloc"]')[0]?.getAttribute("aria-label");
		plusCodes.push(tmpPlusCode);
		console.log(plusCodes);
		//Text Review Array
		let tmpReviews = document.getElementsByClassName("section-review-review-content");
		let tmpReviewArray = [];
		for(let i = 0; i < tmpReviews.length; i++){
			tmpReviewArray.push(tmpReviews[i].childNodes[3].innerHTML)
		}
		textReviewArrays.push(tmpReviewArray);
		//Opening Hours
		//Description
	}, 5000);
}

function GoToPage(n){
	setTimeout(() => {
		let listing = document.getElementsByClassName("section-result")[n];
		console.log(listing);
		console.log("going to the page");
		listing.click();
	}, 1000);
}