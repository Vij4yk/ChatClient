var username = "";
var to_user = "";

$(document).ready(function() {
	parseURL(location.search);

	// Initialize the window
	$('#name').text("Welcome, " + username);
	$('#input').attr("placeholder", "Press 'Enter' or click 'SEND' to send " + to_user + " a message");
	$('#input').focus();

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

    // Send emoticon button
    $('#smile').click(function()
    {
    	$('#popover').fadeToggle(200);
    });

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

// Parse URL
function parseURL(query)
{
	// Get the username and who to send to from URL
	args = query.split("&");
	username = args[0].split("=")[1];
	to_user = args[1].split("=")[1];
}

// Log the user out
function logout()
{
	window.close();
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
			var command = "SEND " + to_user + '\n' + message;
			window.opener.commandFromChild(command);
			input.val('');
			input.focus();
			$('#messages').append(makeMessageSelf(message));
			$('#messages').scrollTop($('#messages')[0].scrollHeight);
		}
	}
}

// Send emoticon
function sendEmoticon(url)
{
	window.opener.commandFromChild("SEND " + to_user + '\n' + "emoticon:" + url);
	$('#smile').click();
	$('#messages').append(makeMessageSelf("emoticon:" + url));
	$('#messages').scrollTop($('#messages')[0].scrollHeight);
}

// Send iamge file
function sendImage(file)
{
	var fr = new FileReader();
	fr.onload = function(e)
	{
		var contents = event.target.result;

		// add these line of code to send it to the chat server
		//window.opener.commandFromChild("SEND " + to_user + '\n' + "upload:" + contents)
		// $('#messages').append(makeMessageSelf("upload:" + contents));
		// $('#messages').scrollTop($('#messages')[0].scrollHeight);

		alert("Got image with length " + contents.length + ". Our chat server will not allow this to be sent due to length constraints.");
	};
	fr.readAsDataURL(file);
}

// Return data from parent window
function receiveFromParent(user, message)
{
	$('#messages').append(makeMessageFrom(user, message));
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
	var html = '<div class="message">';
	html += '<img class="avatar" src="images/avatar2.png"  alt="' + user + '">';
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