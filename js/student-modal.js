

const COMPONENTS = ["Chuyên cần", "Giữa kỳ", "Cuối kỳ"];

function setupStudentModal(students, subjects, grades, onGradesChanged) {
    const modal = document.getElementById("studentModal");
    const detail = document.getElementById("studentDetail");
    const tableBody = document.getElementById("studentTableBody");

    let currentId = null;
    let editing = false;
    let notice = "";

    function closeModal() {
        modal.hidden = true;
        currentId = null;
        editing = false;
    }

    function renderViewRows(result) {
        return result.subjectResults.map(item => `
            <tr>
                <td>${item.subjectName}</td>
                <td>${item.scores[0].toFixed(1)}</td>
                <td>${item.scores[1].toFixed(1)}</td>
                <td>${item.scores[2].toFixed(1)}</td>
                <td>${item.average.toFixed(2)}</td>
            </tr>
        `).join("");
    }

    function renderEditRows(result) {
        return result.subjectResults.map(item => `
            <tr data-subject-row="${item.subjectId}">
                <td>${item.subjectName}</td>
                ${item.scores.map((score, index) => `
                    <td>
                        <input type="number" class="score-input" min="0" max="10" step="0.1"
                            value="${score}" data-subject="${item.subjectId}" data-index="${index}"
                            aria-label="${item.subjectName} - ${COMPONENTS[index]}">
                    </td>
                `).join("")}
                <td class="preview-average">${item.average.toFixed(2)}</td>
            </tr>
        `).join("");
    }

    function render() {
        const student = students.find(item => item.id === currentId);
        const grade = grades.find(item => item.student_id === currentId);

        if (!student || !grade) return;

        const result = calculateStudentResult(grade, subjects);

        detail.innerHTML = `
            <div class="student-info">
                <p><strong>Mã sinh viên:</strong> ${student.id}</p>
                <p><strong>Họ và tên:</strong> ${student.name}</p>
                <p><strong>Lớp:</strong> ${student.class}</p>
                <p><strong>Email:</strong> ${student.email}</p>
            </div>

            <h3>Chi tiết điểm các môn</h3>

            <div class="table-wrapper">
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th>Môn học</th>
                            <th>Chuyên cần</th>
                            <th>Giữa kỳ</th>
                            <th>Cuối kỳ</th>
                            <th>Điểm TB</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${editing ? renderEditRows(result) : renderViewRows(result)}
                    </tbody>
                </table>
            </div>

            <p id="editError" class="form-error" hidden></p>
            ${notice ? `<p class="form-success">${notice}</p>` : ""}

            <div class="result-summary">
                <p><strong>Điểm trung bình học kỳ:</strong> ${result.average.toFixed(2)}</p>
                <p><strong>Xếp loại:</strong>
                    <span class="classification">${result.classification}</span>
                </p>
                <p><strong>Học bổng:</strong> ${formatCurrency(result.scholarship)}</p>
            </div>

            <div class="modal-actions">
                ${editing
                ? `<button class="btn btn-primary" data-action="save">Lưu điểm</button>
                       <button class="btn btn-secondary" data-action="cancel">Hủy</button>`
                : `<button class="btn btn-primary" data-action="edit">Chỉnh sửa điểm</button>`}
            </div>
        `;
    }

    function showError(message, input) {
        const box = document.getElementById("editError");
        box.textContent = message;
        box.hidden = false;
        if (input) input.focus();
    }

    function saveGrades() {
        const grade = grades.find(item => item.student_id === currentId);
        const inputs = [...detail.querySelectorAll(".score-input")];
        const newScores = {};

        inputs.forEach(input => input.classList.remove("invalid"));

        for (const input of inputs) {
            const subject = subjects.find(s => s.id === input.dataset.subject);
            const label = `${subject.name} - ${COMPONENTS[input.dataset.index]}`;
            const raw = input.value.trim();
            const value = Number(raw);

            if (raw === "" || !Number.isFinite(value) || value < 0 || value > 10) {
                input.classList.add("invalid");
                showError(`Điểm "${label}" không hợp lệ: phải là số từ 0 đến 10.`, input);
                return;
            }

            newScores[input.dataset.subject] ??= [];
            newScores[input.dataset.subject][Number(input.dataset.index)] =
                Math.round(value * 10) / 10;
        }

        Object.assign(grade.scores, newScores);

        onGradesChanged();

        editing = false;
        notice = "Đã lưu điểm và cập nhật lại kết quả.";
        render();
    }

    tableBody.addEventListener("click", event => {
        const button = event.target.closest("[data-student-id]");
        if (!button) return;

        currentId = button.dataset.studentId;
        editing = false;
        notice = "";
        render();
        modal.hidden = false;
    });

    detail.addEventListener("click", event => {
        const action = event.target.closest("[data-action]")?.dataset.action;
        if (!action) return;

        if (action === "edit") {
            editing = true;
            notice = "";
            render();
        } else if (action === "cancel") {
            editing = false;
            notice = "";
            render();
        } else if (action === "save") {
            saveGrades();
        }
    });

    detail.addEventListener("input", event => {
        if (!event.target.classList.contains("score-input")) return;

        const row = event.target.closest("tr");
        const values = [...row.querySelectorAll(".score-input")].map(i => i.value.trim());
        const valid = values.every(v => v !== "" && Number(v) >= 0 && Number(v) <= 10);

        row.querySelector(".preview-average").textContent = valid
            ? calculateSubjectAverage(values.map(Number)).toFixed(2)
            : "—";
    });

    document.getElementById("closeModal").addEventListener("click", closeModal);

    modal.addEventListener("click", event => {
        if (event.target.hasAttribute("data-close-modal")) {
            closeModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });
}
