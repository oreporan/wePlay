$('#myGamesPage').live('pageshow', showStatus);
$('#loginUser').click(userLogin);
$('#statusPage').live('pageshow', function() {
	$('.userNameHeader').html('Not ' + localStorage.getItem('first') + ' ?');
});

//Skip Login
var firstName = localStorage.getItem('first');
if (firstName != null) {
	var name = firstName + " " + localStorage.getItem('last');
	userLoginDB(name);
	window.location.href = "#statusPage";
} else {
	window.location.href = "#loginPage";
}

/** Logs in the User, takes name from form, sends to DB, if user exists returns true, if he didnt returns false **/
function userLogin() {

	//Take care of Attending (new user or different than last)
	if (localStorage.getItem('attending') == null || localStorage.getItem('first') != $('#firstName').val()) {
		localStorage.setItem('attending', 0);
	}
	var first = $('#firstName').val();
	var last = $('#lastName').val();
	if (first == "" || last == "") {
	} else {
		localStorage.setItem('first', first);
		localStorage.setItem('last', last);

		//Call DB function
		userLoginDB(first + " " + last);
		window.location.href = "#statusPage";
	}
}

/** When is the next game, and where, in MyGamesPage**/
function showStatus() {
	var today = new Date();
	//var date = [02, 22, 2014];
	var date = findNearestMonday(today.getDay() + 1, today.getDate(), today.getMonth() + 1, today.getFullYear());
	timer(date);
	var firstName = localStorage.getItem('first');
	$('#nextPlace').html(" Tel Aviv University");
	$('#nextDate').html(" " + date[1] + "/" + date[0] + "/" + date[2]);
}

function attend() {
	var flag = localStorage.getItem('attending');
	if (flag == 0) {
		var name = localStorage.getItem('first') + " " + localStorage.getItem('last');
		addPlayer(name);

	}

	window.location.href = "#statusPage";
}

function notAttend() {
	var flag = localStorage.getItem('attending');
	if (flag == 1) {
		var name = localStorage.getItem('first') + " " + localStorage.getItem('last');
		removePlayer(name);
		localStorage.setItem('attending', 0);

	} else {
		//Case where he is actually in the game but attending is 0
	}

	window.location.href = "#statusPage";
}

/** DB function that Sets up the Profile page **/
function playerProfile(player) {
	if (player.indexOf('(') === -1) {
		var request = false;
		var result = null;
		request = new XMLHttpRequest();
		if (request) {
			request.open("GET", "usersProf/" + player);
			request.onreadystatechange = function() {
				if (request.readyState == 4 && request.status == 200) {
					result = JSON.parse(request.responseText);

					if (result == null) {
						alert("השחקן אינו קבוע");
					} else {
						$('#showFullName').html(result.name + '<br>');
						$('#showGamesPlayed').html("<u>Games Played:</u> " + result.gamesPlayed + '<br>');
						$('#showMotto').html('<u>Motto:</u> "' + result.motto + '"<br>');
						$('#showFoot').html('<u>Foot:</u>' + result.foot + '<br>');
					}
				}
			};
			request.send(null);
		}
	} else {
		//This is a FRIEND Of - so no profile
		var first = player.indexOf('(');
		var end = player.indexOf(')');
		var res = player.substring(first + 1, end);
		playerProfile(res);
	}
}

