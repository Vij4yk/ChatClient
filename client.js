$(document).ready(function() {
	$('#username').focus();

	$('#loginform').submit(function(event) {
		event.preventDefault();
		login();	
	});

	$('#sendform').submit(function(event) {
		event.preventDefault();
		sendMessage();	
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
	/*else if(username already used)
	{

	}*/
	else
	{
		window.username = name;
		$('#login').fadeOut(400, function()
		{
			$('#chat').fadeIn(400);
			$('#name').text("Welcome, " + name);
			$('#input').focus();

			// add user through web socket

			update();
		});
	}
}

function logout()
{
	$('#error').hide();
	$('#chat').fadeOut(400, function()
	{
		$('#login').fadeIn(400);
		$('#input').val('');
		$('#username').val('');
		$('#username').focus();
		// remove user through web socket
	});
}

function sendMessage()
{
	var input = $('#input');
	if(input.val() != "" || input.val() == 'undefined')
	{
		var message = chunkMessage(input.val());

		// send message to web socket

		$('#messages').append(makeMessageSelf(message));
		input.val('');
		input.focus();
		$('#messages').scrollTop($('#messages')[0].scrollHeight);
	}
}

function makeMessageSelf(message)
{
	var html = "<div class=\"message\" onclick=\"openWindow('" + window.username + "')\">";
	html += "<img class=\"avatar_self\" src=\"avatar1.png\"  alt=\"" + window.username + "\">";
	html = html + "<div class=\"from_user_self\">" + window.username + "</div>";
	html = html + "<div class=\"from_message_self\">" + message + "</div>";
	html += "</div>";
	return html;
}

function chunkMessage(message)
{
	if(message.length <= 99)
	{
		return message.length.toString()+"\n"+message;
	}
	else
	{
		if(message.length<=999)
		{
			return "C"+message.length.toString()+"\n"+message+"C0\n";
		}
		else
		{
			var len = message.length;
			var chunked = "";
			while(len > 0)
			{
				if(len > 999)
				{
					chunked += "C999\n"+message.splice(message.length - len, message.length - len + 999);
					len -= 999;
				}
				else
				{
					chunked += "C"+len.toString()+"\n"+ message.splice(message.length - len, message.length)+"C0\n";
					break;
				}
			}
		}
	}
}

function update()
{
	var users = ["Matthew Hancock", "Eric Lowry", "Ben Ciummo"];
	$('#users').empty();
	$.each(users, function(i, name) {
		var item = "<li><img class=\"small_avatar\" src=\"avatar" + (i+1) + ".png\">" + name + "</li>";
		$('#users').append($(item).click(function() {
			openWindow(name);
		}));
	});
}

function openWindow(user)
{
	if( typeof openWindow.winRefs == 'undefined' )
	{
		openWindow.winRefs = new Array();
	}
	if( typeof openWindow.winRefs[user] == 'undefined' || openWindow.winRefs[user].closed )
	{
		openWindow.winRefs[user] = window.open('client.html', user);
		openWindow.winRefs[user].moveTo(0,0);
	} 
	else 
	{
		window.open('', user).focus();
	}
}