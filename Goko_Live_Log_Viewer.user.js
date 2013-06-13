// ==UserScript==
// @name        Dominion Online Live Log Viewer
// @namespace   http://dom.retrobox.eu
// @description Dominion Online Live Log Viewer
// @include     http://play.goko.com/Dominion/gameClient.html
// @include     https://play.goko.com/Dominion/gameClient.html
// @require     http://dom.retrobox.eu/js/1.0.0/set_parser.js
// @run-at      document-end
// @grant       none
// @version     15
// ==/UserScript==
var foo = function () {
if (Dom.LogManager.prototype.old_addLog) {
    alert('More than one Dominion User Extension detected.\nPlease uninstall or disable one of them.');
    return;
}
var newLog = document.createElement('div');
var newLogText = '';
var newLogMode = -1;
var newLogPlayers = 0;
var newLogNames = {};
var newPhase = 'init';
var newPrevPhase = 'init';
var playerDecks = [];
var vpchips = [];
var playervp = [];
var possessed;
var newLogHide = true;
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
	    var j = h[1].match(/^(.*): turn (\d+)( \[possessed\])?$/);
	    if (j) {
		possessed = j[3] != undefined; 
		newLogMode = newLogNames[j[1]];
		if (parseInt(j[2]) > 4) vpLocked = true; // Stop VP tracker settings after turn 4
		newLogText += '<h1 class="p'+newLogMode+'">'+h[1]+'</h1>';
	    } else {
		if (h[1] == 'Game Setup') {
		    newLogText = '';
		    newLogMode = 0;
		    newLogPlayers = 0;
		    newLogNames = {};
		    playerDecks = [];
		    vpchips = [];
		    playervp = [];
		} else {
		    newLogMode = -1;
		}
		newLogText += '<h1>'+h[1]+'</h1>';
	    }
	} else {
	    if (newLogMode == 0) {
		var h = opt.text.match(/^(.*) - (starting cards: .*)/);
		if (h) {
		    newLogNames[h[1]] = ++newLogPlayers;
		    playerDecks[newLogNames[h[1]]] = {};
		    vpchips[newLogNames[h[1]]] = 0;
		    updateDeck(newLogNames[h[1]], h[2]);
		}
	    }
	    var h;
	    if (h = opt.text.match(/^(.*) - (([a-z]*).*)$/)) {
		var indent = false;
		if (newLogMode > 0) {
		    var initial = newPhase.substr(0,1).toUpperCase();
		    indent = h[3] != 'plays' && h[3] != 'buys' && newPrevPhase == newPhase;
		    if (newPrevPhase == newPhase) initial = '&nbsp;';
		    newPrevPhase = newPhase;
		    newLogText += '<span class="phase '+newPhase+'Phase">'+initial+'</span> ';
		    updateDeck(newLogNames[h[1]], h[2]);
		}
		newLogText += indent ? '<span class="indent">' : '<span>';
		if (newLogNames[h[1]] != newLogMode)
		    newLogText += '<span class="player p'+newLogNames[h[1]]+'">'+h[1]+'</span> ';
		newLogText += colorize(h[2]) + '</span><br>';
	    } else if (newLogMode == 0 && (h = opt.text.match(/^(Supply cards:)(.*)/))) {
		newLogText += h[1] + colorize(h[2]) + '<br>';
	    } else {
		newLogText += opt.text + '<br>';
	    }
	}
	newLogHide = false;
	newLogRefresh();
	var newLogContainer = document.getElementById("newlogcontainer");
	newLogContainer.scrollTop = newLogContainer.scrollHeight;
    }
    this.old_addLog(opt);
};
function newLogRefresh() {
	var goko_game = document.getElementById("goko-game");
	var goko_canvas = document.getElementById("myCanvas");
	if (newLogHide || goko_game.style.display == 'none') return;
	goko_game.setAttribute("style", 'margin-left:'+Math.floor(-window.innerWidth/2) + 'px !important');
	var goko_w = goko_canvas.offsetWidth;
	var goko_h = goko_canvas.offsetHeight;
	var w = window.innerWidth - goko_w;
	var t = goko_canvas.style.marginTop;
	newLog.setAttribute("style", "position:absolute; overflow:auto; left:"+goko_w+"px; width:"+w+"px; margin-top:"+t+"; height:"+goko_h+"px; background-color: white; z-index: -1");
	newLog.innerHTML = vp_div() + '<div id="newlogcontainer" style="overflow:auto;height:'+(goko_h-200)+'px;width:'+(w-10)+'px;padding:195px 5px 5px 5px">'+newLogText+"</div>";
}
window.addEventListener('resize', function() {
	setTimeout(newLogRefresh,100);
}, false);
function addStyle(style) {
var head = document.getElementsByTagName('head')[0];
var ele = head.appendChild(window.document.createElement('style'));
ele.innerHTML = style;
return ele;
}
{
var style = "\
.fs-launch-game-wrapper .header-bar .fs-rs-logout-row .fs-lg-settings-btn{\
height: 30px;\
line-height: 30px;\
text-decoration: none;\
text-align:center;\
position:relative;\
z-index: 1;\
font-size: 13px;\
font-weight: bold;\
color: #5baacb;\
cursor: pointer;\
font-family: \"TrajanPro\", san-serif;\
}\
div.newlog {\
font-size:12px;\
font-family:Helvetica, Arial;\
}\
table {\
margin: 1px 1px;\
}\
td {\
padding: 1px 4px;\
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
padding: 0px 3px;\
}\
span.indent {\
padding-left: 20px;\
}\
vp-chip\
 { background-color:rgb(0,0,0) ; border-radius: 4px; padding: 0px 3px;\
   color:rgb(255,255,255) ; }\
