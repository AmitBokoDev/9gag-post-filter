
(function() {





    var settings;    
    // Request data from the extension's storage
    const requestEvent = new CustomEvent('CustomEvent', {detail: {key: 'someKey'}});
    window.dispatchEvent(requestEvent);
  
    // Listen for response from the content script
    window.addEventListener('CustomResponse', function(evt) {
        console.log('Received data from extension storage:', evt.detail);
        settings = evt.detail;
        const oldFetch = window.fetch;
        window.fetch = function() {
            return oldFetch.apply(this, arguments)
                .then(response => {
                    console.debug('settings for filets',settings)
                    // Clone the response to create a mutable copy
                    const clone = response.clone();
    
                    // Assume the response is JSON. Adjust this if expecting other formats like text.
                    return clone.json().then(data => {
                        // Example modification: Add or modify a property in the JSON data
                        console.debug(arguments)
                        console.debug(data)
                        data.newProperty = "This is a new property added by the extension.";
    
                        // Serialize the modified JSON back into a string
                        let modifiedData = JSON.parse(JSON.stringify(data)); //avoid pointer problems
                        modifiedData = filterComments(modifiedData)
                        console.debug('modifiedData',modifiedData)
                        modifiedData = JSON.stringify(data);
    
                        // Create a new response with the modified JSON data
                        const newResponse = new Response(modifiedData, {
                            status: response.status,
                            statusText: response.statusText,
                            headers: response.headers
                        });
    
                        return newResponse;  // Return the modified response to the original fetch caller
                    });
                });
        };
    });




function filterComments(data){
    let comments = data?.payload?.comments;
    if(!comments)
        return data;

    console.debug('comment0 test',comments[0])
    data.payload.comments[0].text = "BIG POOP TEST"
    data.payload.comments[0].mediaText = "BIG POOP TEST"
    console.debug('comment0 test2',comments[0],data)


    return  JSON.parse(JSON.stringify(data));
}



var isProfilePage = false;
var isCommentsPage = false;
const clickEvent = new MouseEvent("click", {
  "view": window,
  "bubbles": true,
  "cancelable": false
});
var k = 0; //numerical id for id-less elements, mostly on mobile browser


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
  console.debug('response json', json)
  return json;
}

function filterBadges(art_id,thisart){
  if((
    ( document.querySelectorAll("#"+art_id+" .ui-post-creator__badge").length > 0 && settings.verified) || // hide verified
    ($("#"+art_id+" .ui-post-creator__author").hasClass("promoted") && settings.promoted) // hide promoted
  )
  && 
  !isProfilePage
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
  if(settings.min_days > diff && !isProfilePage){ //hide users that are too young
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
      $("#"+art_id+" .ui-post-creator").append(`<span style="color:red;font-weight:bold;line-height:normal;">| SPAMMER</span>`);
      else{
        $("#"+art_id+" .post-header__left").append(`<span style="color:red;font-weight:bold;line-height:normal;">| SPAMMER</span>`);
        $("#"+art_id+" .post-meta.mobile").append(`<span style="color:red;font-weight:bold;line-height:normal;">| SPAMMER</span>`);
      }
      ////console.log(name+" is a spammer")
    } 

  }
}

async function filterShowDonwvotes(art_id,json,thisart){
  if(!settings.downvotes)
    return true;
  let post_id = ([...document.querySelectorAll("#"+art_id+" header a")].at(-1)).href.split('/').at(-1)
  // //console.log('post_id',post_id);
  //return the downvotes
  let posts = json.data.posts;
  let downvotes = null;
  
  for(let i =0; i<posts.length; i++){
    if(posts[i].id == post_id){
      downvotes = posts[i].downVoteCount;
      if(settings.ratio && posts[i].upVoteCount*settings.ratioVal < downvotes && !isProfilePage){       
        console.log(`${posts[i].upVoteCount }:${downvotes} ratiod ${settings.ratioVal} need to hide `,thisart);
        thisart.hide();
        thisart.addClass("filtered");
        return false;
      }
      break;
    }                                   
  }
  ////console.log('postId ',post_id," downvotes", downvotes);
  if(downvotes!== null){
    $("#"+art_id+" .post-vote").append(`<span class="post-vote__text downvote">${downvotes}</span>`);
    $("#"+art_id+" .downvote.grouped ").after(`<span class="post-vote__text downvote">${downvotes}</span>`);
  }
  return true;
}

async function hideCheers(thisart){
  if(!settings.cheers)
    return;

  thisart.find(".post-award-users").hide(); //awards section
  thisart.find("a.post-award-btn").hide(); //cheer btn on mobile
  thisart.find('span:contains("Cheers")').closest('ul.btn-vote').hide(); //cheer btn on desktop
}

async function filterArticle(index,thisart){
  console.debug(`Is profile? `,isProfilePage)
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


  hideCheers(thisart);

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
    if(!filterShowDonwvotes(art_id,json,thisart))
      return;
    
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


const filterCommenter = async (jsonData) =>{
  let comments = jsonData.payload.comments;
  console.debug('filterComments',comments);
  
  
  
  return JSON.parse(JSON.stringify(jsonData)); //avoid pointer problems
}

const myTimeout = setTimeout(function(){
  setInterval(async function(){    
    isProfilePage = window.location.href.includes("9gag.com/u/");
    isCommentsPage = window.location.href.includes("9gag.com/gag/");    
    console.debug(` is comments? `, isCommentsPage)
    await $("#list-view-2 article:not(.filtered,.filtering), .list-view__content article:not(.filtered,.filtering)").each(filterArticle);    
    if(isCommentsPage)
      ;
  },500)
}, 1000);


  })();
