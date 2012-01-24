var draw_controls;

/*
Draw Button is a drawing
tool that works together with
Openlayers.

Required global variables is a js objets
draw_controls that contains
the name of the control and the OpenLayers
DrawFeature control object.
*/
(function( $ ) {
    $.widget("ui.drawButton",
        {
            options: {
                control: "" //the draw control used, required
            },
            _create: function() {
                this.element.addClass("ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only")
                this.element.bind('click',
                          this.toggle_active);
                var label = this.element.html();
                $( "<span></span>")
                        .addClass( "ui-button-text" )
                        .appendTo( this.element.empty() )
                        .html( label )
                        .text();
                return this.options;
            },
            
            toggle_active: function(evt) {
                console.log("toggle active");   
                console.log($(this).drawButton('option', 'control'));
                console.log($(this));
                console.log(this.element);
                console.log(this.options);
                console.log(draw_controls);

                //unselect if selected
                if($(this).hasClass("ui-state-active")) {

                    $(this).removeClass("ui-state-active");
                    draw_controls[$(this)
                                .drawButton('option', 'control')]
                                .deactivate();

                } else { //select if not selected
                    
                    //unselect the others
                    $(".drawbutton.ui-state-active")
                        .removeClass('ui-state-active');
                    
                    $(this).addClass("ui-state-active");
                    
                    for(var cont in draw_controls) {
                        if($(this).drawButton('option', 'control') === cont) {
                            draw_controls[$(this)
                                .drawButton('option', 'control')]
                                .activate();
                        } else {
                            draw_controls[$(this)
                                .drawButton('option', 'control')]
                                .deactivate();
                        }
                    }
                }
            }
        });
})( jQuery );