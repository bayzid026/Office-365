<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js" integrity="sha512-qTXRIMyZIFb8iQcfjXWCO8+M5Tbc38Qi5WzdPOYZHIlZpzBHG3L3by84BBBOiRGiEb7KKtAOAs5qYdUiZiQNNQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/locale/sv.min.js" integrity="sha512-DGfo0+uPZLhfqjfMnPPveWvVTSQ7M0RP6bmlkgGgF/ATKSBPKIBzjyCtActIRL3vJ0LJRirvqQHFA0icXpCIew==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script>
 $(document).ready(function () {
   
    filterview($( "select[id^='Category_']" ).val(), $( "select[id^='Status_']" ).val());
    
    $("select[id^='Category_']").change(function() {
        filterview($( "select[id^='Category_']" ).val(), $( "select[id^='Status_']" ).val());
    });

    $("select[id^='Status_']").change(function() {
        filterview($( "select[id^='Category_']" ).val(), $( "select[id^='Status_']" ).val());
    });

    function filterview(option, openorclosed) {
        if(option != '' && option == 'Change') {
        /*	$("#onetIDListForm nobr:contains('Closed')").closest('tr').hide(); */
            $("#StartDate").closest('tr').show();
            $("#DueDate").closest('tr').show();
           // $("#Next_x0020_update").closest('tr').show();
            $( "input[id^='Title_']" ).val( "" );
            var date = Date.now();
            const formatedDate = dayjs(date).format("YYYY-MM-DD hh:mm a")
            $( "div[id$='_$TextField_inplacerte']" ).html( "" );
        }
        else if(option != '' && option == 'Incident') {
        /*	if (openorclosed != '' && openorclosed == 'Open') {
                $("#onetIDListForm nobr:contains('Closed')").closest('tr').hide();
            }
            else if (openorclosed != '' && openorclosed == 'Closed'){
                $("#onetIDListForm nobr:contains('Closed')").closest('tr').show();
            }*/
            $("#StartDate").closest('tr').hide();
            $("#DueDate").closest('tr').hide();
           // $("#Next_x0020_update").closest('tr').hide();
             $("#HPSM_x0020_number").closest('tr').hide();
            
            $( "input[id^='Title_']" ).val( "<COUNTRY>-<ID>-<AFFECTED SERVICE AND/OR SYSTEM>-<PROBLEM DESCRIPTION>" );
            var formatedDate = moment().format("YYYY-MM-DD hh:mm");
            //const formatedDate = dayjs(date).format("YYYY-MM-DD hh:mm a")
            $( "div[id$='_$TextField_inplacerte']" ).html( "<p>Description and impact: </p> <br/><p><strong>Estimated Time to Resolve:</strong></p><br><p><b>Update " + formatedDate  + ": </b></p> Text: " );
        }
    }
 });
</script>