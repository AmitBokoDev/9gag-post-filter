const myTimeout = setTimeout(function(){

  // Select the node that will be observed for mutations
  const targetNode = document.getElementById('list-view-2');

  // Options for the observer (which mutations to observe)
  const config = {childList: true};

  var children_am = 0;
  var settings;

  chrome.storage.local.get( ['show_days',"min_days","anon","verified"], data => {
    settings = data;
  } ); 

  // Callback function to execute when mutations are observed
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        console.log('A child node has been added or removed.');

        // if($("list-view-2").children.length > children_am){
        //   children_am = $("list-view-2").children.length;
        //   $("list-view-2").children().each(function(){
        //     if(!this.hasClass("filtered")){
        //       this.children("article").each(function(){
                
                
        //       });
        //     }
        //   });
          


        // }

      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);


    // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
}, 4000);