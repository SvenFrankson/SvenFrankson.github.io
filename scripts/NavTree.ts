interface INavTreeElement {
    name: string;
    url: string;
}

class NavTree {

	public static Clear(): void {
		let navTree = document.getElementById("nav-tree");
		while (navTree.firstChild) {
			navTree.removeChild(navTree.firstChild);
		}
	}

	public static Update(treeNode: INavTreeElement[]): void {
		NavTree.Clear();
		let navTree = document.getElementById("nav-tree");
		for (let i: number = 0; i < treeNode.length; i++) {
            let a = document.createElement("a");
            a.href = treeNode[i].url;
			let e = document.createElement("span");
            e.textContent = treeNode[i].name;
            a.appendChild(e);
			navTree.appendChild(a);
			if (i !== treeNode.length - 1) {
				let separator = document.createElement("span");
				separator.textContent = " > ";
				navTree.appendChild(separator);
			}
		}
	}
}