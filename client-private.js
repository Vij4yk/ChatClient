if(this.MozWebSocket)
{
	WebSocket = MozWebSocket;
}
var username = "";
var to_user = "";

var url = "ws://localhost:8787/chat";
var socket = new WebSocket(url);

socket.onopen = function()
{
	// nothing to do here
}

socket.onmessage = function(msg)
{
	var whole_message = msg.data.toString().trim();
	if(whole_message.substring(0,7) == "PRIVATE")
	{
		// Change this code
		var parts = whole_message.split(" ", 3);
		var from_user = parts[2];
		var starting = 16 + from_user.length;
		var message = whole_message.substring(starting);
		if(from_user == username)
			$('#messages').append(makeMessageSelf(message));
		else
			$('#messages').append(makeMessageFrom(from_user, message));
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
	parseURL(location.search);

	$('#name').text("Welcome, " + username);

	$('#sendform').submit(function(event)
	{
		event.preventDefault();
		sendMessage();	
	}); 
});

function parseURL(query)
{
	args = query.split("&");
	username = args[0].split("=")[1].substring(3);
	to_user = args[1].split("=")[1];
}

function logout()
{
	clearInterval(window.ID);
	socket.close();
	window.close();
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
			socket.send("SEND " + message);

			input.val('');
			input.focus();
			$('#messages').scrollTop($('#messages')[0].scrollHeight);
		}
	}
}

function makeMessageSelf(message)
{
	var html = '<div class="message">';
	html += '<img class="avatar_self" src="avatar1.png"  alt="' + username + '">';
	html = html + '<div class="from_user_self">' + username + '</div>';
	html = html + '<div class="from_message_self">' + message + '</div>';
	html += "</div>";
	return html;
}

function makeMessageFrom(user, message)
{
	var pic_num = users[user];
	var html = '<div class="message">';
	html += '<img class="avatar" src="avatar2.png"  alt="' + user + '">';
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