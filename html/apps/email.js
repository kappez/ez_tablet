
window.registerApp("email", function EmailApp() {

    const e = React.createElement;

    const [email, setEmail] = React.useState("loading...");
    const [inbox, setInbox] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    // =========================
    // LOAD EMAIL + INBOX
    // =========================
    React.useEffect(() => {

        let isMounted = true;

        // Request email from Lua
        fetch(`https://${GetParentResourceName()}/getEmail`, {
            method: "POST",
            body: JSON.stringify({})
        });

        // Message listener
        function onMessage(event) {
            const data = event.data;
            if (!data) return;

            if (data.type === "emailData") {
                if (!isMounted) return;

                setEmail(data.email || "unknown@ezemail.com");

                loadInbox(data.email);
            }
        }

        window.addEventListener("message", onMessage);

        function loadInbox(emailAddr) {

            fetch(`https://${GetParentResourceName()}/getInbox`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailAddr })
            })
            .then(res => res.json())
            .then(data => {
                if (!isMounted) return;
                setInbox(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(err => {
                console.error("[EMAIL ERROR]", err);
                setLoading(false);
            });
        }

        // cleanup (IMPORTANT — prevents hook + memory bugs)
        return () => {
            isMounted = false;
            window.removeEventListener("message", onMessage);
        };

    }, []);

    // =========================
    // UI
    // =========================
    return e("div", { className: "emailApp" },

        e("h2", null, "Email"),

        e("div", { style: { marginBottom: "10px" } },
            "Logged in: " + email
        ),

        loading && e("div", null, "Loading inbox..."),

        !loading && inbox.length === 0 &&
            e("div", null, "No emails yet..."),

        !loading && inbox.map(mail =>
            e("div", {
                key: mail.id,
                style: {
                    background: "#1a1a2a",
                    padding: "10px",
                    marginBottom: "8px",
                    borderRadius: "6px"
                }
            },

                e("div", { style: { fontWeight: "bold" } }, mail.subject),
                e("div", null, mail.sender),
                e("div", { style: { opacity: 0.7 } }, mail.body)
            )
        )
    );
});