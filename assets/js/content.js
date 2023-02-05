var settings;

chrome.storage.local.get( ['show_days',"min_days","anon","verified"], data => {
  settings = data;
} ); 

const myTimeout = setTimeout(function(){

  // Select the node that will be observed for mutations
  const targetNode = document.getElementById('list-view-2');

  // Options for the observer (which mutations to observe)
  const config = {childList: true};

 
  // Hello there, callback hell
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === 'childList') {
        console.log('A child node has been added or removed.');
        console.log(settings);
        $("#list-view-2").children().each(function(){
          if(!$(this).hasClass("filtered")){
            console.log($(this).attr("id")+" is unfiltered")
            $(this).children("article").each(function(){
              let art_id = $(this).attr("id");
              let name = $("#"+art_id+" .ui-post-creator__author").text();

              if(
                (name == "9GAGGER" && settings.anon) || //hide anons
                ( document.querySelectorAll("#"+art_id+" .ui-post-creator__badge").length > 0 && settings.verified) // hide verified
              ){
                $(this).remove();
                return;
              }
              if((settings.show_days || settings.min_days > 0) && name != "9GAGGER"){
                console.log("GETting...");
                $.get(
                  "https://9gag.com/u/"+name,
                  function(res){
                    // console.log(res);
                  res = res.substr(res.indexOf("creator"));
                  res = res.substr(res.indexOf("creationTs")+13, 10);
                  console.log("id: "+art_id+" name: "+name);
                  console.log(res);
                  res = parseInt(res);
                  let now = Date.now()/1000;
                  let diff = now-res;
                  diff = diff/86400; //in days
                  diff = parseInt(diff);
                  console.log(settings.min_days+" ?? "+diff)

                  if(settings.min_days > diff){
                    $("#"+art_id).remove();
                    return;
                  }
                  console.log("appendo");

                  $("#"+art_id+" .ui-post-creator").append("| "+diff+" days");

                });


              }             
              

            });
            $(this).addClass("filtered");
          }
        });
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);


    // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
  $("#list-view-2").append("<p></p>");
}, 2000);