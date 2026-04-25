console.log("🔥 ez_tablet CLEAN BOOT");

window.tabletState = {
    open: false,
    app: "home"
};

function getRoot() {
    return document.getElementById("root");
}

/* =========================
   CLOSE TABLET (SAFE)
========================= */
function closeTablet() {

    window.tabletState.open = false;
    window.tabletState.app = "home";

    fetch(`https://${GetParentResourceName()}/closeTablet`, {
        method: "POST",
        body: "{}"
    }).catch(() => {});

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
   KEY CONTROLS
========================= */
window.addEventListener("keydown", function (event) {

    if (!window.tabletState.open) return;

    const key = event.key;

    // 🚨 DO NOT INTERCEPT TEXT INPUTS
    const tag = document.activeElement?.tagName?.toLowerCase();

    const isTyping =
        tag === "input" ||
        tag === "textarea" ||
        document.activeElement?.isContentEditable;

    // ESC ALWAYS WORKS
    if (key === "Escape") {
        event.preventDefault();

        if (window.tabletState.app !== "home") {
            window.tabletState.app = "home";
            render();
        } else {
            closeTablet();
        }
        return;
    }

    // BACKSPACE ONLY WORKS IF NOT TYPING
    if (key === "Backspace" && !isTyping) {

        event.preventDefault();

        if (window.tabletState.app !== "home") {
            window.tabletState.app = "home";
            render();
        } else {
            closeTablet();
        }
    }
});

/* =========================
   NUI MESSAGES (FIXED GUARD)
========================= */
window.addEventListener("message", (event) => {

    const data = event.data;
    if (!data) return;

    // 🚨 CRITICAL FIX: ignore all messages when closed
    if (!window.tabletState.open && data.action !== "open") {
        return;
    }

    console.log("[TABLET EVENT]", data);

    if (data.action === "open") {
        window.tabletState.open = true;
        window.tabletState.app = "home";
        render();
    }

    if (data.action === "close") {
        window.tabletState.open = false;
        window.tabletState.app = "home";
        render();
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