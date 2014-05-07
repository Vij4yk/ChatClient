// If Firefox, use MozWebSocket
if(this.MozWebSocket)
{
	WebSocket = MozWebSocket;
}

// Globals
var users = {};
var username = "";
var signin = true;

// Chat Server url
var url = "ws://localhost:8787/chat";

// On ready function
$(document).ready(function() {
	$('#username').focus();

	// Prevent default POST action and register our login function
	$('#loginform').submit(function(event)
	{
		event.preventDefault();
		login();	
	});

	// Prevent default POST action and register our send function
	$('#sendform').submit(function(event)
	{
		event.preventDefault();
		sendMessage();	
	});

	// Inline (emoticon) button
	$('#smile').hover(function()
	{
		$(this).attr('src','images/smile_hover.png');
	},
	function(){
      $(this).attr('src','images/smile.png')
    });

	// Upload image button
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

    // Send emoticon button
    $('.emoticon').click(function()
    {
    	sendEmoticon($(this).attr('src').split("/")[2]);
    	$('#input').focus();
    });

    // Send image button
    $('#upload').change(function(e)
    {
    	var file = e.target.files[0];
    	sendImage(file);
    });
});

// Connect to the websocket server
function makeConnections()
{
	window.socket = new WebSocket(url);

	// Attempt to login
	window.socket.onopen = function()
	{
		window.socket.send("ME IS " + username + '\n');
	}

	// Message recv handler
	window.socket.onmessage = function(msg)
	{
		var whole_message = msg.data.toString();

		// If the user needs to be signed in still, parse ME IS response
		if(signin)
		{
			whole_message = whole_message.split('\n')[0];

			// Login error
			if(whole_message == "ERROR")
			{
				$('#error').fadeIn(400);
				$('#username').focus();
				window.socket.close()
			}

			// Successful login
			else
			{
				users[username] = 1;
				signin = false;

				// Show the main interface
				$('#login').fadeOut(400, function()
				{
					$('#chat').fadeIn(400);
					$('#name').text("Welcome, " + username);
					$('#input').focus();

					// Automatically refresh the users list every 2s
					update();
					window.ID = window.setInterval(function(){update();}, 2000);
				});
			}
		}

		// Receive a broadcast
		else if(whole_message.substring(0,9) == "BROADCAST")
		{
			var parts = whole_message.split('\n');
			var from_user = parts[0].split(" ")[2];
			var message = parts[1];

			// Add the recv'd message to the interface
			if(from_user == username)
				$('#messages').append(makeMessageSelf(message));
			else
				$('#messages').append(makeMessageFrom(from_user, message));


			// Scoll down to the most recent message
			$('#messages').scrollTop($('#messages')[0].scrollHeight);
		}

		// Rceive a private message
		else if(whole_message.substring(0,7) == "PRIVATE")
		{
			var parts = whole_message.split('\n');
			var from_user = parts[0].split(" ")[2];
			var starting = 14 + from_user.length;
			var message = parts[1];

			// Send the message to a separate child window
			sendToChild(from_user, message);
		}

		// Receive a list of users
		else
		{
			whole_message = whole_message.split('\n')[0];
			executeUpdate(whole_message);
		}
	}

	window.socket.onclose = function()
	{
		if(!signin)
		{
			alert("No connection available");
			logout();
		}
	}

	window.socket.onerror = function(msg)
	{
		alert("Could not connect");
	}
}


// Login function
function login()
{
	var name = $('#username').val();

	// No username given
	if(name == "")
	{
		$('#error').fadeIn(400);
		$('#username').focus();
	}

	// Attempt to use the entered username
	else
	{
		username = name;
		makeConnections();
		$('#username').val('');
	}
}

// Log the user out
function logout()
{
	// Stop updating user list
	clearInterval(window.ID);
	
	// Hide the main interface
	$('#error').hide();
	$('#chat').fadeOut(400, function()
	{
		$('#login').fadeIn(400);
		$('#input').val('');
		$('#username').focus();
		signin = true;
		$('#messages').empty();

		// Close the socket
		window.socket.close();
	});
}

