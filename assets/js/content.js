var settings;
const clickEvent = new MouseEvent("click", {
  "view": window,
  "bubbles": true,
  "cancelable": false
});
var k = 0; //numerical id for id-less elements, mostly on mobile browser
chrome.storage.local.get( ['downvotes','show_days',"min_days","verified","promoted","spammers","spammers_hours","cheers","controls"], data => {
  settings = data;
} ); 



const getNameFromMenu = async (art_id)=>{
  if(document.querySelector("#"+art_id+" .uikit-popup-menu") !== null){ //desktop
    let el = document.querySelector("#"+art_id+" .uikit-popup-menu");
    await el.querySelector('.button').click();
    let name = await ([...await el.querySelectorAll('.menu a')].at(-1).text.split("@")[1])
    el.querySelector('.button').click();
    return name;
  }else{
    let el = document.querySelector("#"+art_id+" .post-top a.icon");
    let post_id = document.querySelector('#'+art_id+' a[href*="/gag/"]')?.href.split('/').at(-1);
    try{
      await el.click();
    }catch(e){}
    let name = await [...document.querySelector(".overlay.overlay-bottom-sheet.bottom-sheet .modal__content .menu-list a[href*='"+post_id+"']").parentElement.parentElement.querySelectorAll('a')].at(-1).text.split('@')[1];
    [...document.querySelectorAll(".overlay.overlay-bottom-sheet.bottom-sheet")].forEach(async element => {
      try{
        await element.click();
      }catch(e){}
    });
    return name;
  }
}

async function getAndShowName(art_id){
  let name = document.querySelector("#"+art_id+" .ui-post-creator__author") !== null? 
  document.querySelector("#"+art_id+" .ui-post-creator__author").text:
  await getNameFromMenu(art_id);
  if(document.querySelector("#"+art_id+" .ui-post-creator") === null){
    $("#"+art_id+" .post-header__left").append(`<span>| <a style="color:white;font-weight:bold;font-size:1rem;" href="https://9gag.com/u/${name}">@${name}</a></span>`);
    $("#"+art_id+" .post-meta.mobile").append(`<br/><span> <a style="color:white;font-weight:bold;font-size:1rem;" href="https://9gag.com/u/${name}">@${name}</a></span>`);

  }
  return name;
}

async function getUserData(name){
  const response = await fetch("https://9gag.com/v1/user-posts/username/"+name+"/type/posts", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-US,en;q=0.5",
      "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Brave\";v=\"114\"",
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": "\"Android\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1"
    },
    "referrer": "https://9gag.com",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
  });
  const json = await response.json();
  return json;
}

function filterBadges(art_id,thisart){
  if(
    ( document.querySelectorAll("#"+art_id+" .ui-post-creator__badge").length > 0 && settings.verified) || // hide verified
    ($("#"+art_id+" .ui-post-creator__author").hasClass("promoted") && settings.promoted) // hide promoted
  ){
    //console.log("promoted need to hide ",article);
    thisart.hide();
    thisart.addClass("filtered");
    return false;
  }
  return true

}

function filterAndDisplayDays(art_id,creatorCreation){
  const now = Date.now()/1000;
  let diff = now-creatorCreation;
  diff = diff/86400; //in days
  diff = parseInt(diff);
  ////console.log(settings.min_days+" ?? "+diff)
  if(settings.min_days > diff){ //hide users that are too young
    //console.log(article,"creator too new");
    $("#"+art_id).hide();
    $("#"+art_id).addClass("filtered");
    return false;
  }
  
  if(document.querySelector("#"+art_id+" .ui-post-creator") !== null)
    $("#"+art_id+" .ui-post-creator").append("| "+diff+" days");
  else{
    $("#"+art_id+" .post-header__left").append("| "+diff+" days");
    $("#"+art_id+" .post-meta.mobile").append("| "+diff+" days");
  }
  return true;
}

