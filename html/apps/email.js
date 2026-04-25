
function EmailApp() {

    const e = React.createElement;

    const [email, setEmail] = React.useState("");
    const [inbox, setInbox] = React.useState([]);
    const [reply, setReply] = React.useState("");
    const [activeThread, setActiveThread] = React.useState(null);

    React.useEffect(() => {

        fetch(`https://${GetParentResourceName()}/getEmail`, {
            method: "POST",
            body: "{}"
        });

        const handler = (event) => {
            if (event.data?.type === "emailData") {
                setEmail(event.data.email);
                loadInbox(event.data.email);
            }
        };

        window.addEventListener("message", handler);

        return () => window.removeEventListener("message", handler);

    }, []);

    function loadInbox(emailAddr) {

        fetch(`https://${GetParentResourceName()}/getInbox`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailAddr })
        })
        .then(res => res.json())
        .then(setInbox);
    }

    function sendReply() {

        const thread = inbox.find(x => x.thread_id === activeThread);
        if (!thread) return;

        fetch(`https://${GetParentResourceName()}/sendReply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                thread_id: activeThread,
                receiver: thread.sender,
                subject: thread.subject,
                body: reply
            })
        });

        setReply("");
    }

    if (!email) return e("div", null, "Loading email...");

    const thread = inbox.filter(m => m.thread_id === activeThread);

    return e("div", null,

        e("h2", null, email),

        !activeThread && inbox.map(m =>
            e("div", {
                key: m.id,
                onClick: () => setActiveThread(m.thread_id)
            }, m.subject)
        ),

        activeThread && e("div", null,

            e("button", {
                onClick: () => setActiveThread(null)
            }, "Back"),

            thread.map(m =>
                e("div", { key: m.id }, m.body)
            ),

            e("textarea", {
                value: reply,
                onChange: (e) => setReply(e.target.value)
            }),

            e("button", {
                onClick: sendReply
            }, "Send")
        )
    );
}