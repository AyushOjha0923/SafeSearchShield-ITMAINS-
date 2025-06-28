let initialUrl = "https://www.google.com"; // Default fallback URL
let word = "N/A"; // Default searched word
let toggle = 0; // Initialize toggle


//  Step 1: Fetch initialUrl
chrome.runtime.sendMessage({ action: "getData" }, (response) => {
    if (response && response.initialUrl) {
        initialUrl = response.initialUrl;
        word = response.word;
        console.log(" Got Initial URL:", initialUrl);
        console.log(" Got searched word:", word);
    } else {
        console.error("Failed to get data from background.js. Redirecting...");
        window.location.href = initialUrl;
        return;
    }

    //  Now show confirmation alert
    processUserChoice();
});

//  Step 2: Handle user confirmation
function processUserChoice() {
    let userChoice = confirm('Irrelevant search detected. Do you wish to continue?');

    if (userChoice) {
        toggle = 1;
        console.log(" User clicked OK, setting toggle:", toggle);

        // Notify background.js to update toggle
        chrome.runtime.sendMessage({ action: "updateToggle", toggle });
        setTimeout(() => {
                    console.log("➡ Redirecting now...");
                    window.location.href = initialUrl;
                }, 1000); // 1 second delay before redirecting
            }
     else {
        console.log("🔴 User clicked Cancel. Redirecting to Google...");
        chrome.runtime.sendMessage({ action: "updateToggle", toggle });
        window.location.href = "https://www.google.com";
    }
}


