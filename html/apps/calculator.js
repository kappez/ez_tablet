window.registerApp("calculator", function ({ calc, setCalc }) {

    const e = React.createElement;

    function add(v) {
        setCalc(p => p + v);
    }

    function clear() {
        setCalc("");
    }

    function equal() {
        try {
            setCalc(Function("return (" + calc + ")")());
        } catch {
            setCalc("Error");
        }
    }

    return e("div", { className: "calcFull" },

        e("input", {
            className: "calcDisplayFull",
            value: calc,
            readOnly: true
        }),

        e("div", { className: "calcGridFull" },

            e("button", { className: "num", onClick: () => add("7") }, "7"),
            e("button", { className: "num", onClick: () => add("8") }, "8"),
            e("button", { className: "num", onClick: () => add("9") }, "9"),
            e("button", { className: "op", onClick: () => add("/") }, "/"),

            e("button", { className: "num", onClick: () => add("4") }, "4"),
            e("button", { className: "num", onClick: () => add("5") }, "5"),
            e("button", { className: "num", onClick: () => add("6") }, "6"),
            e("button", { className: "op", onClick: () => add("*") }, "*"),

            e("button", { className: "num", onClick: () => add("1") }, "1"),
            e("button", { className: "num", onClick: () => add("2") }, "2"),
            e("button", { className: "num", onClick: () => add("3") }, "3"),
            e("button", { className: "op", onClick: () => add("-") }, "-"),

            e("button", { className: "op", onClick: clear }, "C"),
            e("button", { className: "num", onClick: () => add("0") }, "0"),
            e("button", { className: "op equals", onClick: equal }, "="),
            e("button", { className: "op", onClick: () => add("+") }, "+")
        )
    );
});