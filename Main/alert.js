// import { searchedWord } from "./background";

let ip_address;
var initialUrl;
let toggle = 0; // Initialize toggle to 0

var word ;
// function saveToFile(content, filename) {
//     const blob = new Blob([content], { type: 'text/plain' });
//     const link = document.createElement('a');
//     link.download = filename;
//     link.href = URL.createObjectURL(blob);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// }



//-------------------------------------------------------------------------------------------------------------------------------------------------------
console.log(initialUrl)
// Confirmation dialog logic
if (confirm('Irrelevant search, do you wish to continue?')) {
    toggle = 1; // Update toggle to 1 if user clicks OK
    console.log("Toggle set to:", toggle);

    // Notify background.js of the toggle value
    chrome.runtime.sendMessage({ action: "updateToggle", toggle });
    console.log("user cliked OK");
    // Redirect to initial URL
    window.location.href = initialUrl;
} else {
    console.log("Toggle remains:", toggle); // Toggle stays 0 if user clicks Cancel

    // Notify background.js of the toggle value
    chrome.runtime.sendMessage({ action: "updateToggle", toggle });

    // Redirect to Google
    window.location.href = 'https://www.google.com';
}
//-----------------------------------------------------------------------------------------------------------------------------------------
// Request the variable from background.js
chrome.runtime.sendMessage({ action: "getVariable" }, (response) => {
    if (response && response.data) {
        initialUrl = response.data;
    } else {
        console.error("Failed to get the variable from background.js");
    }
});
// Request the variable from background.js
chrome.runtime.sendMessage({ action: "getVariabl" }, (response) => {
    if (response && response.variable) {
        word = response.variable;
    } else {
        console.error("Failed to get the variable from background.js");
    }
});
