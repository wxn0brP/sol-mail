const loginAs = localStorage.getItem("name");
if (loginAs) {
    const revealedText = "Click to reveal";
    const who = qs("#who");
    let revealed = false;
    who.addEventListener("click", async () => {
        revealed = !revealed;
        await who.fadeOutP();
        who.html(revealed ? loginAs : revealedText);
        who.fadeIn();
    });
    who.html(revealedText);
}