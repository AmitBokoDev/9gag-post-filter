
console.log("DOC READY!");
console.log("debugger? ",chrome.debugger);
console.log("network? ",chrome.debugger.network);
console.log("Network? ",chrome.debugger.Network);
// chrome.debugger?.network?.addEventListener("responseReceived ",(data)=>{
//     console.log("event data",data )
// })

var currentTab;
var version = "1.0";

const tabQuery = ()=>{chrome.tabs.query( //get current Tab
    {
        // currentWindow: true,
        // active: true,
        url: ["*://9gag.com/*"]
    },
    function(tabArray) {
        if(tabArray.length == 0) return;
        console.log(tabArray);
        currentTab = tabArray[0];
        chrome.debugger.attach({ //debug at current tab
            tabId: currentTab.id
        }, version, onAttach.bind(null, currentTab.id));
    }
)}
tabQuery();
chrome.debugger.onDetach.addListener(()=>{
    tabQuery();
})


function onAttach(tabId) {

    chrome.debugger.sendCommand({ //first enable the Network
        tabId: tabId
    }, "Network.enable");

    chrome.debugger.onEvent.addListener(allEventHandler);

}


function allEventHandler(debuggeeId, message, params) {
    // console.log("9gag event", debuggeeId,message,params)
    if (currentTab.id != debuggeeId.tabId) {
        return;
    }
    if(!params.response?.url.includes("9gag.com/v1/group-posts/type")) return;

    if (message == "Network.responseReceived") { //response return 
        chrome.debugger.sendCommand({
            tabId: debuggeeId.tabId
        }, "Network.getResponseBody", {
            "requestId": params.requestId
        }, function(response) {
            console.log("9GAG RESPONSE", params,response);
            // you get the response body here!
            // you can close the debugger tips by:
            // chrome.debugger.detach(debuggeeId);
        });
    }

}