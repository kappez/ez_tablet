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

    const [search, setSearch] = React.useState("");

    // =========================
    // TIME FORMAT
    // =========================
    function formatTime(timestamp) {
        if (!timestamp) return "";

        const date = new Date(timestamp * 1000);

        return date.toLocaleString([], {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

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
                loadInbox(event.data.email, "inbox");
            }
        };

        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);

    }, []);

    // =========================
    // LOAD MAIL
    // =========================
    function loadInbox(emailAddr, folder = "inbox") {

        fetch(`https://${GetParentResourceName()}/getInbox`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: emailAddr,
                folder: folder
            })
        })
        .then(res => res.json())
        .then(setInbox);
    }

    // =========================
    // VIEW CHANGE
    // =========================
    function changeView(folder) {
        setView(folder);
        setActiveThread(null);
        setComposing(false);
        loadInbox(email, folder);
    }

    // =========================
    // OPEN THREAD + MARK READ
    // =========================
    function openThread(threadId, mailId) {

        setActiveThread(threadId);

        setInbox(prev =>
            prev.map(m =>
                m.id === mailId ? { ...m, is_read: 1 } : m
            )
        );

        fetch(`https://${GetParentResourceName()}/markRead`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: mailId })
        });
    }

    // =========================
    // DELETE EMAIL
    // =========================
    function deleteEmail(id) {

        setInbox(prev =>
            prev.map(m =>
                m.id === id ? { ...m, deleted: 1 } : m
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
        if (!thread || !reply.trim()) return;

        const msg = reply;

        setInbox(prev => [
            ...prev,
            {
                id: Date.now(),
                thread_id: activeThread,
                sender: email,
                receiver: thread.sender,
                subject: thread.subject,
                body: msg,
                created_at: Math.floor(Date.now() / 1000),
                is_read: 1,
                deleted: 0
            }
        ]);

        setReply("");

        fetch(`https://${GetParentResourceName()}/sendReply`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                thread_id: activeThread,
                receiver: thread.sender,
                subject: thread.subject,
                body: msg
            })
        });
    }

    // =========================
    // SEND EMAIL
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

    // =========================
    // FILTER + SEARCH
    // =========================
    const filtered = inbox.filter(m => {

        if (!m) return false;

        const inFolder =
            view === "inbox" ? !m.deleted :
            view === "sent" ? (m.sender === email && !m.deleted) :
            view === "trash" ? m.deleted :
            true;

        if (!inFolder) return false;

        if (search.trim() !== "") {
            const q = search.toLowerCase();

            return (
                (m.subject || "").toLowerCase().includes(q) ||
                (m.sender || "").toLowerCase().includes(q) ||
                (m.receiver || "").toLowerCase().includes(q)
            );
        }

        return true;
    });

    const threadMessages = activeThread
        ? inbox.filter(m => m.thread_id === activeThread)
        : [];

    if (!email) return e("div", null, "Loading email...");

    // =========================
    // UI
    // =========================
    return e("div", { className: "emailAppLayout" },

        // SIDEBAR
        e("div", { className: "emailSidebar" },

            e("button", { onClick: () => changeView("inbox"), className: view === "inbox" ? "active" : "" }, "Inbox"),

            e("button", { onClick: () => changeView("sent"), className: view === "sent" ? "active" : "" }, "Sent"),

            e("button", { onClick: () => changeView("trash"), className: view === "trash" ? "active" : "" }, "Trash"),

            e("button", {
                className: "primary",
                onClick: () => {
                    setComposing(true);
                    setActiveThread(null);
                }
            }, "Compose")
        ),

        // MAIN
        e("div", { className: "emailMain" },

            // SEARCH
            e("input", {
                className: "emailSearch",
                placeholder: "Search emails...",
                value: search,
                onChange: (e) => setSearch(e.target.value)
            }),

            // COMPOSE
            composing && e("div", { className: "composePanel" },

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

                e("button", {
                    className: "primary",
                    onClick: sendEmail
                }, "Send")
            ),

            // LIST
            !activeThread && !composing && filtered.map(m =>
                e("div", {
                    key: m.id,
                    className: "emailItem",
                    onClick: () => openThread(m.thread_id, m.id)
                },

                    e("div", { className: "emailItemLeft" },

                        e("div", {
                            className: "emailSubject",
                            style: { fontWeight: m.is_read ? "normal" : "bold" }
                        }, m.subject),

                        e("div", { className: "emailMeta" },
                            view === "sent"
                                ? `To: ${m.receiver || "unknown"}`
                                : `From: ${m.sender || "unknown"}`,
                            " • ",
                            formatTime(m.created_at)
                        )
                    ),

                    e("div", { className: "emailItemRight" },

                        e("div", {
                            style: {
                                fontSize: "11px",
                                marginRight: "8px",
                                opacity: 0.8,
                                color: m.is_read ? "#22c55e" : "#f59e0b"
                            }
                        }, m.is_read ? "Read" : "Unread"),

                        e("button", {
                            className: "deleteBtn",
                            onClick: (ev) => {
                                ev.stopPropagation();
                                deleteEmail(m.id);
                            }
                        }, "✕")
                    )
                )
            ),

            // THREAD
            activeThread && e("div", { className: "emailThreadView" },

                e("div", { className: "emailThreadHeader" },

                    e("div", { className: "emailThreadSubject" },
                        threadMessages[0]?.subject
                    ),

                    e("div", { className: "emailThreadMeta" },

                        e("div", null,
                            "From: ", threadMessages[0]?.sender
                        ),

                        e("div", { style: { marginLeft: "10px" } },
                            "To: ", threadMessages[0]?.receiver
                        ),

                        e("div", { style: { marginLeft: "10px", opacity: 0.7 } },
                            formatTime(threadMessages[0]?.created_at)
                        )
                    )
                ),

                threadMessages.map(m =>
                    e("div", {
                        key: m.id,
                        className: "emailThreadItem"
                    },
                        e("div", { style: { fontSize: "12px", opacity: 0.7 } }, m.sender),
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
        )
    );
}