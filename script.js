const AppState = {
    students: [
        { 
            id: 1, rollNo: "CS-2026-001", name: "Aarav Mehta", batch: "2026",
            score: 88, attendanceTotal: 92,
            subjects: { "Math": 90, "Physics": 85, "CS": 95 },
            attSubjects: { "Math": 95, "Physics": 90, "CS": 92 },
            feedback: ["Concepts are clear", "Active participation"],
            piNotes: "Aarav is doing excellently. No intervention needed.",
            history: [{ date: "2026-10-10", type: "meeting", note: "Term 1 Review - Excellent" }],
            messages: [{ sender: "PI", text: "Great job on the latest assignment!" }, { sender: "Student", text: "Thank you!" }]
        },
        { 
            id: 2, rollNo: "CS-2026-002", name: "Priya Sharma", batch: "2026",
            score: 76, attendanceTotal: 85,
            subjects: { "Math": 70, "Physics": 80, "CS": 78 },
            attSubjects: { "Math": 80, "Physics": 85, "CS": 90 },
            feedback: ["Needs more practice in Math"],
            piNotes: "Priya is consistent but struggles slightly with advanced calculus.",
            history: [{ date: "2026-10-12", type: "meeting", note: "Discussed Math progress" }],
            messages: []
        },
        { 
            id: 3, rollNo: "CS-2026-003", name: "Liam Carter", batch: "2026",
            score: 42, attendanceTotal: 60,
            subjects: { "Math": 40, "Physics": 35, "CS": 50 },
            attSubjects: { "Math": 55, "Physics": 60, "CS": 65 },
            feedback: ["Did not understand concepts", "Lack of preparation"],
            piNotes: "Liam has been absent frequently. Seems disengaged.",
            history: [{ date: "2026-10-18", type: "missed", note: "Missed scheduled 1:1 check-in" }],
            messages: [{ sender: "PI", text: "Liam, please see me after class." }, { sender: "Student", text: "OK" }]
        }
    ],
    settings: {
        scoreCritical: 50,
        attWarning: 75
    },
    
    // Computed Properties
    getProcessedStudents() {
        return this.students.map(s => {
            let riskLevel = "low"; // good
            let riskReasons = [];
            
            if (s.attendanceTotal < this.settings.attWarning) {
                riskReasons.push("Low Attendance");
                riskLevel = "medium";
            }
            if (s.score < this.settings.scoreCritical) {
                riskReasons.push("Critical Score");
                riskLevel = "high"; // overriding medium
            }
            if (s.attendanceTotal < this.settings.attWarning && s.score < this.settings.scoreCritical) {
                riskLevel = "critical"; // worst
            }

            // Trend calculation mocked based on arbitrary logic for now
            let trend = "Stable";
            if (s.score > 80) trend = "Improving";
            if (s.score < 50) trend = "Declining";

            return { ...s, riskLevel, riskReasons, trend };
        });
    },

    // Actions
    addStudent(name, rollNo, batch, initScore, initAtt) {
        const newId = this.students.length ? Math.max(...this.students.map(s => s.id)) + 1 : 1;
        this.students.push({
            id: newId, name, rollNo, batch,
            score: initScore, attendanceTotal: initAtt,
            subjects: { "Math": initScore, "Physics": initScore, "CS": initScore },
            attSubjects: { "Math": initAtt, "Physics": initAtt, "CS": initAtt },
            feedback: ["New student added to system"],
            piNotes: "Initial evaluation pending.",
            history: [{ date: new Date().toISOString().split('T')[0], type: "system", note: "Student enrolled in system." }],
            messages: []
        });
        refreshApp();
    },

    updateAttendance(studentId, subject, newVal) {
        const s = this.students.find(s => s.id === studentId);
        if(s) {
            s.attSubjects[subject] = newVal;
            // Update total attendance
            const attVals = Object.values(s.attSubjects);
            s.attendanceTotal = Math.round(attVals.reduce((a, b) => a + b, 0) / attVals.length);
            refreshApp();
        }
    },

    sendMessage(studentId, text) {
        const s = this.students.find(s => s.id === studentId);
        if(s) {
            s.messages.push({ sender: "PI", text });
            // Mock student reply
            setTimeout(() => {
                s.messages.push({ sender: "Student", text: "OK" });
                refreshApp();
            }, 1000);
        }
    },

    addMeeting(studentId) {
        const s = this.students.find(s => s.id === studentId);
        if(s) {
            s.history.push({ 
                date: new Date().toISOString().split('T')[0], 
                type: "meeting", 
                note: "Scheduled intervention meeting" 
            });
            refreshApp();
        }
    },

    removeStudent(studentId) {
        this.students = this.students.filter(s => s.id !== studentId);
        refreshApp();
    },

    generateInsights() {
        const processed = this.getProcessedStudents();
        const critical = [];
        const behavioral = [];
        const academic = [];
        const positive = [];

        processed.forEach(s => {
            if (s.riskLevel === 'critical' || s.riskLevel === 'high') {
                critical.push({ name: s.name, time: "Current", desc: "Performance and attendance have dropped below critical thresholds.", action: "Urgent Meeting" });
            }
            if (s.attendanceTotal < 65) {
                behavioral.push({ name: s.name, time: "Last 2 weeks", desc: "Frequent absences detected across multiple subjects.", action: "Check Wellbeing" });
            }
            if (s.score < s.attendanceTotal - 20) {
                academic.push({ name: s.name, time: "Term 1", desc: "High attendance but poor academic conversion.", action: "Recommend Tutoring" });
            }
            if (s.score > 85 && s.trend === 'Improving') {
                positive.push({ name: s.name, time: "Last Exam", desc: "Consistently scoring well and improving.", action: "Acknowledge" });
            }
        });

        // Fallbacks so columns aren't completely empty
        if(!positive.length) positive.push({ name: "System", time: "N/A", desc: "Keep monitoring students to see positive trends.", action: "N/A" });

        return { critical, behavioral, academic, positive };
    }
};

