if(this.MozWebSocket)
{
	WebSocket = MozWebSocket;
}
var users = {};
var username = "";
var signin = true;

var url = "ws://localhost:8787/chat";
var socket = new WebSocket(url);

socket.onopen = function()
{
	// nothing to do here
}

socket.onmessage = function(msg)
{
	var whole_message = msg.data.toString().trim();
	if(signin)
	{
		if(whole_message == "ERROR")
		{
			$('#error').fadeIn(400);
			$('#username').focus();
		}
		else
		{
			users[username] = 1;
			signin = false;
			$('#login').fadeOut(400, function()
			{
				$('#chat').fadeIn(400);
				$('#name').text("Welcome, " + username);
				$('#input').focus();

				update();
				window.ID = window.setInterval(function(){update();}, 2000);
			});
		}
	}
	else if(whole_message.substring(0,9) == "BROADCAST")
	{
		var parts = whole_message.split(" ", 3);
		var from_user = parts[2];
		var starting = 16 + from_user.length;
		var message = whole_message.substring(starting);
		if(from_user == username)
			$('#messages').append(makeMessageSelf(message));
		else
			$('#messages').append(makeMessageFrom(from_user, message));


		$('#messages').scrollTop($('#messages')[0].scrollHeight);
	}
	else if(whole_message.substring(0,7) == "PRIVATE")
	{
		alert(whole_message);
		var parts = whole_message.split('\n');
		var from_user = parts[0].split(" ")[2];
		var starting = 14 + from_user.length;
		var message = parts[1];
		sendToChild(from_user, message);
	}
	else
	{
		executeUpdate(whole_message);
	}
}

socket.onclose = function()
{
	// nothing to do here
}

socket.onerror = function(msg)
{
	alert(msg);
}

$(document).ready(function() {
	$('#username').focus();

	$('#loginform').submit(function(event)
	{
		event.preventDefault();
		login();	
	});

	$('#sendform').submit(function(event)
	{
		event.preventDefault();
		sendMessage();	
	});

	$('#smile').hover(function()
	{
		$(this).attr('src','images/smile_hover.png');
	},
	function(){
      $(this).attr('src','images/smile.png')
    });

    $('#camera').hover(function()
	{
		$(this).attr('src','images/camera_hover.png');
	},
	function(){
      $(this).attr('src','images/camera.png')
    });
});

function login()
{
	var name = $('#username').val();
	if(name == "")
	{
		$('#error').fadeIn(400);
		$('#username').focus();
	}
	else
	{
		username = name;
		$('#username').val('');
		socket.send("ME IS " + name);
	}
}

function logout()
{
	clearInterval(window.ID);
	
	$('#error').hide();
	$('#chat').fadeOut(400, function()
	{
		$('#login').fadeIn(400);
		$('#input').val('');
		$('#username').focus();
		// remove user on web socket server
	});
}

function sendMessage()
{
	var input = $('#input');
	if(input.val() != "" || input.val() == 'undefined')
	{
		var message = chunkMessage(input.val());
		if(message == false)
			alert("Message length must be less than 99");
		else
		{
			socket.send("BROADCAST " + message);

			input.val('');
			input.focus();
		}
	}
}

function makeMessageSelf(message)
{
	var html = '<div class="message">';
	html += '<img class="avatar_self" src="images/avatar1.png"  alt="' + username + '">';
	html = html + '<div class="from_user_self">' + username + '</div>';
	html = html + '<div class="from_message_self">' + message + '</div>';
	html += "</div>";
	return html;
}

function makeMessageFrom(user, message)
{
	var pic_num = users[user];
	var html = '<div class="message" onclick="openWindow(\'' + user + '\')">';
	html += '<img class="avatar" src="images/avatar' + pic_num + '.png"  alt="' + user + '">';
	html = html + '<div class="from_user">' + user + '</div>';
	html = html + '<div class="from_message">' + message + '</div>';
	html += '</div>';
	return html;
}

function chunkMessage(message)
{
	if(message.length <= 99)
	{
		return message;
	}
	else
	{
		return false;
	}
}

function update()
{
	socket.send("WHO HERE");
}

function executeUpdate(names)
{
	var returned = names.trim().split(",");
	var counter = 2;
	$('#users').empty();
	$.each(returned, function(i, name) {
		if(name != username)
		{
			users[name] = counter;
			counter++;
		}
		var item = '<li><img class="small_avatar" src="images/avatar' + users[name] + '.png">' + name + '</li>';
		if(name != username)
		{
			$('#users').append($(item).click(function() {
				openWindow(name);
			}));
		}
		else
		{
			$('#users').append(item);
		}
	});
}

function commandFromChild(command)
{
	socket.send(command);
}

function sendToChild(user, message)
{
	alert("Looking for " + user + " with message " + message);
	openWindow(user);
	//userWindow.receiveFromParent(user, message);
}

function openWindow(user, find)
{
	if(typeof openWindow.winRefs == 'undefined')
	{
		openWindow.winRefs = new Array();
	}
	if(typeof openWindow.winRefs[user] == 'undefined' || openWindow.winRefs[user].closed)
	{
		var url = 'client-private.html' + '?username=' + username + '&touser=' + user;
		openWindow.winRefs[user] = window.open(url, user, "width=800, height=750");
		openWindow.winRefs[user].moveTo(0,0);
	} 
	else 
	{
		window.open('', user).focus();
	}
}