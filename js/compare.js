

function setupCompare(getCtx) {
    const selectA = document.getElementById("compareA");
    const selectB = document.getElementById("compareB");
    const output = document.getElementById("compareResult");

    const options = getCtx().students
        .map(s => `<option value="${s.id}">${s.id} – ${s.name}</option>`)
        .join("");

    selectA.innerHTML = options;
    selectB.innerHTML = options;
    if (selectB.options.length > 1) selectB.selectedIndex = 1;

    function cell(value, other, text) {
        const cls = value > other ? "better" : value < other ? "worse" : "";
        return `<td class="${cls}">${text}</td>`;
    }

    function render() {
        const ctx = getCtx();
        const a = ctx.students.find(s => s.id === selectA.value);
        const b = ctx.students.find(s => s.id === selectB.value);
        const ra = a && ctx.results.get(a.id);
        const rb = b && ctx.results.get(b.id);

        if (!a || !b) {
            output.innerHTML = "";
            return;
        }

        if (a.id === b.id) {
            output.innerHTML = `<p class="message">Hãy chọn hai sinh viên khác nhau để so sánh.</p>`;
            return;
        }

        if (!ra || !rb) {
            output.innerHTML = `<p class="message error">Một trong hai sinh viên chưa có dữ liệu điểm.</p>`;
            return;
        }

        const rows = ra.subjectResults.map((item, i) => {
            const other = rb.subjectResults[i];
            const diff = item.average - other.average;

            return `
                <tr>
                    <td class="left">${item.subjectName}</td>
                    ${cell(item.average, other.average,
                `${formatScore(item.average)}<small>${item.scores.join(" / ")}</small>`)}
                    ${cell(other.average, item.average,
                    `${formatScore(other.average)}<small>${other.scores.join(" / ")}</small>`)}
                    <td>${diff === 0 ? "Bằng nhau" : (diff > 0 ? a.name : b.name) + " +" + Math.abs(diff).toFixed(2)}</td>
                </tr>
            `;
        }).join("");

        const diff = ra.average - rb.average;

        output.innerHTML = `
            <div class="table-wrapper">
                <table class="plain-table compare-table">
                    <thead>
                        <tr>
                            <th>Môn học</th>
                            <th>${a.name}<small>${a.id}</small></th>
                            <th>${b.name}<small>${b.id}</small></th>
                            <th>Chênh lệch</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                        <tr class="total-row">
                            <td class="left">Điểm TB học kỳ</td>
                            ${cell(ra.average, rb.average, formatScore(ra.average))}
                            ${cell(rb.average, ra.average, formatScore(rb.average))}
                            <td>${diff === 0 ? "Bằng nhau" : (diff > 0 ? a.name : b.name) + " +" + Math.abs(diff).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td class="left">Xếp loại</td>
                            <td><span class="classification">${ra.classification}</span></td>
                            <td><span class="classification">${rb.classification}</span></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td class="left">Học bổng</td>
                            <td>${formatCurrency(ra.scholarship)}</td>
                            <td>${formatCurrency(rb.scholarship)}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p class="result-count">Dưới mỗi điểm TB môn là ba điểm thành phần: chuyên cần / giữa kỳ / cuối kỳ.</p>
        `;
    }

    selectA.addEventListener("change", render);
    selectB.addEventListener("change", render);

    return render;
}
