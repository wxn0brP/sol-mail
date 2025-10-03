const loginAs = localStorage.getItem("name");
if (loginAs) {
    const revealedText = "Click to reveal";
    const who = qs("#who");
    let revealed = false;
    who.addEventListener("click", async () => {
        revealed = !revealed;
        await who.fadeOutP(200);
        who.html(revealed ? loginAs : revealedText);
        who.fadeIn(200, "flex");
    });
    who.html(revealedText);
}