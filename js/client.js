if(this.MozWebSocket)
{
	WebSocket = MozWebSocket;
}
var users = {};
var username = "";
var signin = true;

var url = "ws://localhost:8787/chat";

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

    $('#camera').click(function()
    {
    	$('#upload').click();
    });

    $('#smile').click(function()
    {
    	$('#popover').fadeToggle(200);
    });

    $('.emoticon').click(function()
    {
    	sendEmoticon($(this).attr('src').split("/")[2]);
    	$('#input').focus();
    });

    $('#upload').change(function(e)
    {
    	var file = e.target.files[0];
    	sendImage(file);
    });
});

function makeConnections()
{
	window.socket = new WebSocket(url);
	window.socket.onopen = function()
	{
		window.socket.send("ME IS " + username + "|");
	}

	window.socket.onmessage = function(msg)
	{
		var whole_message = msg.data.toString();
		if(signin)
		{
			whole_message = whole_message.split("|")[0];
			if(whole_message == "ERROR")
			{
				$('#error').fadeIn(400);
				$('#username').focus();
				window.socket.close()
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
			var parts = whole_message.split("|");
			var from_user = parts[0].split(" ")[2];
			var message = parts[1];

			if(from_user == username)
				$('#messages').append(makeMessageSelf(message));
			else
				$('#messages').append(makeMessageFrom(from_user, message));


			$('#messages').scrollTop($('#messages')[0].scrollHeight);
		}
		else if(whole_message.substring(0,7) == "PRIVATE")
		{
			var parts = whole_message.split("|");
			var from_user = parts[0].split(" ")[2];
			var starting = 14 + from_user.length;
			var message = parts[1];
			sendToChild(from_user, message);
		}
		else
		{
			whole_message = whole_message.split("|")[0];
			executeUpdate(whole_message);
		}
	}

	window.socket.onclose = function()
	{
		alert("No connection available");
		logout();
	}

	window.socket.onerror = function(msg)
	{
		alert("Could not connect");
	}
}

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
		makeConnections();
		$('#username').val('');
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
		signin = true;
		$('#messages').empty();
		window.socket.close();
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
			window.socket.send("BROADCAST|" + message);

			input.val('');
			input.focus();
		}
	}
}

function sendEmoticon(url)
{
	window.socket.send("BROADCAST|emoticon:" + url);
	$('#smile').click();
}

function sendImage(file)
{
	var fr = new FileReader();
	fr.onload = function(e)
	{
		var contents = event.target.result;

		// add this line of code to send it to the chat server
		// window.socket.send("BROADCAST|upload:" + contents)
		alert("Got image with length " + contents.length + ". Our chat server will not allow this to be sent due to length constraints.");
	};
	fr.readAsDataURL(file);
}

function makeMessageSelf(message)
{
	var html = '<div class="message">';
	html += '<img class="avatar_self" src="images/avatar1.png"  alt="' + username + '">';
	html = html + '<div class="from_user_self">' + username + '</div>';
	if(message.substring(0,9) == "emoticon:")
	{
		var image = message.substring(9);
		html = html + '<img src="images/emoticons/' + image + '" class="emoticon_self_message">';
	}
	else if(message.substring(0,7) == "upload:")
	{
		var imageURI = message.substring(7);
		html = html + '<img scr="' + imageURI + '" class="image_self_message">';
	}
	else
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
	if(message.substring(0,9) == "emoticon:")
	{
		var image = message.substring(9);
		html = html + '<img src="images/emoticons/' + image + '" class="emoticon_message">';
	}
	else if(message.substring(0,7) == "upload:")
	{
		var imageURI = message.substring(7);
		html = html + '<img scr="' + imageURI + '" class="image_message">';
	}
	else
		html = html + '<div class="from_message">' + message + '</div>';
	html += '</div>';
	return html;
}

function chunkMessage(message)
{
	if(message.length <= 120)
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
	window.socket.send("WHO HERE");
}

function executeUpdate(names)
{
	var returned = (names.split("|")[0]).split(",");
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
		if(counter == 17)
			counter = 2;
	});
}

function commandFromChild(command)
{
	window.socket.send(command);
}

function sendToChild(user, message)
{
	var w = openWindow(user, true);
	var win = w[0];
	if(w[1] == false)
	{
		$(win).load(function() {
			win.receiveFromParent(user, message);
		});
	}
	else
	{
		win.receiveFromParent(user, message);
	}
}

function openWindow(user, find)
{
	if(typeof find == 'undefined')
	{
		find = false;
	}

	if(typeof openWindow.winRefs == 'undefined')
	{
		openWindow.winRefs = new Array();
	}

	if(typeof openWindow.winRefs[user] == 'undefined' || openWindow.winRefs[user].closed)
	{
		var url = 'client-private.html' + '?username=' + username + '&touser=' + user;
		openWindow.winRefs[user] = window.open(url, user, "width=800, height=750");
		openWindow.winRefs[user].moveTo(0,0);
		if(find)
			return [openWindow.winRefs[user], false];
	} 
	else 
	{
		window.open('', user).focus();
		if(find)
			return [openWindow.winRefs[user], true];
	}
}