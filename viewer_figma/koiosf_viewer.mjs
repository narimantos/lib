//console.log(`In ${window.location.href} starting script: ${import.meta.url}`);
// https://browserhow.com/how-to-clear-chrome-android-history-cookies-and-cache-data/
 // imports

    import {LinkButton,HideButton,DragItem,publish,subscribe,LinkClickButton,LinkToggleButton,CanvasProgressInfoClass,ForceButton,getElement,setElementVal,LinkVisible } from '../lib/koiosf_util.mjs';
    import {SetupLogWindow} from '../lib/koiosf_log.mjs';
    import {SetupVideoWindowYouTube} from './koiosf_playvideo.mjs';
    import {SelectLesson,SelectNextLesson,GlobalLessonList } from './koiosf_lessons.mjs';
    import {GetSubTitlesAndSheets} from './koiosf_subtitles.mjs';
    import {UpdateTranscript,FoundTranscript,SelectLanguage,SetVideoTranscriptCallbacks} from './koiosf_showtranscript.mjs';
    import {/*FoundSlides,*/UpdateSlide} from './koiosf_slides.mjs';
    import {} from './koiosf_notes.mjs';
    import {InitSpeak,StopSpeak,StartSpeak,EnableSpeech,IsSpeechOn} from './koiosf_speech.mjs';
    //import {} from './koiosf_test.mjs';
    import {SelectPopup,InitPopup} from './koiosf_popup.mjs';
    import {DisplayMessageContinous,SwitchDisplayMessageContinous,DisplayMessage} from './koiosf_messages.mjs';
    import {} from './koiosf_music.mjs';

    import {GetCourseInfo} from './koiosf_course.mjs';
    import {Login} from './koiosf_login.mjs';

    import {} from './koiosf_literature.mjs';
    import {} from './koiosf_screenlayout.mjs';
    import {} from './koiosf_comments.mjs';
    import {} from './koiosf_quiz.mjs';
    import {} from './koiosf_badges.mjs';
    import {currentlang, setLangEn, setDarkmode} from './koiosf_settings.mjs';
    import {} from './koiosf_leaderboard.mjs';

var globalplayer=0;
//export var currentduration;
export var currentvidinfo;

{ // Global variables
//var currentvideoid;


var position;
var logpos;
var logtext=0;
var logipfs;

var video=0;
var slide;
var ToggleCueVisibilityStatus=true;
var SecondsToSubtitle=[];
var globalyoutubeid; // global for onYouTubeIframeAPIReady
var previous_colour=""
var previous_row=-1;
var table
var tablediv
var captionLanguageGlobal = "en";

var defaultvolume=100;
var vidproginput=0;
var vidprogress=0;
var slider=0; // global

var fSoundOn=true;
}
function GetDuration() {
    if (video) return video.duration;
    if (globalplayer && globalplayer.getDuration) return  globalplayer.getDuration();
    return 0;
}


subscribe("videoplayerready",VideoPlayerReady);
function VideoPlayerReady(playerobject) {
    globalplayer = playerobject;

    if (currentvidinfo)
        LoadVideo(currentvidinfo)
}


var seeninfo;

var GlobalCanvasProgressInfo;


async function VideoLocation() {
    var CurrentPos=0;
    var Duration=GetDuration();
    var PlaybackRate=1;
    var ReallyPlayed=0;
   // console.log(`In VideoLocation pos=${CurrentPos}`);

    if (IsVideoPaused())
        return;  // probably just ended, don't update any more

    if (globalplayer) {
        if (globalplayer.getCurrentTime) {
            CurrentPos=globalplayer.getCurrentTime();
            PlaybackRate=globalplayer.getPlaybackRate()
        }
    }
    UpdateTranscript(CurrentPos);
    UpdateSlide(CurrentPos);
    SetVideoProgressBar(parseFloat (CurrentPos / Duration ));

    var cursec=Math.floor(CurrentPos)
    if (!seeninfo.seensec[cursec]) {
        seeninfo.seensec[cursec]=1;
        seeninfo.seensum++;
        GlobalCanvasProgressInfo.UpdateItem(seeninfo,cursec)
    }
    await GlobalLessonList.SaveVideoSeen(seeninfo,currentvidinfo)

    //CanvasProgressInfo(getElement("videoprogressbar"),true,seeninfo)


}



