
const WEIGHTS = {
    attendance: 0.1,
    midterm: 0.4,
    final: 0.5
};

function calculateSubjectAverage(scores) {
    const [attendance, midterm, final] = scores;

    return (
        attendance * WEIGHTS.attendance +
        midterm * WEIGHTS.midterm +
        final * WEIGHTS.final
    );
}

function calculateStudentResult(grade, subjects) {
    const subjectResults = subjects.map(subject => {
        const scores = grade.scores[subject.id];

        return {
            subjectId: subject.id,
            subjectName: subject.name,
            scores,
            average: calculateSubjectAverage(scores)
        };
    });

    const average =
        subjectResults.reduce((sum, item) => sum + item.average, 0) /
        subjectResults.length;

    const hasFailedSubject = subjectResults.some(
        item => item.average < 5
    );

    let classification;

    if (average >= 8.5) {
        classification = "Giỏi";
    } else if (average >= 7) {
        classification = "Khá";
    } else if (average >= 5) {
        classification = "Trung bình";
    } else {
        classification = "Yếu";
    }

    let scholarship = 0;

    if (!hasFailedSubject && average >= 8.5) {
        scholarship = 1500000;
    } else if (!hasFailedSubject && average >= 8) {
        scholarship = 1000000;
    }

    return {
        subjectResults,
        average,
        classification,
        scholarship
    };
}

const SCHOLARSHIP_FUND = 100000000;
const SCHOLARSHIP_UNIT = 1000;

const SCHOLARSHIP_GROUPS = [
    { name: "Nhóm 1", topPercent: 10, fundPercent: 40 },
    { name: "Nhóm 2", topPercent: 30, fundPercent: 40 },
    { name: "Nhóm 3", topPercent: 50, fundPercent: 20 }
];

function calculateAllResults(students, subjects, grades) {
    const gradeMap = new Map(grades.map(grade => [grade.student_id, grade]));
    const results = new Map();

    students.forEach(student => {
        const grade = gradeMap.get(student.id);
        if (grade) {
            results.set(student.id, calculateStudentResult(grade, subjects));
        }
    });

    return results;
}

function calculateScholarships(students, totalFund = SCHOLARSHIP_FUND) {
    const sorted = [...students].sort((a, b) =>
        (b.average - a.average) ||
        a.id.localeCompare(b.id, undefined, { numeric: true })
    );

    const n = sorted.length;

    const cutoffs = SCHOLARSHIP_GROUPS.map(group =>
        Math.min(n, Math.ceil((n * group.topPercent) / 100))
    );

    const sizes = cutoffs.map((cutoff, i) => cutoff - (i === 0 ? 0 : cutoffs[i - 1]));
    const pools = SCHOLARSHIP_GROUPS.map(group => (totalFund * group.fundPercent) / 100);

    for (let i = pools.length - 1; i > 0; i--) {
        if (sizes[i] === 0) {
            pools[i - 1] += pools[i];
            pools[i] = 0;
        }
    }

    const ranked = sorted.map((student, index) => ({
        ...student,
        rank: index + 1,
        group: 0,
        groupName: "Không nhận học bổng",
        amount: 0
    }));

    let start = 0;

    SCHOLARSHIP_GROUPS.forEach((group, i) => {
        const size = sizes[i];
        if (size === 0) return;

        const members = ranked.slice(start, start + size);
        const base = Math.floor(pools[i] / size / SCHOLARSHIP_UNIT) * SCHOLARSHIP_UNIT;
        const leftoverUnits = Math.round((pools[i] - base * size) / SCHOLARSHIP_UNIT);

        members.forEach(member => {
            member.group = i + 1;
            member.groupName = group.name;
            member.amount = base;
        });

        for (let k = 0; k < leftoverUnits; k++) {
            members[k % size].amount += SCHOLARSHIP_UNIT;
        }

        start += size;
    });

    return ranked;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0
    }).format(amount);
}
