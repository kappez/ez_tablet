window.registerApp("cmd", function () {

    const e = React.createElement;

    return e("div", { className: "appPanel" },

        e("h2", null, "Command Console"),

        e("textarea", {
            placeholder: "type command...",
            style: { width: "100%", height: "200px" },
            onKeyDown: (ev) => {
                if (ev.key === "Enter") {
                    ev.preventDefault();
                    console.log("command executed");
                }
            }
        })
    );
});