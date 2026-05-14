const e = React.createElement;

/* =========================
   SAFE DATE PARSER
========================= */
function parseDate(dt) {

    if (!dt) return 0;

    if (dt instanceof Date) return dt.getTime();
    if (typeof dt === "number") return dt;

    if (typeof dt === "string") {

        if (dt.includes("T") && dt.endsWith("Z")) {
            return new Date(dt).getTime();
        }

        return new Date(dt.replace(" ", "T")).getTime();
    }

    return new Date(dt).getTime();
}

function NewsApp() {

    const [articles, setArticles] = React.useState([]);
    const [events, setEvents] = React.useState([]);

    const [selectedArticle, setSelectedArticle] = React.useState(null);
    const [adminOpen, setAdminOpen] = React.useState(false);

    // ✅ FIX: stable default state
    const [job, setJob] = React.useState("none");

    const [title, setTitle] = React.useState("");
    const [ingress, setIngress] = React.useState("");
    const [body, setBody] = React.useState("");
    const [image, setImage] = React.useState("");

    const [eventTitle, setEventTitle] = React.useState("");
    const [eventStart, setEventStart] = React.useState("");
    const [eventEnd, setEventEnd] = React.useState("");
    const [eventDescription, setEventDescription] = React.useState("");

    const [now, setNow] = React.useState(Date.now());

    /* =========================
       CLOCK
    ========================= */
    React.useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    /* =========================
       NUI MESSAGES
    ========================= */
    React.useEffect(() => {

        function handler(event) {

            const msg = event.data;
            if (!msg) return;

            if (msg.name === "getNews") {
                setArticles(Array.isArray(msg.data) ? msg.data : []);

                // ✅ SAFE JOB SYNC
                if (msg.isReporter !== undefined) {
                    setJob(msg.isReporter ? "newsreporter" : "none");
                }
            }

            if (msg.name === "getEvents") {
                setEvents(Array.isArray(msg.data) ? msg.data : []);

                // ✅ SAFE JOB SYNC
                if (msg.isReporter !== undefined) {
                    setJob(msg.isReporter ? "newsreporter" : "none");
                }
            }
        }

        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);

    }, []);

    function send(name, args = {}) {

        fetch(`https://${GetParentResourceName()}/callback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, args })
        });
    }

    React.useEffect(() => {
        send("getNews");
        send("getEvents");
    }, []);

    /* =========================
       CREATE NEWS
    ========================= */
    function createArticle() {

        send("createNews", {
            title,
            ingress,
            body,
            image
        });

        setTitle("");
        setIngress("");
        setBody("");
        setImage("");

        setTimeout(() => send("getNews"), 300);
    }

    /* =========================
       CREATE EVENT
    ========================= */
    function createEvent() {

        send("createEvent", {
            title: eventTitle,
            start_time: eventStart.replace("T", " ") + ":00",
            end_time: eventEnd.replace("T", " ") + ":00",
            description: eventDescription
        });

        setEventTitle("");
        setEventStart("");
        setEventEnd("");
        setEventDescription("");

        setTimeout(() => send("getEvents"), 300);
    }

    /* =========================
       HELPERS
    ========================= */
    function toTime(dt) {
        return parseDate(dt);
    }

    function formatDate(dt) {
        const d = new Date(parseDate(dt));
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    function formatTime(dt) {
        const d = new Date(parseDate(dt));
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }

    function formatDateTime(dt) {
        const d = new Date(parseDate(dt));
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} - ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }

    function formatArticleMeta(a) {
        return `Author: ${a.author || "City News Desk"} - ${formatDateTime(a.created_at)}`;
    }

    function formatEvent(ev) {
        return `📅 ${formatDate(ev.start_time)} - 🕒 ${formatTime(ev.start_time)} - ${formatTime(ev.end_time)}`;
    }

    function getCountdown(ev) {

        const diff = toTime(ev.start_time) - now;
        if (diff <= 0) return "";

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        let text = "Starting in ";
        if (days > 0) text += `${days}d `;
        if (hours > 0 || days > 0) text += `${hours}h `;
        text += `${minutes}min`;

        return text;
    }

    const upcomingEvents = events
        .filter(ev => toTime(ev.end_time) > now)
        .sort((a, b) => toTime(a.start_time) - toTime(b.start_time));

    const pastEvents = events
        .filter(ev => toTime(ev.end_time) <= now)
        .sort((a, b) => toTime(b.start_time) - toTime(a.start_time));

    return e("div", { className: "newsApp" },

        /* TOP BAR */
        e("div", { className: "newsTopbar" },

            e("div", { className: "newsBrand" }, "📅 Daily News"),

            e("div", { style: { display: "flex", gap: "8px", alignItems: "center" } },

                selectedArticle && e("button", {
                    className: "newsBackBtn",
                    onClick: () => setSelectedArticle(null)
                }, "← Back"),

                job === "newsreporter" && e("button", {
                    className: "newsAdminBtn",
                    onClick: () => setAdminOpen(!adminOpen)
                }, "Admin")
            )
        ),

        /* ADMIN */
        adminOpen && job === "newsreporter" && e("div", {
            className: "newsAdminPanel"
        },

            e("h3", null, "Create Article"),

            e("input", {
                placeholder: "Image URL",
                value: image,
                onChange: ev => setImage(ev.target.value)
            }),

            e("input", {
                placeholder: "Title",
                value: title,
                onChange: ev => setTitle(ev.target.value)
            }),

            e("input", {
                placeholder: "Ingress",
                value: ingress,
                onChange: ev => setIngress(ev.target.value)
            }),

            e("textarea", {
                placeholder: "Body",
                value: body,
                onChange: ev => setBody(ev.target.value)
            }),

            e("button", {
                className: "newsActionBtn",
                onClick: createArticle
            }, "Publish"),

            e("hr"),

            e("h3", null, "Create Event"),

            e("input", {
                type: "datetime-local",
                value: eventStart,
                onChange: ev => setEventStart(ev.target.value)
            }),

            e("input", {
                type: "datetime-local",
                value: eventEnd,
                onChange: ev => setEventEnd(ev.target.value)
            }),

            e("textarea", {
                placeholder: "Description",
                value: eventDescription,
                onChange: ev => setEventDescription(ev.target.value)
            }),

            e("button", {
                className: "newsActionBtn",
                onClick: createEvent
            }, "Create Event")
        ),

        /* CONTENT */
        e("div", { className: "newsContent" },

            e("div", { className: "newsFeed" },

                !selectedArticle && articles.map(a =>
                    e("div", {
                        key: a.id,
                        className: "newsCard",
                        onClick: () => setSelectedArticle(a)
                    },

                        a.image && e("img", {
                            src: a.image,
                            className: "newsCardImage"
                        }),

                        e("div", { className: "newsCardTitle" }, a.title),
                        e("div", { className: "newsCardMeta" }, formatArticleMeta(a)),
                        e("div", { className: "newsCardIngress" }, a.ingress)
                    )
                ),

                selectedArticle && e("div", null,

                    selectedArticle.image && e("img", {
                        src: selectedArticle.image,
                        className: "articleHeaderImage"
                    }),

                    e("h1", null, selectedArticle.title),

                    e("div", { className: "articleMetaBar" },
                        formatArticleMeta(selectedArticle)
                    ),

                    e("div", { className: "articleIngress" }, selectedArticle.ingress),

                    e("div", {
                        className: "articleBody",
                        dangerouslySetInnerHTML: { __html: selectedArticle.body }
                    })
                )
            ),

            e("div", { className: "eventsPanel" },

                upcomingEvents.map(ev =>
                    e("div", {
                        key: ev.id,
                        className: "eventCard"
                    },
                        e("div", { style: { fontWeight: "bold" } }, ev.title),
                        e("div", null, formatEvent(ev)),
                        e("div", null, getCountdown(ev)),
                        e("div", null, ev.description)
                    )
                )
            )
        )
    );
}