
//----------------------------------------------------------
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

    const exceptions = [
  // Educational contexts
        'cases',
        'case',
        'recent case',
        'num of',
        'no of',
        'number of cases of',
        'statistics of',
        'how to prevent',
        'legal consequences of',
        'history of',
        'laws regarding',
        'educational resources on',
        'awareness campaigns about',
        'prevention methods for',
        'causes of',
        'effects of',
        'meaning',
        'means',
        'meaning of',
    
        // Health and safety
        'mental health support for',
        'therapy for victims of',
        'counseling resources for',
        'how to report',
        'support groups for',
        'medical treatment for',
    
        // Reporting and legal
        'how to file a report for',
        'how to take legal action against',
        'how to help a victim of',
        'legal definitions of',
        'penalties for',
    
        // Academic and research
        'research on',
        'studies about',
        'articles about',
        'thesis on',
        'papers on',
    
        // News and journalism
        'latest news on',
        'cases reported in',
        'updates about',
        'trends in',
    
        // Community and activism
        'organizations working against',
        'campaigns against',
        'charities supporting victims of',
        'advocacy for victims of',
    
        // Safety and awareness
        'safety tips to avoid',
        'how to protect yourself from',
        'warning signs of',
        'risk factors for',
    
        // Victim support
        'resources for survivors of',
        'how to support a survivor of',
        'help for victims of',
    
        // Broader discussions
        'philosophical discussion on',
        'sociological impact of',
        'cultural views on',
        'public opinion about',
         // Educational and Informational Contexts
    'ethical considerations of',
    'historical accounts of',
    'case studies on',
    'impact studies about',
    'educational videos about',
    'seminars on',
    'documentaries about',
    'presentations on',
    'online courses on',
    'training materials about',

    // Health, Support, and Safety
    'rehabilitation for victims of',
    'emergency hotline for',
    'first aid steps for',
    'coping strategies for survivors of',
    'community resources for',
    'supportive measures for',
    'self-care tips after',
    'crisis intervention for',
    'best practices to address',
    'protocols for dealing with',

    // Legal and Policy-Related
    'international laws about',
    'judicial precedents on',
    'policy changes regarding',
    'human rights violations involving',
    'legal frameworks addressing',
    'advocacy for policy reforms on',
    'nonprofit initiatives to combat',
    'government responses to',
    'legal assistance for victims of',
    'prosecutorial guidelines for',

    // Academic and Research-Oriented
    'bibliographies on',
    'meta-analyses of',
    'dissertations about',
    'data sets on',
    'empirical evidence for',
    'comparative studies of',
    'literature reviews on',
    'anthropological perspectives on',
    'psychological theories about',
    'epidemiological data on',

    // Media and Public Awareness
    'public service announcements about',
    'media coverage of',
    'social media campaigns on',
    'journalistic investigations into',
    'viral stories about',
    'interviews with survivors of',
    'press releases about',
    'public awareness posters on',
    'community outreach programs about',
    'news analysis of',

    // Community, Advocacy, and Activism
    'collaborative initiatives against',
    'volunteer programs addressing',
    'grassroots movements to stop',
    'alliances formed to combat',
    'fundraising events for victims of',
    'petitions addressing',
    'community dialogues about',
    'town hall meetings on',
    'nonprofit programs for survivors of',
    'youth education on',

    // Cultural and Social Perspectives
    'media portrayals of',
    'religious views on',
    'artistic representations of',
    'film depictions about',
    'books exploring',
    'societal responses to',
    'intergenerational discussions about',
    'cross-cultural perspectives on',
    'symbolism associated with',
    'social movements addressing',

    // Broader Contexts
    'economic impact of',
    'technological solutions for',
    'environmental factors contributing to',
    'intersectional issues involving',
    'policy implications of',
    'ethical debates about',
    'role of education in preventing',
    'long-term consequences of',
    'global strategies to address',
    'initiatives to eradicate'
        
    ];
    
    
    const query = getQueryParam(url.href, 'q');
        if (query) {
            console.log("User searched for:", query);
          userQuery = query;
    let shouldBlock = false;


       // Check if the query contains any blocked words
       for (let word of blockedWords) {
        // Use regex to ensure word boundaries are respected
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(query)) {
            // Check for exceptions
            shouldBlock = true; // Assume it should block initially
            for (let exception of exceptions) {
                if (query.toLowerCase().includes(exception.toLowerCase())) {
                    shouldBlock = false; // Do not block if an exception applies
                    break;
                }
            }

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

        return true; //  Ensures async response works properly
    }
    if (request.action === "updateToggle") {
        toggleValue = request.toggle;
        console.log(" Toggle updated:", toggleValue);
    }
});


//========================================================================================


