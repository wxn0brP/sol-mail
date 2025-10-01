window.logout=async function(){confirm("Are you sure you want to logout?")&&(await fetch("/auth/logout",{method:"POST"}),window.location.href="/page/login")};
//# sourceMappingURL=logout.js.map