async function showSpammer(art_id,json){
  if(settings.spammers && json.data.posts.length >= 10){
    let posts = json.data.posts;
    let postDiff = [];
    for(let i =0; i<posts.length; i++){
      let creationTs = posts[i].creationTs;
      if(i == 0)
        postDiff[i] = ((Date.now()/1000) - creationTs)/3600 //as hours
      else 
        postDiff[i] = (posts[i-1].creationTs - creationTs)/3600 ;
      
    }
    ////console.log(name+" diffs ",postDiff);
    const average = array  => array .reduce((a, b) => a + b) / array .length
    let diffAve =  average(postDiff);
    ////console.log("averages: ",diffAve);
    
    ////console.log('diffsetting ',settings.spammers_hours);
    // ////console.log('stuff ',Number(settings.spammers_hours));
    let diffset = !isNaN(settings.spammers_hours) ? settings.spammers_hours : 12
    ////console.log('diffset ',diffset);
    if(diffAve < diffset){
      if(document.querySelector("#"+art_id+" .ui-post-creator")!== null)
      $("#"+art_id+" .ui-post-creator").append(`<span style="color:red;font-weight:bold;">| SPAMMER</span>`);
      else{
        $("#"+art_id+" .post-header__left").append(`<span style="color:red;font-weight:bold;">| SPAMMER</span>`);
        $("#"+art_id+" .post-meta.mobile").append(`<span style="color:red;font-weight:bold;">| SPAMMER</span>`);
      }
      ////console.log(name+" is a spammer")
    } 

  }
}

async function showDonwvotes(art_id,json){
  if(!settings.downvotes)
    return;
  let post_id = ([...document.querySelectorAll("#"+art_id+" header a")].at(-1)).href.split('/').at(-1)
  // //console.log('post_id',post_id);
  //return the downvotes
  let posts = json.data.posts;
  let downvotes = null;
  
  for(let i =0; i<posts.length; i++){
    if(posts[i].id == post_id){
      downvotes = posts[i].downVoteCount;
      break;
    }                                   
  }
  ////console.log('postId ',post_id," downvotes", downvotes);
  if(downvotes !== null){
    const upvote_grouped_data = $(`#${art_id} .upvote.grouped`).data();
    const data_attr_name = `data-${Object.keys(upvote_grouped_data)[0]}`
    const downvote_span = $('<span />').addClass('downvote').attr(data_attr_name,"").html(downvotes);
    $(`#${art_id} .downvote.grouped`).after(downvote_span);
  }
}

async function filterArticle(index,thisart){
      thisart = $(thisart);

      // console.log('filtering ', thisart); 
      thisart.addClass("filtering");
      if(thisart.attr("id") === undefined){
        thisart.attr("id","custom-id-"+k);
        k++;
      }

      const art_id = thisart.attr("id");
      const name = await getAndShowName(art_id)

      if(!filterBadges(art_id,thisart)) //early escape for verified or promoted users
        return;


      if(settings.cheers){
        $("#"+art_id+" a.post-award-btn").hide();
        $("#"+art_id+" post-award-users").hide();
      }

      //keep days stuff for last, no unnecessary http requests
      if((settings.show_days || settings.min_days > 0) && name != "9GAGGER"){
        const json = await getUserData(name)
        if(!json)
          return;
        const creatorCreation = json.data.profile.creationTs;
        //console.log(article,'creator ts',creatorCreation);
        
            
        if(!filterAndDisplayDays(art_id,creatorCreation))
          return;
    
        showSpammer(art_id,json)
        showDonwvotes(art_id,json)
        
      }

      if(settings.controls){
        try{
          // console.debug("trying to enable controls for "+art_id,$("#"+art_id+""))
          $("#"+art_id+" video").prop("controls",true);  //enable controls for videos
        }catch(e){
          // console.debug("can't enable controls for "+art_id,e)
        }
      }
        thisart.addClass("filtered");

  }



const myTimeout = setTimeout(function(){
  setInterval(async function(){    
    ////console.log(settings);
    await $("#list-view-2 article:not(.filtered,.filtering), .list-view__content article:not(.filtered,.filtering)").each(filterArticle);    
  },500)
}, 1000);