function YellowPagesApp() {

    const e = React.createElement;

    const [data, setData] = React.useState({});

    React.useEffect(() => {
        load();
    }, []);

    function load() {

        fetch(`https://${GetParentResourceName()}/getYellowPages`, {
            method: "POST",
            body: "{}"
        })
        .then(res => res.json())
        .then(res => {

            if (!res || typeof res !== "object") {
                setData({});
                return;
            }

            setData(res);
        })
        .catch(() => setData({}));
    }

    // =========================
    // CALL FUNCTION (NPWD)
    // =========================
    function callNumber(number) {

        fetch(`https://${GetParentResourceName()}/yellowpages:call`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ number })
        });
    }

    return e("div", { className: "yellowPagesApp" },

        // =========================
        // TOP BAR
        // =========================
        e("div", { className: "yellowTopBar" },

            e("div", { className: "yellowTitle" }, "📒 Yellow Pages"),

            e("div", {
                className: "yellowRefreshIcon",
                onClick: load,
                title: "Refresh"
            }, "⟳")
        ),

        // =========================
        // EMPTY STATE
        // =========================
        Object.keys(data).length === 0 &&
            e("div", { className: "emptyState" }, "No services online"),

        // =========================
        // CATEGORIES
        // =========================
        Object.entries(data).map(([job, cat]) => {

            if (!cat.people || cat.people.length === 0) return null;

            return e("div", {
                key: job,
                className: "yellowCategory"
            },

                // CATEGORY HEADER
                e("div", {
                    className: "yellowCategoryHeader",
                    style: {
                        background: cat.color
                    }
                }, cat.label),

                // PEOPLE LIST
                cat.people.map((p, i) =>
                    e("div", {
                        key: i,
                        className: "yellowCard"
                    },

                        e("div", { className: "yellowName" }, p.name),

                        // PHONE ROW (CALL ONLY)
                        e("div", { className: "yellowActions" },

                            e("div", { className: "yellowPhone" }, p.phone),

                            e("button", {
                                className: "yellowBtn call",
                                onClick: () => callNumber(p.phone)
                            }, "📞 Call")
                        )
                    )
                )
            );
        })
    );
}