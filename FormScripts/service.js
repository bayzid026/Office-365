(function () {
  window.broadcastTool = window.broadcastTool || {};
  window.broadcastTool.services = window.broadcastTool.services || {};
  window.broadcastTool.services = (function () {
    var self = {};

    self.getCurrentUserPermission = function () {
      //debugger;
      var web, clientContext, currentUser, oList, perMask;
      var deferred = $.Deferred();
      clientContext = new SP.ClientContext.get_current();
      web = clientContext.get_web();
      currentUser = web.get_currentUser();
      oList = web.get_lists().getById("24CA6790-DDED-45BD-BE41-78CFB44CA5FE");
      clientContext.load(oList, "EffectiveBasePermissions");
      clientContext.load(currentUser);
      clientContext.load(web);

      clientContext.executeQueryAsync(
        function () {
          if (
            oList
              .get_effectiveBasePermissions()
              .has(SP.PermissionKind.editListItems)
          ) {
            console.log("user has edit permission");
            IsEditor = true;
            deferred.resolve(IsEditor);
          } else {
            console.log("user doesn't have edit permission");
            IsEditor = false;
            deferred.resolve(IsEditor);
          }
          // getAlertsKeyCollection();
        },
        function (sender, args) {
          console.log(
            "request failed " +
              args.get_message() +
              "\n" +
              args.get_stackTrace()
          );
          IsEditor = false;
          deferred.resolve(IsEditor);
          //  getAlertsKeyCollection();
        }
      );
      return deferred.promise();
    };

    self.getAlertsKeyCollection = function (siteUrl, success) {
      var soapenv =
        "<soap:Envelope xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema' xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'> \
            <soap:Body> \
                            <GetAlerts xmlns='http://schemas.microsoft.com/sharepoint/soap/2002/1/alerts/' /> \
            </soap:Body> \
                    </soap:Envelope>";

      $.ajax({
        type: "POST",
        data: soapenv,
        dataType: "xml",
        url: siteUrl + "/_vti_bin/alerts.asmx",
        contentType: "text/xml; charset=utf-8",
        complete: onAlertsLoadComplete,
        error: onError,
      });

      function onAlertsLoadComplete(xData, status) {
        subscriptionidCol = new Array();
        $(xData.responseXML)
          .find("Alert")
          .each(function () {
            var listitemid = $(this).find("AlertForUrl").text().split("=")[1];
            if (listitemid == null) {
              subscriptionidCol[$(this).find("Title").text()] =
                $(this).find("EditAlertUrl").text() + "&IsDlg=1";
            } else {
              subscriptionidCol[listitemid] =
                $(this).find("EditAlertUrl").text() + "&IsDlg=1";
            }
          });
        success(subscriptionidCol);
      }

      function onError(msg) {
        window.location.reload(true);
      }
    };
    self.setSubscriptionidCol = function (xData, success) {
      var subscriptionidCol = new Array();
      $(xData.responseXML)
        .find("Alert")
        .each(function () {
          var listitemid = $(this).find("AlertForUrl").text().split("=")[1];
          if (listitemid == null) {
            subscriptionidCol[$(this).find("Title").text()] =
              $(this).find("EditAlertUrl").text() + "&IsDlg=1";
          } else {
            subscriptionidCol[listitemid] =
              $(this).find("EditAlertUrl").text() + "&IsDlg=1";
          }
        });
      success(subscriptionidCol);
    };

    self.getAcuteListData = function (
      siteUrl,
      subscriptionidCol,
      listGuid,
      contentTypeId,
      currentGroupID,
      success
    ) {
      clientContext = new SP.ClientContext.get_current();
      myList = clientContext.get_web().get_lists().getById("24CA6790-DDED-45BD-BE41-78CFB44CA5FE");

      var query = new SP.CamlQuery();
      query.set_viewXml(
        '<View><Query><Where><And><Eq><FieldRef Name="Category" /><Value Type="Choice">Incident</Value></Eq><Eq><FieldRef Name="Status" /><Value Type="Choice">Open</Value></Eq></And></Where><OrderBy><FieldRef Name="Modified" Ascending="False" /></OrderBy></Query></View>'
      );
      collListItems = myList.getItems(query);
      clientContext.load(collListItems);
      clientContext.executeQueryAsync(AcuteSucceeded, AcuteFailed);

      function AcuteFailed(sender, args) {
        window.location.reload(true);
      }

      function AcuteSucceeded(sender, args) {
        var isSubscribed = getValue("Current__" + _spPageContextInfo.userEmail);
        if (isSubscribed === null) {
          self
            .GetUserId(currentGroupID, _spPageContextInfo.userEmail)
            .done(function (isMember) {
              console.log("isMember", isMember);
              if (isMember) {
                cacheLong(
                  "Current__" + _spPageContextInfo.userEmail,
                  "true",
                  true
                );
                manipulateHtml(true);
              } else {
                manipulateHtml(false);
              }
            })
            .catch(function (error) {
              console.log("error", error);
              manipulateHtml(false);
            });
        } else if (isSubscribed && isSubscribed == "true") {
          manipulateHtml(true);
        } else {
          manipulateHtml(false);
        }
        var listItemEnumeratorpl = collListItems.getEnumerator();
        var strHtml = "",
          strAcuteHtml = "";

        function manipulateHtml(isSubscribed) {
          if (isSubscribed) {
            strAcuteHtml =
              "<div id='acuteaccordion'> \
                                <input class='alertsubid' type='hidden' value='" +
              subscriptionidCol["Incident Service Interruptions"] +
              "'/> \
                                    <h2 style='text-align:center;'><img class='unalrtmeheader' src='" +
              siteUrl +
              "/SiteAssets/unalertme.png'/>Current</h2>";
          } else {
            strAcuteHtml =
              "<div id='acuteaccordion'><h2 style='text-align:center;'><img class='alrtmeincidents' src='" +
              siteUrl +
              "/SiteAssets/alertme.png'/>Current</h2>";
          }

          var listItemEnumerator = collListItems.getEnumerator();

          while (listItemEnumerator.moveNext()) {
            var oListItem = listItemEnumerator.get_current();

            var nxtupd = oListItem.get_item("Modified");

            /*  if(oListItem.get_item('MobileNotification') == true) {
                            PostActionForMobileNotification(currentGroupID,oListItem.get_item('ID'),oListItem.get_item('Title'),"Critical").done(function(listItemId) {
                                updateListItem(listItemId);
                                console.log(data);
                            });
                        } */

            if (subscriptionidCol.hasOwnProperty(oListItem.get_item("ID"))) {
              strAcuteHtml +=
                "<div class='block-inner acute item'> \
                                    <div class='sender'> \
                                        <img class='unalertimg' src='" +
                siteUrl +
                "/SiteAssets/unalertme.png'/> \
                                            <div class='toggle'> \
                                                <div align='center' class='datefield'>" +
                nxtupd.format("dd MMM yyyy HH:mm") +
                "</div> \
                                                <div class='itemheading'> \
                                                    <strong> \
                                                        <a class='itemtitle' href='#' >" +
                oListItem.get_item("Title") +
                "</a> \
                                                        <input class='hiddenfield' type='hidden' value='" +
                siteUrl +
                "/_layouts/listform.aspx?PageType=4&ListId=" +
                listGuid +
                "&ID=" +
                oListItem.get_item("ID") +
                "&amp;ContentTypeID=" +
                contentTypeId +
                "' /> \
                                                        <input class='hiddenalertfield' type='hidden' value='" +
                siteUrl +
                "/_layouts/SubNew.aspx?List==" +
                listGuid +
                "&ID=" +
                oListItem.get_item("ID") +
                "&Source=" +
                siteUrl +
                "%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
                                                        <input class='alertsubid' type='hidden' value='" +
                subscriptionidCol[oListItem.get_item("ID")] +
                "'/> \
                                                    </strong> \
                                                </div> \
                                        </div> \
                                    </div> \
                                    <div class='publications'>";
            } else {
              strAcuteHtml +=
                "<div class='block-inner acute item'> \
                                    <div class='sender'> \
                                        <img class='alrtmeimg' src='" +
                siteUrl +
                "/SiteAssets/alertme.png'/> \
                                            <div class='toggle'> \
                                                <div align='center' class='datefield'>" +
                nxtupd.format("dd MMM yyyy HH:mm") +
                "</div> \
                                                <div class='itemheading'> \
                                                    <strong> \
                                                        <a class='itemtitle' href='#' >" +
                oListItem.get_item("Title") +
                "</a> \
                                                        <input class='hiddenfield' type='hidden' value='" +
                siteUrl +
                "/_layouts/listform.aspx?PageType=4&ListId=" +
                listGuid +
                "&ID=" +
                oListItem.get_item("ID") +
                "&amp;ContentTypeID=" +
                contentTypeId +
                "' /> \
                                                        <input class='hiddenalertfield' type='hidden' value='" +
                siteUrl +
                "/_layouts/SubNew.aspx?List=" +
                listGuid +
                "&ID=" +
                oListItem.get_item("ID") +
                "&Source=" +
                siteUrl +
                "%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
                                                    </strong> \
                                                </div> \
                                        </div> \
                                    </div> \
                                    <div class='publications'>";
            }
            if (
              oListItem.get_item("Body") != null &&
              oListItem.get_item("Body") != "<div></div>"
            ) {
              strAcuteHtml +=
                "<div class='item-header'><strong>Description</strong>" +
                oListItem.get_item("Body") +
                "</div>";
            }
            if (oListItem.get_item("Next_x0020_update") != null) {
              var nxtupd = oListItem.get_item("Next_x0020_update");
              strAcuteHtml +=
                "<div class='item-header'><div style='float:left;'><strong class='underheading'>Next Update</strong></div><div align='right' class='nxtupd'>" +
                nxtupd.format("dd MMM yyyy HH:mm") +
                "</div></div>";
            }
            strAcuteHtml += "</div></div>";
          }
          strAcuteHtml += "</div>";
          success(strAcuteHtml);
        }
      }
    };

    self.getPlannedData = function (
      siteUrl,
      subscriptionidCol,
      listGuid,
      contentTypeId,
      plannedGroupID,
      success
    ) {
      var query = new SP.CamlQuery();

      query.set_viewXml(
        '<View><Query><Where><And><Eq><FieldRef Name="Category" /><Value Type="Choice">Change</Value></Eq><Eq><FieldRef Name="Status" /><Value Type="Choice">Open</Value></Eq></And></Where><OrderBy><FieldRef Name="StartDate" Ascending="True" /></OrderBy></Query></View>'
      );
      collListItems = myList.getItems(query);

      clientContext.load(collListItems);

      clientContext.executeQueryAsync(PlanedSucceeded, PlanedFailed);

      function PlanedFailed(sender, args) {
        window.location.reload(true);
      }

      function PlanedSucceeded(sender, args) {
        var listItemEnumeratorpl = collListItems.getEnumerator();
        var strHtml = "",
          strPlanedHtml = "";

        var isSubscribed = getValue("Planned__" + _spPageContextInfo.userEmail);
        if (isSubscribed === null) {
          // GroupOperation(plannedGroupID, _spPageContextInfo.userEmail, httpFlowUrlForGroupMemberChecking)
          self
            .GetUserId(plannedGroupID, _spPageContextInfo.userEmail)
            .done(function (isMember) {
              console.log("isMember", isMember);
              if (isMember) {
                // window.localStorage.setItem("Planned_" + _spPageContextInfo.userEmail, "true");
                cacheLong(
                  "Planned__" + _spPageContextInfo.userEmail,
                  "true",
                  true
                );
                manipulateHtml(true);
              } else {
                manipulateHtml(false);
              }
            })
            .catch(function (error) {
              console.log("error", error);
              manipulateHtml(false);
            });
        } else if (isSubscribed && isSubscribed == "true") {
          manipulateHtml(true);
        } else {
          manipulateHtml(false);
        }

        function manipulateHtml(isSubscribed) {
          if (isSubscribed) {
            strPlanedHtml =
              "<div id='planedaccordion'> \
                                <input class='alertsubid' type='hidden' value='" +
              subscriptionidCol["Change Service Interruptions"] +
              "'/> \
                                    <h2 style='text-align:center;'><img class='unalrtmeheader' src='" +
              siteUrl +
              "/SiteAssets/unalertme.png'/>Planned</h2>";
          } else {
            strPlanedHtml =
              "<div id='acuteaccordion'><h2 style='text-align:center;'><img class='alrtmeplanned' src='" +
              siteUrl +
              "/siteAssets/alertme.png'/>Planned</h2>";
          }

          while (listItemEnumeratorpl.moveNext()) {
            var oListItem = listItemEnumeratorpl.get_current();

            var nxtupd = oListItem.get_item("StartDate");
            if (nxtupd == null) {
              nxtupd = "";
            } else {
              nxtupd = nxtupd.format("dd MMM yyyy HH:mm");
            }

            if (subscriptionidCol.hasOwnProperty(oListItem.get_item("ID"))) {
              strPlanedHtml +=
                "<div class='block-inner planned item'> \
                                <div class='sender'> \
                                    <img class='unalertimg' src='" +
                siteUrl +
                "/SiteAssets/unalertme.png'/> \
                                        <div class='toggle'> \
                                            <div align='center' class='datefield'>" +
                nxtupd +
                "</div> \
                                            <div class='itemheading'> \
                                                <strong> \
                                                    <a class='itemtitle' href='#' >" +
                oListItem.get_item("Title") +
                "</a> \
                                                    <input class='hiddenfield' type='hidden' value='" +
                siteUrl +
                "/_layouts/listform.aspx?PageType=4&ListId=" +
                listGuid +
                "&ID=" +
                oListItem.get_item("ID") +
                "&amp;ContentTypeID=" +
                contentTypeId +
                "' /> \
                                                    <input class='hiddenalertfield' type='hidden' value='" +
                siteUrl +
                "/_layouts/SubNew.aspx?List=" +
                listGuid +
                "&ID=" +
                oListItem.get_item("ID") +
                "&Source=" +
                siteUrl +
                "%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
                                                    <input class='alertsubid' type='hidden' value='" +
                subscriptionidCol[oListItem.get_item("ID")] +
                "'/> \
                                                </strong> \
                                            </div> \
                                        </div> \
                                </div> \
                                <div class='publications'>";
            } else {
              strPlanedHtml +=
                "<div class='block-inner planned item'> \
                                <div class='sender'> \
                                    <img class='alrtmeimg' src='" +
                siteUrl +
                "/SiteAssets/alertme.png'/> \
                                        <div class='toggle'> \
                                            <div align='center' class='datefield'>" +
                nxtupd +
                "</div> \
                                            <div class='itemheading'> \
                                                <strong> \
                                                    <a class='itemtitle' href='#' >" +
                oListItem.get_item("Title") +
                "</a> \
                                                    <input class='hiddenfield' type='hidden' value='" +
                siteUrl +
                "/_layouts/listform.aspx?PageType=4&ListId=" +
                listGuid +
                "&ID=" +
                oListItem.get_item("ID") +
                "&amp;ContentTypeID=" +
                contentTypeId +
                "' /> \
                                                    <input class='hiddenalertfield' type='hidden' value='" +
                siteUrl +
                "/_layouts/SubNew.aspx?List=" +
                listGuid +
                "&ID=" +
                oListItem.get_item("ID") +
                "&Source=" +
                siteUrl +
                "%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
                                                </strong> \
                                            </div> \
                                        </div> \
                                </div> \
                                <div class='publications'>";
            }

            if (
              oListItem.get_item("Body") != null &&
              oListItem.get_item("Body") != "<div></div>"
            ) {
              strPlanedHtml +=
                "<div class='item-header'><h4>Description</h4>" +
                oListItem.get_item("Body") +
                "</div>";
            }
            if (oListItem.get_item("Next_x0020_update") != null) {
              var nxtupd = oListItem.get_item("Next_x0020_update");
              strPlanedHtml +=
                "<div class='item-header'><div style='float:left;'><strong class='underheading'>Next Update</strong></div><div align='right' class='nxtupd'>" +
                nxtupd.format("dd MMM yyyy HH:mm") +
                "</div></div>";
            }
            strPlanedHtml += "</div></div>";
          }
          strPlanedHtml += "</div>";
          success(strPlanedHtml);
        }
      }
    };

    self.getFixedData = function (
      siteUrl,
      subscriptionidCol,
      listGuid,
      contentTypeId,
      success
    ) {
      var query = new SP.CamlQuery();

      query.set_viewXml(
        '<View><Query><Where><And><Eq><FieldRef Name="Category" /><Value Type="Choice">Incident</Value></Eq><Eq><FieldRef Name="Status" /><Value Type="Choice">Closed</Value></Eq></And></Where><OrderBy><FieldRef Name="Modified" Ascending="False" /></OrderBy></Query><RowLimit Paged="False">10</RowLimit></View>'
      );
      collListItems = myList.getItems(query);

      clientContext.load(collListItems);

      clientContext.executeQueryAsync(FixedSucceeded, FixedFailed);

      function FixedFailed(sender, args) {
        //alert(args.get_message());
        window.location.reload(true);
      }

      function FixedSucceeded(sender, args) {
        var listItemEnumeratorpl = collListItems.getEnumerator();
        var strHtml = "";
        // loop through the list items
        strFixedHtml =
          "<div id='fixedaccordion'><h2 style='text-align:center;'>Closed</h2>";

        var i = 0;

        while (listItemEnumeratorpl.moveNext() && i < 5) {
          var oListItem = listItemEnumeratorpl.get_current();

          if (oListItem.get_item("Modified") != null) {
            var nxtupd = oListItem.get_item("Modified");
            strFixedHtml +=
              "<div class='block-inner solved item'><div class='sender'> \
                                    <div class='toggle'> \
                                        <div align='center' class='datefield'><strong class='closedheading'>Closed</strong>" +
              nxtupd.format("dd MMM yyyy HH:mm") +
              "</div> \
                                        <div class='itemheading'> \
                                            <strong><a href='#' >" +
              oListItem.get_item("Title") +
              "</a> \
                                                <input class='hiddenfield' type='hidden' value='" +
              siteUrl +
              "/_layouts/listform.aspx?PageType=4&ListId=" +
              listGuid +
              "&ID=" +
              oListItem.get_item("ID") +
              "&amp;ContentTypeID=" +
              contentTypeId +
              "' /> \
                                                <input class='hiddenalertfield' type='hidden' value=''" +
              siteUrl +
              "/_layouts/SubNew.aspx?List=" +
              listGuid +
              "&ID=" +
              oListItem.get_item("ID") +
              "&Source=" +
              siteUrl +
              "%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
                                            </strong> \
                                        </div> \
                                    </div> \
                                </div> \
                                <div class='publications'>";
          } else {
            strFixedHtml +=
              "<div class='block-inner solved item'><div class='sender'> \
                                    <div class='toggle'> \
                                        <strong><a href='#' >" +
              oListItem.get_item("Title") +
              "</a> \
                                            <input class='hiddenfield' type='hidden' value='" +
              siteUrl +
              "/_layouts/listform.aspx?PageType=4&ListId=" +
              listGuid +
              "&ID=" +
              oListItem.get_item("ID") +
              "&amp;ContentTypeID=" +
              contentTypeId +
              "' /> \
                                            <input class='hiddenalertfield' type='hidden' value='" +
              siteUrl +
              "/_layouts/SubNew.aspx?List=" +
              listGuid +
              "&ID=" +
              oListItem.get_item("ID") +
              "&Source=" +
              siteUrl +
              "%2FLists%2FNSDTasks%2FAllItems%2Easpx&IsDlg=1' /> \
                                        </strong> \
                                    </div> \
                                </div> \
                                <div class='publications'>";
          }
          if (
            oListItem.get_item("Body") != null &&
            oListItem.get_item("Body") != "<div></div>"
          ) {
            strFixedHtml +=
              "<div class='item-header'><h4>Description</h4>" +
              oListItem.get_item("Body") +
              "</div>";
          }
          strFixedHtml += "</div></div>";
          i += 1;
        }
        if (collListItems.get_count() > 4) {
          strFixedHtml +=
            "<a href='" +
            siteUrl +
            "/Lists/NSDTasks/Solved.aspx' >All Closed</a>";
        }

        strFixedHtml += "</div>";
        success(strFixedHtml);
      }
    };

    self.setEditorRights = function (IsEditor) {
      if (IsEditor) {
        $("a.itemtitle").click(function () {
          var options = SP.UI.$create_DialogOptions();
          options.title = $(this).text();
          options.url = $(this).closest("div").find(".hiddenfield").val();
          options.dialogReturnValueCallback = Function.createDelegate(
            null,
            self.modalDialogClosedCallback
          );
          SP.UI.ModalDialog.showModalDialog(options);
        });

        $(".anewitem").click(function () {
          var options = SP.UI.$create_DialogOptions();
          options.title = $(this).text();
          options.url =
            _spPageContextInfo.webAbsoluteUrl +
            "/Lists/NSDTasks/NewForm.aspx?RootFolder=";
          options.dialogReturnValueCallback = Function.createDelegate(
            null,
            self.modalDialogClosedCallback
          );
          SP.UI.ModalDialog.showModalDialog(options);
        });

        $("#NewItemArea").show();
      } else {
        $("#NewItemArea").hide();
      }
    };

    /* self.PostActionForMobileNotification = function (
      groupId,
      listItemId,
      title,
      type
    ) {
      //  return new Promise(function(resolve, reject) {
      var deferred = $.Deferred();
      $.ajax({
        method: "POST",
        url: "https://prod-21.westeurope.logic.azure.com:443/workflows/f26f61a995f84a65a7f4dc546d9a201f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=XC4ZI-4DnSDBGeUllMYdKxA2Kdxn8fU5Dw186oqDAr4",
        data: JSON.stringify({
          groupId: groupId,
          listItemId: listItemId,
          title: title,
          type: type,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        success: function (data) {
          deferred.resolve(data);
        },
        error: function (error) {
          deferred.reject(error);
        },
      });
      return deferred.promise();
      // });
    }; */

    self.GetUserId = function (groupId, email, token) {
      
        return getGroupId();
      

      function getGroupId() {
        var deferred = $.Deferred();
        $.ajax({
          method: "POST",
          url: "https://pn-broadcasttoolapp.azurewebsites.net/api/PN-BroadcastTool-IsMember?code=YjT7fxqreAHUngFYMead1GwoKD0TialgB4FcWresswt6SOFGX5shlA==",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
                    "email": email,
                    "groupId": groupId
                }),
            success: function (result) {
              deferred.resolve(result.isMember);
            },
            error: function (error) {
              deferred.reject(error);
            },
        });
        return deferred.promise();
      }
    };

    self.GroupOperation = function (groupId, email, operation, cssClass) {
      var deferred = $.Deferred();
      if (cssClass) {
        var loading =
          _spPageContextInfo.webAbsoluteUrl + "/SiteAssets/loading.gif";
        $(cssClass).attr("src", loading);
      }
     
        if (operation == "add") {
          var url =
            "https://pn-broadcasttoolapp.azurewebsites.net/api/PN-BroadcastTool-AddRemoveGrpUser?code=DIrOSdhikAVbKJg0hdCHJYNXJSBicLXDyxW9GexCWHzXJAFTZGuuTg==";
          $.ajax({
            method: "POST",
            url: url,
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify({
                    "email": email,
                    "operationName": operation,
                    "groupId": groupId
                }),
            success: function (data) {
              //   resolve(data);
              deferred.resolve(data);
            },
            error: function (error) {
              deferred.reject(error);
            },
          });
          //  });
        } else if (operation == "delete") {
        
            if (email) {
              var url =
                "https://pn-broadcasttoolapp.azurewebsites.net/api/PN-BroadcastTool-AddRemoveGrpUser?code=DIrOSdhikAVbKJg0hdCHJYNXJSBicLXDyxW9GexCWHzXJAFTZGuuTg==";
              $.ajax({
                method: "POST",
                url: url,
                headers: {
                    "Content-Type": "application/json",
                },
                data: JSON.stringify({
                    "email": email,
                    "operationName": operation,
                    "groupId": groupId
                }),
                success: function (data) {
                    deferred.resolve(data);
                },
                error: function (error) {
                    deferred.reject(error);
                },
            });
            }
         
        }
     
      return deferred.promise();
    };

    self.modalDialogClosedCallbackDeleteAlert = function (callback) {
     // reloadContent();
     window.location.reload(true);
    };

    self.modalDialogClosedCallback = function (callback) {
      if (callback == 1) {
        //reloadContent();
        window.location.reload(true);
      }
    };
    return self;
  })();
})();
