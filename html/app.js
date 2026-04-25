console.log("🔥 ez_tablet CLEAN BOOT");

/* =========================
   STATE
========================= */
window.tabletState = {
    open: false,
    app: "home"
};

/* =========================
   ROOT
========================= */
function getRoot() {
    return document.getElementById("root");
}

/* =========================
   CLOSE TABLET
========================= */
function closeTablet() {

    window.tabletState.open = false;
    window.tabletState.app = "home";

    fetch(`https://${GetParentResourceName()}/closeTablet`, {
        method: "POST",
        body: "{}"
    });

    render();
}

/* =========================
   GO HOME
========================= */
function goHome() {
    window.tabletState.app = "home";
    render();
}

/* =========================
   KEYBOARD HANDLING
========================= */
window.addEventListener("keydown", function (event) {

    if (!window.tabletState.open) return;

    const key = event.key;

    if (key === "Escape" || key === "Backspace") {

        event.preventDefault();

        if (window.tabletState.app !== "home") {
            goHome();
        } else {
            closeTablet();
        }
    }
});

/* =========================
   NUI EVENTS
========================= */
window.addEventListener("message", (event) => {

    const data = event.data;
    if (!data) return;

    console.log("[TABLET EVENT]", data);

    if (data.action === "open") {
        window.tabletState.open = true;
        window.tabletState.app = "home";
        render();
    }

    if (data.action === "close") {
        closeTablet();
    }

    if (data.action === "setApp") {
        window.tabletState.app = data.app;
        render();
    }
});

/* =========================
   RENDER
========================= */
function render() {

    const root = getRoot();
    if (!root) return;

    ReactDOM.render(
        React.createElement(TabletApp),
        root
    );
}