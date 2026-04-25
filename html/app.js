
console.log("🔥 ez_tablet CLEAN BOOT");

// =========================
// STATE
// =========================
window.tabletState = {
    open: false,
    app: "home"
};

// =========================
// ROOT
// =========================
function getRoot() {
    return document.getElementById("root");
}

// =========================
// NUI EVENTS
// =========================
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
        window.tabletState.open = false;
        render();
    }

    if (data.action === "setApp") {
        window.tabletState.app = data.app;
        render();
    }
});

// =========================
// RENDER
// =========================
function render() {

    const root = getRoot();
    if (!root) return;

    ReactDOM.render(
        React.createElement(TabletApp),
        root
    );
}