var users = require('./users');
var db = require('./db-config.js');

var gameHasEnded = false;
var currentPlayerStats = 0;
var teamBlack = [];
var teamWhite = [];
var subs = [];

/** Function back to FED, adds player to the array **/
exports.addPlayer = function(req, res) {
	var player = req.params.player;
	db.game.count(function(err, count) {
		if (count < 12) {
			db.users.find({
				name : player
			}, function(err, playerResult) {
				if (err || !playerResult) {
					console.log("Player not Found to put in team");
				} else {
					var attackD = playerResult[0].attack * 0.3;
					var defenseD = playerResult[0].defense * 0.3;
					var teamworkD = playerResult[0].teamwork * 0.1;
					var staminaD = playerResult[0].stamina * 0.2;
					var goalkeepingD = playerResult[0].goalkeeping * 0.1;
					var totalStat = Math.floor(attackD + defenseD + teamworkD + staminaD + goalkeepingD);
					db.game.update({
						name : player
					}, {
						name : player,
						score : totalStat
					}, {
						upsert : true
					}, function(err, playerAdded) {
						console.log("Player Added: ");
						res.send(true);
					});
				}
			});
		} else {
			console.log("Player was NOT added to team");
			res.send(false);
		}
	});
};
/** Function back to FED, adds Guest to the Team **/
exports.addGuest = function(req, res) {
	var guestObj = req.body;
	var player = guestObj.name;
	var skills = guestObj.skills;
	var addedBy = guestObj.addedBy;
	if (playerExists(player) == false && players.length < 12) {
		players.push(player + ' (' + skills + ') ' + ' (' + addedBy + ')');
		res.send(true);
	} else {
		res.send(false);
	}

};

//Initialize SUMmers
var sumWhite = 0;
var sumBlack = 0;

function makeGame(game, black, white, n, diff, subs) {
	//End of recursion
	if (n == -1) {
		//Place subs
		var q = 0;
		for (var i = 0; i < game.length; i++) {
			if (game[i].picked == false) {
				subs[q] = game[i].name;
				q++;
			}

		}
		return true;
	}
	//Try to pick random number to put in white
	for (var i = 0; i < game.length; i++) {
		//var rand = Math.floor((Math.random()*players.length));
		if (game[i].picked == false) {
			white[n] = game[i].name;
			//Increment white sum score
			sumWhite += game[i].score;
			//Mark this player
			game[i].picked = true;
			var toFind = Math.abs(sumWhite - sumBlack);
			//Run over array looking for matching player
			for (var j = 0; j < game.length; j++) {
				//If he's free
				if (game[j].picked == false) {
					//Mark this player && add score
					game[j].picked = true;
					sumBlack += game[j].score;
					black[n] = game[j].name;
					//If he's between +-5
					if ((toFind - diff) <= game[j].score && (toFind + diff) >= game[j].score && makeGame(game, black, white, n - 1, diff, subs)) {
						return true;
					} else {
						//Un-Mark this player and erase score
						game[j].picked = false;
						sumBlack -= game[j].score;
					}
				}
				//If the picked is true - do nothing
			}
			//Was unable to find someone for team Black (end of for loop)
			sumWhite -= game[i].score;
			game[i].picked = false;

		}
		//If picked was true for White team - do nothing

	}
	//Was unable to find someone for random - go up one level
	return false;

}

/** Function back to FED, removes player from the array **/
exports.removePlayer = function(req, res) {
	var player = req.params.player;
	db.game.remove({
		name : player
	}, function(err, removed) {
		if (err || !removed) {
			return false;
			console.log("Problem Removing");
		} else {
			return true;
			console.log("Player Removed: " + removed);
		}
	});
};

/** Function back to FED, List of Players **/
exports.listTeam = function(req, res) {

	db.game.find({}, {
		_id : 0
	}, function(err, result) {
		if (err || !result)
			console.log("Could not List Teams");
		else {
			var players = [];

			for (var i = 0; i < result.length; i++) {
				players[i] = result[i].name;
			}
			if (players.length < 10) {
				res.send(JSON.stringify(players));
			}
			//There are enough to make squads
			else {
				var teamObject = [];
				subs = [];

				var t = 4;

				//Makes a new array with Name and Score
				for (var i = 0; i < players.length; i++) {
					var playerName = players[i];
					var scoreFunc = 0;
					if (players[i].indexOf('(') > -1) {
						//We have a friend
						var indOne = playerName.indexOf('(');
						var indTwo = playerName.indexOf(')');
						scoreFunc = parseInt(playerName.substring(indOne + 1, indTwo)) * 10;
						playerName = players[i].substring(0, indOne);
					} else {
						//Not a friend - the result array holds scores.
						scoreFunc = result[i].score;

					}
					var newObj = {
						name : playerName,
						score : scoreFunc,
						picked : false
					};
					teamObject.push(newObj);
				}
				//Decides the initial Difference between the two teams
				var diff = 5;

				//Initial recursive call to makeGame()
				while (makeGame(teamObject, teamBlack, teamWhite, t, diff, subs) == false) {
					diff += 5;
					console.log(diff);
				}
				res.send(JSON.stringify([teamBlack, teamWhite, subs]));

			}
		}
	});

};

/**  Once game has ended **/
module.exports.gameEnded = function() {
	if (!gameHasEnded) {
		gameHasEnded = true;
		teamBlack = [];
		teamWhite = [];
		subs = [];
	}

};
