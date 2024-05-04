var settings;
chrome.storage.local.get( [
'downvotes', 'show_days', "min_days", "verified", "promoted", "spammers", "spammers_hours", "cheers", "controls", "ratio", "ratioVal", //posts settings
"comDays", "comVerified", "comPro", "comProplus", "comName", "comFlag" //commenters settings
], data => {
  settings = data;
} ); 

(function() {
  const scriptElement2 = document.createElement('script');
  scriptElement2.src = chrome.runtime.getURL('assets/js/jquery_slim_mini.js');
  (document.head || document.documentElement).appendChild(scriptElement2);

  
  const scriptElement = document.createElement('script');
  scriptElement.src = chrome.runtime.getURL('assets/js/injectFetch.js');
  (document.head || document.documentElement).appendChild(scriptElement);

})();

window.addEventListener('CustomEvent', function(evt) {
  chrome.runtime.sendMessage({type: "storageRequest", key: evt.detail.key}, function(response) {
      const customEvent = new CustomEvent('CustomResponse', {detail: settings});
      window.dispatchEvent(customEvent);
  });
});