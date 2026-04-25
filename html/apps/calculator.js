function CalculatorApp() {

    const e = React.createElement;

    const [input, setInput] = React.useState("");
    const [history, setHistory] = React.useState([]);

    function press(v) {
        setInput(prev => prev + v);
    }

    function clear() {
        setInput("");
    }

    function backspace() {
        setInput(prev => prev.slice(0, -1));
    }

    function calculate() {
        try {
            let result = eval(
                input
                    .replace(/π/g, Math.PI)
                    .replace(/e/g, Math.E)
            );

            setHistory(prev => [
                { expr: input, result },
                ...prev
            ].slice(0, 10));

            setInput(String(result));
        } catch {
            setInput("Error");
        }
    }

    function Button({ label, onClick, type }) {
        return e("button", {
            className: "calcBtn " + (type || ""),
            onClick
        }, label);
    }

    React.useEffect(() => {

        function onKeyDown(e) {

            const k = e.key;

            if (!isNaN(k)) press(k);

            if (k === "+") press("+");
            if (k === "-") press("-");
            if (k === "*") press("*");
            if (k === "/") press("/");

            if (k === ".") press(".");

            if (k === "Enter") {
                e.preventDefault();
                calculate();
            }

            if (k === "Backspace") backspace();
            if (k === "Escape") clear();
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);

    }, []);

    return e("div", { className: "calculatorApp" },

        e("div", { className: "calcDisplay" }, input || "0"),

        e("div", { className: "calcGrid" },

            Button({ label: "C", onClick: clear, type: "danger" }),
            Button({ label: "⌫", onClick: backspace, type: "danger" }),
            Button({ label: "(", onClick: () => press("("), type: "operator" }),
            Button({ label: ")", onClick: () => press(")"), type: "operator" }),

            Button({ label: "7", onClick: () => press("7"), type: "number" }),
            Button({ label: "8", onClick: () => press("8"), type: "number" }),
            Button({ label: "9", onClick: () => press("9"), type: "number" }),
            Button({ label: "/", onClick: () => press("/"), type: "operator" }),

            Button({ label: "4", onClick: () => press("4"), type: "number" }),
            Button({ label: "5", onClick: () => press("5"), type: "number" }),
            Button({ label: "6", onClick: () => press("6"), type: "number" }),
            Button({ label: "*", onClick: () => press("*"), type: "operator" }),

            Button({ label: "1", onClick: () => press("1"), type: "number" }),
            Button({ label: "2", onClick: () => press("2"), type: "number" }),
            Button({ label: "3", onClick: () => press("3"), type: "number" }),
            Button({ label: "-", onClick: () => press("-"), type: "operator" }),

            Button({ label: "0", onClick: () => press("0"), type: "number" }),
            Button({ label: ".", onClick: () => press("."), type: "number" }),
            Button({ label: "=", onClick: calculate, type: "equal" }),
            Button({ label: "+", onClick: () => press("+"), type: "operator" })
        ),

        e("div", { className: "calcHistory" },
            history.map((h, i) =>
                e("div", {
                    key: i,
                    onClick: () => setInput(h.expr)
                }, `${h.expr} = ${h.result}`)
            )
        )
    );
}