async function SeenVideo() { // every few seconds save the progress
    console.log(`Seen video ${currentvidinfo.txt}`);
    seeninfo.seenend=true;
    await GlobalLessonList.SaveVideoSeen(seeninfo,currentvidinfo)
	publish("videoseen",currentvidinfo);
}

subscribe('videoend',    SeenVideo);



async function NextVideo() {
    stopVideo();
    
    if (localStorage.getItem("autoplaystatus")=="true") {
        console.log("in viewer video ", localStorage.getItem("autoplaystatus"));
        var tempvidinfo = currentvidinfo;
        await sleep(3000);
        if (currentvidinfo == tempvidinfo) {
            SelectNextLesson(+1);
        }
    }
    //await Relax();
/*
    var RelaxTime=5000;
    await SelectPopup("relax")
    await sleep(RelaxTime);
    await SelectPopup("literature")
*/
    /*
    if (CurrentLesson == LastLesson)
        publish ("lessonsend")
    else
        SelectLesson(CurrentLesson +1);
    */
}


async function tcallback() {

    //console.log("In tcallback");
    VideoLocation();

   if (!IsVideoPaused())
        setTimeout( tcallback, 400); // 400
}
/*
function DisplayCurrentFunctionName(args) {
            var ownName = args.callee.toString();
            ownName = ownName.substr('function '.length);        // trim off "function "
            ownName = ownName.substr(0, ownName.indexOf('('));        // trim off everything after the function name
            console.log(`In function ${ownName}`);
           console.log(`In function ${ownName}`);
        }
*/
function SwapObjects(obj1,obj2) {
    var temp = document.createElement("div"); // create marker element
    console.log('swapping');
    console.log(obj1);
    console.log(obj2);
    obj1.parentNode.insertBefore(temp, obj1); // and insert it where obj1 is
    obj2.parentNode.insertBefore(obj1, obj2); // move obj1 to right before obj2
    temp.parentNode.insertBefore(obj2, temp); // move obj2 to right before where obj1 used to be
    temp.parentNode.removeChild(temp); // remove temporary marker node
    // temp should be carbage collected
}
function swapElements(obj1, obj2) {  // not used now
    var temp = document.createElement("div"); // create marker element
    var c1 = obj1.childNodes;
    var c2 = obj2.childNodes;
    while (obj1.childNodes.length > 0) temp.appendChild(obj1.childNodes[0]);
    while (obj2.childNodes.length > 0) obj1.appendChild(obj2.childNodes[0]);
    while (temp.childNodes.length > 0) obj2.appendChild(temp.childNodes[0]);


}
function CreateButton(name,funct,place) {
    console.log(`CreateButton ${name}`);
    var buttonback=document.createElement("button");
    buttonback.innerHTML = name;

    // buttonback.style.float="right";

    buttonback.addEventListener("click", funct);
    place.appendChild(buttonback);
}



//document.addEventListener("keydown", x=>{publish(`keypressed${x.key}`)}); // connect actions to keypresses, not implemented yet

function GetVolume() {
    if (video) return video.volume;
    if (globalplayer && globalplayer.getVolume) return globalplayer.getVolume();
    return 0;
}
function SetVolume(newvol) {
    console.log(`In SetVolume newvol=${newvol}`);
    if (video) {
        const newvolint=parseFloat( newvol/ 100);
        video.volume = newvolint;
    }
    if (globalplayer && globalplayer.setVolume) globalplayer.setVolume(newvol);
    console.log(`New volume=${GetVolume()}`);
}
function CreateSoundSlider() {
    let divsoundslider=getElement("soundslider");
    var input=document.createElement("input");
    input.type="range"
    input.min="0"
    input.value=defaultvolume;
    input.max="100"
    input.step="1"
    input.addEventListener("change", obj => SetVolume(obj.target.value))
    divsoundslider.appendChild(input);
    SetVolume(defaultvolume);
}

