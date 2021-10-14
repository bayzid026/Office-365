<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js" integrity="sha512-qTXRIMyZIFb8iQcfjXWCO8+M5Tbc38Qi5WzdPOYZHIlZpzBHG3L3by84BBBOiRGiEb7KKtAOAs5qYdUiZiQNNQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/locale/sv.min.js" integrity="sha512-DGfo0+uPZLhfqjfMnPPveWvVTSQ7M0RP6bmlkgGgF/ATKSBPKIBzjyCtActIRL3vJ0LJRirvqQHFA0icXpCIew==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script>
 $(document).ready(function () {
      moment.locale("sv");
    var isItemSelectedToChange = false;
    var storedData = "";
    var storedTitle = "";
    filterview($( "select[id^='Category_']" ).val(), $( "select[id^='Status_']" ).val());
    
    $("select[id^='Category_']").change(function() {
        filterview($( "select[id^='Category_']" ).val(), $( "select[id^='Status_']" ).val());
    });

    $("select[id^='Status_']").change(function() {
        filterview($( "select[id^='Category_']" ).val(), $( "select[id^='Status_']" ).val());
    });

    function filterview(option, openorclosed) {
        if(option != '' && option == 'Change') {
            $("#StartDate").closest('tr').show();
            $("#DueDate").closest('tr').show();
            storedTitle = $( "input[id^='Title_']" ).val();
            isItemSelectedToChange = true;
            storedData = $( "div[id$='_$TextField_inplacerte']" ).html();
        }
        else if(option != '' && option == 'Incident') {
        
            $("#StartDate").closest('tr').hide();
            $("#DueDate").closest('tr').hide();
            $("#HPSM_x0020_number").closest('tr').hide();
            
            var data = $( "div[id$='_$TextField_inplacerte']" ).html();
             var formatedDate = moment().format("L") + " " + moment().format('LT');
            data = data + "<br/><p><strong>Update " + formatedDate  +":</strong></p> Text: ";
            if(isItemSelectedToChange) {
                data = storedData;
                $( "input[id^='Title_']" ).val( storedTitle);
            }
            $( "div[id$='_$TextField_inplacerte']" ).html(data);
        }
    }

 });
</script>
