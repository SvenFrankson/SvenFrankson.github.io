var answers = [];

var validate = () => {
    $("#afev-answer-4").animate(
        { backgroundColor: "green"}
    );
    var good = true;
    if (answers.indexOf(4) === -1) {
        good = false;
    }
    if (answers.indexOf(1) !== -1) {
        $("#afev-answer-1").animate(
            { backgroundColor: "red"}
        );
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
    var score = localStorage.getItem("afev-score");
    if (score !== null) {
        score = score.substring(0, 2) + '1' + score.substring(3, 5);
        localStorage.setItem("afev-score", score);
    } else {
        localStorage.setItem("afev-score", "10000");
    }
    initLayout();
};