var extensionBool = false;

var downloadHeader = ["Name", "Image URL", "Category", "Review", "Reviews Amount", "Address", "Website", "Phone Number", "Plus Code", "Text Reviews"];
var fileName = "results";
var delimiter = ",";

document.addEventListener("DOMContentLoaded", function(){
	OnLoad();
	document.getElementById("sendBt").addEventListener("click",SendInput);
	document.getElementById("extensionToggle").addEventListener("click",ToggleExtension);
	document.getElementById("donwnloadBt").addEventListener("click",DonwloadInput);
});

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
			extensionBool = msg.val.exBool;
			console.log("trying to change visibility");
			ChangeVisibility();
			break;
		case "downloadResults":
			let arrayData = [];
			for(let i=0;i<msg.val.names.length;i++){
				let tmpArray = [];
				tmpArray.push(msg.val.names[i] ? msg.val.names[i].replace(/,/g, "") : "");
				tmpArray.push(msg.val.imgURLs[i] ? msg.val.imgURLs[i] : "");
				tmpArray.push(msg.val.categories[i] ? msg.val.categories[i].replace(/,/g, "") : "");
				tmpArray.push(msg.val.reviewsTotal[i] ? msg.val.reviewsTotal[i] : "0");
				tmpArray.push(msg.val.reviewSums[i] ? msg.val.reviewSums[i].includes("(") ? msg.val.reviewSums[i].replace(/\D/g, "") : "0" : "0");
				tmpArray.push(msg.val.addresses[i] ? msg.val.addresses[i].replace(/,/g, "") : "");
				tmpArray.push(msg.val.websites[i] ? msg.val.websites[i].replace(/,/g, "") : "");
				tmpArray.push(msg.val.phoneNumbers[i] ? msg.val.phoneNumbers[i].replace(/,/g, "") : "");
				tmpArray.push(msg.val.plusCodes[i] ? msg.val.plusCodes[i].replace(/,/g, "") : "");
				tmpArray.push(msg.val.textReviewArrays[i] ? msg.val.textReviewArrays[i].map(RemoveCommas) : "");

				arrayData.push(tmpArray);
			}
			console.log(arrayData);
			DownloadResults(arrayData);
			break;
	}
}

function ChangeVisibility(){
	console.log("changing visibility");
	let bodyVisibility = (extensionBool) ? ("visible") : ("hidden");
	document.getElementById("extensionToggle").checked = extensionBool;
	document.getElementById("iSearch").style.visibility = bodyVisibility;
	document.getElementById("iListings").style.visibility = bodyVisibility;
	document.getElementById("iTabs").style.visibility = bodyVisibility;
	document.getElementById("sendBt").style.visibility = bodyVisibility;
}

function SendInput(){
	let msg = {
		type:"customVals",
		val:{
			searchInput:[],
			listingsInput:0,
			tabsInput:0
		}
	};
	let file = document.getElementById("iSearch").files[0];
	let reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function(){
		let tmpResult = reader.result;
		msg.val.searchInput = tmpResult.split(",");
		msg.val.listingsInput = document.getElementById("iListings").valueAsNumber;
		msg.val.tabsInput = document.getElementById("iTabs").valueAsNumber;

		chrome.runtime.sendMessage(msg);
	}
	reader.onerror = function(){
	}

	document.getElementById("donwnloadBt").style.visibility = "visible";
}

function DownloadResults(data){
	console.log("exporting");
	let header = downloadHeader.join(delimiter) + '\n';
    let csv = header;
    data.forEach( array => {
        csv += array.join(delimiter)+"\n";
    });

    let csvData = new Blob([csv], { type: 'text/csv' });  
    let csvUrl = URL.createObjectURL(csvData);

    let hiddenElement = document.createElement('a');
    console.log("created hidden element");
    hiddenElement.href = csvUrl;
    hiddenElement.target = '_blank';
    hiddenElement.download = fileName + '.csv';
    document.body.appendChild(hiddenElement);
    hiddenElement.click();
    console.log("downloaded");
}

function DonwloadInput(){
	let msg = {
		type:"downloadResults"
	};
	chrome.runtime.sendMessage(msg,function(response){
		GotMessage(response);
	});
}


function ToggleExtension(){
	let toggle = document.getElementById("extensionToggle").checked;
	console.log("toggle is ", toggle ? "on" : "off");
	extensionBool = toggle;
	let msg = {
		type:"extensionVal",
		val:{
			exBool:extensionBool
		}
	}
	chrome.runtime.sendMessage(msg,function(response){
		GotMessage(response);
	});
	ChangeVisibility();
}

function RemoveCommas(review){
	return review.replace(/,/g, "").replace(/(\r\n|\n|\r)/gm, "");
}