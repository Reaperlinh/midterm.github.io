

const LEVELS = ["Giỏi", "Khá", "Trung bình", "Yếu"];

function renderStatistics(ctx) {
    const { students, subjects, results } = ctx;
    const container = document.getElementById("statsContent");

    const rows = students
        .map(student => ({ student, result: results.get(student.id) }))
        .filter(row => row.result);

    if (!rows.length) {
        container.innerHTML = `<p class="message">Chưa có dữ liệu điểm để thống kê.</p>`;
        return;
    }

    const maxAverage = Math.max(...rows.map(row => row.result.average));
    const toppers = rows.filter(row => row.result.average === maxAverage);

    const counts = Object.fromEntries(LEVELS.map(level => [level, 0]));
    rows.forEach(row => { counts[row.result.classification]++; });

    const failing = rows
        .map(row => ({
            ...row,
            failedSubjects: row.result.subjectResults.filter(item => item.average < 5)
        }))
        .filter(row => row.failedSubjects.length > 0);

    const subjectStats = subjects.map((subject, index) => {
        const values = rows.map(row => row.result.subjectResults[index].average);
        return {
            name: subject.name,
            average: values.reduce((a, b) => a + b, 0) / values.length,
            min: Math.min(...values),
            max: Math.max(...values)
        };
    });

    container.innerHTML = `
        <div class="stats-grid">
            <article class="stats-card">
                <h3>Sinh viên có điểm TB học kỳ cao nhất</h3>
                ${toppers.map(row => `
                    <p class="top-student">
                        <strong>${row.student.name}</strong>
                        <span>(${row.student.id})</span>
                        – ${formatScore(row.result.average)} điểm
                    </p>
                `).join("")}
            </article>

            <article class="stats-card">
                <h3>Số sinh viên theo xếp loại</h3>
                <table class="plain-table">
                    <thead><tr><th>Xếp loại</th><th>Số lượng</th></tr></thead>
                    <tbody>
                        ${LEVELS.map(level => `
                            <tr>
                                <td><span class="classification">${level}</span></td>
                                <td>${counts[level]}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </article>
        </div>

        <article class="stats-card">
            <h3>Sinh viên có ít nhất một môn dưới 5 (${failing.length})</h3>
            ${failing.length ? `
                <div class="table-wrapper">
                    <table class="plain-table">
                        <thead><tr><th>Mã SV</th><th>Họ và tên</th><th>Môn dưới 5</th><th>Điểm TB học kỳ</th></tr></thead>
                        <tbody>
                            ${failing.map(row => `
                                <tr>
                                    <td>${row.student.id}</td>
                                    <td class="student-name">${row.student.name}</td>
                                    <td class="left">${row.failedSubjects.map(item =>
        `${item.subjectName} (${formatScore(item.average)})`).join(", ")}</td>
                                    <td>${formatScore(row.result.average)}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            ` : `<p class="message">Không có sinh viên nào có môn dưới 5.</p>`}
        </article>

        <article class="stats-card">
            <h3>Điểm của lớp theo từng môn học</h3>
            <div class="table-wrapper">
                <table class="plain-table">
                    <thead><tr><th>Môn học</th><th>Điểm trung bình</th><th>Thấp nhất</th><th>Cao nhất</th></tr></thead>
                    <tbody>
                        ${subjectStats.map(item => `
                            <tr>
                                <td class="left">${item.name}</td>
                                <td>${formatScore(item.average)}</td>
                                <td>${formatScore(item.min)}</td>
                                <td>${formatScore(item.max)}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>
        </article>
    `;
}
