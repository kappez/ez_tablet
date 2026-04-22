
console.log("🔥 ez_tablet app.js BOOTED");

// ============================
// SAFE GLOBAL STATE
// ============================
window.apps = window.apps || {};
window.activeApp = "home";
window.tabletOpen = false;

// ============================
// REGISTER SYSTEM
// ============================
window.registerApp = function (name, component) {
    window.apps[name] = component;
    console.log(`[TABLET] Registered app: ${name}`);
};

// ============================
// ROOT
// ============================
function getRoot() {
    return document.getElementById("root");
}

// ============================
// HOME APP
// ============================
function Home() {

    const e = React.createElement;

    const appList = Object.keys(window.apps || {});

    return e("div", { className: "home" },

        e("h1", null, "Tablet"),

        appList.length === 0
            ? e("div", null, "No apps loaded")
            : appList.map(app =>
                e("button", {
                    key: app,
                    onClick: () => {
                        window.activeApp = app;
                        render();
                    }
                }, app)
            )
    );
}

// ============================
// GET ACTIVE APP SAFE
// ============================
function getActiveApp() {

    if (window.activeApp === "home") return Home;

    const app = window.apps[window.activeApp];

    console.log("[TABLET] Active app:", window.activeApp, app);

    if (!app) {
        return function MissingApp() {
            return React.createElement(
                "div",
                { style: { color: "red", padding: "10px" } },
                "App not found: " + window.activeApp
            );
        };
    }

    return app;
}

// ============================
// MAIN RENDER (FIXED SHELL SYSTEM)
// ============================
function render() {

    const root = getRoot();
    if (!root || !window.tabletOpen) return;

    const App = getActiveApp();

    console.log("[TABLET] Rendering:", window.activeApp);

    const e = React.createElement;

    let appContent;

    try {
        appContent = e(App);
    } catch (err) {
        console.error("[TABLET APP ERROR]", err);

        appContent = e("div", { style: { color: "red" } },
            "App crashed: " + window.activeApp
        );
    }

    // =========================
    // TABLET SHELL (IMPORTANT FIX)
    // =========================
    const shell = e("div", { className: "tabletShell" },

        // BACKGROUND LAYER (fix missing background issue)
        e("div", { className: "tabletBackground" }),

        // TOP BAR
        e("div", { className: "tabletTopBar" }, "Tablet"),

        // CONTENT AREA
        e("div", { className: "tabletContent" },

            window.activeApp === "home"
                ? e(Home)
                : appContent
        )
    );

    ReactDOM.render(shell, root);
}

// ============================
// NUI MESSAGES
// ============================
window.addEventListener("message", (event) => {

    const data = event.data;
    if (!data) return;

    console.log("[NUI MESSAGE]", JSON.stringify(data));

    if (data.action === "open") {

        window.tabletOpen = true;
        window.activeApp = "home";

        const root = getRoot();
        if (root) root.style.display = "block";

        render();
    }

    if (data.action === "close") {

        window.tabletOpen = false;

        const root = getRoot();
        if (root) {
            ReactDOM.unmountComponentAtNode(root);
        }
    }

    if (data.action === "setApp") {

        window.activeApp = data.app;

        render();
    }
});

// ============================
// DEBUG SAFE STATE
// ============================
setTimeout(() => {

    console.log("DEBUG activeApp:", window.activeApp);
    console.log("DEBUG apps:", Object.keys(window.apps || {}));

}, 1000);