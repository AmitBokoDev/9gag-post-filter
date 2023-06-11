var settings;
var $tags = [];
var k = 0; //numerical id for id-less elements, mostly on mobile browser
chrome.storage.local.get( ['show_days',"min_days","anon","verified","promoted","tags","title","spammers","spammers_hours"], data => {
  settings = data;
  if(settings.tags !== undefined){
    $tags = settings.tags;
    $tags = $tags.trim().split(",");
  }
} ); 

const myTimeout = setTimeout(function(){

  setInterval(function(){
    
    //console.log(settings);
    $("#list-view-2 article:not(.filtered), .list-view__content article:not(.filtered)").each(function(){
        if($(this).hasClass("filtered"))
          return;
        
        if($(this).attr("id") === undefined){
          $(this).attr("id","custom-id-"+k);
          k++;
        }

        //console.log($(this), $(this).attr("id")+" is unfiltered")

        let art_id = $(this).attr("id");
        let name = $("#"+art_id+" .ui-post-creator__author").text();
        let title = $("#"+art_id+" header a h2").text();
        let post_tags = [];
        $("#"+art_id+" section.featured-tag").children().each(function(){
          post_tags.push($(this).text().toLowerCase());
        });
        //console.log("post tags", post_tags);
        //console.log("global tags", $tags);


        if(
          (name == "9GAGGER" && settings.anon) || //hide anons
          ( document.querySelectorAll("#"+art_id+" .ui-post-creator__badge").length > 0 && settings.verified) || // hide verified
          ($("#"+art_id+" .ui-post-creator__author").hasClass("promoted") && settings.promoted) // hide promoted
        ){
          //console.log("need to hide "+name);
          $(this).hide();
          $(this).addClass("filtered");
          return;
        }

        for(let i = 0; i<$tags.length; i++){ //hide tags
          let tag = $tags[i];
          //console.log("tag ", tag);
          //console.log("in post> ", post_tags.includes(tag));
          if(
            (settings.title && title.toLowerCase().indexOf(tag.trim().toLowerCase()) > -1) || //search by title
            (post_tags.includes(tag)) //search by post tags
          ){
            //console.log('filtered by tags');
            $("#"+art_id).hide();
            $(this).addClass("filtered");
            return;
          }

        }

        //keep days stuff for last, no unnecessary http requests
        if((settings.show_days || settings.min_days > 0) && name != "9GAGGER"){
          //console.log("GETting...");
          $.get(
            "https://9gag.com/u/"+name,
            function(res){
                // //console.log(res);
              let fullres = res;
              res = res.substr(res.indexOf("creator"));
              res = res.substr(res.indexOf("creationTs")+13, 10);
              //console.log("id: "+art_id+" name: "+name);
              //console.log(res);
              res = parseInt(res);
              let now = Date.now()/1000;
              let diff = now-res;
              diff = diff/86400; //in days
              diff = parseInt(diff);
              //console.log(settings.min_days+" ?? "+diff)
              if(settings.min_days > diff){ //hide users that are too young
                $("#"+art_id).hide();
                $("#"+art_id).addClass("filtered");
                return;
              }
              $("#"+art_id+" .ui-post-creator").append("| "+diff+" days");

              
              // Using regular expressions
              const regex = /JSON\.parse\("(.*)"\)/; // Matches the entire JSON.parse() expression and captures the content inside the parentheses
              const match = fullres.match(regex);
              let jsonString = match ? match[1] : null;
              // jsonString = jsonString.replaceAll('\\\"',"'");
              const regex2 = /[^\\]/g;
              const match2 = (jsonString.match(regex2)).join('');
              // //console.log('jsonString', jsonString); // JSON.parse("{"key": "value"}")
              // //console.log('match', match2);
              
              if(jsonString === null){
                console.error('ERROR FETCHING USER DATA FOR '+name);
              } 
              
              try{
                var json = JSON.parse(match2);
                // const json = JSON.parse(jsonString);
                if(json !== null){
                  //console.log('jsonString2', json); // JSON.parse("{"key": "value"}")
                  if(settings.spammers){
                    let posts = json.data.posts;
                    let postDiff = [];
                    for(let i =0; i<posts.length; i++){
                      let creationTs = posts[i].creationTs;
                      if(i == 0)
                        postDiff[i] = ((Date.now()/1000) - creationTs)/3600 //as hours
                      else 
                        postDiff[i] = (posts[i-1].creationTs - creationTs)/3600 ;
                      
                    }
                    //console.log(name+" diffs ",postDiff);
                    const average = array  => array .reduce((a, b) => a + b) / array .length
                    let diffAve =  average(postDiff);
                    //console.log("averages: ",diffAve);
                    
                    //console.log('diffsetting ',settings.spammers_hours);
                    // //console.log('stuff ',Number(settings.spammers_hours));
                    let diffset = !isNaN(settings.spammers_hours) ? settings.spammers_hours : 12
                    //console.log('diffset ',diffset);
                    if(diffAve < diffset){
                      $("#"+art_id+" .ui-post-creator").append(`<span style="color:red;font-weight:bold;">| SPAMMER</span>`);
                      //console.log(name+" is a spammer")
                    } 

                  }
                  //console.log('aids');
                  let post_id = (($("#"+art_id+" header a")[4]).href.split('/'))[4];
                  //console.log('post_id',post_id);
                  //return the downvotes
                  let posts = json.data.posts;
                  let downvotes = null;
                 
                  for(let i =0; i<posts.length; i++){
                    if(posts[i].id == post_id){
                      downvotes = posts[i].downVoteCount;
                      break;
                    }                                   
                  }
                  //console.log('postId ',post_id," downvotes", downvotes);
                  if(downvotes!== null)
                    $("#"+art_id+" .post-vote").append(`<span class="post-vote__text downvote">${downvotes}</span>`);
                  


  
                }
              }catch(e){
                // console.error(e,'ERROR PARSING JSON',match2);
                var json = null;
              }

            }
          );


        }
        try{
          console.debug("tring to enable controls for "+art_id,$("#"+art_id+""))
          $("#"+art_id+" video").prop("controls",true);  //enable controls for videos
        }catch(e){
          console.debug("can't enable controls for "+art_id,e)
        }
        $(this).addClass("filtered");

    });    
  },500)
}, 1000);