// Initial Dataset
let students = [
    { id: 1, name: "Alice Johnson", participation: 85, quiz: 90, sentiment: "positive", trend: "improving" },
    { id: 2, name: "Bob Smith", participation: 45, quiz: 60, sentiment: "neutral", trend: "stable" },
    { id: 3, name: "Charlie Davis", participation: 30, quiz: 40, sentiment: "negative", trend: "declining" },
    { id: 4, name: "Diana Evans", participation: 95, quiz: 88, sentiment: "positive", trend: "stable" },
    { id: 5, name: "Evan Wright", participation: 60, quiz: 75, sentiment: "neutral", trend: "improving" },
    { id: 6, name: "Fiona Clark", participation: 20, quiz: 55, sentiment: "negative", trend: "declining" },
    { id: 7, name: "George Miller", participation: 80, quiz: 85, sentiment: "positive", trend: "improving" }
];

const sentimentMap = { "positive": 100, "neutral": 60, "negative": 30 };
let charts = {}; // Store chart instances

// Initialize Application
function init() {
    lucide.createIcons();
    setupNavigation();
    bindEvents();
    processData();
    renderAll();
}

// Data Processing Logic
function processData() {
    students = students.map(s => {
        // Calculate Score: (Part * 0.4) + (Quiz * 0.4) + (Sentiment * 0.2)
        const score = Math.round((s.participation * 0.4) + (s.quiz * 0.4) + (sentimentMap[s.sentiment] * 0.2));
        
        let status = "low";
        if (score >= 75) status = "high";
        else if (score >= 50) status = "medium";
        
        const isAtRisk = score < 45 || s.trend === "declining";

        return { ...s, score, status, isAtRisk };
    });
}

// Render Functions
function renderAll() {
    renderKPIs();
    renderTable(students);
    renderAlerts();
    initCharts();
}

function renderKPIs() {
    const total = students.length;
    const avgScore = Math.round(students.reduce((acc, s) => acc + s.score, 0) / total);
    const atRiskCount = students.filter(s => s.isAtRisk).length;

    document.getElementById('kpi-total-students').textContent = total;
    document.getElementById('kpi-avg-score').textContent = avgScore;
    document.getElementById('kpi-at-risk').textContent = atRiskCount;
    document.getElementById('alert-badge').textContent = atRiskCount;
}

