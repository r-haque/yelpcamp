var tofill=$("#starrating").attr("value");

$(".star").on("click", function(evt){ 
    $(".rating").removeClass("value-" + tofill);
    tofill = evt.target.id;
    $(".rating").addClass("value-" + tofill);
    $("#starrating").attr("value", tofill);
});