class Route {

    public home(): void {
        $.ajax(
            {
                url: "./home.html",
                success: (data) => {
                    $("#page").fadeOut(
                        500,
                        () => {
                            document.getElementById("page").innerHTML = data;
                            NavTree.Update([
                                {
                                    name: "home",
                                    url: "#"
                                }
                            ]);
                            $("#page").fadeIn(500);
                        }
                    );
                }
            }
        )
    }

    public about(): void {
        $.ajax(
            {
                url: "./about.html",
                success: (data) => {
                    $("#page").fadeOut(
                        500,
                        () => {
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
                            $("#page").fadeIn(500);
                        }
                    );
                }
            }
        )
    }

    public contact(): void {
        $.ajax(
            {
                url: "./contact.html",
                success: (data) => {
                    $("#page").fadeOut(
                        500,
                        () => {
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
                            $("#page").fadeIn(500);
                        }
                    );
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
                            //document.getElementById("project-image").setAttribute("src", data.img);
                            if (data.imgs) {
                                for (let i = 0; i < data.imgs.length; i++) {
                                    let img = document.createElement("img");
                                    img.setAttribute("class", "project-image");
                                    img.setAttribute("src", data.imgs[i].src);
                                    let div = document.createElement("div");
                                    if (i === 0) {
                                        div.setAttribute("class", "carousel-item active");
                                    }
                                    else {
                                        div.setAttribute("class", "carousel-item");
                                    }
                                    div.appendChild(img);
                                    document.getElementById("carousel-inner").appendChild(div);

                                    let li = document.createElement("li");
                                    li.setAttribute("data-target", "#carouselProjectImage");
                                    li.setAttribute("data-slide-to", i.toString());
                                    if (i === 0) {
                                        li.setAttribute("class", "active");
                                    }
                                    document.getElementById("carousel-indicators").appendChild(li);
                                }
                                document.getElementById("carouselProjectImage").setAttribute("class", "carousel slide");
                            }
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
                            if (data.links) {
                                for (let i = 0; i < data.links.length; i++) {
                                    //<a href="#" id="project-link" class="btn btn-default project-link" target="_blank">> Link</a>
                                    let a = document.createElement("a");
                                    a.setAttribute("href", data.links[i].href);
                                    a.setAttribute("class", "btn btn-default project-link");
                                    a.setAttribute("target", "_blank");
                                    a.innerText = "> " + data.links[i].text;
                                    document.getElementById("project-links").appendChild(a);
                                }
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
            Projects.open();
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