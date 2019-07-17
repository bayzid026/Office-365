jQuery(function () {

    function getTheList() {
		getAlertsKeyCollection()
	}
	
	function getAlertsKeyCollection() {
    	var soapenv = 	"<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'> \
	  							<soap:Body> \
	    							<GetAlerts xmlns='http://schemas.microsoft.com/sharepoint/soap/2002/1/alerts/' /> \
	  							</soap:Body> \
							</soap:Envelope>";
        	
    	$.ajax({
	        type: "POST",
	        data: soapenv,
	        dataType: "xml",
	        url: "/orgs/corp/IT/bis/sim/ServiceIntegration/_vti_bin/alerts.asmx",
	        contentType: "text/xml; charset=utf-8",
	        complete: onAlertsLoadComplete,
	        error: onError
   	 	});
			
	}
    	
	function onAlertsLoadComplete(xData, status) {
	    subscriptionidCol = new Array();
	    $(xData.responseXML).find("Alert").each(function() {
	    	//$("#myalertsdiv").append("<li>" + $(this).find("Title").text() + " Id:" + $(this).find("Id").text() +" Url:"+ $(this).find("AlertForUrl").text() + "</li>");
			var listitemid = $(this).find("AlertForUrl").text().split("=")[1];	
			if (listitemid == null){
			 	subscriptionidCol[$(this).find("Title").text()] = $(this).find("EditAlertUrl").text() +"&IsDlg=1";
			}
			else{
				subscriptionidCol[listitemid] = $(this).find("EditAlertUrl").text() +"&IsDlg=1";
			}
		});
		
		var soapEnv = "<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'> \
							<soap:Body><GetListItems xmlns='http://schemas.microsoft.com/sharepoint/soap/'> \
								<listName>NSD Tasks</listName> \
								<query><Query><Where><And><Eq><FieldRef Name='Category' /><Value Type='Choice'>Incident</Value></Eq><Eq><FieldRef Name='Status' /><Value Type='Choice'>Open</Value></Eq></And></Where><OrderBy><FieldRef Name='Modified' Ascending='False' /></OrderBy></Query></query> \
								<viewFields><ViewFields xmlns='' /></viewFields> \
								<queryOptions><QueryOptions><DateInUtc>TRUE</DateInUtc></QueryOptions></queryOptions> \
								</GetListItems> \
							</soap:Body> \
						</soap:Envelope>";
		
		$.ajax({
			url: "http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/_vti_bin/lists.asmx",
			type: "POST",
			dataType: "xml",
			data: soapEnv,
			complete: AcuteSucceeded,
			contentType: "text/xml; charset=\"utf-8\""
		});		
	}
	
	function AcuteSucceeded(xData, status) {
		var strAcuteHtml = '';
		
		if (subscriptionidCol.hasOwnProperty("Current Service Interruptions")) {
			strAcuteHtml = "<div id='acuteaccordion'> \
								<input class='alertsubid' type='hidden' value='" +subscriptionidCol['Current Service Interruptions'] +"'/> \
									<h2 style='text-align:center;'><img class='unalrtmeheader' src='/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/unalertme.png'/>Current</h2>";
		}
		else {
			strAcuteHtml = "<div id='acuteaccordion'><h2 style='text-align:center;'><img class='alrtmeincidents' src='/_layouts/images/alertme.png'/>Current</h2>";
		}

		$(xData.responseXML).find("z\\:row, row").each(function() {
			var oListItem = $(this);		
			var nxtupd = new Date(replaceAll(oListItem.attr("ows_Modified"), '-','/').replace('T', ' '));

			if (subscriptionidCol.hasOwnProperty(oListItem.attr("ows_ID"))) {
				strAcuteHtml += "<div class='block-inner acute item'> \
									<div class='sender'> \
										<img class='unalertimg' src='/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/unalertme.png'/> \
											<div class='toggle'> \
												<div align='center' class='datefield'>" + nxtupd.format("dd MMM yyyy HH:mm") +"</div> \
												<div class='itemheading'> \
													<strong> \
														<a class='itemtitle' href='#' >" + oListItem.attr("ows_Title") +"</a> \
														<input class='hiddenfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/listform.aspx?PageType=4&ListId={928A9E2D-ED86-4CB6-8FF2-405F733E4594}&ID=" + oListItem.attr("ows_ID") +"&amp;ContentTypeID=0x010800B5C3C56E55E35F47A156619C280FF1DC' /> \
														<input class='hiddenalertfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&ID=" + oListItem.attr("ows_ID") +"&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
														<input class='alertsubid' type='hidden' value='" +subscriptionidCol[oListItem.attr("ows_ID")] +"'/> \
													</strong> \
												</div> \
										</div> \
									</div> \
									<div class='publications'>";	
			}
			else {
				strAcuteHtml += "<div class='block-inner acute item'> \
									<div class='sender'> \
										<img class='alrtmeimg' src='/_layouts/images/alertme.png'/> \
											<div class='toggle'> \
												<div class='itemheading'> \
													<div align='center' class='datefield'>" + nxtupd.format("dd MMM yyyy HH:mm") +"</div> \
													<strong> \
														<a class='itemtitle' href='#' >" + oListItem.attr("ows_Title") +"</a> \
														<input class='hiddenfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/listform.aspx?PageType=4&ListId={928A9E2D-ED86-4CB6-8FF2-405F733E4594}&ID=" + oListItem.attr("ows_ID") +"&amp;ContentTypeID=0x010800B5C3C56E55E35F47A156619C280FF1DC' /> \
														<input class='hiddenalertfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&ID=" + oListItem.attr("ows_ID") +"&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
													</strong> \
												</div> \
											</div> \
									</div> \
									<div class='publications'>";			
			}
			if(oListItem.attr("ows_Body") != null && oListItem.attr("ows_Body") != '<div></div>'){
				strAcuteHtml += "<div class='item-header'><strong>Description</strong>" + oListItem.attr("ows_Body") +"</div>";
			}
			if(oListItem.attr('ows_Next_x0020_update') != null){
				var nxtupd = new Date(replaceAll(oListItem.attr('ows_Next_x0020_update'), '-','/').replace('T', ' '));
				strAcuteHtml += "<div class='item-header'><div style='float:left;'><strong class='underheading'>Next Update</strong></div><div align='right' class='nxtupd'>" + nxtupd.format("dd MMM yyyy HH:mm") +"</div></div>";
			}
			strAcuteHtml += "</div></div>"	 
		});

		strAcuteHtml += "</div>";
		 
		$('#AcuteArea').html(strAcuteHtml);
		
		var soapEnv = "<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'> \
							<soap:Body><GetListItems xmlns='http://schemas.microsoft.com/sharepoint/soap/'> \
								<listName>NSD Tasks</listName> \
								<query><Query><Where><And><Eq><FieldRef Name='Category' /><Value Type='Choice'>Change</Value></Eq><Eq><FieldRef Name='Status' /><Value Type='Choice'>Open</Value></Eq></And></Where><OrderBy><FieldRef Name='StartDate' Ascending='True' /></OrderBy></Query></query> \
								<viewFields><ViewFields xmlns='' /></viewFields> \
								<queryOptions><QueryOptions><DateInUtc>TRUE</DateInUtc></QueryOptions></queryOptions> \
								</GetListItems> \
							</soap:Body> \
						</soap:Envelope>";
		
		$.ajax({
			url: "http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/_vti_bin/lists.asmx",
			type: "POST",
			dataType: "xml",
			data: soapEnv,
			complete: PlanedSucceeded,
			contentType: "text/xml; charset=\"utf-8\""
		});
	 }
	 
	 function PlanedSucceeded(xData, status) {
		var strPlanedHtml = '';
		if (subscriptionidCol.hasOwnProperty("Planned Service Interruptions")) {
			strPlanedHtml = "<div id='planedaccordion'> \
								<input class='alertsubid' type='hidden' value='" +subscriptionidCol['Planned Service Interruptions'] +"'/> \
									<h2 style='text-align:center;'><img class='unalrtmeheader' src='/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/unalertme.png'/>Planned</h2>";
		}
		else {
			strPlanedHtml = "<div id='acuteaccordion'><h2 style='text-align:center;'><img class='alrtmeplanned' src='/_layouts/images/alertme.png'/>Planned</h2>";
		}

		 $(xData.responseXML).find("z\\:row, row").each(function() {
			var oListItem = $(this);
			var nxtupd = new Date(replaceAll(oListItem.attr("ows_StartDate"), '-','/').replace('T', ' '));
		
			if (subscriptionidCol.hasOwnProperty(oListItem.attr("ows_ID"))) {
				strPlanedHtml += "<div class='block-inner planned item'> \
									<div class='sender'> \
										<img class='unalertimg' src='/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/unalertme.png'/> \
											<div class='toggle'> \
												<div class='itemheading'> \
													<div align='center' class='datefield'>" + nxtupd.format("dd MMM yyyy HH:mm") +"</div> \
													<strong> \
														<a class='itemtitle' href='#' >" + oListItem.attr("ows_Title") +"</a> \
														<input class='hiddenfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/listform.aspx?PageType=4&ListId={928A9E2D-ED86-4CB6-8FF2-405F733E4594}&ID=" + oListItem.attr("ows_ID") +"&amp;ContentTypeID=0x010800B5C3C56E55E35F47A156619C280FF1DC' /> \
														<input class='hiddenalertfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&ID=" + oListItem.attr("ows_ID") +"&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
														<input class='alertsubid' type='hidden' value='" +subscriptionidCol[oListItem.attr("ows_ID")] +"'/> \
													</strong> \
												</div> \
											</div> \
									</div> \
									<div class='publications'>";	
			}
			else {
				strPlanedHtml += "<div class='block-inner planned item'> \
									<div class='sender'> \
										<img class='alrtmeimg' src='/_layouts/images/alertme.png'/> \
											<div class='toggle'> \
												<div class='itemheading'> \
													<div align='center' class='datefield'>" + nxtupd.format("dd MMM yyyy HH:mm") +"</div> \
													<strong> \
														<a class='itemtitle' href='#' >" + oListItem.attr("ows_Title") +"</a> \
														<input class='hiddenfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/listform.aspx?PageType=4&ListId={928A9E2D-ED86-4CB6-8FF2-405F733E4594}&ID=" + oListItem.attr("ows_ID") +"&amp;ContentTypeID=0x010800B5C3C56E55E35F47A156619C280FF1DC' /> \
														<input class='hiddenalertfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&ID=" + oListItem.attr("ows_ID") +"&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
													</strong> \
												</div> \
											</div> \
									</div> \
									<div class='publications'>";			
			}
			
			if(oListItem.attr("ows_Body") != null){
				strPlanedHtml += "<div class='item-header'><strong>Description</strong>" + oListItem.attr("ows_Body") +"</div>";
			}
			if(oListItem.attr('ows_Next_x0020_update') != null){
				var nxtupd = new Date(replaceAll(oListItem.attr('ows_Next_x0020_update'), '-','/').replace('T', ' '));
				strPlanedHtml += "<div class='item-header'><div style='float:left;'><strong class='underheading'>Next Update</strong></div><div align='right' class='nxtupd'>" + nxtupd.format("dd MMM yyyy HH:mm") +"</div></div>";
			}
			strPlanedHtml += "</div></div>"	 
		 
		 });
		 strPlanedHtml += "</div>";

		$('#PlanedArea').html(strPlanedHtml);
		
		var soapEnv = "<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'> \
							<soap:Body><GetListItems xmlns='http://schemas.microsoft.com/sharepoint/soap/'> \
								<listName>NSD Tasks</listName> \
								<query><Query><Where><And><Eq><FieldRef Name='Category' /><Value Type='Choice'>Incident</Value></Eq><Eq><FieldRef Name='Status' /><Value Type='Choice'>Closed</Value></Eq></And></Where><OrderBy><FieldRef Name='Modified' Ascending='False' /></OrderBy></Query></query> \
								<viewFields><ViewFields xmlns='' /></viewFields> \
								<queryOptions><QueryOptions><DateInUtc>TRUE</DateInUtc></QueryOptions></queryOptions> \
								</GetListItems> \
							</soap:Body> \
						</soap:Envelope>";
		
		$.ajax({
			url: "http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/_vti_bin/lists.asmx",
			type: "POST",
			dataType: "xml",
			data: soapEnv,
			complete: FixedSucceeded,
			contentType: "text/xml; charset=\"utf-8\""
		});
	 }
	 
	 function PlanedFailed(sender, args) {
		alert('failed');
		alert(args.get_message());	
	 }	
	 
	 function FixedSucceeded(xData, status) {
		strFixedHtml = "<div id='fixedaccordion'><h2 style='text-align:center;'>Closed</h2>";
		
		var i = 0;

		$(xData.responseXML).find("z\\:row, row").each(function() {
			if(i < 5) {
				var oListItem = $(this);
								
				if(oListItem.attr('ows_Modified') != null){
					var nxtupd = new Date(replaceAll(oListItem.attr('ows_Modified'), '-','/').replace('T', ' '));
					
					strFixedHtml += "<div class='block-inner solved item'> \
										<div class='sender'> \
											<div class='toggle'> \
												<div align='center' class='datefield'><strong class='closedheading'>Closed</strong>" + nxtupd.format("dd MMM yyyy HH:mm") +"</div> \
												<div class='itemheading'> \
													<strong> \
														<a href='#' >" + oListItem.attr("ows_Title") +"</a> \
														<input class='hiddenfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/listform.aspx?PageType=4&ListId={928A9E2D-ED86-4CB6-8FF2-405F733E4594}&ID=" + oListItem.attr("ows_ID") +"&amp;ContentTypeID=0x010800B5C3C56E55E35F47A156619C280FF1DC' /> \
														<input class='hiddenalertfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&ID=" + oListItem.attr("ows_ID") +"&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
													</strong> \
												</div> \
											</div> \
										</div> \
										<div class='publications'>";			
				}
				else{
					strFixedHtml += "<div class='block-inner solved item'> \
										<div class='sender'><div class='toggle'> \
											<div class='itemheading'> \
												<strong> \
													<a href='#' >" + oListItem.attr("ows_Title") +"</a> \
													<input class='hiddenfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/listform.aspx?PageType=4&ListId={928A9E2D-ED86-4CB6-8FF2-405F733E4594}&ID=" + oListItem.attr("ows_ID") +"&amp;ContentTypeID=0x010800B5C3C56E55E35F47A156619C280FF1DC' /> \
													<input class='hiddenalertfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&ID=" + oListItem.attr("ows_ID") +"&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
												</strong> \
											</div> \
										</div> \
									</div> \
									<div class='publications'>";
				}
				if(oListItem.attr("ows_Body") != null){
					strFixedHtml += "<div class='item-header'><strong>Description</strong>" + oListItem.attr("ows_Body") +"</div>";
				}
				strFixedHtml += "</div></div>"	 
				i += 1;
			 }
		});

		if($(xData.responseXML).find("z\\:row, row").length > 4){
			strFixedHtml += "<a target='_blank' href='http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/Lists/NSDTasks/Solved.aspx' >All Closed</a>"
		}
		strFixedHtml += "</div>";

		$('#FixedArea').html(strFixedHtml);
		
				
		$('.alrtmeimg').click(function () {
			var options = SP.UI.$create_DialogOptions();
		    options.title = $(this).text();
		    options.url = $(this).closest('div').find('.hiddenalertfield').val();
		    options.dialogReturnValueCallback = Function.createDelegate(null, modalDialogClosedCallback);
		    SP.UI.ModalDialog.showModalDialog(options);
		});
		
		$('.alrtmeincidents').click(function () {
			
			var listname = $('#incidentsiframe').contents().find('#ctl00_PlaceHolderMain_ctl02_ctl00_TextTitle').val();
			$('#incidentsiframe').contents().find('#ctl00_PlaceHolderMain_ctl02_ctl00_TextTitle').val('Current Service Interruptions');

			$('#incidentsiframe').contents().find('#ctl00_PlaceHolderMain_ctl06_ctl01_DdlView option:contains("Current incidents")').prop("selected","selected");
			$('#incidentsiframe').contents().find('#ctl00_PlaceHolderMain_ctl06_ctl01_RadioBtnAlertFilter_8').attr('checked',true);
			
			$('#incidentsiframe').contents().find('#ctl00_PlaceHolderMain_ctl00_RptControls_BtnCreateAlerttop').click();
			$('.alrtmeincidents').attr('src', '/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/unalertme.png');
			$("#notymesincident").fadeTo(5000,1).fadeOut(1000); 
			$('.alrtmeincidents').unbind();
			$('.alrtmeincidents').click(function () {
				var options = SP.UI.$create_DialogOptions();
			    options.url = "http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/MySubs.aspx?IsDlg=1";
			    options.dialogReturnValueCallback = Function.createDelegate(null, modalDialogClosedCallbackDeleteAlert);
			    SP.UI.ModalDialog.showModalDialog(options);	   	 	
        	});
        });
        
        $('.alrtmeplanned').click(function () {
			var listname = $('#plannediframe').contents().find('#ctl00_PlaceHolderMain_ctl02_ctl00_TextTitle').val();
			$('#plannediframe').contents().find('#ctl00_PlaceHolderMain_ctl02_ctl00_TextTitle').val('Planned Service Interruptions');

			$('#plannediframe').contents().find('#ctl00_PlaceHolderMain_ctl06_ctl01_DdlView option:contains("Planned")').prop("selected","selected");
			$('#plannediframe').contents().find('#ctl00_PlaceHolderMain_ctl06_ctl01_RadioBtnAlertFilter_8').attr('checked',true);
		
			$('#plannediframe').contents().find('#ctl00_PlaceHolderMain_ctl00_RptControls_BtnCreateAlerttop').click();	
			$('.alrtmeplanned').attr('src', '/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/unalertme.png');
			$("#notymeplanned").fadeTo(5000,1).fadeOut(1000); 
			$('.alrtmeplanned').unbind();
			$('.alrtmeplanned').click(function () {
				var options = SP.UI.$create_DialogOptions();
			    options.url = "http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/MySubs.aspx?IsDlg=1";
			    options.dialogReturnValueCallback = Function.createDelegate(null, modalDialogClosedCallbackDeleteAlert);
			    SP.UI.ModalDialog.showModalDialog(options);	   	 	
        	});
        });
		
		$('.sender .toggle').click(function () {
            var $senderContainer = $(this).closest('.item');
            $senderContainer.toggleClass('selected');
        });
			
        $('.unalertimg').click(function () {
			var options = SP.UI.$create_DialogOptions();
		    options.url = $(this).closest('.sender').find('.alertsubid').val();
		    options.dialogReturnValueCallback = Function.createDelegate(null, modalDialogClosedCallbackDeleteAlert);
		    SP.UI.ModalDialog.showModalDialog(options);	   	 	
        });
        
        $('.unalrtmeheader').click(function () {
			var options = SP.UI.$create_DialogOptions();
		    options.url = $(this).closest('div').find('.alertsubid').val();
		    options.dialogReturnValueCallback = Function.createDelegate(null, modalDialogClosedCallbackDeleteAlert);
		    SP.UI.ModalDialog.showModalDialog(options);	   	 	
        });
		
		$('.managealerts').click(function () {
			var options = SP.UI.$create_DialogOptions();
		    options.url = "http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/MySubs.aspx?IsDlg=1";
		    options.dialogReturnValueCallback = Function.createDelegate(null, modalDialogClosedCallbackDeleteAlert);
		    SP.UI.ModalDialog.showModalDialog(options);	   	 	
        });
        
        $('a.itemtitle').click(function () {
				var options = SP.UI.$create_DialogOptions();
			    options.title = $(this).text();
			    options.url = $(this).closest('div').find('.hiddenfield').val();
			    options.dialogReturnValueCallback = Function.createDelegate(null, modalDialogClosedCallback);
			    SP.UI.ModalDialog.showModalDialog(options);
		});
			
	 }
	  
	 function modalDialogClosedCallbackDeleteAlert(callback) {
	 	reloadContent();
	 }
	 
	 function FixedFailed(sender, args) {
		alert(args.get_message());	
	 }	
	 function AcuteFailed(sender, args) {
		alert(args.get_message());	
	}

	function modalDialogClosedCallback(callback) {
	 	if (callback == 1){
		 	reloadContent();	 	
		}
	}
    
    $(document).ready(function () {    	
    	$('#s4-statusbarcontainer').hide();
    	if (window.PIE) {
	        $('#notymesincident, #notymeplanned, .alerthelptoggle').each(function() {
	            PIE.attach(this);
	        });
   		}
   		/*
   		$(".alerthelp").click(function () {
			 if($(".alerthelptoggle").is(':hidden')){
			 	$(".alerthelptoggle").fadeTo(1000,1)
			 }
			 else{
			 	$(".alerthelptoggle").fadeOut(1000); 
			 }
			 
 		});
 		*/
   		window.setInterval(function(){
  			reloadContent();
		}, 120000);
   		   		
        //ExecuteOrDelayUntilScriptLoaded(getTheList, "sp.js");
        getTheList();
    });
        
	function onError(msg) {
	    alert(msg);
	}
	
	function reloadContent(){
		$('#AcuteArea').html('<img src="http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/loading.gif">');
		$('#PlanedArea').html('<img src="http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/loading.gif">');
		$('#FixedArea').html('<img src="http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/loading.gif">');
		$('#NewItemArea').html("<a class='anewitem' href='#'>New Item</a>");
		var iframehtml = "<iframe id='incidentsiframe' src='http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAcute%2520issues%2Easpx'></iframe> \
						  <iframe id='plannediframe' src='http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAcute%2520issues%2Easpx'></iframe>"
		$('#hiddeniframes').html(iframehtml);
		$('.managealerts').unbind();
	 	getTheList();
	}
	
	function replaceAll(txt, replace, with_this) {  
		return txt.replace(new RegExp(replace, 'g'),with_this);
	}
	
	
	
});