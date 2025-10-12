const loginAs = localStorage.getItem("name");
if (loginAs) {
    const who = qs("#who");
    let revealedText = who.getAttribute("translate");
    let revealed = false;
    who.addEventListener("click", async () => {
        revealed = !revealed;
        await who.fadeOutP(200);
        who.html(revealed ? loginAs : t(revealedText));
        who.fadeIn(200, "flex");
    });
    who.html(t(revealedText));
}

qs("nav p").on("click", () => qs("nav ul").clT("show"));

(() => {
    const footer = qs("footer");
    let animation = false;
    qs("#open-info").on("click", () => {
        if (animation) return;
        animation = true;
        footer.style.display = "";

        setTimeout(() => {
            animation = false;
            footer.style.display = "none";
        }, 10_000);
    });
})();