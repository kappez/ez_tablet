window.registerApp("home", function ({ setActiveApp }) {

    const e = React.createElement;

    //====================================================
    // APP ICON COMPONENT (colored square style)
    //====================================================
    function Icon({ color, label, app }) {
        return e("div", {
            className: "appIcon",
            onClick: () => setActiveApp(app)
        },

            e("div", {
                className: "iconBox",
                style: { background: color }
            }),

            e("div", { className: "label" }, label)
        );
    }

    //====================================================
    // HOME SCREEN
    //====================================================
    return e("div", { className: "homeScreen" },

        e("div", { className: "appGrid" },

            e(Icon, { color: "#38bdf8", label: "Calculator", app: "calculator" }),
            e(Icon, { color: "#22c55e", label: "Bank", app: "bank" }),
            e(Icon, { color: "#a855f7", label: "CMD", app: "cmd" }),
            e(Icon, { color: "#f59e0b", label: "Settings", app: "settings" }),
            e(Icon, { color: "#0bf51f", label: "ezmail", app: "email" })

        ),
    );
});

