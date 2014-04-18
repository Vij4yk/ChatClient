var username = "";
var to_user = "";

$(document).ready(function() {
	parseURL(location.search);

	$('#name').text("Welcome, " + username);
	$('input').attr("placeholder", "Press 'Enter' or click 'SEND' to send " + to_user + " a message");

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

function parseURL(query)
{
	args = query.split("&");
	username = args[0].split("=")[1];
	to_user = args[1].split("=")[1];
}

function logout()
{
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
			var command = "SEND " + to_user + '\n' + message;
			alert(command);
			window.opener.commandFromChild(command);
			input.val('');
			input.focus();
			$('#messages').scrollTop($('#messages')[0].scrollHeight);
		}
	}
}

function receiveFromParent(user, message)
{
	alert(message);
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
	var html = '<div class="message">';
	html += '<img class="avatar" src="images/avatar2.png"  alt="' + user + '">';
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