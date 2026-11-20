
async function loadData() {
    if (location.protocol === "file:" && window.APP_DATA) {
        return window.APP_DATA;
    }

    const [studentsResponse, subjectsResponse, gradesResponse] =
        await Promise.all([
            fetch("data/students.json"),
            fetch("data/subjects.json"),
            fetch("data/grades.json")
        ]);

    if (
        !studentsResponse.ok ||
        !subjectsResponse.ok ||
        !gradesResponse.ok
    ) {
        throw new Error("Không thể tải dữ liệu. Hãy kiểm tra các file JSON.");
    }

    const [students, subjects, grades] = await Promise.all([
        studentsResponse.json(),
        subjectsResponse.json(),
        gradesResponse.json()
    ]);

    return { students, subjects, grades };
}
