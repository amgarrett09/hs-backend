function nameReverse(st) {
    const words = st.split(" ");
    const firstName = words.shift();
    const lastName = words.join(" ");
    const out = [];
    out.push(lastName);
    out.push(firstName);

    return out.join(", ");
}

module.exports = nameReverse;