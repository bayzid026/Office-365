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
		
		// Get the current client context to start. Most things run from the client context.
		clientContext = new SP.ClientContext.get_current();
		
		// traverse up through the site to the root level, and get the list called 'my-list'.
		// the root level isn't required, you can get a list from your current site level if you want, just use get_web() instead of get_site().get_rootWeb()
		myList = clientContext.get_web().get_lists().getByTitle("NSD Tasks");
		 
		// use a standard syntax CAML query to filter your results and the fields returned if required, by adding the following, or passing parameters to the load command below
		var query = new SP.CamlQuery();
		
		// You can leave out this line if you just want to return the entire list.
		query.set_viewXml('<View><Query><Where><And><Eq><FieldRef Name="Category" /><Value Type="Choice">Incident</Value></Eq><Eq><FieldRef Name="Status" /><Value Type="Choice">Open</Value></Eq></And></Where><OrderBy><FieldRef Name="Modified" Ascending="False" /></OrderBy></Query></View>');

		// add your query to the getItems command for your list
		collListItems = myList.getItems(query);
		 
		// issue the load command, these can be batched for multiple operations
		clientContext.load(collListItems);
		
		// execute the actual query against the server, and pass the objects we have created to either a success or failure function
		clientContext.executeQueryAsync(AcuteSucceeded, AcuteFailed);

	}
	
	function AcuteSucceeded(sender, args) {
		
		var listItemEnumerator = collListItems.getEnumerator();
		var strAcuteHtml = '';
		// loop through the list items
		
		if (subscriptionidCol.hasOwnProperty("Current Service Interruptions")) {
			strAcuteHtml = "<div id='acuteaccordion'> \
								<input class='alertsubid' type='hidden' value='" +subscriptionidCol['Current Service Interruptions'] +"'/> \
									<h2 style='text-align:center;'><img class='unalrtmeheader' src='/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/unalertme.png'/>Current</h2>";
		}
		else {
			strAcuteHtml = "<div id='acuteaccordion'><h2 style='text-align:center;'><img class='alrtmeincidents' src='/_layouts/images/alertme.png'/>Current</h2>";
		}

		while (listItemEnumerator.moveNext()) {

			var oListItem = listItemEnumerator.get_current();
			
			var nxtupd = oListItem.get_item('Modified');
			
			if (subscriptionidCol.hasOwnProperty(oListItem.get_item('ID'))) {
				strAcuteHtml += "<div class='block-inner acute item'> \
									<div class='sender'> \
										<img class='unalertimg' src='/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/unalertme.png'/> \
											<div class='toggle'> \
												<div align='center' class='datefield'>" + nxtupd.format("dd MMM yyyy HH:mm") +"</div> \
												<div class='itemheading'> \
													<strong> \
														<a class='itemtitle' href='#' >" + oListItem.get_item('Title') +"</a> \
														<input class='hiddenfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/listform.aspx?PageType=4&ListId={928A9E2D-ED86-4CB6-8FF2-405F733E4594}&ID=" + oListItem.get_item('ID') +"&amp;ContentTypeID=0x010800B5C3C56E55E35F47A156619C280FF1DC' /> \
														<input class='hiddenalertfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&ID=" + oListItem.get_item('ID') +"&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
														<input class='alertsubid' type='hidden' value='" +subscriptionidCol[oListItem.get_item('ID')] +"'/> \
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
												<div align='center' class='datefield'>" + nxtupd.format("dd MMM yyyy HH:mm") +"</div> \
												<div class='itemheading'> \
													<strong> \
														<a class='itemtitle' href='#' >" + oListItem.get_item('Title') +"</a> \
														<input class='hiddenfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/listform.aspx?PageType=4&ListId={928A9E2D-ED86-4CB6-8FF2-405F733E4594}&ID=" + oListItem.get_item('ID') +"&amp;ContentTypeID=0x010800B5C3C56E55E35F47A156619C280FF1DC' /> \
														<input class='hiddenalertfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&ID=" + oListItem.get_item('ID') +"&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
													</strong> \
												</div> \
										</div> \
									</div> \
									<div class='publications'>";			
			}
			if(oListItem.get_item('Body') != null && oListItem.get_item('Body') != '<div></div>'){
				strAcuteHtml += "<div class='item-header'><strong>Description</strong>" + oListItem.get_item('Body') +"</div>";
			}
			if(oListItem.get_item('Next_x0020_update') != null){
				var nxtupd = oListItem.get_item('Next_x0020_update');
				strAcuteHtml += "<div class='item-header'><div style='float:left;'><strong class='underheading'>Next Update</strong></div><div align='right' class='nxtupd'>" + nxtupd.format("dd MMM yyyy HH:mm") +"</div></div>";
			}
			strAcuteHtml += "</div></div>"	 
		 }
		 strAcuteHtml += "</div>";
		 
		$('#AcuteArea').html(strAcuteHtml);
						 
		var query = new SP.CamlQuery();
		
		query.set_viewXml('<View><Query><Where><And><Eq><FieldRef Name="Category" /><Value Type="Choice">Change</Value></Eq><Eq><FieldRef Name="Status" /><Value Type="Choice">Open</Value></Eq></And></Where><OrderBy><FieldRef Name="StartDate" Ascending="True" /></OrderBy></Query></View>');
		collListItems = myList.getItems(query);
		 
		clientContext.load(collListItems);
		
		clientContext.executeQueryAsync(PlanedSucceeded, PlanedFailed);
	 }
	 
	 function PlanedSucceeded(sender, args) {
		var listItemEnumeratorpl = collListItems.getEnumerator();
		var strHtml = '';
		// loop through the list items
		//strPlanedHtml = "<div id='planedaccordion'><h2 style='text-align:center;'><img class='alrtmeplanned' src='/_layouts/images/alertme.png'/>Planned</h2>";
		if (subscriptionidCol.hasOwnProperty("Planned Service Interruptions")) {
			strPlanedHtml = "<div id='planedaccordion'> \
								<input class='alertsubid' type='hidden' value='" +subscriptionidCol['Planned Service Interruptions'] +"'/> \
									<h2 style='text-align:center;'><img class='unalrtmeheader' src='/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/unalertme.png'/>Planned</h2>";
		}
		else {
			strPlanedHtml = "<div id='acuteaccordion'><h2 style='text-align:center;'><img class='alrtmeplanned' src='/_layouts/images/alertme.png'/>Planned</h2>";
		}

		
		 while (listItemEnumeratorpl.moveNext()) {
			var oListItem = listItemEnumeratorpl.get_current();
			
			var nxtupd = oListItem.get_item('StartDate');
		
			if (subscriptionidCol.hasOwnProperty(oListItem.get_item('ID'))) {
				strPlanedHtml += "<div class='block-inner planned item'> \
									<div class='sender'> \
										<img class='unalertimg' src='/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/unalertme.png'/> \
											<div class='toggle'> \
												<div align='center' class='datefield'>" + nxtupd.format("dd MMM yyyy HH:mm") +"</div> \
												<div class='itemheading'> \
													<strong> \
														<a class='itemtitle' href='#' >" + oListItem.get_item('Title') +"</a> \
														<input class='hiddenfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/listform.aspx?PageType=4&ListId={928A9E2D-ED86-4CB6-8FF2-405F733E4594}&ID=" + oListItem.get_item('ID') +"&amp;ContentTypeID=0x010800B5C3C56E55E35F47A156619C280FF1DC' /> \
														<input class='hiddenalertfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&ID=" + oListItem.get_item('ID') +"&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
														<input class='alertsubid' type='hidden' value='" +subscriptionidCol[oListItem.get_item('ID')] +"'/> \
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
												<div align='center' class='datefield'>" + nxtupd.format("dd MMM yyyy HH:mm") +"</div> \
												<div class='itemheading'> \
													<strong> \
														<a class='itemtitle' href='#' >" + oListItem.get_item('Title') +"</a> \
														<input class='hiddenfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/listform.aspx?PageType=4&ListId={928A9E2D-ED86-4CB6-8FF2-405F733E4594}&ID=" + oListItem.get_item('ID') +"&amp;ContentTypeID=0x010800B5C3C56E55E35F47A156619C280FF1DC' /> \
														<input class='hiddenalertfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&ID=" + oListItem.get_item('ID') +"&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
													</strong> \
												</div> \
											</div> \
									</div> \
									<div class='publications'>";			
			}
			
			if(oListItem.get_item('Body') != null && oListItem.get_item('Body') != '<div></div>'){
				strPlanedHtml += "<div class='item-header'><h4>Description</h4>" + oListItem.get_item('Body') +"</div>";
			}
			if(oListItem.get_item('Next_x0020_update') != null){
				var nxtupd = oListItem.get_item('Next_x0020_update');
				strPlanedHtml += "<div class='item-header'><div style='float:left;'><strong class='underheading'>Next Update</strong></div><div align='right' class='nxtupd'>" + nxtupd.format("dd MMM yyyy HH:mm") +"</div></div>";
			}
			strPlanedHtml += "</div></div>"	 
		 
		 }
		 strPlanedHtml += "</div>";

		$('#PlanedArea').html(strPlanedHtml);
						 
		var query = new SP.CamlQuery();
		
		query.set_viewXml('<View><Query><Where><And><Eq><FieldRef Name="Category" /><Value Type="Choice">Incident</Value></Eq><Eq><FieldRef Name="Status" /><Value Type="Choice">Closed</Value></Eq></And></Where><OrderBy><FieldRef Name="Modified" Ascending="False" /></OrderBy></Query><RowLimit Paged="False">10</RowLimit></View>');
		collListItems = myList.getItems(query);
		 
		clientContext.load(collListItems);
		
		clientContext.executeQueryAsync(FixedSucceeded, FixedFailed);

	 }
	 function PlanedFailed(sender, args) {
		//alert(args.get_message());
		window.location.reload(true);
	 }	
	 
	  function FixedSucceeded(sender, args) {
		var listItemEnumeratorpl = collListItems.getEnumerator();
		var strHtml = '';
		// loop through the list items
		strFixedHtml = "<div id='fixedaccordion'><h2 style='text-align:center;'>Closed</h2>";
		
		var i = 0;

		while (listItemEnumeratorpl.moveNext() && i < 5) {
			var oListItem = listItemEnumeratorpl.get_current();
			
			if(oListItem.get_item('Modified') != null){
				var nxtupd = oListItem.get_item('Modified');
				strFixedHtml += "<div class='block-inner solved item'><div class='sender'> \
									<div class='toggle'> \
										<div align='center' class='datefield'><strong class='closedheading'>Closed</strong>" + nxtupd.format("dd MMM yyyy HH:mm") +"</div> \
										<div class='itemheading'> \
											<strong><a href='#' >" + oListItem.get_item('Title') +"</a> \
												<input class='hiddenfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/listform.aspx?PageType=4&ListId={928A9E2D-ED86-4CB6-8FF2-405F733E4594}&ID=" + oListItem.get_item('ID') +"&amp;ContentTypeID=0x010800B5C3C56E55E35F47A156619C280FF1DC' /> \
												<input class='hiddenalertfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&ID=" + oListItem.get_item('ID') +"&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
											</strong> \
										</div> \
									</div> \
								</div> \
								<div class='publications'>";			
			}
			else{
				strFixedHtml += "<div class='block-inner solved item'><div class='sender'> \
									<div class='toggle'> \
										<strong><a href='#' >" + oListItem.get_item('Title') +"</a> \
											<input class='hiddenfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/listform.aspx?PageType=4&ListId={928A9E2D-ED86-4CB6-8FF2-405F733E4594}&ID=" + oListItem.get_item('ID') +"&amp;ContentTypeID=0x010800B5C3C56E55E35F47A156619C280FF1DC' /> \
											<input class='hiddenalertfield' type='hidden' value='/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&ID=" + oListItem.get_item('ID') +"&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
										</strong> \
									</div> \
								</div> \
								<div class='publications'>";
			}
			if(oListItem.get_item('Body') != null && oListItem.get_item('Body') != '<div></div>'){
				strFixedHtml += "<div class='item-header'><h4>Description</h4>" + oListItem.get_item('Body') +"</div>";
			}
			strFixedHtml += "</div></div>"	 
			i += 1;
		}
		if(collListItems.get_count() > 4){
			strFixedHtml += "<a href='http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/Lists/NSDTasks/Solved.aspx' >All Closed</a>"
		}
		
		strFixedHtml += "</div>";

		$('#FixedArea').html(strFixedHtml);
		
		if (IsEditor) {
			$('a.itemtitle').click(function () {
				var options = SP.UI.$create_DialogOptions();
			    options.title = $(this).text();
			    options.url = $(this).closest('div').find('.hiddenfield').val();
			    options.dialogReturnValueCallback = Function.createDelegate(null, modalDialogClosedCallback);
			    SP.UI.ModalDialog.showModalDialog(options);
			});
			
			$('.anewitem').click(function () {
				var options = SP.UI.$create_DialogOptions();
		    	options.title = $(this).text();
		    	options.url = "http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/Lists/NSDTasks/NewForm.aspx?RootFolder=";
		    	options.dialogReturnValueCallback = Function.createDelegate(null, modalDialogClosedCallback);
		    	SP.UI.ModalDialog.showModalDialog(options);
			});
			
			$('.anewitem').show();
			
		}
		
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
                options.url = _spPageContextInfo.webAbsoluteUrl + "/_layouts/MySubs.aspx?IsDlg=1";
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
            options.url = _spPageContextInfo.webAbsoluteUrl + "/_layouts/MySubs.aspx?IsDlg=1";
		    options.dialogReturnValueCallback = Function.createDelegate(null, modalDialogClosedCallbackDeleteAlert);
		    SP.UI.ModalDialog.showModalDialog(options);	   	 	
        });
        
        
	 }
	  
	 function modalDialogClosedCallbackDeleteAlert(callback) {
	 	reloadContent();
	 }
	 
	 function FixedFailed(sender, args) {
		//alert(args.get_message());	
		window.location.reload(true);	
	 }	
	 function AcuteFailed(sender, args) {
	 	//alert(args.get_message());
	 	window.location.reload(true);
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
			 if($("#alerthelptoggle").is(':hidden')){
			 	$("#alerthelptoggle").fadeTo(1000,1);
			 }
			 else{
			 	$("#alerthelptoggle").fadeOut(1000); 
			 }
			 
 		});
 		*/
 		$(".tipsandtrix").click(function () {
			 if($("#tipsandtrixid").is(':hidden')){
			 	$("#tipsandtrixid").fadeTo(1000,1);
			 }
			 else{
			 	$("#tipsandtrixid").fadeOut(1000); 
			 }
			 
 		});

 		
 		shortcut.add("Ctrl+Shift+F",function() {
			if (!$("form").is(':hidden')) {
				$('body').append("<div id='tmpissuelistcontainer' class='ms-WPBody'></div>")
				$('.ms-rte-layoutszone-inner').appendTo('#tmpissuelistcontainer');
				
				$('body').css({
	                overflowY:'scroll'
	            });

				//$('.ms-rte-layoutszone-inner').centerDiv();
				
				$('form').hide();
			}
			else {
				alert('Already fullscreen');
			}
		});
		
		shortcut.add("Ctrl+Shift+N",function() {
			window.location = "http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/SitePages/BroadCast.aspx";
			/*
			if ($("form").is(':hidden')) {
				$('.ms-rte-layoutszone-inner').appendTo('.ms-rte-layoutszone-outer');
				$('#tmpissuelistcontainer').remove();
				
				$('form').show();
			}
			else {
				alert('Already normalscreen')
			}
			*/
		});

 		
         		
 		
   		window.setInterval(function(){
  			reloadContent();
		}, 120000);
   		   		
        ExecuteOrDelayUntilScriptLoaded(getTheList, "sp.js");
    });
        
	function onError(msg) {
	    //alert(msg);
	    window.location.reload(true);
	}
	
	function reloadContent(){
		$('#AcuteArea').html('<img src="http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/loading.gif">');
		$('#PlanedArea').html('<img src="http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/loading.gif">');
		$('#FixedArea').html('<img src="http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/SiteAssets/loading.gif">');
		$('#NewItemArea').html("<a class='anewitem' href='#'>New BroadCast</a>");
		var iframehtml = "<iframe id='incidentsiframe' src='http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAcute%2520issues%2Easpx'></iframe> \
						  <iframe id='plannediframe' src='http://ipostnord.com/orgs/corp/IT/bis/sim/ServiceIntegration/_layouts/SubNew.aspx?List=%7B928A9E2D%2DED86%2D4CB6%2D8FF2%2D405F733E4594%7D&Source=http%3A%2F%2Fipostnord%2Ecom%2Forgs%2Fcorp%2FIT%2Fbis%2Fsim%2FServiceIntegration%2FLists%2FNSDTasks%2FAcute%2520issues%2Easpx'></iframe>"
		$('#hiddeniframes').html(iframehtml);
		$('.managealerts').unbind();
	 	getTheList();
	}
	
	jQuery.fn.centerDiv = function (options) {
	    var o = this;
	    $(window).bind('load resize',function(){
	        $(o).each(function(){
	            $(this).css({
	                position:'absolute',
	                left: ($(window).width() - $(this).outerWidth())/2
	            });
	    	});
	    });
	}
	
	function FixRibbonAndWorkspaceDimensions(){
		  ULSxSy:;
		  g_frl = true;
		  var elmRibbon = GetCachedElement("s4-ribbonrow");
		  var elmWorkspace = GetCachedElement("s4-workspace");
		  var elmTitleArea = GetCachedElement("s4-titlerow");
		  var elmBodyTable = GetCachedElement("s4-bodyContainer");
		  if(!elmRibbon || !elmWorkspace || !elmBodyTable){
		    return;
		  }
		  if (!g_setWidthInited){
		    var setWidth = true;
		    if (elmWorkspace.className.indexOf("s4-nosetwidth") > -1)
		      setWidth = false;
		    g_setWidth = setWidth;
		    g_setWidthInited = true;
		  }
		  else{
		    var setWidth = g_setWidth;
		  }
		  var baseRibbonHeight = RibbonIsMinimized() ? 44 : 135;
		  var ribbonHeight = baseRibbonHeight + g_wpadderHeight;
		  if(GetCurrentEltStyle(elmRibbon, "visibility") == "hidden"){
		    ribbonHeight = 0;
		  }
		
		  // Override default resizing behavior
		  // -- adds padding to the top of the "s4-workspace" <div> if the ribbon exists and has content
		  // -- allows the ribbon to be positioned using CSS instead of JavaScript (more accessible)
		  // -- checks to see if the page is inside a "no-ribbon" dialog
		  if(elmRibbon.children.length > 0 && document.getElementsByTagName("html")[0].className.indexOf('ms-dialog-nr') == -1){
		    elmWorkspace.style.paddingTop = ribbonHeight + 'px';
		  }
		}

});