
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

        case "garage":
            App = GarageApp;
            break;

        case "yellowpages":
            App = YellowPagesApp;
            break;

         case "news":
            App = NewsApp;
            break;

        default:
            App = HomeApp;
            break;
    }

    function goHome() {
        window.tabletState.app = "home";
        render();
    }

    return e("div", { className: "tabletShell" },

        e("div", { className: "tabletBackground" }),

        /* TOP BAR */
        e("div", { className: "tabletTopBar" },

            /* LEFT TITLE */
            e("div", { className: "topbarTitle" }, "ez_tablet"),

            /* RIGHT BUTTON */
            state.app !== "home"
                ? e("button", {
                    className: "topbarClose",
                    onClick: goHome
                }, "Back")
                : e("div", null)
        ),

        /* APP CONTENT */
        e("div", { className: "tabletContent" },
            e(App)
        )
    );
}