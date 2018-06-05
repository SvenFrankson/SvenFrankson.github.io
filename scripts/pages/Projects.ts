class Projects {

    public static filters: string[] = [];

    public static open(): void {
        $.ajax(
            {
                url: "./projects.html",
                success: (data) => {
                    $("#page").fadeOut(
                        "fast",
                        () => {
                            document.getElementById("page").innerHTML = data;
                            NavTree.Update([
                                {
                                    name: "home",
                                    url: "#"
                                },
                                {
                                    name: "projects",
                                    url: "#projects"
                                }
                            ]);
                            $("#page").show(0);
                            $(".menu-item").hide();
                            $(".menu-item").each(
                                (i, e) => {
                                    setTimeout(
                                        () => {
                                            $(e).fadeIn(500);
                                        },
                                        i * 100
                                    )
                                }
                            )
                        }
                    );
                }
            }
        )
    }
}