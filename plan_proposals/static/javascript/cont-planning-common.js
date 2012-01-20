$(document).ready(function(){
    //dialog window created for feedback 
    $( "#feedback_window" ).dialog({
        autoOpen: false,
        show: "blind",
        width: 600
    }); 
     
    //open feedback form as info window
    $( "#feedback_link" ).click(function() {
        $( "#feedback_window" ).dialog( "open" );
        return false;
    });
    
});     