/** DB function Lists the players **/
function listPlayers() {
	var request = false;
	var result = null;
	request = new XMLHttpRequest();
	if (request) {
		request.open("GET", "teamList/");
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				result = JSON.parse(request.responseText);

				if (result == null) {
					alert("Not a User");
					return;
				} else {
					//Empty old list
					$('#listOfPlayers').empty();
					lengthF = result.length;

					//Two teams were sent back
					if (result.length > 0 && result[0][0].length != 1) {

						//Fill new list as two teams
						$('#listOfPlayers').append('<li data-role="list-divider">Black Team</li>');
						for (var i = 0; i < result[0].length; i++) {
							var showPlayerA = result[0][i];
							$('#listOfPlayers').append('<li style="opacity: 0.8;"><img class="ui-li-icon" src="./images/blackShirt.png"><a href="#profilePage" id="plyr" onClick="playerProfile(\'' + showPlayerA + '\')" >' + showPlayerA + '</a></li>');
						}
						$('#listOfPlayers').append('<li data-role="list-divider">White Team</li>');

						for (var i = 0; i < result[0].length; i++) {
							var showPlayerB = result[1][i];
							$('#listOfPlayers').append('<li style="opacity: 0.8;"><img class="ui-li-icon"  src="./images/whiteShirt.png"><a href="#profilePage" id="plyr" onClick="playerProfile(\'' + showPlayerB + '\')" >' + showPlayerB + '</a></li>');
						}

						//Takes care of Sub players only if there ARE
						if (result[2].length > 0) {
							$('#listOfPlayers').append('<li data-role="list-divider">Substitutions</li>');
							for (var i = 0; i < result[2].length; i++) {
								var showPlayerSub = result[2][i];
								$('#listOfPlayers').append('<li style="opacity: 0.8"><a href="#profilePage" id="plyr" onClick="playerProfile(\'' + showPlayerSub + '\')" >' + showPlayerSub + '</a></li>');

							}
						}

						if ($('#listOfPlayers').hasClass('ui-listview')) {
							$('#listOfPlayers').listview('refresh');
						} else {
							$('#listOfPlayers').trigger('create');
						}

					}
					//List was sent - as in - under 11 players
					else {

						//Fill new list
						for ( i = 0; i < lengthF; i++) {
							var showPlayer = result[i];
							$('#listOfPlayers').append('<li style="opacity: 0.8"><a href="#profilePage" id="plyr" onClick="playerProfile(\'' + showPlayer + '\')" >' + showPlayer + '</a></li>');
						}
						if ($('#listOfPlayers').hasClass('ui-listview')) {
							$('#listOfPlayers').listview('refresh');
						} else {
							$('#listOfPlayers').trigger('create');
						}

					}

				}
				window.location.href = "#playerListPage";

			}
		};
		request.send(null);
	}

}

/* Gets Profile Pic, puts in DB, Puts in LocalStorage, and presents*/
function profilePic(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();

		reader.onload = function(e) {
			$('#pic').attr('src', e.target.result);
			localStorage.setItem('picture', e.target.result);
		};

		reader.readAsDataURL(input.files[0]);
	}

}

/** Brings the old Data about this user to his Edit **/
function editProfile() {
	$('#mottoTextArea').val(localStorage.getItem('motto'));
}

/** DB Function - sends edited Info **/
function submitProfile() {
	var name = localStorage.getItem('first') + " " + localStorage.getItem('last');
	var newFoot = $("#footSelect option:selected").val();
	var newMotto = $("#mottoTextArea").val();
	//var newPic = $('#inputPic').val();
	var toSend = {
		name : localStorage.getItem('first') + " " + localStorage.getItem('last'),
		motto : newMotto,
		foot : newFoot
	};
	var request = false;
	var result = null;
	request = new XMLHttpRequest();
	if (request) {
		request.open("POST", "usersEditProf/");
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				result = JSON.parse(request.responseText);

				if (result == null) {
					alert("problemo");
				} else {
				}
				//Update localstorage with new Motto and foot
				localStorage.setItem('motto', result.motto);
				localStorage.setItem('foot', result.foot);
				localStorage.setItem('picture', result.picture);
			}
			window.location.href = "#statusPage";
		};
		request.setRequestHeader('content-type', 'application/json');
		request.send(JSON.stringify(toSend));
	}
}

/** Send to Server Function - Attending**/
function addPlayer(player) {
	var request = false;
	var result = null;
	request = new XMLHttpRequest();
	if (request) {
		request.open("GET", "team/" + player);
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				result = JSON.parse(request.responseText);
				// Problem
				if (result == null) {
					alert("PROBLEMO");
					return;
				} else {
					//Game is Full or player was not IN the game
					if (result == false) {
						//Send to Full PopUp
						//Make 'attending' just so we can make him NOT attending
						//localStorage.setItem('attending', 1);
						$('#fullGamePopup').popup();
						$("#fullGamePopup").popup("open");
					} else {
						localStorage.setItem('attending', 1);
					}

				}
			}
		};
		request.send(null);
	}

}

