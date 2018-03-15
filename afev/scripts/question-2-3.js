var answers = [];

var validate = () => {
    $("#afev-answer-1").animate(
        { backgroundColor: "green"}
    );
    $("#afev-answer-3").animate(
        { backgroundColor: "green"}
    );
    var good = false;
    if (answers.indexOf(1) !== -1) {
        if (answers.indexOf(3) !== -1) {
            good = true;
        }
    }
    
    if (answers.indexOf(2) !== -1) {
        good = false;
        $("#afev-answer-2").animate(
            { backgroundColor: "red"}
        );
    }
    if (answers.indexOf(4) !== -1) {
        good = true;
        $("#afev-answer-4").animate(
            { backgroundColor: "red"}
        );
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