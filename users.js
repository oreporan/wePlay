//Call DB and fill Users
var db = require('./db-config.js');

//Restart DB Collections
//db.users.remove();
//db.game.remove();
/*
db.users.insert([{
	name : "Niv Funis",
	gamesPlayed : 0,
	motto : "",
	foot : 'R',
	attack : 72,
	defense : 63,
	teamwork : 77,
	goalkeeping : 71,
	stamina : 72
},{
	name : "Nir Lavee",
	gamesPlayed : 0,
	motto : "Nir's Motto",
	foot : 'R',
	attack : 94,
	defense : 72,
	teamwork : 66,
	goalkeeping : 77,
	stamina : 89
},{
	name : "Yahav Winkler",
	gamesPlayed : 0,
	motto : "Yahav's Motto",
	foot : 'R',
	picture : null,
	attack : 59,
	defense : 72,
	teamwork : 86,
	goalkeeping : 62,
	stamina : 70
},{
	name : "Ore Poran",
	gamesPlayed : 0,
	motto : "Be the best!",
	foot : 'Left',
	picture : null,
	attack : 67,
	defense : 61,
	teamwork : 70,
	goalkeeping : 64,
	stamina : 73
},{
	name : "Or Harel",
	gamesPlayed : 0,
	motto : "",
	foot : 'Right',
	picture : null,
	attack : 70,
	defense : 74,
	teamwork : 83,
	goalkeeping : 60,
	stamina : 90
},{
	name : "Ehud Eldan",
	gamesPlayed : 0,
	motto : "",
	foot : 'Right',
	picture : null,
	attack : 48,
	defense : 60,
	teamwork : 66,
	goalkeeping : 57,
	stamina : 76
},{
	name : "Asaf Ergas",
	gamesPlayed : 0,
	motto : "",
	foot : 'Left',
	picture : null,
	attack : 58,
	defense : 59,
	teamwork : 67,
	goalkeeping : 51,
	stamina : 81
},{
	name : "Yaniv Schuldenfrei",
	gamesPlayed : 0,
	motto : "",
	foot : 'Right',
	picture : null,
	attack : 67,
	defense : 81,
	teamwork : 79,
	goalkeeping : 77,
	stamina : 78
},{
	name : "Itai Rotschild",
	gamesPlayed : 0,
	motto : "",
	foot : 'Right',
	picture : null,
	attack : 75,
	defense : 65,
	teamwork : 72,
	goalkeeping : 68,
	stamina : 74
},{
	name : "Odi Weinberger",
	gamesPlayed : 0,
	motto : "",
	foot : 'Right',
	picture : null,
	attack : 70,
	defense : 66,
	teamwork : 61,
	goalkeeping : 60,
	stamina : 50
},{
	name : "Adar Neumann",
	gamesPlayed : 0,
	motto : "",
	foot : 'Right',
	picture : null,
	attack : 73,
	defense : 88,
	teamwork : 82,
	goalkeeping : 64,
	stamina : 89
},{
	name : "Tomer Honigman",
	gamesPlayed : 0,
	motto : "",
	foot : 'Right',
	picture : null,
	attack : 47,
	defense : 38,
	teamwork : 59,
	goalkeeping : 43,
	stamina : 38
}], function(err, saved) {
	if (err || !saved)
		console.log("Users not saved");
	else
		console.log("Users saved");
});
*/
var team = require('./team');
var bestPlayers = [0];

/** Function back to FED, adds player to the array **/
exports.logPlayer = function(req, res) {
	var player = req.params.player;
	db.users.findAndModify({query:{name:player},update:{$setOnInsert:{name : player, motto:"",foot:"Right",pic:null,gamesPlayed:0,attack:50,defense:50,teamwork:50,goalkeeping:50,stamina:50}},new:true,upsert:true},
	//The user was not added
	function(err,found){
		if(err || !found){
			console.log("Problem Logging in");
		}
		//Player was FOUND - so just log in or Sign up
		else{
			console.log("Player logged in");
			res.send(JSON.stringify(found));
		}
	});
	
};
/** Function back to FED, get the profiley **/
exports.getProfile = function(req, res) {
	var player = req.params.player;
	db.users.find({
		name : player
	}, function(err, thisPlayer) {
		if (err || !thisPlayer)
			console.log("No Such Player");
		else {
			res.send(JSON.stringify(thisPlayer[0]));
		}
	});
};


/** Edits the Profile - sends the new one **/
exports.incGamesPlayed = function(req, res) {

	//Counter has ended - to erase team
	team.gameEnded();

	var player = req.params.player;
	db.users.update({
		name : player
	},{$inc: {gamesPlayed:1}}, function(err, updated) {
		if (err || !updated)
			console.log("No Such Player");
		else {
			res.send(JSON.stringify(updated));
		}
	});
};

//Has this player been voted yet
function hasBeenVoted(player) {

	for (var i = 0; i < bestPlayers.length; i++) {
		if (bestPlayers[i].name == player) {
			return bestPlayers[i];
		}
	}
	return null;

}

//Who has the most votes for best player?
function findHighestVote() {
	var maxVotes = bestPlayers[1].votes;
	var maxName = bestPlayers[1].name;
	for (var i = 2; i < bestPlayers.length; i++) {
		if (bestPlayers[i].votes > maxVotes) {
			maxVotes = bestPlayers[i].votes;
			maxName = bestPlayers[i].name;
		}
	}
	return maxName;

}

/** Edits the Profile - sends the new one **/
exports.bestPlayer = function(req, res) {
	var player = req.params.player;
	if (bestPlayers[0] < 10) {
		//bestPlayers [numOfVotes,{name:Ore Poran,votes:3}...]
		bestPlayers[0]++;
		var voted = hasBeenVoted(player);
		if (voted != null) {
			voted.votes++;
		}
		//Newly voted Player
		else {
			bestPlayers.push({
				name : player,
				votes : 1
			});
		}
		if (bestPlayers[0] == 10) {
			var manOfMatch = findHighestVote();
			db.users.update({
		name : manOfMatch
	},{$inc: {attack:1,defense:1,teamwork:1,stamina:1,goalkeeping:1}}, function(err, updated) {
		if (err || !updated)
			console.log("No Such Player");
		else {
			res.send(JSON.stringify(updated));
			bestPlayers = [0];
		}
	});
		
				
			
		} else {
			res.send(JSON.stringify(bestPlayers));

		}

	}
	res.send(null);

};

/** Edits the Profile - sends the new one **/
exports.editProfile = function(req, res) {
	var toEdit = req.body;
	var player = toEdit.name;
	var newMotto = toEdit.motto;
	var newFoot = toEdit.foot;
	var newPic = toEdit.picture;
	db.users.findAndModify({query:{name : player},update:{$set: {motto:newMotto,foot:newFoot,pic:newPic}},upsert:true,new:true},
		function(err, updated) {
		if (err || !updated)
			console.log("No Such Player");
		else {
			res.send(JSON.stringify(updated));
			bestPlayers = [0];
		}
	});
};		



/** Deals with the profile Picture **/
exports.uploadPic = function(req, res) {

};

