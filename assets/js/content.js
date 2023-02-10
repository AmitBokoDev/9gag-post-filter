var settings;
var $tags = [];
chrome.storage.local.get( ['show_days',"min_days","anon","verified","promoted","tags","title"], data => {
  settings = data;
  if(settings.tags !== undefined){
    $tags = settings.tags;
    $tags = $tags.trim().split(",");
  }
} ); 

const myTimeout = setTimeout(function(){

  setInterval(function(){
    
    console.log(settings);
    $("#list-view-2").children().each(function(){
        $(this).children("article").each(function(){
          if($(this).hasClass("filtered"))
            return;
          console.log($(this), $(this).attr("id")+" is unfiltered")

          let art_id = $(this).attr("id");
          let name = $("#"+art_id+" .ui-post-creator__author").text();
          let title = $("#"+art_id+" header a h2").text();
          let post_tags = [];
          $("#"+art_id+" div.ui-post-tags").children().each(function(){
            post_tags.push($(this).text());
          });
          console.log("post tags", post_tags);
          console.log("global tags", $tags);


          if(
            (name == "9GAGGER" && settings.anon) || //hide anons
            ( document.querySelectorAll("#"+art_id+" .ui-post-creator__badge").length > 0 && settings.verified) || // hide verified
            ($(this).attr("id") === undefined && settings.promoted) // hide promoted
          ){
            console.log("need to hide "+name);
            $(this).remove();
            return;
          }

          for(let i = 0; i<$tags.length; i++){ //hide tags
            let tag = $tags[i];
            console.log("tag ", tag);
            console.log("in post> ", post_tags.includes(tag));
            if(
              (settings.title && title.toLowerCase().indexOf(tag.trim().toLowerCase()) > -1) || //search by title
              (post_tags.includes(tag)) //search by post tags
            ){
              $("#"+art_id).remove();
              return;
            }

          }

          //keep days stuff for last, no unnecessary http requests
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
          $(this).addClass("filtered");

        });

    });    
  },1500)
}, 1000);