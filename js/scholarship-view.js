

function renderScholarshipFund(ctx) {
    const container = document.getElementById("scholarshipContent");
    const list = ctx.scholarshipList;

    if (!list.length) {
        container.innerHTML = `<p class="message">Chưa có dữ liệu để phân bổ học bổng.</p>`;
        return;
    }

    const total = list.reduce((sum, item) => sum + item.amount, 0);

    const groupRows = SCHOLARSHIP_GROUPS.map((group, i) => {
        const members = list.filter(item => item.group === i + 1);
        return `
            <tr>
                <td>${group.name} (đến hết top ${group.topPercent}%)</td>
                <td>${group.fundPercent}%</td>
                <td>${members.length}</td>
                <td>${formatCurrency(members.reduce((s, m) => s + m.amount, 0))}</td>
            </tr>
        `;
    }).join("");

    container.innerHTML = `
        <div class="stats-grid">
            <article class="stats-card">
                <h3>Phân bổ quỹ ${formatCurrency(SCHOLARSHIP_FUND)}</h3>
                <table class="plain-table">
                    <thead><tr><th>Nhóm</th><th>Tỷ lệ quỹ</th><th>Số SV</th><th>Tổng tiền</th></tr></thead>
                    <tbody>${groupRows}</tbody>
                    <tfoot>
                        <tr class="total-row">
                            <td colspan="3">Tổng đã phân bổ</td>
                            <td>${formatCurrency(total)} ${total === SCHOLARSHIP_FUND ? "✓" : "✗"}</td>
                        </tr>
                    </tfoot>
                </table>
            </article>
        </div>

        <div class="table-wrapper">
            <table class="plain-table">
                <thead>
                    <tr><th>Hạng</th><th>Mã SV</th><th>Họ và tên</th><th>Điểm TB</th><th>Nhóm học bổng</th><th>Số tiền</th></tr>
                </thead>
                <tbody>
                    ${list.map(item => `
                        <tr>
                            <td>${item.rank}</td>
                            <td>${item.id}</td>
                            <td class="student-name">${item.name}</td>
                            <td class="average-score">${formatScore(item.average)}</td>
                            <td>${item.groupName}</td>
                            <td>${formatCurrency(item.amount)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        </div>
    `;
}