// Send a message
function sendMessage()
{
	// Get the message contents
	var input = $('#input');
	if(input.val() != "" || input.val() == 'undefined')
	{
		// Check for valid length
		var message = input.val();
		if(message.length > 100)
			alert("Message length must be less than 99");
		else
		{
			// Send the message
			window.socket.send("BROADCAST\n" + message);

			input.val('');
			input.focus();
		}
	}
}

// Send emoticon
function sendEmoticon(url)
{
	window.socket.send("BROADCAST\nemoticon:" + url);
	$('#smile').click();
}

// Send iamge file
function sendImage(file)
{
	var fr = new FileReader();
	fr.onload = function(e)
	{
		var contents = event.target.result;

		// add this line of code to send it to the chat server
		// window.socket.send("BROADCAST\nupload:" + contents)
		alert("Got image with length " + contents.length + ". Our chat server will not allow this to be sent due to length constraints.");
	};
	fr.readAsDataURL(file);
}

// Show a received message from the current user
function makeMessageSelf(message)
{
	var html = '<div class="message">';
	html += '<img class="avatar_self" src="images/avatar1.png"  alt="' + username + '">';
	html = html + '<div class="from_user_self">' + username + '</div>';

	// Show emoticon message
	if(message.substring(0,9) == "emoticon:")
	{
		var image = message.substring(9);
		html = html + '<img src="images/emoticons/' + image + '" class="emoticon_self_message">';
	}

	// Show image message
	else if(message.substring(0,7) == "upload:")
	{
		var imageURI = message.substring(7);
		html = html + '<img scr="' + imageURI + '" class="image_self_message">';
	}

	// Show text message
	else
		html = html + '<div class="from_message_self">' + message + '</div>';
	html += "</div>";
	return html;
}

// Show message received from another user
function makeMessageFrom(user, message)
{
	var pic_num = users[user];
	var html = '<div class="message" onclick="openWindow(\'' + user + '\')">';
	html += '<img class="avatar" src="images/avatar' + pic_num + '.png"  alt="' + user + '">';
	html = html + '<div class="from_user">' + user + '</div>';
	
	// Show emoticon message
	if(message.substring(0,9) == "emoticon:")
	{
		var image = message.substring(9);
		html = html + '<img src="images/emoticons/' + image + '" class="emoticon_message">';
	}

	// Show image message
	else if(message.substring(0,7) == "upload:")
	{
		var imageURI = message.substring(7);
		html = html + '<img scr="' + imageURI + '" class="image_message">';
	}

	// Show text message
	else
		html = html + '<div class="from_message">' + message + '</div>';
	html += '</div>';
	return html;
}

// Send an update request
function update()
{
	window.socket.send("WHO HERE");
}

// Update the users list
function executeUpdate(names)
{
	// Split the returned usernames by comma
	var returned = (names.split('\n')[0]).split(",");
	var counter = 2;
	$('#users').empty();

	// Add each name to the users list
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

// Received a send from private message window
function commandFromChild(command)
{
	window.socket.send(command);
}

// Send a message to a private window
function sendToChild(user, message)
{
	// Open (or focus) private message window
	var w = openWindow(user, true);
	var win = w[0];

	// If the window wasn't open, wait for it to load then send
	if(w[1] == false)
	{
		$(win).load(function() {
			win.receiveFromParent(user, message);
		});
	}

	// Window already open, send the message
	else
	{
		win.receiveFromParent(user, message);
	}
}


// Open a private message window or focus existing window
function openWindow(user, find)
{
	if(typeof find == 'undefined')
	{
		find = false;
	}

	// Maintain an array of open windows
	if(typeof openWindow.winRefs == 'undefined')
	{
		openWindow.winRefs = new Array();
	}

	// Window not already open, open a new window
	if(typeof openWindow.winRefs[user] == 'undefined' || openWindow.winRefs[user].closed)
	{
		var url = 'client-private.html' + '?username=' + username + '&touser=' + user;
		openWindow.winRefs[user] = window.open(url, user, "width=800, height=750");
		openWindow.winRefs[user].moveTo(0,0);
		if(find)
			return [openWindow.winRefs[user], false];
	} 

	// Window exists, focus it
	else 
	{
		window.open('', user).focus();
		if(find)
			return [openWindow.winRefs[user], true];
	}
}