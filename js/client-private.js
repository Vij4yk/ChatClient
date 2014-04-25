var username = "";
var to_user = "";

$(document).ready(function() {
	parseURL(location.search);

	$('#name').text("Welcome, " + username);
	$('#input').attr("placeholder", "Press 'Enter' or click 'SEND' to send " + to_user + " a message");
	$('#input').focus();

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
    });
});

function handleFiles(files)
{
	alert(files);
}

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
			window.opener.commandFromChild(command);
			input.val('');
			input.focus();
			$('#messages').append(makeMessageSelf(message));
			$('#messages').scrollTop($('#messages')[0].scrollHeight);
		}
	}
}

function sendEmoticon(url)
{
	window.opener.commandFromChild("SEND " + to_user + '\n' + "emoticon:" + url);
	$('#smile').click();
	$('#messages').append(makeMessageSelf("emoticon:" + url));
	$('#messages').scrollTop($('#messages')[0].scrollHeight);
}

function receiveFromParent(user, message)
{
	$('#messages').append(makeMessageFrom(user, message));
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
	else
		html = html + '<div class="from_message_self">' + message + '</div>';
	html += "</div>";
	return html;
}

function makeMessageFrom(user, message)
{
	var html = '<div class="message">';
	html += '<img class="avatar" src="images/avatar2.png"  alt="' + user + '">';
	html = html + '<div class="from_user">' + user + '</div>';
	if(message.substring(0,9) == "emoticon:")
	{
		var image = message.substring(9);
		html = html + '<img src="images/emoticons/' + image + '" class="emoticon_message">';
	}
	else
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