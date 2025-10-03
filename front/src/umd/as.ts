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