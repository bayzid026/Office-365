<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js" integrity="sha512-qTXRIMyZIFb8iQcfjXWCO8+M5Tbc38Qi5WzdPOYZHIlZpzBHG3L3by84BBBOiRGiEb7KKtAOAs5qYdUiZiQNNQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/locale/sv.min.js" integrity="sha512-DGfo0+uPZLhfqjfMnPPveWvVTSQ7M0RP6bmlkgGgF/ATKSBPKIBzjyCtActIRL3vJ0LJRirvqQHFA0icXpCIew==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script>
 $(window).on('load', function () {
      moment.locale("sv");
    var isItemSelectedToChange = false;
    var storedData = "";
    var storedTitle = "";
    filterview($( "a[name$='Category']" ).closest('td').next().text());
    
    

    function filterview(option) {
        if(option != '' && option.indexOf('Change') > -1 ) {
            $( "a[name$='StartDate']" ).closest('tr').show();
            $( "a[name$='DueDate']" ).closest('tr').show();
            $( "a[name$='HPSM_x0020_number']" ).closest('tr').show();
             $( "a[name$='Next_x0020_update']" ).closest('tr').hide();
           
        }
        else if(option != '' && option.indexOf('Incident') > -1) {

             $( "a[name$='StartDate']" ).closest('tr').hide();
            $( "a[name$='DueDate']" ).closest('tr').hide();
            $( "a[name$='HPSM_x0020_number']" ).closest('tr').hide();
             $( "a[name$='Next_x0020_update']" ).closest('tr').show();
        
           
            
            
        }
    }

 });
</script>