/** DB function that adds a guest without logging him in**/
function addGuest() {
	var player = $('#guestName').val();

	//Send DB request only if the value is not empty!
	if (player != "") {
		var skillsV = $('#guestSlider').val();
		var addedByV = localStorage.getItem('first') + ' ' + localStorage.getItem('last');
		var toSend = {
			name : player,
			skills : skillsV,
			addedBy : addedByV
		};
		var request = false;
		var result = null;
		request = new XMLHttpRequest();
		if (request) {
			request.open("POST", "teamGuest/");
			request.onreadystatechange = function() {
				if (request.readyState == 4 && request.status == 200) {
					result = JSON.parse(request.responseText);

					// Problem
					if (result == null) {
						alert("PROBLEMO");
						return;
					} else {
						//Game is Full or player is already in the game
						if (result == false) {
							//Send to Full PopUp
							$('#fullGamePopup').popup();
							$("#fullGamePopup").popup("open");
						}
						//Friend was added
						else {
							window.location.href = '#statusPage';
						}

					}
				}
			};
			request.setRequestHeader('content-type', 'application/json');
			request.send(JSON.stringify(toSend));
		}
	}

}

/** Send to Server Function - Not Attending**/
function removePlayer(player) {
	var request = false;
	var result = null;
	request = new XMLHttpRequest();
	if (request) {
		request.open("GET", "teamDel/" + player);
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				result = JSON.parse(request.responseText);

				// There are enough players (11) or this user is already in the game
				if (result == null) {
					alert("PROBLEMO");
					return;
				} else {
					// Why is it false?
					if (result == false) {
						//Send to Full PopUp
						alert("PROBLEMO2");

					} else {
					}

				}
			}
		};
		request.send(null);
	}
}

/** Server function - adds/logs in user **/
function userLoginDB(player) {
	var request = false;
	var result = null;
	request = new XMLHttpRequest();
	if (request) {
		request.open("GET", "users/" + player);
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				result = JSON.parse(request.responseText);

				// Problem logging in
				if (result == null) {
					alert("PROBLEMO");
					return;
				} else {
					//User Added
					localStorage.setItem('motto', result.motto);
					localStorage.setItem('gamesPlayed', result.gamesPlayed);
					localStorage.setItem('attack', result.attack);
					localStorage.setItem('defense', result.defense);
					localStorage.setItem('stamina', result.stamina);
					localStorage.setItem('goalkeeping', result.goalkeeping);
					localStorage.setItem('teamwork', result.teamwork);

				}
			}
		};
		request.send(null);
	}

}

/** Update Date **/
function findNearestMonday(day, date, month, year) {
	var toBump = (9 - day) % 7;
	date += toBump;
	if (date > 31) {
		date = date % 31;
		month++;
	}
	if (month > 12) {
		month = month % 12;
		year++;
	}
	var newDate = [month, date, year];
	return newDate;

}

/** Timer **/
function timer(date) {
	$('#clock').countdown(date[2] + '/' + date[0] + '/' + date[1] + ' 21:30:00', function(event) {
		$(this).html(event.strftime('%D days %H:%M:%S'));
	}).on('finish.countdown', function(event) {
		//If the player was attending at end of countdown, send to DB that GamesPlayed ++
		if (localStorage.getItem('attending') == 1) {
			//Set back to 0
			localStorage.setItem('attending', 0);
			var request = false;
			var result = null;
			var name = localStorage.getItem('first') + " " + localStorage.getItem('last');
			request = new XMLHttpRequest();
			if (request) {
				request.open("GET", "usersGamesPlayed/" + name);
				request.onreadystatechange = function() {
					if (request.readyState == 4 && request.status == 200) {
						result = JSON.parse(request.responseText);

						if (result == null) {
							alert('PROBLEMO');
						} else {
							localStorage.setItem('gamesPlayed', parseInt(result.gamesPlayed));
							//Popup to find Best Player
							$('#bestPlayerPopup').popup();
							$("#bestPlayerPopup").popup("open");

						}
					}
				};
				request.send(null);
			}
		}

	});

}

/** Server function - adds/logs in user **/
function bestPlayer() {
	//Close the PopUp
	$("#bestPlayerPopup").popup("close");
	var player = $("#playerSelect option:selected").text();
	var request = false;
	var result = null;
	request = new XMLHttpRequest();
	if (request) {
		request.open("GET", "bestPlayer/" + player);
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				result = JSON.parse(request.responseText);

				// Problem with server
				if (result == null) {
					alert("PROBLEMO");
					return;
				} else {
					//Best Player marked

				}
			}
		};
		request.send(null);
	}

}

