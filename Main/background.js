let toggleValue = 0;  // Initialize toggle value

// Listen for URL changes in a tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        toggleValue = 0;
        console.log("URL updated (likely typing in search bar). Toggle reset to 0.");
    }
});
// Function to extract query from URL
function getQueryParam(url, param) {
    const params = new URL(url).searchParams;
    return params.get(param);
}

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    
    const blockedWords = ['example1', 'example2', 'rape', 'murder', "kill",  "assault", "bomb", "attack", "shoot", "weapon", "terrorism",

        "exploitation", "child pornography", "bully", "stalk", "threaten",  "harassment"];
   
        const url = new URL(details.url);
//-------------------------------------------------------------------------

        const query = getQueryParam(url.href, 'q');
        if (query) {
            console.log("User searched for:", query);
          userQuery = query;
    let shouldBlock = false;


       // Check if the query contains any blocked words
       for (let word of blockedWords) {
        // Use regex to ensure word boundaries are respected
        const regex = new RegExp(\\b${word}\\b, 'i');

        if (regex.test(query)) {
            // Check for exceptions
                shouldBlock = true; // Assume it should block initially

          if (shouldBlock) {
                searchedWord = word;
                console.log("Blocked due to word:", word);
            }
            break; // Stop checking once a word is found
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
}
});

// The variable to send (initialized, will be updated when a blocked URL is detected)
let myVariable = '';
var searchedWord= '';// variable for word
var userQuery = '';
// export{searchedWord};

// Listen for messages from other scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getData") {
        console.log("📩 Received request for initialUrl & word");

        sendResponse({
            initialUrl: myVariable || "https://www.google.com", // Use a fallback if undefined
            word: userQuery || "N/A"
        });

        return true; // ✅ Ensures async response works properly
    }
    if (request.action === "updateToggle") {
        toggleValue = request.toggle;
        console.log("🔄 Toggle updated:", toggleValue);
    }
});


//========================================================================================




