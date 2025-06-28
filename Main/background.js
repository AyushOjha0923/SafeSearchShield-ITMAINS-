let toggleValue = 0;  // Initialize toggle value

// Listen for URL changes in a tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        toggleValue = 0;
        console.log("URL updated (likely typing in search bar). Toggle reset to 0.");
    }
});

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    const blockedWords = ['example1', 'example2', 'example3', 'oopm'];
    const url = new URL(details.url);
    
    let shouldBlock = false;
    
    // Check if the URL contains any blocked words
    for (let word of blockedWords) {
        if (url.search.includes(word)) {
            searchedWord = word;
            shouldBlock = true;
            
            break;
        }
    }
    
    // Additional condition: check toggle value
    if (shouldBlock && toggleValue === 0) {
        // Set the URL as the value for myVariable
        myVariable = url.href;
        console.log("Blocked URL:", myVariable);
        
        // Update tab to the alert page
        chrome.tabs.update(details.tabId, { url: 'alertpopup.html' });
    } else if (shouldBlock && toggleValue === 1) {
        console.log("Allowed URL despite block conditions due to toggle:", url.href);
    }
});

// The variable to send (initialized, will be updated when a blocked URL is detected)
let myVariable = '';
var searchedWord= '';// variable for word
// export{searchedWord};

// Listen for messages from other scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getVariable") {
        sendResponse({ data: myVariable });
    }
     else if (request.action === "updateToggle") {
        // Update the toggle value
        toggleValue = request.toggle;
        console.log("Toggle value updated in background.js:", toggleValue);
    }
});
// Listen for messages from other scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getVariabl") {
        sendResponse({ variable: searchedWord });
    }
    //  else if (request.action === "updateToggle") {
    //     // Update the toggle value
    //     toggleValue = request.toggle;
    //     console.log("Toggle value updated in background.js:", toggleValue);
// }
});