let charts = {};
let activeChatStudentId = null;

// INIT
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    setupTheme();
    setupNavigation();
    bindEvents();
    refreshApp();
});

function refreshApp() {
    renderKPIs();
    renderStudentsGrid();
    renderAlerts();
    renderAttendance();
    renderMeetings();
    renderInsights();
    renderMessagesList();
    if(activeChatStudentId) renderChatArea(activeChatStudentId);
    if(document.getElementById('view-student-profile').classList.contains('active')) {
        // If a profile is open, refresh it
        const currentName = document.getElementById('sp-name').textContent;
        const student = AppState.getProcessedStudents().find(s => s.name === currentName);
        if(student) openStudentProfile(student);
    }
    initCharts();
}

// BINDINGS
function bindEvents() {
    // Add Student Form
    document.getElementById('global-add-student-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('add-name').value;
        const roll = document.getElementById('add-roll').value;
        const batch = document.getElementById('add-batch').value;
        const score = parseInt(document.getElementById('add-score').value);
        const att = parseInt(document.getElementById('add-att').value);
        AppState.addStudent(name, roll, batch, score, att);
        e.target.reset();
        alert("Student Added to Global State!");
        document.querySelector('[data-view="mystudents"]').click();
    });

    // Settings Form
    document.getElementById('settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
    });

    // Filter
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            renderStudentsGrid();
        });
    });

    document.getElementById('student-search').addEventListener('input', () => renderStudentsGrid());

    // Export
    document.getElementById('btn-export-csv').addEventListener('click', () => {
        const processed = AppState.getProcessedStudents();
        const headers = ["ID", "Name", "RollNo", "Score", "Attendance", "RiskLevel"];
        const rows = processed.map(s => [s.id, s.name, s.rollNo, s.score, s.attendanceTotal, s.riskLevel]);
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "edupulse_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// RENDERING
function renderKPIs() {
    const students = AppState.getProcessedStudents();
    const total = students.length;
    const avgScore = total ? Math.round(students.reduce((a, s) => a + s.score, 0) / total) : 0;
    const avgAtt = total ? Math.round(students.reduce((a, s) => a + s.attendanceTotal, 0) / total) : 0;
    const atRisk = students.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length;

    document.getElementById('kpi-total').textContent = total;
    document.getElementById('kpi-score').textContent = `${avgScore}/100`;
    document.getElementById('kpi-attendance').textContent = `${avgAtt}%`;
    document.getElementById('kpi-risk').textContent = atRisk;
}

function renderStudentsGrid() {
    const grid = document.getElementById('students-grid');
    if(!grid) return;
    grid.innerHTML = '';

    const text = document.getElementById('student-search').value.toLowerCase();
    const filterType = document.querySelector('.filter-chip.active')?.getAttribute('data-filter') || 'all';

    let filtered = AppState.getProcessedStudents().filter(s => 
        s.name.toLowerCase().includes(text) || s.rollNo.toLowerCase().includes(text)
    );

    if (filterType === 'high') filtered = filtered.filter(s => s.riskLevel === 'low');
    if (filterType === 'risk') filtered = filtered.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical' || s.riskLevel === 'medium');

    filtered.forEach(s => {
        let scoreClass = 'high';
        if(s.riskLevel === 'medium') scoreClass = 'medium';
        if(s.riskLevel === 'high' || s.riskLevel === 'critical') scoreClass = 'low';

        const card = document.createElement('div');
        card.className = 'student-card';
        card.innerHTML = `
            <div class="sc-header">
                <div class="sc-info">
                    <h4>${s.name}</h4>
                    <p>${s.rollNo}</p>
                </div>
                <div class="sc-score ${scoreClass}">${s.score}</div>
            </div>
            <div class="sc-stats">
                <div class="sc-stat">Att: <strong>${s.attendanceTotal}%</strong></div>
                <div class="sc-stat">Risk: <strong style="color: ${scoreClass === 'low' ? 'var(--low)' : 'inherit'}; text-transform: capitalize;">${s.riskLevel}</strong></div>
            </div>
        `;
        card.addEventListener('click', () => openStudentProfile(s));
        grid.appendChild(card);
    });
}

function renderAlerts() {
    const students = AppState.getProcessedStudents();
    const criticals = students.filter(s => s.score < AppState.settings.scoreCritical);
    const lowAtt = students.filter(s => s.attendanceTotal < AppState.settings.attWarning);

    document.getElementById('alert-kpi-critical').textContent = criticals.length;
    document.getElementById('alert-kpi-attendance').textContent = lowAtt.length;

    const container = document.getElementById('alerts-container');
    if(!container) return;
    container.innerHTML = '';

    const atRisk = students.filter(s => s.riskLevel !== 'low');

    atRisk.forEach(s => {
        container.innerHTML += `
            <div class="alert-card">
                <div class="alert-card-header">
                    <div class="alert-card-name">${s.name}</div>
                    <div class="alert-card-score">${s.score}/100</div>
                </div>
                <div class="alert-card-reasons">
                    <strong>Flags:</strong><br>
                    ${s.riskReasons.map(r => `• ${r}`).join('<br>')}
                </div>
                <button class="alert-card-action" onclick="AppState.addMeeting(${s.id}); alert('Meeting Scheduled!');">
                    <i data-lucide="calendar"></i> Schedule Intervention
                </button>
            </div>
        `;
    });
    lucide.createIcons();
}

function renderAttendance() {
    const tbody = document.getElementById('attendance-tbody');
    const thead = document.getElementById('attendance-thead');
    if(!tbody || !thead) return;

    // Get subjects from first student (assuming uniform subjects for now)
    const allSubjects = AppState.students.length > 0 ? Object.keys(AppState.students[0].attSubjects) : ["Math", "Physics", "CS"];

    // Dynamic Header
    thead.innerHTML = `
        <tr>
            <th>Student Name</th>
            <th>Overall %</th>
            ${allSubjects.map(sub => `<th style="text-align: center;">${sub}</th>`).join('')}
            <th>Actions</th>
        </tr>
    `;

    tbody.innerHTML = '';

    AppState.getProcessedStudents().forEach(s => {
        const subs = Object.keys(s.attSubjects);
        let subCells = '';
        allSubjects.forEach(sub => {
            const val = s.attSubjects[sub] !== undefined ? s.attSubjects[sub] : '';
            subCells += `<td style="text-align: center;">
                <input type="number" class="att-input" style="width: 80px; padding: 8px; font-weight: 600;" value="${val}" min="0" max="100" onchange="AppState.updateAttendance(${s.id}, '${sub}', parseInt(this.value))">
            </td>`;
        });

        tbody.innerHTML += `
            <tr>
                <td style="font-weight:600; font-size: 1rem;">${s.name}</td>
                <td><strong style="color: ${s.attendanceTotal < AppState.settings.attWarning ? 'var(--low)' : 'var(--high)'}; font-size: 1.1rem;">${s.attendanceTotal}%</strong></td>
                ${subCells}
                <td><button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;" onclick="document.querySelectorAll('.student-card')[${AppState.students.findIndex(x=>x.id===s.id)}].click()">View Profile</button></td>
            </tr>
        `;
    });
}

function renderMeetings() {
    const container = document.getElementById('meetings-list');
    if(!container) return;
    container.innerHTML = '';
    
    let allHistory = [];
    AppState.students.forEach(s => {
        s.history.forEach(h => {
            allHistory.push({ ...h, studentName: s.name });
        });
    });

    allHistory.sort((a,b) => new Date(b.date) - new Date(a.date));

    allHistory.forEach(h => {
        container.innerHTML += `
            <div class="tl-item" style="margin-bottom:20px;">
                <div class="tl-date">${h.date} - ${h.studentName}</div>
                <div class="tl-content">${h.note}</div>
            </div>
        `;
    });
}

function renderInsights() {
    const data = AppState.generateInsights();
    
    const renderColumn = (colId, items) => {
        const col = document.getElementById(colId);
        if(!col) return;
        const title = col.querySelector('.column-title').outerHTML;
        let cardsHtml = items.map(i => `
            <div class="insight-card">
                <div class="ic-header"><span class="ic-name">${i.name}</span><span class="ic-time">${i.time}</span></div>
                <div class="ic-desc">${i.desc}</div>
                <div class="ic-action"><i data-lucide="arrow-right-circle"></i> ${i.action}</div>
            </div>
        `).join('');
        col.innerHTML = title + cardsHtml;
    };

    renderColumn('insights-critical', data.critical);
    renderColumn('insights-behavioral', data.behavioral);
    renderColumn('insights-academic', data.academic);
    renderColumn('insights-positive', data.positive);
    lucide.createIcons();
}

// Messaging System
function renderMessagesList() {
    const list = document.getElementById('msg-student-list');
    if(!list) return;
    list.innerHTML = '';
    AppState.students.forEach(s => {
        const div = document.createElement('div');
        div.className = `msg-student ${activeChatStudentId === s.id ? 'active' : ''}`;
        div.innerHTML = `<div class="msg-student-name">${s.name}</div><div class="msg-student-roll">${s.rollNo}</div>`;
        div.addEventListener('click', () => {
            activeChatStudentId = s.id;
            renderMessagesList();
            renderChatArea(s.id);
        });
        list.appendChild(div);
    });
}

function renderChatArea(studentId) {
    const area = document.getElementById('msg-area');
    const s = AppState.students.find(x => x.id === studentId);
    if(!s || !area) return;

    let chatHtml = s.messages.map(m => `
        <div class="msg-bubble ${m.sender === 'PI' ? 'msg-pi' : 'msg-stu'}">
            ${m.text}
        </div>
    `).join('');

    area.innerHTML = `
        <div class="msg-header">Chat with ${s.name}</div>
        <div class="msg-history" id="msg-history">${chatHtml}</div>
        <form class="msg-input-area" id="msg-form">
            <input type="text" id="msg-input" placeholder="Type a message..." required autocomplete="off">
            <button type="submit"><i data-lucide="send"></i></button>
        </form>
    `;

    document.getElementById('msg-history').scrollTop = document.getElementById('msg-history').scrollHeight;

    document.getElementById('msg-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('msg-input').value;
        AppState.sendMessage(studentId, text);
    });
    lucide.createIcons();
}

// Profile page
function openStudentProfile(student) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-student-profile').classList.add('active');
    document.getElementById('breadcrumb').textContent = `Student Profile / ${student.name}`;

    document.getElementById('sp-name').textContent = student.name;
    document.getElementById('sp-roll').textContent = `Roll No: ${student.rollNo}`;
    document.getElementById('sp-avatar').textContent = student.name.charAt(0);
    
    // Risk
    const tagsContainer = document.getElementById('sp-tags');
    let rCol = 'var(--high)';
    if(student.riskLevel === 'medium') rCol = 'var(--warning)';
    if(student.riskLevel === 'high' || student.riskLevel === 'critical') rCol = 'var(--low)';
    
    tagsContainer.innerHTML = `
        <span class="filter-chip" style="pointer-events: none; border-color:${rCol}; color:${rCol}; background:transparent;">Risk: ${student.riskLevel.toUpperCase()}</span>
    `;

    const riskContainer = document.getElementById('sp-risk-reasons');
    if(student.riskReasons.length > 0) {
        document.getElementById('sp-risk-card').style.display = 'block';
        riskContainer.innerHTML = student.riskReasons.map(r => `<div class="risk-item"><i data-lucide="alert-circle"></i><p>${r}</p></div>`).join('');
    } else {
        document.getElementById('sp-risk-card').style.display = 'none';
    }

    // Att
    document.getElementById('sp-att-total').textContent = `${student.attendanceTotal}%`;
    document.getElementById('sp-att-circle').style.borderColor = student.attendanceTotal >= AppState.settings.attWarning ? 'var(--high)' : 'var(--low)';
    
    const attSubContainer = document.getElementById('sp-att-subjects');
    attSubContainer.innerHTML = '';
    for(let sub in student.attSubjects) {
        attSubContainer.innerHTML += `<div class="att-sub"><span>${sub}</span><strong>${student.attSubjects[sub]}%</strong></div>`;
    }

    // Perf
    document.getElementById('sp-score-current').textContent = `${student.score}/100`;
    
    // History
    const timeline = document.getElementById('sp-timeline');
    timeline.innerHTML = student.history.map(h => `
        <div class="tl-item"><div class="tl-date">${h.date}</div><div class="tl-content">${h.note}</div></div>
    `).join('');

    // Actions
    document.getElementById('btn-sp-remove').onclick = () => {
        if(confirm(`Are you sure you want to remove ${student.name} from the system?`)) {
            AppState.removeStudent(student.id);
            document.getElementById('back-to-students').click();
        }
    };
    document.getElementById('btn-sp-msg').onclick = () => {
        activeChatStudentId = student.id;
        document.querySelector('[data-view="messages"]').click();
    };
    document.getElementById('btn-sp-meeting').onclick = () => {
        AppState.addMeeting(student.id);
        alert('Meeting added to history!');
    };

    lucide.createIcons();
    setTimeout(() => initStudentChart(student), 100);
}

