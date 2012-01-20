// increase the default animation speed to exaggerate the effect
$.fx.speeds._default = 500;

jQuery(document).ready(function(){
    $( "#dialog" ).dialog({
        autoOpen: false,
        show: "blind",
        width: 600
    });

    $( "#opener" ).click(function() {
        $( "#dialog" ).dialog( "open" );
        return false;
    });
    // Create target element for onHover titles
    $caption = $("<span/>");
    //create html for stars
  
    
     $("input.star").rating({
            callback: function(value, link){
                alert(value);

            }
     });

     // Make it available in DOM tree
     $caption.appendTo(".ratings");
     
     $(".submit-evaluation").click(function() {
            $(".red").html("Thank you for your feedback!");
            $(".submit-evaluation").attr("disabled", "disabled");
            $("#free-comment").attr("disabled", "disabled");
            
            $(".ui-stars-star").addClass("ui-stars-star-disabled");
            $(".ui-stars-cancel").css("opacity", 0);
            
            $('input.star').rating('readOnly',true) 
            
     });

});


function widgets_initialization()
{
        //call create widgets function to create the imagebutton widgets for all proposals
        create_widgets("placebased-feedback");
}
