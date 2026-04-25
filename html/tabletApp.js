
function TabletApp() {

    const e = React.createElement;
    const state = window.tabletState;

    if (!state.open) return null;

    let App;

    switch (state.app) {

        case "email":
            App = EmailApp;
            break;

        case "calculator":
            App = CalculatorApp;
            break;

        case "bank":
            App = BankApp;
            break;

        case "cmd":
            App = CmdApp;
            break;

        default:
            App = HomeApp;
    }

    return e("div", { className: "tabletShell" },

        e("div", { className: "tabletBackground" }),

        e("div", { className: "tabletTopBar" }, "ez Tablet"),

        e("div", { className: "tabletContent" },
            e(App)
        )
    );
}