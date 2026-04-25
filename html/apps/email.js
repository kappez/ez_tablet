function EmailApp() {

    const e = React.createElement;

    const [email, setEmail] = React.useState("");
    const [inbox, setInbox] = React.useState([]);
    const [view, setView] = React.useState("inbox");
    const [activeThread, setActiveThread] = React.useState(null);

    const [composing, setComposing] = React.useState(false);
    const [to, setTo] = React.useState("");
    const [subject, setSubject] = React.useState("");
    const [body, setBody] = React.useState("");

    const [reply, setReply] = React.useState("");

    // =========================
    // INIT
    // =========================
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

    // =========================
    // LOAD INBOX
    // =========================
    function loadInbox(emailAddr) {

        fetch(`https://${GetParentResourceName()}/getInbox`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailAddr })
        })
        .then(res => res.json())
        .then(setInbox);
    }

    // =========================
    // REFRESH (manual only)
    // =========================
    function refresh() {
        loadInbox(email);
    }

    // =========================
    // OPEN THREAD + MARK READ (LIVE UI)
    // =========================
    function openThread(threadId, mailId) {

        setActiveThread(threadId);

        // instantly update UI
        setInbox(prev =>
            prev.map(m =>
                m.id === mailId
                    ? { ...m, is_read: 1 }
                    : m
            )
        );

        fetch(`https://${GetParentResourceName()}/markRead`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: mailId })
        });
    }

    // =========================
    // DELETE EMAIL (FIXED + PERMANENT)
    // =========================
    function deleteEmail(id) {

        // instant UI update (no refresh needed)
        setInbox(prev =>
            prev.map(m =>
                m.id === id
                    ? { ...m, deleted: 1 }
                    : m
            )
        );

        fetch(`https://${GetParentResourceName()}/markDeleted`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
    }

    // =========================
    // SEND REPLY
    // =========================
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

    // =========================
    // SEND NEW EMAIL
    // =========================
    function sendEmail() {

        if (!to || !subject || !body) return;

        fetch(`https://${GetParentResourceName()}/sendReply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                thread_id: Date.now(),
                receiver: to,
                subject,
                body
            })
        });

        setTo("");
        setSubject("");
        setBody("");
        setComposing(false);
    }

    if (!email) return e("div", null, "Loading email...");

    // =========================
    // FILTER VIEW
    // =========================
    const filtered = inbox.filter(m => {

        if (view === "inbox") return !m.deleted;
        if (view === "sent") return m.sender === email && !m.deleted;
        if (view === "trash") return m.deleted;

        return true;
    });

    const thread = inbox.filter(m => m.thread_id === activeThread);

    // =========================
    // UI
    // =========================
    return e("div", { className: "emailAppLayout" },

        // SIDEBAR
        e("div", { className: "emailSidebar" },

            e("button", {
                className: view === "inbox" ? "active" : "",
                onClick: () => setView("inbox")
            }, "Inbox"),

            e("button", {
                className: view === "sent" ? "active" : "",
                onClick: () => setView("sent")
            }, "Sent"),

            e("button", {
                className: view === "trash" ? "active" : "",
                onClick: () => setView("trash")
            }, "Trash"),

            e("button", {
                className: "primary",
                onClick: () => setComposing(true)
            }, "Compose"),

            e("button", {
                className: "secondary",
                onClick: refresh
            }, "Refresh")
        ),

        // MAIN AREA
        e("div", { className: "emailMain" },

            // INBOX LIST
            !activeThread && filtered.map(m =>
                e("div", {
                    key: m.id,
                    className: "emailItem",
                    onClick: () => openThread(m.thread_id, m.id)
                },

                    e("div", {
                        style: {
                            display: "flex",
                            justifyContent: "space-between"
                        }
                    },

                        e("div", {
                            style: {
                                fontWeight: m.is_read ? "normal" : "bold"
                            }
                        }, m.subject),

                        !m.is_read && e("div", {
                            style: {
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "#3b82f6"
                            }
                        })
                    ),

                    e("div", {
                        style: { fontSize: "12px", opacity: 0.7 }
                    }, m.sender),

                    e("button", {
                        className: "secondary",
                        style: { marginTop: "5px" },
                        onClick: (ev) => {
                            ev.stopPropagation();
                            deleteEmail(m.id);
                        }
                    }, "Delete")
                )
            ),

            // THREAD VIEW
            activeThread && e("div", null,

                e("button", {
                    className: "secondary",
                    onClick: () => setActiveThread(null)
                }, "Back"),

                thread.map(m =>
                    e("div", {
                        key: m.id,
                        className: "emailThreadItem"
                    },
                        e("div", { style: { fontWeight: "bold" } }, m.sender),
                        e("div", null, m.body)
                    )
                ),

                e("textarea", {
                    value: reply,
                    onChange: (e) => setReply(e.target.value),
                    placeholder: "Reply..."
                }),

                e("button", {
                    className: "primary",
                    onClick: sendReply
                }, "Send Reply")
            )
        ),

        // COMPOSE MODAL
        composing && e("div", { className: "composeModal" },

            e("div", { className: "composeBox" },

                e("h3", null, "New Email"),

                e("input", {
                    placeholder: "To",
                    value: to,
                    onChange: (e) => setTo(e.target.value)
                }),

                e("input", {
                    placeholder: "Subject",
                    value: subject,
                    onChange: (e) => setSubject(e.target.value)
                }),

                e("textarea", {
                    placeholder: "Message",
                    value: body,
                    onChange: (e) => setBody(e.target.value)
                }),

                e("div", {
                    style: { display: "flex", gap: "10px" }
                },

                    e("button", {
                        className: "secondary",
                        onClick: () => setComposing(false)
                    }, "Cancel"),

                    e("button", {
                        className: "primary",
                        onClick: sendEmail
                    }, "Send")
                )
            )
        )
    );
}