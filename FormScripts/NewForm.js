<script src="https://code.jquery.com/jquery-3.3.1.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dayjs/1.8.16/dayjs.min.js" crossorigin="anonymous"></script>
<script>
 $(document).ready(function () {
    $( "input[id^='Title_']" ).val( "<COUNTRY>-<ID>-<AFFECTED SERVICE AND/OR SYSTEM>-<PROBLEM DESCRIPTION>" );
    var date = Date.now();
    const formatedDate = dayjs(date).format("YYYY-MM-DD hh:mm")
    $( "div[id$='_$TextField_inplacerte']" ).html( "<p>Description and impact: </p> <br/><p><strong>Estimated Time to Resolve:</strong></p><br/><p><b>Update " + formatedDate  + " : </b></p><br>" );
 });
</script>