export async function SetVideoSeconds(seconds) {
    //console.log(`In SetVideoSeconds, moving to ${seconds}`);

    if (globalplayer)
        globalplayer.seekTo(seconds, true);


    UpdateTranscript(seconds)
    UpdateSlide(seconds);

        //console.log(`New position=${video.currentTime}`);
    //startVideo(); // be sure to start again ==> not starting, to irritating

}
async function SetVideoProgressBar(perc) {
    // console.log(`SetVideoProgressBar ${perc}`);
    if (slider)
        slider.style.left =  (perc*100)+"%";

}
export async function CreateVideoSlider() {
    slider=getElement("videodrag");//.parentElement;

    function XYUpdate(percx,percy) {
        if (percx >1) percx=1;
        if (percx <=0) percx=0;
        SetVideoProgressBar(percx);
        SetVideoSeconds(parseFloat (GetDuration()*percx ));
    }
    SetVideoProgressBar(0);
    DragItem("videodrag","videoprogressbar","mainscreen",XYUpdate);
}
function IsVideoPaused(){
    var fpaused=false;
    //if (video)  fpaused=video.paused
    if (globalplayer && globalplayer.getPlayerState)
        fpaused=( globalplayer.getPlayerState() !== 1); // 1 – playing
    return fpaused;
}
//async function UpdateVideoIndicator(fpaused) {
//    HideButton("start",!fpaused);
//    HideButton("pause",fpaused);
//}
export async function startVideo() {
    console.log("In startVideo");
   //         console.log(globalplayer.getDebugText());
   //     console.log(globalplayer.getVideoData());


    HideButton("StartButton",true);




//    ShowTitles(false)
   // ForceButton("start",true);
  //  HideButton("largestart",true)

    if (video) {
        video.play();
        video.autoplay=true; // so after location change the video continues to play
    }
    if (globalplayer) {
        if (IsVideoPaused()) // maybe already started via youtube interface
            globalplayer.playVideo();
    }
 //   UpdateVideoIndicator(false);


    publish("videostarted");

    tcallback(); // callbacks for the progress
}
function TranscriptShownCB(txt) {
    console.log(`In TranscriptShownCB ${txt}`);
      StartSpeak(txt);
}
function stopVideo() {
    console.log("In stopVideo");
    //ForceButton("start",false);
    //HideButton("largestart",false)
      HideButton("StartButton",false);
    //ShowTitles(true);
    if (video) video.pause();
    if (globalplayer) globalplayer.pauseVideo();
   // UpdateVideoIndicator(true);
    StopSpeak();
    publish("videostopped");

}
function TogglePauseVideo() {
    console.log("In TogglePauseVideo");
    var fpaused=IsVideoPaused()
    if (fpaused) {
        if (video)  video.play();
        if (globalplayer) globalplayer.playVideo();
    } else {
        if (video) video.pause();
        if (globalplayer)  globalplayer.pauseVideo();
    }
    UpdateVideoIndicator(!fpaused);
    StopSpeak();
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export async function ToggleSpeech(){
    var fspeechon = !IsSpeechOn();
    EnableSpeech(fspeechon);
    EnableSound(!fspeechon); // disable video sound when speech is on
}
export function SetglobalplayerSubtitle(lang) {
  console.log("lang set to " + lang);
   if (globalplayer &&  globalplayer.setOption)
        globalplayer.setOption('captions', 'track', lang==""?{}:{'languageCode': lang});
}
function CueVisible(lang) { // if lang="" then cue invisible
    if (globalplayer)
        SetglobalplayerSubtitle(lang);
}
export function ToggleCueVisibility() {
    ToggleCueVisibilityStatus = !ToggleCueVisibilityStatus;
    //CueVisible(ToggleCueVisibilityStatus?currentlang:"");
    SetglobalplayerSubtitle(ToggleCueVisibilityStatus?currentlang:"");
}

var signs=0;
async function PlayerLoaded() {
   // console.log("In PlayerLoaded");
    signs++;
    if (signs ==1) // only at exactly 1
        publish("playerloaded");
}

subscribe("youtubepluginloaded",PlayerLoaded);

subscribe('videostart',  startVideo);
//subscribe('videocued',   PlayerLoaded ); // do nothing, wait for user to start
subscribe('videopause',  stopVideo);
subscribe('videostop',   stopVideo);
subscribe('videoend',    NextVideo);


subscribe('slidesloaded',    PlayerLoaded);


var fVideoRunning=false;

subscribe('popupdisplayblock',x=> { fVideoRunning=!IsVideoPaused();stopVideo();} );
subscribe('popupdisplaynone', x=> { if (fVideoRunning) startVideo(); } ); // if running before, start again



subscribe("loadvideo",LoadVideo);

async function LoadVideo(vidinfo) { // call when first video is loaded or a diffent video is selected
     if (!vidinfo) return;
    //console.log(`Loading video ${vidinfo.videoid} ${vidinfo.txt}`);
    //console.log(vidinfo);

    //publish("loadvideo",vidinfo); // note: with parameter




    if (globalplayer) {
        globalplayer.cueVideoById(vidinfo.videoid,0); // start at beginning
		console.log(`Cue video ${vidinfo.videoid}`);
	}


    currentvidinfo = vidinfo;
    //currentduration = vidinfo.duration
    //currentvideoid = vidinfo.videoid;
    console.log(`In Loadvideo`);
    //
   SetVideoProgressBar(0)

  //  console.log(vidinfo)
   // GetSubTitlesAndSheets(vidinfo,FoundTranscript,FoundSlides);
   // for (var i=0;i< vidinfo.subtitles.length;i++)
       //if (vidinfo.subtitles[i].lang == "vor")
            //FoundSlides(vidinfo.subtitles[i].subtitle,vidinfo);
    //GetSetupLitAndAssInfo(vidinfo.txt);

    seeninfo=GlobalLessonList.LoadVideoSeen(vidinfo);
	console.log(seeninfo)

    GlobalCanvasProgressInfo.Update(seeninfo)
}



subscribe("setcurrentcourse",SetCurrentCourse)
var globalcommunity
var globalcommunityinvite

async function SetCurrentCourse() {
    globalcommunity=await GetCourseInfo("community");
    globalcommunityinvite=await GetCourseInfo("communityinvite");
    console.log(`SetCurrentCourse globalcommunity is now ${globalcommunity} ${globalcommunityinvite}`)
}

function ScrCommunityMadeVisible () {

    console.log(`ScrCommunityMadeVisible Opening ${globalcommunity}`)

	//getElement("btncommunity","scr_community").dispatchEvent(new CustomEvent("displayactive")); // then hide the join button


    getElement("communitylink").href=globalcommunity
    getElement("communitylink").target="_blank"
    getElement("communitylink").textContent=globalcommunity;

    //getElement("globalcommunityinvite").href=globalcommunityinvite
    //getElement("globalcommunityinvite").target="_blank"
    //getElement("globalcommunityinvite").textContent="Join "+globalcommunity;


}
function SlackJoin() {
	window.open(globalcommunityinvite, '_blank');
}

async function asyncloaded() {
    //console.log(`In asyncloaded of script: ${import.meta.url}`);
    publish("playerstart");


    LinkVisible("scr_community" ,ScrCommunityMadeVisible)
    LinkClickButton("slackjoin",SlackJoin);
    LinkClickButton("back",stopVideo,"scr_viewer");

    //LinkButton("start",startVideo);


getElement("StartButton").addEventListener('animatedclick',startVideo)


//    LinkClickButton("largestart");subscribe("largestartclick",startVideo);
    subscribe('videocued', x=>{HideButton("StartButton",false);})

    var videofield=getElement("videofield");
videofield.addEventListener('click', x=>{console.log("videofield click");if (!IsVideoPaused()) stopVideo();});

   // LinkToggleButton("start",false);subscribe("starton",startVideo);subscribe("startoff",stopVideo);


    //LinkButton("stop",stopVideo);
    //LinkButton("pause",TogglePauseVideo);
   // HideButton("pause",true);
    //LinkButton("audio",ToggleSound);

 // LinkToggleButton("audio",true);subscribe("audioon",ToggleSound);subscribe("audiooff",ToggleSound);

    //LinkButton("speech",ToggleSpeech);
 // LinkToggleButton("speech",false);subscribe("speechon",ToggleSpeech);subscribe("speechoff",ToggleSpeech);

    //LinkButton("subtitle",ToggleCueVisibility);
 // LinkToggleButton("subtitle",false);subscribe("subtitleon",ToggleCueVisibility);subscribe("subtitleoff",ToggleCueVisibility);




console.log("Init ready1");




  CreateVideoSlider();  //ff uitgezet
 GlobalCanvasProgressInfo=new CanvasProgressInfoClass(getElement("videoprogressbar"),true,"#20FFB1")//"green")


    // CreateSoundSlider();
    InitSpeak();
console.log("Init ready2");
    var chatlink="https://gitter.im/web3examples/test/~embed";
    //SetupChat("chat",chatlink);
    //SetupLitAndAss();
    // CreateButton("closekeyboard",x=>document.blur(),getElement('notes'));
    var metaDom = getElement("viewport");
    if (metaDom) {
        metaDom.content=metaDom[0].content+", user-scalable=no"; //maximum-scale=1.0, minimum-scale=1.0"; // fix zoom
    }
    var newmeta=document.createElement("meta");
    //newmeta.name="viewport";
//    newmeta.content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0";   // not inserted??
  //  newmeta=document.createElement("meta");
    newmeta.name="theme-color"
    newmeta.content="#EBEBD3" //#20FFB1"
    getElement("head").appendChild(newmeta);
console.log("Init ready3");
    //SetupSliders(); now done via move.mjs
    //NavigateLessons();

    InitPopup();
    console.log("Init ready4");
    console.log(localStorage.getItem("currentlang"));
    SetglobalplayerSubtitle(localStorage.getItem("currentlang"));
    console.log("Init ready5");
    SetVideoTranscriptCallbacks(SetVideoSeconds,TranscriptShownCB);
    console.log("Init ready6");
    setDarkmode(localStorage.getItem("darkmodestatus")=="true");
    console.log(localStorage.getItem("darkmodestatus")=="true");
    console.log("Init ready7");

    console.log("Init ready");
}


publish("playerloading");
SetupLogWindow();
var url = window.location.pathname;
var filename = url.substring(url.lastIndexOf('/')+1);
//console.log(filename);
//console.log(`In ${window.location.href} starting script: ${document.currentScript.src}`);
window.addEventListener('DOMContentLoaded', asyncloaded);  // load
/*  https://gist.github.com/kvyb/3b370c40696ffc222563c8a70276af15
//window.addEventListener('load', (event) => {
//  console.log('page is fully loaded');
   //console.log(Webflow);
//}); */

/* too annoying
window.onerror = async function(message, source, lineno, colno, error) {   // especially for ios
console.log("In onerror");
    var str=`Error: ${message} ${source}, ${lineno}, ${colno}  `;
    if (error && error.stack) str = str.concat('\n').concat(error.stack);

    //console.log(error.stack);

    DisplayMessage(str)

}
*/
