// ==UserScript==
// @name        Dominion Online Live Log Viewer
// @namespace   http://dom.retrobox.eu
// @description Dominion Online Live Log Viewer
// @include     http://play.goko.com/Dominion/gameClient.html
// @include     https://play.goko.com/Dominion/gameClient.html
// @grant       none
// @version     3
// ==/UserScript==
var newLog = document.createElement('div');
var newLogText = '';
var newLogMode = -1;
var newLogPlayers = 0;
var newLogNames = {};
var newPhase = 'init';
var newPrevPhase = 'init';
newLog.setAttribute("class", "newlog");
document.getElementById("goko-game").appendChild(newLog);
Dom.DominionWindow.prototype._old_updateState = Dom.DominionWindow.prototype._updateState;
Dom.DominionWindow.prototype._updateState = function (opt) {
    if (opt.dominionPhase) newPhase = opt.dominionPhase;
    this._old_updateState(opt);
}

Dom.LogManager.prototype.old_addLog = Dom.LogManager.prototype.addLog;
Dom.LogManager.prototype.addLog = function (opt) {
    if (opt.logUrl) {
	opt.logUrl = 'http://dom.retrobox.eu/?'+opt.logUrl.substr(29);
    }
    if (opt.text) {
	var h = opt.text.match(/^-+ (.*) -+$/);
	if (h) {
	    var j = h[1].match(/^(.*): turn \d+$/);
	    if (j) {
		newLogMode = newLogNames[j[1]];
		newLogText += '<h1 class="p'+newLogMode+'">'+h[1]+'</h1>';
	    } else {
		if (h[1] == 'Game Setup') {
		    newLogText = '';
		    newLogMode = 0;
		    newLogPlayers = 0;
		    newLogNames = {};
		} else {
		    newLogMode = -1;
		}
		newLogText += '<h1>'+h[1]+'</h1>';
	    }
	} else {
	    if (newLogMode == 0) {
		var h = opt.text.match(/^(.*) - starting cards:/);
		if (h) newLogNames[h[1]] = ++newLogPlayers;
	    }
	    var h;
	    if (h = opt.text.match(/^(.*) -( ([a-z]*).*)$/)) {
		if (newLogMode > 0) {
		    var initial = newPhase.substr(0,1).toUpperCase();
		    if (h[3] != 'plays' && h[3] != 'buys' && newPrevPhase == newPhase)
			initial = '&nbsp;';
		    newPrevPhase = newPhase;
		    newLogText += '<span class="phase '+newPhase+'Phase">'+initial+'</span> ';
		}
		newLogText += '<span class="player p'+newLogNames[h[1]]+'">'+h[1]+'</span>' + colorize(h[2]) + '</br>';
	    } else if (newLogMode == 0 && (h = opt.text.match(/^(Supply cards:)(.*)/))) {
		newLogText += h[1] + colorize(h[2]) + '</br>';
	    } else {
		newLogText += opt.text + '</br>';
	    }
	}
	var goko_canvas = document.getElementById("myCanvas");
	goko_canvas.style.marginLeft="0px";
	document.getElementById("goko-game").setAttribute("style", 'margin-left:'+Math.floor(-window.innerWidth/2) + 'px !important');
	var goko_w = goko_canvas.offsetWidth;
	var goko_h = goko_canvas.offsetHeight;
	var w = window.innerWidth - goko_w - 10;
	var t = Math.floor((window.innerHeight - goko_h) / 2);
	newLog.setAttribute("style", "position:absolute; overflow:auto; left:"+goko_w+"px; width:"+w+"px; top:"+t+"px; height:"+goko_h+"px; background-color: white; z-index: -1");
	newLog.innerHTML = newLogText;
	newLog.scrollTop = newLog.scrollHeight;
    }
    this.old_addLog(opt);
};
//function newLogAlign() {
//    setTimeout('newLogAlign()', 1000/2);
//}
//newLogAlign();
function addStyle(style) {
var head = document.getElementsByTagName('head')[0];
var ele = head.appendChild(window.document.createElement('style'));
ele.innerHTML = style;
return ele;
}
addStyle("\
div.newlog {\
font-size:12px;\
font-family:Helvetica, Arial;\
padding: 0px 5px;\
}\
table {\
margin: 5px 10px;\
padding: 0px 20px;\
}\
td {\
padding: 0px 1px;\
}\
td.c1 {\
text-align:right;\
width:200px;\
}\
h1 {\
margin: 0px 0px;\
padding: 0px 5px;\
font-size:14px;\
background-color: lightgray;\
border: 2px solid gray; \
border-radius: 5px;\
}\
*.p3 {\
background-color: lightgreen;\
border-color: green; \
}\
*.p1 {\
background-color: #CC33FF;\
border-color: purple; \
}\
*.p4 {\
background-color: yellow;\
border-color: orange; \
}\
*.p2 {\
background-color: lightblue;\
border-color: blue; \
}\
*.actionPhase {\
background-color: rgb(240,240,240);\
}\
*.buyPhase {\
background-color: rgb(253,225,100);\
}\
*.cleanUpPhase {\
background-color: rgb(254,143,78);\
}\
span.phase {\
display: inline-block;\
width: 15px;\
text-align: center;\
}\
span.player {\
display: inline-block;\
min-width: 75px;\
text-align: right;\
padding-right: 3px;\
padding-left: 3px;\
}\
action\
 { background-color:rgb(240,240,240) ; border-radius: 6px; }\
treasure\
 { background-color:rgb(253,225,100) ; border-radius: 6px; }\
reaction\
 { background-color:rgb(64,168,227) ; border-radius: 6px; }\
duration\
 { background-color:rgb(254,143,78) ; border-radius: 6px; }\
victory\
 { background-color:rgb(146,193,125) ; border-radius: 6px; }\
curse\
 { background-color:rgb(215,138,219) ; border-radius: 6px; }\
ruins\
 { background-color:rgb(150,104,51) ; border-radius: 6px; }\
shelter\
 { background-color:rgb(230,108,104) ; border-radius: 6px; }\
vp-chip\
 { background-color:rgb(0,0,0) ; border-radius: 6px;\
   color:rgb(255,255,255) ; }\
treasure-victory\
{ background: -moz-linear-gradient(top, rgb(253,225,100), rgb(146,193,125));\
  background: -webkit-linear-gradient(top, rgb(253,225,100), rgb(146,193,125));\
  background: -o-linear-gradient(top, rgb(253,225,100), rgb(146,193,125));\
  background: -ms-linear-gradient(top, rgb(253,225,100), rgb(146,193,125));\
  background: linear-gradient(top, rgb(253,225,100), rgb(146,193,125)); border-radius: 6px; }\
treasure-reaction\
{ background: -moz-linear-gradient(top, rgb(253,225,100), rgb(64,168,227));\
  background: -webkit-linear-gradient(top, rgb(253,225,100), rgb(64,168,227));\
  background: -o-linear-gradient(top, rgb(253,225,100), rgb(64,168,227));\
  background: -ms-linear-gradient(top, rgb(253,225,100), rgb(64,168,227));\
  background: linear-gradient(top, rgb(253,225,100), rgb(64,168,227)); border-radius: 6px; }\
victory-reaction\
{ background: -moz-linear-gradient(top, rgb(146,193,125), rgb(64,168,227));\
  background: -webkit-linear-gradient(top, rgb(146,193,125), rgb(64,168,227));\
  background: -o-linear-gradient(top, rgb(146,193,125), rgb(64,168,227));\
  background: -ms-linear-gradient(top, rgb(146,193,125), rgb(64,168,227));\
  background: linear-gradient(top, rgb(146,193,125), rgb(64,168,227)); border-radius: 6px; }\
shelter-reaction\
{ background: -moz-linear-gradient(top, rgb(230,108,104), rgb(64,168,227));\
  background: -webkit-linear-gradient(top, rgb(230,108,104), rgb(64,168,227));\
  background: -o-linear-gradient(top, rgb(230,108,104), rgb(64,168,227));\
  background: -ms-linear-gradient(top, rgb(230,108,104), rgb(64,168,227));\
  background: linear-gradient(top, rgb(230,108,104), rgb(64,168,227)); border-radius: 6px; }\
action-shelter\
{ background: -moz-linear-gradient(top, rgb(240,240,240), rgb(230,108,104));\
  background: -webkit-linear-gradient(top, rgb(240,240,240), rgb(230,108,104));\
  background: -o-linear-gradient(top, rgb(240,240,240), rgb(230,108,104));\
  background: -ms-linear-gradient(top, rgb(240,240,240), rgb(230,108,104));\
  background: linear-gradient(top, rgb(240,240,240), rgb(230,108,104));  border-radius: 6px;}\
shelter-victory\
{ background: -moz-linear-gradient(top, rgb(230,108,104), rgb(146,193,125));\
  background: -webkit-linear-gradient(top, rgb(230,108,104), rgb(146,193,125));\
  background: -o-linear-gradient(top, rgb(230,108,104), rgb(146,193,125));\
  background: -ms-linear-gradient(top, rgb(230,108,104), rgb(146,193,125));\
  background: linear-gradient(top, rgb(230,108,104), rgb(146,193,125));  border-radius: 6px;}\
action-victory\
{ background: -moz-linear-gradient(top, rgb(240,240,240), rgb(146,193,125));\
  background: -webkit-linear-gradient(top, rgb(240,240,240), rgb(146,193,125));\
  background: -o-linear-gradient(top, rgb(240,240,240), rgb(146,193,125));\
  background: -ms-linear-gradient(top, rgb(240,240,240), rgb(146,193,125));\
  background: linear-gradient(top, rgb(240,240,240), rgb(146,193,125)); border-radius: 6px;}"
);
var types = {
'Border Village':'action',
'Farming Village':'action',
'Mining Village':'action',
'Native Village':'action',
'Walled Village':'action',
'Worker\'s Village':'action',
'Ruined Village':'ruins',
'Fishing Village':'duration',
'Village':'action',
'Ruined Library':'ruins',
'Library':'action',
'Abandoned Mine':'ruins',
'Mine':'action',
'Bag of Gold':'action',
'Fool\'s Gold':'treasure-reaction',
'Gold':'treasure',
'Overgrown Estate':'shelter-victory',
'Estate':'victory',
'Counting House':'action',
'Count':'action',
'Coppersmith':'action',
'Copper':'treasure',
'Ruined Market':'ruins',
'Grand Market':'action',
'Black Market':'action',
'Market Square':'reaction',
'Market':'action',
'Adventurer':'action',
'Alchemist':'action',
'Altar':'action',
'Ambassador':'action',
'Apothecary':'action',
'Apprentice':'action',
'Armory':'action',
'Band of Misfits':'action',
'Bandit Camp':'action',
'Baron':'action',
'Bazaar':'action',
'Bishop':'action',
'Bridge':'action',
'Bureaucrat':'action',
'Cartographer':'action',
'Catacombs':'action',
'Cellar':'action',
'Chancellor':'action',
'Chapel':'action',
'City':'action',
'Conspirator':'action',
'Council Room':'action',
'Courtyard':'action',
'Crossroads':'action',
'Cultist':'action',
'Cutpurse':'action',
'Dame Anna':'action',
'Dame Molly':'action',
'Dame Natalie':'action',
'Dame Sylvia':'action',
'Death Cart':'action',
'Develop':'action',
'Duchess':'action',
'Embargo':'action',
'Embassy':'action',
'Envoy':'action',
'Expand':'action',
'Explorer':'action',
'Familiar':'action',
'Feast':'action',
'Festival':'action',
'Followers':'action',
'Forager':'action',
'Forge':'action',
'Fortress':'action',
'Fortune Teller':'action',
'Ghost Ship':'action',
'Golem':'action',
'Goons':'action',
'Governor':'action',
'Graverobber':'action',
'Haggler':'action',
'Hamlet':'action',
'Harvest':'action',
'Herbalist':'action',
'Hermit':'action',
'Highway':'action',
'Hunting Grounds':'action',
'Hunting Party':'action',
'Inn':'action',
'Ironmonger':'action',
'Ironworks':'action',
'JackOfAllTrades':'action',
'Jester':'action',
'Junk Dealer':'action',
'King\'s Court':'action',
'Knights':'action',
'Laboratory':'action',
'Lookout':'action',
'Madman':'action',
'Mandarin':'action',
'Marauder':'action',
'Margrave':'action',
'Masquerade':'action',
'Menagerie':'action',
'Mercenary':'action',
'Militia':'action',
'Minion':'action',
'Mint':'action',
'Moneylender':'action',
'Monument':'action',
'Mountebank':'action',
'Mystic':'action',
'Navigator':'action',
'Noble Brigand':'action',
'Nomad Camp':'action',
'Oasis':'action',
'Oracle':'action',
'Pawn':'action',
'Pearl Diver':'action',
'Peddler':'action',
'Pillage':'action',
'Pirate Ship':'action',
'Poor House':'action',
'Possession':'action',
'Princess':'action',
'Procession':'action',
'Rabble':'action',
'Rats':'action',
'Rebuild':'action',
'Remake':'action',
'Remodel':'action',
'Rogue':'action',
'Saboteur':'action',
'Sage':'action',
'Salvager':'action',
'Scavenger':'action',
'Scheme':'action',
'Scout':'action',
'Scrying Pool':'action',
'Sea Hag':'action',
'Shanty Town':'action',
'Sir Bailey':'action',
'Sir Destry':'action',
'Sir Martin':'action',
'Sir Michael':'action',
'Sir Vander':'action',
'Smithy':'action',
'Smugglers':'action',
'Spice Merchant':'action',
'Spy':'action',
'Squire':'action',
'Stables':'action',
'Steward':'action',
'Storeroom':'action',
'Swindler':'action',
'Thief':'action',
'Throne Room':'action',
'Torturer':'action',
'Tournament':'action',
'Trade Route':'action',
'Trading Post':'action',
'Transmute':'action',
'Treasure Map':'action',
'Treasury':'action',
'Tribute':'action',
'Trusty Steed':'action',
'University':'action',
'Upgrade':'action',
'Urchin':'action',
'Vagrant':'action',
'Vault':'action',
'Wandering Minstrel':'action',
'Warehouse':'action',
'Wishing Well':'action',
'Witch':'action',
'Young Witch':'action',
'Woodcutter':'action',
'Workshop':'action',
'Beggar':'reaction',
'Watchtower':'reaction',
'Horse Traders':'reaction',
'Moat':'reaction',
'Secret Chamber':'reaction',
'Trader':'reaction',
'Bank':'treasure',
'Cache':'treasure',
'Contraband':'treasure',
'Counterfeit':'treasure',
'Diadem':'treasure',
'Hoard':'treasure',
'Horn of Plenty':'treasure',
'Ill-Gotten Gains':'treasure',
'Loan':'treasure',
'Philosopher\'s Stone':'treasure',
'Platinum':'treasure',
'Potion':'treasure',
'Quarry':'treasure',
'Royal Seal':'treasure',
'Silver':'treasure',
'Spoils':'treasure',
'Stash':'treasure',
'Talisman':'treasure',
'Venture':'treasure',
'Colony':'victory',
'Duchy':'victory',
'Duke':'victory',
'Fairgrounds':'victory',
'Farmland':'victory',
'Feodum':'victory',
'Gardens':'victory',
'Province':'victory',
'Silk Road':'victory',
'Vineyard':'victory',
'Caravan':'duration',
'Haven':'duration',
'Lighthouse':'duration',
'Merchant Ship':'duration',
'Outpost':'duration',
'Tactician':'duration',
'Wharf':'duration',
'Survivors':'ruins',
'Ruins':'ruins',
'Dame Josephine':'action-victory',
'Great Hall':'action-victory',
'Nobles':'action-victory',
'Island':'action-victory',
'Harem':'treasure-victory',
'Hovel':'shelter-reaction',
'Necropolis':'action-shelter',
'Tunnel':'victory-reaction',
'victory point chips':'vp-chip',
'Curse':'curse',
}

