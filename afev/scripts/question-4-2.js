var answers = [];

var validate = () => {
    $("#afev-answer-1").animate(
        { backgroundColor: "green"}
    );
    var good = true;
    if (answers.indexOf(1) === -1) {
        good = false;
    }
    if (answers.indexOf(2) !== -1) {
        $("#afev-answer-2").animate(
            { backgroundColor: "red"}
        );
        good = false;
    }
    if (answers.indexOf(3) !== -1) {
        $("#afev-answer-3").animate(
            { backgroundColor: "red"}
        );
        good = false;
    }
    if (answers.indexOf(4) !== -1) {
        $("#afev-answer-4").animate(
            { backgroundColor: "red"}
        );
        good = false;
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
    initLayout();
};