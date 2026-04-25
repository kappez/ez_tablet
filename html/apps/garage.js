function GarageApp() {

    const e = React.createElement;

    const [vehicles, setVehicles] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // =========================
    // LOAD VEHICLES
    // =========================
    function loadVehicles() {

        setLoading(true);

        fetch(`https://${GetParentResourceName()}/callback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "ez_tablet:getGarageVehicles",
                args: []
            })
        })
        .then(res => res.json())
        .then(data => {
            setVehicles(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(() => {
            setVehicles([]);
            setLoading(false);
        });
    }

    React.useEffect(() => {
        loadVehicles();
    }, []);

    // =========================
    // GPS (FIXED)
    // =========================
    function gps(coords) {

        if (!coords) return;

        fetch(`https://${GetParentResourceName()}/callback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "ez_tablet:garageSetWaypoint",
                args: coords
            })
        });
    }

    // =========================
    // STATUS (CLICKABLE)
    // =========================
    function statusText(v) {

        if (v.status === "parked") {

            return e(
                "span",
                {
                    className: "garageClickable",
                    onClick: () => gps(v.coords)
                },
                "📍 Parked at " + (v.garage || "Unknown")
            );
        }

        return "🚗 Out";
    }

    // =========================
    // UI
    // =========================
    return e("div", { className: "garageApp" },

        e("div", { className: "garageTopBar" },

            e("div", { className: "garageTitle" }, "Eazy Garage"),

            e("button", {
                className: "garageRefresh",
                onClick: loadVehicles
            }, "⟳")
        ),

        loading
            ? e("div", { className: "garageEmpty" }, "Loading vehicles...")

            : vehicles.length === 0
                ? e("div", { className: "garageEmpty" }, "No owned vehicles found.")

                : vehicles.map((v, i) =>
                    e("div", {
                        key: i,
                        className: "garageCard"
                    },

                        e("div", { className: "garageName" },
                            v.model || "Vehicle"
                        ),

                        e("div", { className: "garagePlate" },
                            "Plate: " + v.plate
                        ),

                        e("div", { className: "garageStatus" },
                            statusText(v)
                        )
                    )
                )
    );
}