";
    var singletypes = {
    action: 'rgb(240,240,240)',
    'action-attack': 'rgb(240,240,240)',
    treasure: 'rgb(253,225,100)',
    'action-reaction': 'rgb(64,168,227)',
    'action-duration': 'rgb(254,143,78)',
    victory: 'rgb(146,193,125)',
    curse: 'rgb(215,138,219)',
    'action-ruins': 'rgb(150,104,51)',
    shelter: 'rgb(230,108,104)' };
    for (var i in singletypes)
	style += i + "{ background-color:"+singletypes[i]+"; border-radius: 4px; padding: 0px 3px;}";
    var doubletypes = {
	'treasure-victory': 'rgb(253,225,100), rgb(146,193,125)',
	'treasure-reaction': 'rgb(253,225,100), rgb(64,168,227)',
	'victory-reaction': 'rgb(146,193,125), rgb(64,168,227)',
	'shelter-reaction': 'rgb(230,108,104), rgb(64,168,227)',
	'action-shelter': 'rgb(240,240,240), rgb(230,108,104)',
	'shelter-victory': 'rgb(230,108,104), rgb(146,193,125)',
	'action-victory': 'rgb(240,240,240), rgb(146,193,125)',
    }
    for (var i in doubletypes)
	style += i + "\
{ background: -moz-linear-gradient(top, "+doubletypes[i]+");\
  background: -webkit-linear-gradient(top, "+doubletypes[i]+");\
  background: -o-linear-gradient(top, "+doubletypes[i]+");\
  background: -ms-linear-gradient(top, "+doubletypes[i]+");\
  background: linear-gradient(top, "+doubletypes[i]+"); border-radius: 6px; padding: 0px 3px;}";
    addStyle(style);
}
var types = {
'Border Village':'action',
'Farming Village':'action',
'Mining Village':'action',
'Native Village':'action',
'Walled Village':'action',
'Worker\'s Village':'action',
'Ruined Village':'action-ruins',
'Fishing Village':'action-duration',
'Village':'action',
'Ruined Library':'action-ruins',
'Library':'action',
'Abandoned Mine':'action-ruins',
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
'Ruined Market':'action-ruins',
'Grand Market':'action',
'Black Market':'action',
'Market Square':'action-reaction',
'Market':'action',
'Adventurer':'action',
'Alchemist':'action',
'Altar':'action',
'Ambassador':'action-attack',
'Apothecary':'action',
'Apprentice':'action',
'Armory':'action',
'Band of Misfits':'action',
'Bandit Camp':'action',
'Baron':'action',
'Bazaar':'action',
'Bishop':'action',
'Bridge':'action',
'Bureaucrat':'action-attack',
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
'Cultist':'action-attack',
'Cutpurse':'action-attack',
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
'Familiar':'action-attack',
'Feast':'action',
'Festival':'action',
'Followers':'action-attack',
'Forager':'action',
'Forge':'action',
'Fortress':'action',
'Fortune Teller':'action-attack',
'Ghost Ship':'action-attack',
'Golem':'action',
'Goons':'action-attack',
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
'Jester':'action-attack',
'Junk Dealer':'action',
'King\'s Court':'action',
'Knights':'action-attack',
'Laboratory':'action',
'Lookout':'action',
'Madman':'action',
'Mandarin':'action',
'Marauder':'action-attack',
'Margrave':'action-attack',
'Masquerade':'action',
'Menagerie':'action',
'Mercenary':'action-attack',
'Militia':'action-attack',
'Minion':'action-attack',
'Mint':'action',
'Moneylender':'action',
'Monument':'action',
'Mountebank':'action-attack',
'Mystic':'action',
'Navigator':'action',
'Noble Brigand':'action-attack',
'Nomad Camp':'action',
'Oasis':'action',
'Oracle':'action-attack',
'Pawn':'action',
'Pearl Diver':'action',
'Peddler':'action',
'Pillage':'action-attack',
'Pirate Ship':'action-attack',
'Poor House':'action',
'Possession':'action',
'Princess':'action',
'Procession':'action',
'Rabble':'action-attack',
'Rats':'action',
'Rebuild':'action',
'Remake':'action',
'Remodel':'action',
'Rogue':'action',
'Saboteur':'action-attack',
'Sage':'action',
'Salvager':'action',
'Scavenger':'action',
'Scheme':'action',
'Scout':'action',
'Scrying Pool':'action-attack',
'Sea Hag':'action-attack',
'Shanty Town':'action',
'Sir Bailey':'action',
'Sir Destry':'action',
'Sir Martin':'action',
'Sir Michael':'action',
'Sir Vander':'action',
'Smithy':'action',
'Smugglers':'action',
'Spice Merchant':'action',
'Spy':'action-attack',
'Squire':'action',
'Stables':'action',
'Steward':'action',
'Storeroom':'action',
'Swindler':'action-attack',
'Thief':'action-attack',
'Throne Room':'action',
'Torturer':'action-attack',
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
'Urchin':'action-attack',
'Vagrant':'action',
'Vault':'action',
'Wandering Minstrel':'action',
'Warehouse':'action',
'Wishing Well':'action',
'Witch':'action-attack',
'Young Witch':'action-attack',
'Woodcutter':'action',
'Workshop':'action',
'Beggar':'action-reaction',
'Watchtower':'action-reaction',
'Horse Traders':'action-reaction',
'Moat':'action-reaction',
'Secret Chamber':'action-reaction',
'Trader':'action-reaction',
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
'Caravan':'action-duration',
'Haven':'action-duration',
'Lighthouse':'action-duration',
'Merchant Ship':'action-duration',
'Outpost':'action-duration',
'Tactician':'action-duration',
'Wharf':'action-duration',
'Survivors':'action-ruins',
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
'Candlestick Maker':'action',
'Stonemason':'action',
'Doctor':'action',
'Masterpiece':'treasure',
'Advisor':'action',
'Herald':'action',
'Plaza':'action',
'Taxman':'action-attack',
'Baker':'action',
'Butcher':'action',
'Journeyman':'action',
'Merchant Guild':'action',
'Soothsayer':'action-attack',
}

