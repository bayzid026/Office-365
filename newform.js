$(document).ready(function () {

	var choosenoption = $("#onetIDListForm #ctl00_m_g_440c5263_062f_491d_8d12_f535470da4d5_ctl00_ctl05_ctl00_ctl00_ctl00_ctl04_ctl00_DropDownChoice option:selected").val();
	var openorclosed = $("#onetIDListForm #ctl00_m_g_440c5263_062f_491d_8d12_f535470da4d5_ctl00_ctl05_ctl08_ctl00_ctl00_ctl04_ctl00_DropDownChoice option:selected").val();
	filterview(choosenoption, openorclosed);

	$('#onetIDListForm #ctl00_m_g_440c5263_062f_491d_8d12_f535470da4d5_ctl00_ctl05_ctl00_ctl00_ctl00_ctl04_ctl00_DropDownChoice').change( function() {
		var choosenoption = $("#onetIDListForm #ctl00_m_g_440c5263_062f_491d_8d12_f535470da4d5_ctl00_ctl05_ctl00_ctl00_ctl00_ctl04_ctl00_DropDownChoice option:selected").val();
		var openorclosed = $("#onetIDListForm #ctl00_m_g_440c5263_062f_491d_8d12_f535470da4d5_ctl00_ctl05_ctl08_ctl00_ctl00_ctl04_ctl00_DropDownChoice option:selected").val();
		filterview(choosenoption, openorclosed);
	}); 
	
	$("#onetIDListForm #ctl00_m_g_440c5263_062f_491d_8d12_f535470da4d5_ctl00_ctl05_ctl08_ctl00_ctl00_ctl04_ctl00_DropDownChoice").change( function() {
		var openorclosed = $("#onetIDListForm #ctl00_m_g_440c5263_062f_491d_8d12_f535470da4d5_ctl00_ctl05_ctl08_ctl00_ctl00_ctl04_ctl00_DropDownChoice option:selected").val();
		var choosenoption = $("#onetIDListForm #ctl00_m_g_440c5263_062f_491d_8d12_f535470da4d5_ctl00_ctl05_ctl00_ctl00_ctl00_ctl04_ctl00_DropDownChoice option:selected").val();
		filterview(choosenoption, openorclosed);
	});

	
});

function filterview(option, openorclosed) {
	if(option != '' && option == 'Change') {
		$("#onetIDListForm nobr:contains('To Date')").closest('tr').show();
		$("#onetIDListForm nobr:contains('From Date')").closest('tr').show();
		$("#onetIDListForm nobr:contains('Next update')").closest('tr').hide();
		$("#onetIDListForm nobr:contains('Closed')").closest('tr').hide();
	}
	else if(option != '' && option == 'Incident') {
		$("#onetIDListForm nobr:contains('To Date')").closest('tr').hide();
		$("#onetIDListForm nobr:contains('From Date')").closest('tr').hide();
		$("#onetIDListForm nobr:contains('Next update')").closest('tr').show();
		
		if (openorclosed != '' && openorclosed == 'Open') {
			$("#onetIDListForm nobr:contains('Closed')").closest('tr').hide();
		}
		else if (openorclosed != '' && openorclosed == 'Closed'){
			$("#onetIDListForm nobr:contains('Closed')").closest('tr').show();
		}

	}
}