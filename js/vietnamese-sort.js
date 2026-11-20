
const collator = new Intl.Collator("vi", { sensitivity: "variant" });

function splitVietnameseName(fullName) {
    const parts = fullName.trim().split(/\s+/);

    if (parts.length === 1) {
        return { family: "", middle: "", given: parts[0] };
    }

    return {
        family: parts[0],
        middle: parts.slice(1, -1).join(" "),
        given: parts[parts.length - 1]
    };
}

function compareVietnameseNames(a, b) {
    const nameA = splitVietnameseName(a.name);
    const nameB = splitVietnameseName(b.name);

    return (
        collator.compare(nameA.given, nameB.given) ||
        collator.compare(nameA.family, nameB.family) ||
        collator.compare(nameA.middle, nameB.middle) ||
        collator.compare(a.id, b.id)
    );
}

function sortStudentsByName(students) {
    return [...students].sort(compareVietnameseNames);
}