function initStudentChart(student) {
    const ctx = document.getElementById('sp-trendChart');
    if(!ctx) return;
    if(charts.spTrend) charts.spTrend.destroy();
    const primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#6366f1';
    charts.spTrend = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: Object.keys(student.subjects),
            datasets: [{ label: 'Score', data: Object.values(student.subjects), borderColor: primary, fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)', tension: 0.4 }]
        },
        options: { maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } }
    });
}

function initCharts() {
    const students = AppState.getProcessedStudents();
    const rootStyle = getComputedStyle(document.documentElement);
    let cHigh = rootStyle.getPropertyValue('--high').trim() || '#10b981';
    let cMed = rootStyle.getPropertyValue('--warning').trim() || '#f59e0b';
    let cLow = rootStyle.getPropertyValue('--low').trim() || '#ef4444';
    let primary = rootStyle.getPropertyValue('--primary').trim() || '#6366f1';

    Chart.defaults.color = rootStyle.getPropertyValue('--text-muted').trim() || '#94a3b8';
    Chart.defaults.borderColor = rootStyle.getPropertyValue('--border').trim() || '#2d3748';

    const highCount = students.filter(s => s.riskLevel === 'low').length;
    const medCount = students.filter(s => s.riskLevel === 'medium').length;
    const lowCount = students.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical').length;

    const ctxDist = document.getElementById('distChart');
    if(ctxDist) {
        if(charts.dist) charts.dist.destroy();
        charts.dist = new Chart(ctxDist.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Good', 'Warning', 'Critical'],
                datasets: [{ data: [highCount, medCount, lowCount], backgroundColor: [cHigh, cMed, cLow], borderWidth: 0 }]
            },
            options: { cutout: '75%', maintainAspectRatio: false }
        });
    }

    const scatterData = students.map(s => ({ x: s.attendanceTotal, y: s.score, r: 6 }));
    const ctxScatter = document.getElementById('scatterChart');
    if(ctxScatter) {
        if(charts.scatter) charts.scatter.destroy();
        charts.scatter = new Chart(ctxScatter.getContext('2d'), {
            type: 'bubble',
            data: { datasets: [{ label: 'Students', data: scatterData, backgroundColor: primary }] },
            options: { maintainAspectRatio: false, scales: { x: { title: { display: true, text: 'Attendance %' }, min: 40, max: 100 }, y: { title: { display: true, text: 'Academic Score' }, min: 0, max: 100 } } }
        });
    }

    const ctxAnalytics = document.getElementById('analyticsChart');
    if(ctxAnalytics) {
        if(charts.analytics) charts.analytics.destroy();
        
        let subAvgs = {};
        let subCounts = {};
        students.forEach(s => {
            Object.keys(s.subjects).forEach(sub => {
                subAvgs[sub] = (subAvgs[sub] || 0) + s.subjects[sub];
                subCounts[sub] = (subCounts[sub] || 0) + 1;
            });
        });
        let labels = Object.keys(subAvgs);
        let data = labels.map(l => subAvgs[l] / subCounts[l]);

        charts.analytics = new Chart(ctxAnalytics.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{ label: 'Class Average', data: data, backgroundColor: primary, borderRadius: 6 }]
            },
            options: { maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } }
        });
    }
}

