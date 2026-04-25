
console.log("🔥 ez_tablet CLEAN BOOT");

window.tabletState = {
    open: false,
    app: "home"
};

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
   INPUT DETECTION (SAFE)
========================= */
function isTypingField() {
    const el = document.activeElement;
    if (!el) return false;

    const tag = el.tagName?.toLowerCase();

    return (
        tag === "input" ||
        tag === "textarea" ||
        el.isContentEditable
    );
}

/* =========================
   SAFE KEY HANDLING (FIXED FOR ALTGR)
========================= */
window.addEventListener("keydown", function (event) {

    if (!window.tabletState.open) return;

    // 🚨 CRITICAL: NEVER interfere with typing OR IME
    if (isTypingField()) return;

    // 🚨 IMPORTANT FIX:
    // DO NOT block ANY modifier combos globally
    // This is what was breaking AltGr @
    // (We remove this entirely)

    if (event.key === "Escape") {

        event.preventDefault();

        if (window.tabletState.app !== "home") {
            window.tabletState.app = "home";
            render();
        } else {
            closeTablet();
        }

        return;
    }

    if (event.key === "Backspace") {

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
   NUI MESSAGES
========================= */
window.addEventListener("message", (event) => {

    const data = event.data;
    if (!data) return;

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