var cards = Object.keys(types);
var reg = new RegExp(cards.sort(function(a,b){return b.length-a.length}).join('|'),'g');
function colorize(x) {
    return x.replace(reg,function (m) {var t = types[m]; return "<"+t+">"+m+"</"+t+">"});
}

var vpoint = {
'Estate':function() {return 1},
'Colony':function() {return 10},
'Duchy':function() {return 3},
'Duke':function(d) {return d.Dutchy ? d.Dutchy : 0;},
'Fairgrounds':function(d) {var s=0;for(var c in d){s++};return Math.floor(s/5)},
'Farmland':function() {return 2},
'Feodum':function(d) {return d.Silver ? Math.floor(d.Silver/3) : 0;},
'Gardens':function(d) {var s=0;for(var c in d){s+=d[c];};return Math.floor(s/10)},
'Province':function() {return 6},
'Silk Road':function(d) {var s=0;for(var c in d)if(types[c].matches(/victory/)){s+=d[c];};return Math.floor(s/4)},
'Vineyard':function(d) {var s=0;for(var c in d)if(types[c].matches(/action/)){s+=d[c];};return Math.floor(s/3)},
//'Overgrown Estate':function() {return 0},
'Dame Josephine':function() {return 2},
'Great Hall':function() {return 1},
'Nobles':function() {return 2},
'Island':function() {return 2},
'Harem':function() {return 2},
'Tunnel':function() {return 2},
'Curse':function() {return -1},
}
function vp_in_deck(deck) {
    var points = 0;
    for (var card in deck) if(vpoint[card]) {
	points += deck[card] * vpoint[card](deck);
    }
    return points;
}
