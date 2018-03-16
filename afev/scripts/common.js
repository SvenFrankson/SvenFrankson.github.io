var initLayout = () => {
    var score = localStorage.getItem("afev-score");
    if (score !== null) {
        if (score[0] === '1') {
            $("#1-agora").text("A");
            $("#1-agora").attr("href", "question-1-1.html");
        }
        if (score[1] === '1') {
            $("#2-agora").text("G");
            $("#2-agora").attr("href", "question-2-1.html");
        }
        if (score[2] === '1') {
            $("#3-agora").text("O");
            $("#3-agora").attr("href", "question-3-1.html");
        }
        if (score[3] === '1') {
            $("#4-agora").text("R");
            $("#4-agora").attr("href", "question-4-1.html");
        }
        if (score[4] === '1') {
            $("#5-agora").text("A");
            $("#5-agora").attr("href", "question-5-1.html");
        }
    }
    else {
        alert("NULL");
        localStorage.setItem("afev-score", "00000");
    }
    $(".afev-secret").hide();
    $("#next-question").hide();
    $("#afev-validate").on("click", () => {
        validate();
        $("#afev-validate").hide();
        $("#next-question").show();
    });
}