// Navigation Helper
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-links li');
    const breadcrumb = document.getElementById('breadcrumb');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            const viewId = item.getAttribute('data-view');
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(`view-${viewId}`).classList.add('active');
            breadcrumb.textContent = item.querySelector('span').textContent;
            
            if(viewId === 'messages' && !activeChatStudentId && AppState.students.length > 0) {
                activeChatStudentId = AppState.students[0].id;
                renderMessagesList();
                renderChatArea(activeChatStudentId);
            }
        });
    });

    // PI Profile
    const piProfileBtn = document.getElementById('pi-profile-btn');
    if(piProfileBtn) {
        piProfileBtn.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById('view-pi-profile').classList.add('active');
            breadcrumb.textContent = "Instructor Profile";
        });
    }

    document.getElementById('back-to-students').addEventListener('click', () => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById('view-mystudents').classList.add('active');
        breadcrumb.textContent = "My Students";
        navItems.forEach(n => n.classList.remove('active'));
        document.querySelector('[data-view="mystudents"]').classList.add('active');
    });
}

function setupTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const htmlObj = document.documentElement;
    const icon = toggleBtn.querySelector('i');
    
    toggleBtn.addEventListener('click', () => {
        const currentTheme = htmlObj.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            htmlObj.setAttribute('data-theme', 'light');
            icon.setAttribute('data-lucide', 'moon');
        } else {
            htmlObj.setAttribute('data-theme', 'dark');
            icon.setAttribute('data-lucide', 'sun');
        }
        lucide.createIcons();
        if(charts.dist) initCharts(); 
    });
}
