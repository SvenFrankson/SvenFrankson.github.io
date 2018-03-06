var answers = [];

var validate = () => {
    $(".afev-answer").animate(
        { backgroundColor: "green"}
    );
    var good = true;
    for (var i = 1; i <= 5; i++) {
        if (answers.indexOf(i) === -1) {
            good = false;
        }
    }
    if (good) {
        $("#afev-secret-right").show();
    } 
    else {
        $("#afev-secret-wrong").show();
    }
    $("#afev-secret-response").show();
}

window.onload = () => {
    for (var i = 0; i < 5; i++) {
        let index = i + 1;
        $("#afev-answer-" + index).on("click", () => {
            answers.push(index);
            $("#afev-answer-" + index).animate(
                { backgroundColor: "#1e5abc"}
            );
        })
    }
    $(".afev-secret").hide();
    $("#afev-validate").on("click", () => {
        validate();
    });
};