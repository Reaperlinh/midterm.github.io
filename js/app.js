

let students = [];
let subjects = [];
let grades = [];
let keyword = "";
let sortByName = false;
let ctx = null;
let renderCompare = () => { };

function buildContext() {
    const results = calculateAllResults(students, subjects, grades);

    const scholarshipList = calculateScholarships(
        students
            .filter(student => results.has(student.id))
            .map(student => ({
                id: student.id,
                name: student.name,
                average: results.get(student.id).average
            }))
    );

    return { students, subjects, grades, results, scholarshipList };
}

function getVisibleStudents() {
    const filtered = students.filter(student =>
        student.id.toLowerCase().includes(keyword) ||
        student.name.toLowerCase().includes(keyword)
    );

    return sortByName ? sortStudentsByName(filtered) : filtered;
}

function renderList() {
    renderStudentList(getVisibleStudents(), subjects, grades);
}

function refresh() {
    ctx = buildContext();
    renderList();
    renderStatistics(ctx);
    renderCompare();
    renderScholarshipFund(ctx);
}

function setupTabs() {
    const tabs = document.querySelectorAll("[data-view]");
    const views = document.querySelectorAll(".view");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(item => item.classList.toggle("active", item === tab));
            views.forEach(view => {
                view.hidden = view.id !== `view-${tab.dataset.view}`;
            });
        });
    });
}

async function init() {
    const loadingMessage = document.getElementById("loadingMessage");
    const errorMessage = document.getElementById("errorMessage");
    const searchInput = document.getElementById("searchInput");
    const sortButton = document.getElementById("sortButton");

    try {
        ({ students, subjects, grades } = await loadData());

        console.log(students, subjects, grades)

        ctx = buildContext();
        renderCompare = setupCompare(() => ctx);
        setupStudentModal(students, subjects, grades, refresh);
        setupTabs();
        refresh();

        searchInput.addEventListener("input", () => {
            keyword = searchInput.value.trim().toLowerCase();
            renderList();
        });

        sortButton.addEventListener("click", () => {
            sortByName = !sortByName;
            sortButton.classList.toggle("active", sortByName);
            sortButton.textContent = sortByName
                ? "Sắp xếp: Tên A → Z (bỏ sắp xếp)"
                : "Sắp xếp theo tên A → Z";
            renderList();
        });

        loadingMessage.hidden = true;
    } catch (error) {
        loadingMessage.hidden = true;
        errorMessage.hidden = false;
        errorMessage.textContent = error.message;
        console.error(error);
    }
}

init();
