$(document).ready(function () {
	//Change request
	if($('form').attr('action').indexOf('0x0100D31429037FFE004FA760FE65AC9D57EE00118689EC7CA8CE4C85A04A3EA1D23714') != -1) {
		$('#onetIDListForm').find('h1').text($('#onetIDListForm').find('h1').text() + " - Change");	
	}
	//Incident request
	else {
		$('#onetIDListForm').find('h1').text($('#onetIDListForm').find('h1').text() + " - Incident");
	}
	
	ExecuteOrDelayUntilScriptLoaded(setpeoplepicker, "sp.js");
});


function setpeoplepicker(){
	var ctx = new SP.ClientContext();
	var user = ctx.get_web().get_currentUser();
	ctx.load(user);
	ctx.executeQueryAsync(function() {
	  $('.ms-formbody').filter(function() {
	    return $(this).html().match(/spfielduser/i);
	  }).each(function() {
	    $(this).find('div:first').html(user.get_title());
	  });
	});
}