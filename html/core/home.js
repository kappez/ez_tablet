
function HomeApp() {

    const e = React.createElement;

    function open(app) {
        window.tabletState.app = app;
        render();
    }

    return e("div", { className: "home" },

        e("h1", null, "Apps"),

        e("button", { onClick: () => open("email") }, "Email"),
        e("button", { onClick: () => open("calculator") }, "Calculator"),
        e("button", { onClick: () => open("bank") }, "Bank"),
        e("button", { onClick: () => open("cmd") }, "CMD")
    );
}