var fixnames = { 'JackOfAllTrades':'Jack of All Trades' };
function fixname(n) { return fixnames[n] || n; }

var cards = Object.keys(types);
var reg = new RegExp(cards.sort(function(a,b){return b.length-a.length}).join('|'),'g');
function colorize(x) {
    return x.replace(reg,function (m) {var t = types[m]; return "<"+t+">"+fixname(m)+"</"+t+">"});
}

var vpoint = {
'Estate':function() {return 1},
'Colony':function() {return 10},
'Duchy':function() {return 3},
'Duke':function(d) {return d.Duchy || 0},
'Fairgrounds':function(d) {var s=0;for(var c in d)s++;return 2*Math.floor(s/5)},
'Farmland':function() {return 2},
'Feodum':function(d) {return Math.floor((d.Silver || 0)/3)},
'Gardens':function(d) {var s=0;for(var c in d)s+=d[c];return Math.floor(s/10)},
'Province':function() {return 6},
'Silk Road':function(d) {var s=0;for(var c in d)if(types[c].match(/victory/))s+=d[c];return Math.floor(s/4)},
'Vineyard':function(d) {var s=0;for(var c in d)if(types[c].match(/\baction/))s+=d[c];return Math.floor(s/3)},
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
function updateCards(player, cards, v) {
    for (var i = 0; i < cards.length; i++) {
	playerDecks[player][cards[i]] = playerDecks[player][cards[i]] ?
	    playerDecks[player][cards[i]] + v : v;
	if (playerDecks[player][cards[i]] <= 0)
	    delete playerDecks[player][cards[i]];
    }
    playervp[player] = vpchips[player] + vp_in_deck(playerDecks[player]);
}
function updateDeck(player, action) {
    var h;
    if (h = action.match(/^returns (.*) to the Supply$/)) {
	updateCards(player, [h[1]], -1);
    } else if (h = action.match(/^gains (.*)/)) {
	updateCards(player, [h[1]], 1);
    } else if (h = action.match(/^trashes (.*)/)) {
	if (possessed && player == newLogMode) return;
	updateCards(player, h[1].split(', ').filter(function(c){return c != "Fortress"}), -1);
    } else if (h = action.match(/^starting cards: (.*)/)) {
	updateCards(player, h[1].split(', '), 1);
/* live log does not have passed card names
    } else if (h = action.match(/^passes (.*)/)) {
	updateCards(player, [h[1]], -1);
	updateCards(player == newLogPlayers ? 1 : player + 1, [h[1]], 1);
*/
    } else if (h = action.match(/^receives ([0-9]*) victory point chips$/)) {
	vpchips[player]+=+h[1];
	updateCards(player, []);
    } else if (h = action.match(/^plays Bishop$/)) {
	vpchips[player]++;
	updateCards(player, []);
    } else if (h = action.match(/^plays (Spoils|Madman)$/)) {
	updateCards(player, [h[1]], -1);
    }
}

function updateDeckMasq(src_player, dst_player, card) {
    if (!card || !src_player || !dst_player) return;
    console.log('passed: '+card+' from '+src_player+' to '+dst_player);
    updateCards(src_player, [card], -1);
    updateCards(dst_player, [card], 1);
}
function canonizeName(n) {
    return n.toLowerCase().replace(/\W+/g,'');
}

function decodeCard(name) {
    var n = name.toLowerCase().replace(/\.\d+$/,'');
    for (var i in types)
	if (canonizeName(i) == n)
	    return i;
    return undefined;
}
var vpOn = false;
var vpLocked = false;
function vp_div() {
    if (!vpOn) return '';
    var ret = '<div style="position:absolute;padding:2px;background-color:gray"><table>';
    var p = Object.keys(newLogNames);
    p.sort(function(a,b){
	var pa = newLogNames[a];
	var pb = newLogNames[b];
	if (playervp[pa] != playervp[pb]) return playervp[pb] - playervp[pa];
	return pb - pa;
    });
    for (var i = 0; i < p.length; i++) {
	var pn = newLogNames[p[i]];
	ret += '<tr class="p'+pn+'"><td>'+p[i] + '</td><td>'+ playervp[pn] + '</td></tr>';
    }
    ret += '</table></div>';
    return ret;
}
function vp_txt() {
    var ret = [];
    var p = Object.keys(newLogNames);
    for (var i = 0; i < p.length; i++)
	ret.push(p[i] + ': '+ playervp[newLogNames[p[i]]]);
    return ret.sort().join(', ');
}
Dom.DominionWindow.prototype._old_moveCards = Dom.DominionWindow.prototype._moveCards;
Dom.DominionWindow.prototype._moveCards = function(options, callback) {
    var m = options.moves;
    try {
    for (var i = 0; i < m.length; i++) {
	if (m[i].source.area.name == 'reveal' && m[i].destination.area.name == 'hand' &&
	    m[i].source.area.playerIndex != m[i].destination.area.playerIndex) {
	    updateDeckMasq(m[i].source.area.playerIndex+1, m[i].destination.area.playerIndex+1,
			decodeCard(m[i].sourceCard));
	}
    }
    } catch (e) { console.log('exception: ' + e); }
    this._old_moveCards(options, callback);
}

var old_onIncomingMessage = DominionClient.prototype.onIncomingMessage;
DominionClient.prototype.onIncomingMessage = function(messageName, messageData, message) {
    try {
//    if (messageName != 'messageGroup' && messageName != 'gamePingMessage')
//	console.log(messageName + JSON.stringify(messageData));
    if (messageName == 'RoomChat') {
	if (messageData.text.toUpperCase() == '#VPOFF' && (vpOn || !vpLocked)) {
	    if (vpLocked) {
		this.clientConnection.send('sendChat',{text:'Victory Point tracker setting locked'});
	    } else {
		this.clientConnection.send('sendChat',{text:'Victory Point tracker disallowed'});
		vpOn = false;
		vpLocked = true;
	    }
	} else if (messageData.text.toUpperCase() == '#VPON' && !vpOn) {
	    if (vpLocked) {
		this.clientConnection.send('sendChat',{text:'Victory Point tracker setting locked'});
	    } else {
		this.clientConnection.send('sendChat',{text:'Victory Point tracker enabled (see http://dom.retrobox.eu/vp.html)'});
		vpOn = true;
	    }
	} else if (messageData.text.toUpperCase() == '#VP?' && vpOn) {
	    this.clientConnection.send('sendChat',{text:'Current points: ' + vp_txt()});
	}
    } else if (messageName == 'addLog' && messageData.text == '------------ Game Setup ------------') {
	vpOn = false;
	vpLocked = false;
	var tablename = JSON.parse(this.table.get("settings")).name;
	if (tablename) {
	    tablename = tablename.toUpperCase();
	    if (tablename.indexOf("#VPON") != -1) {
		this.clientConnection.send('sendChat',{text:'Victory Point tracker enabled (see http://dom.retrobox.eu/vp.html)'});
		vpOn = true;
		vpLocked = true;
	    } else if (tablename.indexOf("#VPOFF") != -1) {
		vpOn = false;
		vpLocked = true;
	    }
	}
    } else if (messageName == 'addLog' && messageData.text == 'Rating system: adventure' && options.adventurevp) {
	vpOn = true;
    }
    } catch (e) {
	console.log('exception :' + e);
    }
    old_onIncomingMessage.call(this, messageName, messageData, message);
}

//
// Custom avatar module
//
var myCanvas = document.createElement("canvas");
var myContext = myCanvas.getContext("2d");
Goko.Player.old_AvatarLoader = Goko.Player.AvatarLoader;
Goko.Player.AvatarLoader = function(userdata,callback) {
	function loadImage() {
	    var img = new Image();
	    var img2 = new Image();
	    img.onerror = img2.onerror = function() {
		Goko.Player.old_AvatarLoader(userdata,callback);
	    };
	    img.onload = function() {
		try {
		    var size = [50,100,256][userdata.which];
		    myCanvas.width = size;
		    myCanvas.height = size;
		    myContext.drawImage(img, 0, 0, img.width, img.height, 0, 0, size, size);
		    img2.onload = function() {callback(img2)};
		    img2.src = myCanvas.toDataURL("image/png");
		} catch (e) {
		    alert(e.toString());
		    Goko.Player.old_AvatarLoader(userdata,callback);
		}
	    };
	    img.crossOrigin = "Anonymous";
	    img.src = "http://dom.retrobox.eu/avatars/"+userdata.player.id+".png";
	}
	if (userdata.which < 3) {
	    loadImage();
	} else {
	    Goko.Player.old_AvatarLoader(userdata,callback);
	}
}
Goko.Player.preloader=function(ids,which) {}

FS.Templates.LaunchScreen.MAIN = FS.Templates.LaunchScreen.MAIN.replace('<div id="fs-player-pad-avatar"',
'<div style="display:none"><form id="uploadAvatarForm" method="post" action="http://dom.retrobox.eu/setavatar.php"><input type="text" id="uploadAvatarId" name="id" value="x"/></form></div>'+
'<div id="fs-player-pad-avatar" onClick="'+
'document.getElementById(\'uploadAvatarId\').setAttribute(\'value\',Goko.ObjectCache.getInstance().conn.connInfo.playerId);'+
'document.getElementById(\'uploadAvatarForm\').submit();'+
'"');

//
// Saving table name module
//
FS.EditTableView.prototype.old_modifyDOM = FS.EditTableView.prototype.modifyDOM;
FS.EditTableView.prototype.modifyDOM = function () {
    var create = !_.isNumber(this.tableIndex);
    var lasttablename = this.$tableName.val() || options.lasttablename;
    options.lasttablename = lasttablename;
    options_save();
    FS.EditTableView.prototype.old_modifyDOM.call(this);
    if (create && lasttablename)
	this.$tableName.val(lasttablename);
}

//
// Saving other table settings between sessions
//
var firstCreateTable = true;
FS.DominionEditTableView.prototype.old_modifyDOM = FS.DominionEditTableView.prototype.modifyDOM;
FS.DominionEditTableView.prototype.modifyDOM = function () {
    var create = !_.isNumber(this.tableIndex);
    if (create && firstCreateTable) {
	if (options.cacheSettings) this.cacheSettings = options.cacheSettings;
	firstCreateTable = false;
    }
    FS.DominionEditTableView.prototype.old_modifyDOM.call(this);
}

FS.DominionEditTableView.prototype.old_retriveDOM = FS.DominionEditTableView.prototype.retriveDOM;
FS.DominionEditTableView.prototype.retriveDOM = function () {
    var ret = FS.DominionEditTableView.prototype.old_retriveDOM.call(this);
    if (ret) {
	options.cacheSettings = this.cacheSettings;
	options_save();
    }
    return ret;
}


//
// Kingdom generator module
//
var hideKingdomGenerator = false;
FS.DominionEditTableView.prototype._old_renderRandomDeck = FS.DominionEditTableView.prototype._renderRandomDeck;
FS.DominionEditTableView.prototype._renderRandomDeck = function () {
    if (this.ratingType == 'pro') hideKingdomGenerator = true;
    this._old_renderRandomDeck();
}

var setsComp = {
cellar:"B2",chapel:"B2",moat:"B2",
chancellor:"B3",village:"B3",woodcutter:"B3",workshop:"B3",
bureaucrat:"B4",feast:"B4",gardens:"B4",militia:"B4",moneylender:"B4",remodel:"B4",smithy:"B4",spy:"B4",thief:"B4",throneroom:"B4",
councilroom:"B5",festival:"B5",laboratory:"B5",library:"B5",market:"B5",mine:"B5",witch:"B5",
adventurer:"B6",
courtyard:"I2",pawn:"I2",secretchamber:"I2",
greathall:"I3",masquerade:"I3",shantytown:"I3",steward:"I3",swindler:"I3",wishingwell:"I3",
baron:"I4",bridge:"I4",conspirator:"I4",coppersmith:"I4",ironworks:"I4",miningvillage:"I4",scout:"I4",
duke:"I5",minion:"I5",saboteur:"I5",torturer:"I5",tradingpost:"I5",tribute:"I5",upgrade:"I5",
harem:"I6",nobles:"I6",
embargo:"S2",haven:"S2",lighthouse:"S2",nativevillage:"S2",pearldiver:"S2",
ambassador:"S3",fishingvillage:"S3",lookout:"S3",smugglers:"S3",warehouse:"S3",
caravan:"S4",cutpurse:"S4",island:"S4",navigator:"S4",pirateship:"S4",salvager:"S4",seahag:"S4",treasuremap:"S4",
bazaar:"S5",explorer:"S5",ghostship:"S5",merchantship:"S5",outpost:"S5",tactician:"S5",treasury:"S5",wharf:"S5",
herbalist:"A2",
apprentice:"A5",
transmute:"Ap",vineyard:"Ap",
apothecary:"Ap",scryingpool:"Ap",university:"Ap",
alchemist:"Ap",familiar:"Ap",philosophersstone:"Ap",
golem:"Ap",
possession:"Ap",
loan:"P3",traderoute:"P3",watchtower:"P3",
bishop:"P4",monument:"P4",quarry:"P4",talisman:"P4",workervillage:"P4",
city:"P5",contraband:"P5",countinghouse:"P5",mint:"P5",mountebank:"P5",rabble:"P5",royalseal:"P5",vault:"P5",venture:"P5",
goons:"P6",grandmarket:"P6",hoard:"P6",
bank:"P7",expand:"P7",forge:"P7",kingscourt:"P7",
peddler:"P8",
hamlet:"C2",
fortuneteller:"C3",menagerie:"C3",
farmingvillage:"C4",horsetraders:"C4",remake:"C4",tournament:"C4",youngwitch:"C4",
harvest:"C5",hornofplenty:"C5",huntingparty:"C5",jester:"C5",
fairgrounds:"C6",
crossroads:"H2",duchess:"H2",foolsgold:"H2",
develop:"H3",oasis:"H3",oracle:"H3",scheme:"H3",tunnel:"H3",
jackofalltrades:"H4",noblebrigand:"H4",nomadcamp:"H4",silkroad:"H4",spicemerchant:"H4",trader:"H4",
cache:"H5",cartographer:"H5",embassy:"H5",haggler:"H5",highway:"H5",illgottengains:"H5",inn:"H5",mandarin:"H5",margrave:"H5",stables:"H5",
bordervillage:"H6",farmland:"H6",
poorhouse:"D1",
beggar:"D2",squire:"D2",vagrant:"D2",
forager:"D3",hermit:"D3",marketsquare:"D3",sage:"D3",storeroom:"D3",urchin:"D3",
armory:"D4",deathcart:"D4",feodum:"D4",fortress:"D4",ironmonger:"D4",marauder:"D4",procession:"D4",rats:"D4",scavenger:"D4",wanderingminstrel:"D4",
bandofmisfits:"D5",banditcamp:"D5",catacombs:"D5",count:"D5",counterfeit:"D5",cultist:"D5",graverobber:"D5",junkdealer:"D5",knights:"D5",mystic:"D5",pillage:"D5",rebuild:"D5",rogue:"D5",
altar:"D6",huntinggrounds:"D6",
blackmarket:"X3",
envoy:"X4",walledvillage:"X4",
governor:"X5",stash:"X5",
candlestickmaker:"G2",stonemason:"G2",
doctor:"G3",masterpiece:"G3",
advisor:"G4",herald:"G4",plaza:"G4",taxman:"G4",
baker:"G5",butcher:"G5",journeyman:"G5",merchantguild:"G5",soothsayer:"G5",
};
var setNames = {
    '1':'cost1',
    '2':'cost2',
    '3':'cost3',
    '4':'cost4',
    '5':'cost5',
    '6':'cost6',
    '7':'cost7',
    '8':'cost8',
    'p':'costpotion',
    'B':'baseset',
    'I':'intrigue',
    'S':'seaside',
    'A':'alchemy',
    'P':'prosperity',
    'C':'cornucopia',
    'H':'hinterlands',
    'D':'darkages',
    'X':'promos',
    'G':'guilds',
};
var sets = {};

function buildSets() {
    sets.all = {};
    for(var c in setNames) sets[setNames[c]] = {};
    for(var c in setsComp) {
	var t = setsComp[c];
	sets[c] = {}; sets[c][c] = 1;
	sets.all[c] = 1;
	for(var i = 0; i<t.length; i++) {
	    sets[setNames[t[i]]][c] = 1;
	}
    }
    for(var c in types) {
	var n = canonizeName(c);
	if (n in setsComp) {
	    var t = types[c].split('-');
	    for (var i = 0; i <t.length; i++) {
		if (sets[t[i]] === undefined) sets[t[i]] = {};
		sets[t[i]][n] = 1;
	    }
	}
    }
}
buildSets();

function myBuildCard(avail, except, set) {
    var sum = 0;
    for (var c in set) if (avail[c] && !except[c]) sum += set[c];
    if (!sum) return null;
    var rnd = Math.random() * sum;
    for (var c in set) if (avail[c] && !except[c]) {
	rnd -= set[c];
	if (rnd < 0) return c;
    }
    return c;
}
function myBuildDeck(avail, s) {
    var chosen = {};
    var deck = new Array(11);
    for (var i = 0; i < 11; i++) {
	if (i == 10) {
	    if (!chosen.youngwitch) break;
	    for (var c in avail) if (!sets.cost2[c] && !sets.cost3[c]) chosen[c] = true;
	}
	var cs = s[i < s.length ? i : s.length - 1];
	var card = myBuildCard(avail, chosen, cs);
	if (!card) return null;
	chosen[card] = true;
	deck[i] = avail[card];
    }
    return deck;
}
var kingdomsel = function(val) {
    this.sel = document.createElement('div');
    this.sel.setAttribute("style", "position:absolute;display:none;left:0px;top:0px;height:100%;width:100%;background:rgba(0,0,0,0.5);z-index:6000;");
    this.sel.setAttribute("class", "newlog");
    this.sel.innerHTML = '<div style="text-align:center;position:absolute;top:50%;left:50%;height:100px;margin-top:-50px;width:80%;margin-left:-40%;background:white;"><div style="margin-top:20px">Select a kingdom (see <a target="_blank" href="http://dom.retrobox.eu/kingdomgenerator.html">instructions</a>):<br><form id="selform"><input id="selval" style="width:95%"><br><input type="submit" value="OK"></form></div></div>';
    document.getElementById('viewport').appendChild(this.sel);
    this.selform = document.getElementById('selform');
    this.selval = document.getElementById('selval');
    this.selval.value = 'All';
}
kingdomsel.prototype = {
    prompt: function(callback) {
	var self = this;
	this.sel.style.display = 'block';
	this.selval.select();
	this.selform.onsubmit = function () {
	    callback(this.selval.value);
	    self.sel.style.display = 'none';
	    self.selform.onsubmit = null;
	    return false;
	};
    }
}
//document.addEventListener ('DOMContentLoaded', function() {
    var myCachedCards;
    var sel = new kingdomsel('All');
    if(FS.Dominion.DeckBuilder.Persistent.prototype._old_proRandomMethod) return;
    FS.Dominion.DeckBuilder.Persistent.prototype._old_proRandomMethod =
    FS.Dominion.DeckBuilder.Persistent.prototype._proRandomMethod;
    FS.Dominion.DeckBuilder.Persistent.prototype._proRandomMethod = function(cachedCards, exceptCards, numberCards) {
	myCachedCards = cachedCards;
	var ret = this._old_proRandomMethod(cachedCards, exceptCards, numberCards);
	return ret;
    }
    FS.Dominion.DeckBuilder.Persistent.prototype._old_getRandomCards =
    FS.Dominion.DeckBuilder.Persistent.prototype.getRandomCards;
    FS.Dominion.DeckBuilder.Persistent.prototype.getRandomCards = function (opts, callback) {
	this._old_getRandomCards(opts,function (x) {
	    if (options.generator && !hideKingdomGenerator && opts.useEternalGenerateMethod) {
		sel.prompt(function (val) {
		    try {
			var all = {};
			myCachedCards.each(function (c) {all[c.get('nameId').toLowerCase()] = c.toJSON()});
			var myret = myBuildDeck(all, set_parser.parse(val));
			if (myret) x = myret;
			else throw new Error('Cannot generate specified kingdom from the cards availiable');
		    } catch(e) {alert(e)};
		    callback(x);
		});
	    } else callback(x);
	    hideKingdomGenerator = false;
	});
    }
window.canonizeName = canonizeName;
window.sets = sets;
//});

//
// Auto kick module
//
// Goko dependencies:
//   - getRating API specifics ($elPro and $elQuit trigger getting the pro ranking)
//   - onPlayerJoinTable API
//   - lot of other APIs (bootTable, table settings, isLocalOwner)
// Internal dependencies: enabled by options.autokick
//
joinSound = document.createElement('div');
joinSound.innerHTML = '<audio id="_joinSound" style="display: none;" src="sounds/startTurn.ogg"></audio>';
document.getElementById('viewport').appendChild(joinSound);
FS.ZoneClassicHelper.prototype.old_onPlayerJoinTable =
FS.ZoneClassicHelper.prototype.onPlayerJoinTable;
FS.ZoneClassicHelper.prototype.onPlayerJoinTable = function (t,tp) {
    this.old_onPlayerJoinTable(t,tp);
    if (options.autokick && this.isLocalOwner(t)) {
	var p = tp.get('player');
	var settings = JSON.parse(t.get("settings"));
	var pro = settings.ratingType == 'pro';
	var m = settings.name.toLowerCase().match(/\b(\d+)(\d{3}|k)\+/);
	var mr = null;
	if (m) mr = parseInt(m[1],10) * 1000 + (m[2] == 'k' ? 0 : parseInt(m[2],10));
	var ratingHelper = this.meetingRoom.getHelper('RatingHelper');
	var self = this;
	if (mr) ratingHelper.getRating({
	    playerId: p.get("playerId"),
	    $elPro: $(document.createElement('div')),
	    $elQuit: $(document.createElement('div'))
	}, function (resp) {
	    if (!resp.data) return;
	    var r = pro ? resp.data.ratingPro : resp.data.rank;
	    if (r != undefined && r < mr) self.meetingRoom.conn.bootTable({
		table: t.get('number'),
		playerAddress: p.get('playerAddress')
	    }); else document.getElementById('_joinSound').play();
	});
    }
}

//
// Lobby ratings module
//
// Goko dependencies:
// - getRating API specifics ($elPro and $elQuit trigger getting the pro ranking)
// - class name of the player list rank element ('player-rank')
// - format of the text content of the player list element ('username Rating: 1000')
// Internal dependencies:
// - pro rating display enabled by options.proranks
// - sort by rating enabled by options.sortrating
// - insertInPlace()
// - getRatingObject()
//

FS.RatingHelper.prototype.old_getRating =
FS.RatingHelper.prototype.getRating;
FS.RatingHelper.prototype.getRating = function (opts, callback) {
    var newCallback = callback;
    if (opts.$el && opts.$el.hasClass('player-rank')) {
	if (options.sortrating) {
	    var playerElement = opts.$el.closest('li')[0];
	    newCallback = function () {
		callback();
		insertInPlace(playerElement);
	    };
	}
	if (options.proranks) {
	    opts.$elPro = opts.$el;
	    opts.$elQuit = $(document.createElement('div'));
	    delete opts.$el;
	}
    }
    this.old_getRating(opts, newCallback);
};

FS.ClassicRoomView.prototype.old_modifyDOM =
FS.ClassicRoomView.prototype.modifyDOM;
FS.ClassicRoomView.prototype.modifyDOM = function () {
    var originalRating = this.meetingRoom.options.ratingSystemId;
    if (options.proranks)
        this.meetingRoom.options.ratingSystemId = FS.MeetingRoomSetting.ratingSystemPro;
    FS.ClassicRoomView.prototype.old_modifyDOM.call(this);
    this.meetingRoom.options.ratingSystemId = originalRating;
};

function insertInPlace(element) {
    var list = element.parentNode;
    if (!list) return; // Removed from the list before the ranking came
    list.removeChild(element);

    var newEl = getSortablePlayerObjectFromElement(element),
        elements = list.children,
        b = elements.length,
        a = 0;

    while (a !== b) {
        var c = Math.floor((a+b)/2);
        var compare = getSortablePlayerObjectFromElement(elements[c]);

        // sort first by rating, then alphabetically
        if (compare.rating < newEl.rating || compare.rating === newEl.rating && compare.name > newEl.name) {
            b = c;
        } else {
            a = c + 1;
        }
    }
    list.insertBefore(element,elements[a] || null);
}

function getSortablePlayerObjectFromElement(element) {
    var rankSpan = element.querySelector('.player-rank>span');
    return {
        name: element.querySelector('.fs-mtrm-player-name>strong').innerHTML,
        rating: rankSpan ? parseInt(rankSpan.innerHTML,10) : -1
    };
}

//
// Configuration module
//
// Exports: 'options' object, options_save function.
// Goko dependencies:
//   - Format of the main screen layout template: FS.Templates.LaunchScreen.MAIN
// Internal dependencies: none
//
var default_options = {
    version: 1,
    autokick: true,
    generator: true,
    proranks: true,
    sortrating: true,
    adventurevp: true,
};
var options = {};
function options_save() {
    localStorage.userOptions = JSON.stringify(options);
}
function options_load() {
    if (localStorage.userOptions)
	options = JSON.parse(localStorage.userOptions);
    for (var o in default_options)
	if (!(o in options)) options[o] = default_options[o];
}
function options_window() {
    var h;
    var optwin;
    optwin = document.createElement('div');
    optwin.setAttribute("style", "position:absolute;display:none;left:0px;top:0px;height:100%;width:100%;background:rgba(0,0,0,0.5);z-index:6000;");
    optwin.setAttribute("class", "newlog");
    optwin.setAttribute("id", "usersettings");
    h = '<div style="text-align:center;position:absolute;top:50%;left:50%;height:300px;margin-top:-150px;width:40%;margin-left:-20%;background:white;"><div style="margin-top:20px">';
    h+= 'User extension settings:<br>';
    h+= '<form style="margin:10px;text-align:left" id="optform">';
    h+= '<input name="autokick" type="checkbox">Auto kick<br>';
    h+= '<input name="generator" type="checkbox">Kingdom generator (see <a target="_blank" href="http://dom.retrobox.eu/kingdomgenerator.html">instructions</a>)<br>';
    h+= '<input name="proranks" type="checkbox">Show pro rankings in the lobby<br>';
    h+= '<input name="sort-rating" type="checkbox">Sort players by rating<br>';
    h+= '<input name="adventurevp" type="checkbox">Victory point tracker in Adventures<br>';
//    h+= '<input name="opt" style="width:95%"><br>';
    h+= '<div style="align:center;text-align:center"><input type="submit" value="Save"></div></form>';
    h+= '</div></div>';
    optwin.innerHTML = h;
    document.getElementById('viewport').appendChild(optwin);
//    $('#optform input[name="opt"]').val('Aha');
    $('#optform input[name="autokick"]').prop('checked',options.autokick);
    $('#optform input[name="generator"]').prop('checked',options.generator);
    $('#optform input[name="proranks"]').prop('checked',options.proranks);
    $('#optform input[name="sort-rating"]').prop('checked',options.sortrating);
    $('#optform input[name="adventurevp"]').prop('checked',options.adventurevp);
    document.getElementById('optform').onsubmit = function () {
	options.autokick = $('#optform input[name="autokick"]').prop('checked');
	options.generator = $('#optform input[name="generator"]').prop('checked');
	options.proranks = $('#optform input[name="proranks"]').prop('checked');
	options.sortrating = $('#optform input[name="sort-rating"]').prop('checked'); 
	options.adventurevp = $('#optform input[name="adventurevp"]').prop('checked'); 
	options_save();
	$('#usersettings').hide();
	return false;
    };
}
options_load();
options_window();
FS.Templates.LaunchScreen.MAIN = FS.Templates.LaunchScreen.MAIN.replace('Logout</a>',
'Logout</a><div onClick="$(\'#usersettings\').show()" class="fs-lg-settings-btn">User Settings</div>');

};

if (navigator.userAgent.indexOf('Firefox') >= 0) {
    document.addEventListener ('DOMContentLoaded', foo);
} else {
    var runInPageContext = function(fn) {
	var script = document.createElement('script');
	script.src = 'http://dom.retrobox.eu/js/1.0.0/set_parser.js';
	document.body.appendChild(script);
	script = document.createElement('script');
	script.textContent = '('+ fn +')();';
	document.body.appendChild(script);
    }
    runInPageContext(foo);
}