function renderTable(dataToRender) {
    const tbody = document.getElementById('student-tbody');
    tbody.innerHTML = '';

    dataToRender.forEach(s => {
        const colorVar = `var(--${s.status})`;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${s.name}</strong></td>
            <td>${s.participation}</td>
            <td>${s.quiz}</td>
            <td style="text-transform: capitalize;">${s.sentiment}</td>
            <td>
                <div class="score-cell">
                    <span style="font-weight: 600; width: 24px;">${s.score}</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${s.score}%; background: ${colorVar}"></div>
                    </div>
                </div>
            </td>
            <td><span class="status-badge status-${s.status}">${s.status.toUpperCase()}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderAlerts() {
    const container = document.getElementById('alerts-container');
    container.innerHTML = '';
    
    const atRiskStudents = students.filter(s => s.isAtRisk);
    
    if (atRiskStudents.length === 0) {
        container.innerHTML = `<div style="padding:40px; text-align:center; color:var(--text-muted);">
            <i data-lucide="check-circle" style="width:48px; height:48px; color:var(--high); margin-bottom:16px;"></i>
            <h3>All Good!</h3>
            <p>No students are currently marked as at-risk.</p>
        </div>`;
        lucide.createIcons();
        return;
    }

    atRiskStudents.forEach(s => {
        const reason = s.score < 45 ? "critically low engagement score" : "declining weekly trend";
        const div = document.createElement('div');
        div.className = 'alert-card';
        div.innerHTML = `
            <div class="alert-icon"><i data-lucide="alert-triangle"></i></div>
            <div class="alert-content">
                <h3>Intervention Needed: ${s.name}</h3>
                <p>Flagged due to ${reason}. Current Score: <strong>${s.score}</strong>.</p>
                <div class="alert-tip">
                    <i data-lucide="lightbulb" style="width: 16px;"></i>
                    Action Tip: Schedule a brief 1-on-1 check-in to discuss recent performance and emotional well-being.
                </div>
            </div>
        `;
        container.appendChild(div);
    });
    lucide.createIcons();
}

// Charting Logic (Chart.js)
function initCharts() {
    const high = students.filter(s => s.status === 'high').length;
    const med = students.filter(s => s.status === 'medium').length;
    const low = students.filter(s => s.status === 'low').length;

    const rootStyle = getComputedStyle(document.documentElement);
    const cHigh = rootStyle.getPropertyValue('--high').trim();
    const cMed = rootStyle.getPropertyValue('--medium').trim();
    const cLow = rootStyle.getPropertyValue('--low').trim();

    // 1. Distribution Doughnut
    const ctxDist = document.getElementById('distChart').getContext('2d');
    if(charts.dist) charts.dist.destroy();
    charts.dist = new Chart(ctxDist, {
        type: 'doughnut',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{ data: [high, med, low], backgroundColor: [cHigh, cMed, cLow], borderWidth: 0 }]
        },
        options: { cutout: '70%', maintainAspectRatio: false }
    });

    // 2. Scatter/Bubble Chart
    const scatterData = students.map(s => ({ x: s.participation, y: s.quiz, r: 6 }));
    const ctxScatter = document.getElementById('scatterChart').getContext('2d');
    if(charts.scatter) charts.scatter.destroy();
    charts.scatter = new Chart(ctxScatter, {
        type: 'bubble',
        data: {
            datasets: [{ label: 'Students', data: scatterData, backgroundColor: rootStyle.getPropertyValue('--primary').trim() }]
        },
        options: {
            maintainAspectRatio: false,
            scales: { x: { title: { display: true, text: 'Participation' }, min: 0, max: 100 }, y: { title: { display: true, text: 'Quiz Score' }, min: 0, max: 100 } }
        }
    });

    // 3. Sentiment Doughnut
    const pos = students.filter(s => s.sentiment === 'positive').length;
    const neu = students.filter(s => s.sentiment === 'neutral').length;
    const neg = students.filter(s => s.sentiment === 'negative').length;
    
    const ctxSent = document.getElementById('sentimentChart').getContext('2d');
    if(charts.sent) charts.sent.destroy();
    charts.sent = new Chart(ctxSent, {
        type: 'doughnut',
        data: {
            labels: ['Positive', 'Neutral', 'Negative'],
            datasets: [{ data: [pos, neu, neg], backgroundColor: ['#3b82f6', '#9ca3af', '#ef4444'], borderWidth: 0 }]
        },
        options: { maintainAspectRatio: false }
    });

    // 4. Bar Chart Averages
    const avgPart = students.reduce((acc, s) => acc + s.participation, 0) / students.length;
    const avgQuiz = students.reduce((acc, s) => acc + s.quiz, 0) / students.length;
    
    const ctxBar = document.getElementById('barChart').getContext('2d');
    if(charts.bar) charts.bar.destroy();
    charts.bar = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Participation Avg', 'Quiz Avg'],
            datasets: [{ label: 'Score', data: [avgPart, avgQuiz], backgroundColor: '#8b5cf6', borderRadius: 4 }]
        },
        options: { maintainAspectRatio: false, scales: { y: { min: 0, max: 100 } } }
    });
}

// Navigation & Events
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-links li');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            
            const viewId = item.getAttribute('data-view');
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(`view-${viewId}`).classList.add('active');
            
            const titles = {
                'dashboard': 'Class Overview',
                'roster': 'Student Roster',
                'alerts': 'At-Risk Alerts',
                'add-student': 'Add New Student'
            };
            document.getElementById('page-title').textContent = titles[viewId];
        });
    });
}

function bindEvents() {
    // Search logic
    document.getElementById('search-input').addEventListener('input', (e) => {
        const text = e.target.value.toLowerCase();
        const filter = document.getElementById('filter-select').value;
        filterTable(text, filter);
    });

    // Filter Logic
    document.getElementById('filter-select').addEventListener('change', (e) => {
        const text = document.getElementById('search-input').value.toLowerCase();
        const filter = e.target.value;
        filterTable(text, filter);
    });

    // Submitting New Student
    document.getElementById('add-student-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newStudent = {
            id: Date.now(),
            name: document.getElementById('form-name').value,
            participation: parseInt(document.getElementById('form-participation').value),
            quiz: parseInt(document.getElementById('form-quiz').value),
            sentiment: document.getElementById('form-sentiment').value,
            trend: document.getElementById('form-trend').value
        };

        students.push(newStudent);
        processData();
        renderAll();

        e.target.reset();
        alert("Student added successfully!");
        document.querySelector('[data-view="roster"]').click();
    });

    // CSV Export
    document.getElementById('export-csv').addEventListener('click', () => {
        const headers = ["ID", "Name", "Participation", "Quiz", "Sentiment", "Trend", "Engagement Score", "Status"];
        const rows = students.map(s => [s.id, `"${s.name}"`, s.participation, s.quiz, s.sentiment, s.trend, s.score, s.status]);
        
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "edupulse_class_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

function filterTable(searchText, statusFilter) {
    let filtered = students.filter(s => s.name.toLowerCase().includes(searchText));
    if (statusFilter !== 'all') {
        filtered = filtered.filter(s => s.status === statusFilter);
    }
    renderTable(filtered);
}

// Boot up
document.addEventListener('DOMContentLoaded', init);
