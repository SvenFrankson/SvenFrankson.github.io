class Route {

    public home(): void {
        $.ajax(
            {
                url: "./home.html",
                success: (data) => {
                    document.getElementById("page").innerHTML = data;
                    NavTree.Update([
                        {
                            name: "home",
                            url: "#"
                        }
                    ]);
                }
            }
        )
    }

    public projects(): void {
        $.ajax(
            {
                url: "./projects.html",
                success: (data) => {
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
                }
            }
        )
    }

    public about(): void {
        $.ajax(
            {
                url: "./about.html",
                success: (data) => {
                    document.getElementById("page").innerHTML = data;
                    NavTree.Update([
                        {
                            name: "home",
                            url: "#"
                        },
                        {
                            name: "about",
                            url: "#about"
                        }
                    ]);
                }
            }
        )
    }

    public contact(): void {
        $.ajax(
            {
                url: "./contact.html",
                success: (data) => {
                    document.getElementById("page").innerHTML = data;
                    NavTree.Update([
                        {
                            name: "home",
                            url: "#"
                        },
                        {
                            name: "contact",
                            url: "#contact"
                        }
                    ]);
                }
            }
        )
    }

    public project(projectId: string): void {
        $.ajax(
            {
                url: "./project.html",
                success: (data) => {
                    document.getElementById("page").innerHTML = data;
                    $.getJSON(
                        "./content/projects/" + projectId + ".json",
                        undefined,
                        (data) => {
                            document.getElementById("project-title").innerText = data.name;
                            document.getElementById("project-image").setAttribute("src", data.img);
                            if (data.play) {
                                document.getElementById("project-play").setAttribute("href", data.play);
                            } else {
                                document.getElementById("project-play").remove();
                            }
                            if (data.source) {
                                document.getElementById("project-source").setAttribute("href", data.source);
                            } else {
                                document.getElementById("project-source").remove();
                            }
                            if (data.link) {
                                document.getElementById("project-link").setAttribute("href", data.link);
                            } else {
                                document.getElementById("project-link").remove();
                            }
                        }
                    )
                    $.ajax(
                        {
                            url: "./content/projects/" + projectId + ".html",
                            success: (data) => {
                                document.getElementById("project-page").innerHTML = data;
                                NavTree.Update([
                                    {
                                        name: "home",
                                        url: "#"
                                    },
                                    {
                                        name: "projects",
                                        url: "#projects"
                                    },
                                    {
                                        name: projectId,
                                        url: "#projects/" + projectId
                                    }
                                ]);
                            }
                        }
                    );
                }
            }
        );
    }

    public route = () => {
        let url = location.hash.slice(1) || "/";

        console.log("Route : Queried URL is '" + url + "'");

        if (url === "/") {
            this.home();
        } else if (url === "projects") {
            this.projects();
        } else if (url.startsWith("project/")) {
            let projectId = url.split("/")[1];
            this.project(projectId);
        } else if (url === "contact") {
            this.contact();
        } else if (url === "about") {
            this.about();
        } else {
            this.home();
        }
    }
}