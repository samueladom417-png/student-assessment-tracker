// ============================================
// EMAIL LOGIN SYSTEM
// ============================================

// Teacher session management
let currentTeacher = JSON.parse(localStorage.getItem('current_teacher')) || null;
let teacherAssessments = {};

// DOM Elements for login
const loginOverlay = document.getElementById('login-overlay');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');

// Check login status on page load
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

function checkLoginStatus() {
    if (currentTeacher) {
        // Teacher is logged in
        loginOverlay.style.display = 'none';
        mainApp.style.display = 'block';
        
        // Load teacher's data
        loadTeacherData();
        initializeApp();
    } else {
        // Show login screen
        loginOverlay.style.display = 'flex';
        mainApp.style.display = 'none';
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('teacher-email').value.trim();
    const password = document.getElementById('teacher-password').value.trim();
    const name = document.getElementById('teacher-name').value.trim();
    const school = document.getElementById('teacher-school').value.trim();
    
    // Validation
    if (!email || !password || !name || !school) {
        showNotification('Please fill all fields', 'warning');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'warning');
        return;
    }
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'warning');
        return;
    }
    
    // Save teacher info
    currentTeacher = {
        email: email,
        name: name,
        school: school,
        loginDate: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('current_teacher', JSON.stringify(currentTeacher));
    
    // Create teacher's data storage if not exists
    if (!localStorage.getItem(`teacher_data_${email}`)) {
        // Initialize empty data for new teacher
        const initialData = {
            assessments: [],
            settings: {
                gradeScale: GRADE_SCALE,
                defaultMaxScore: 100
            }
        };
        localStorage.setItem(`teacher_data_${email}`, JSON.stringify(initialData));
    }
    
    // Hide login, show app
    checkLoginStatus();
    
    // Show welcome message
    showNotification(`Welcome, ${name}! Data loaded successfully.`, 'success');
    
    // Update navbar with teacher info
    updateNavbarWithTeacherInfo();
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function loadTeacherData() {
    if (!currentTeacher) return;
    
    const teacherKey = `teacher_data_${currentTeacher.email}`;
    const savedData = localStorage.getItem(teacherKey);
    
    if (savedData) {
        const data = JSON.parse(savedData);
        assessments = data.assessments || [];
        teacherAssessments = data;
    }
}

function saveTeacherData() {
    if (!currentTeacher) return;
    
    const teacherKey = `teacher_data_${currentTeacher.email}`;
    const data = {
        ...teacherAssessments,
        assessments: assessments,
        lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(teacherKey, JSON.stringify(data));
}

function updateNavbarWithTeacherInfo() {
    if (!currentTeacher) return;
    
    // Add teacher info to navbar
    const navbar = document.querySelector('.nav-stats');
    if (navbar) {
        const teacherBadge = document.createElement('div');
        teacherBadge.className = 'teacher-badge';
        teacherBadge.innerHTML = `
            <i class="fas fa-user-circle"></i>
            <span>${currentTeacher.name.split(' ')[0]}</span>
        `;
        navbar.insertBefore(teacherBadge, navbar.firstChild);
        
        // Add logout button
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn-logout';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.onclick = handleLogout;
        navbar.appendChild(logoutBtn);
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout? Your data is saved.')) {
        // Save current data before logout
        saveTeacherData();
        
        // Clear current teacher
        currentTeacher = null;
        localStorage.removeItem('current_teacher');
        
        // Show login screen
        checkLoginStatus();
        
        showNotification('Logged out successfully', 'info');
    }
}

// ===== UPDATE YOUR EXISTING FUNCTIONS =====

// Replace ALL occurrences of:
// localStorage.setItem('teacher_assessments', ...)
// with:
// saveTeacherData()

// Replace ALL occurrences of:
// localStorage.getItem('teacher_assessments')
// with loading from teacher's data

// Replace the saveToLocalStorage function with:
function saveToLocalStorage() {
    if (currentTeacher) {
        saveTeacherData();
    } else {
        // Fallback to global storage if no login
        localStorage.setItem('teacher_assessments', JSON.stringify(assessments));
    }
}

// Replace the loadAssessments function with:
function loadAssessments() {
    if (currentTeacher) {
        loadTeacherData();
    } else {
        // Fallback to global storage if no login
        const saved = localStorage.getItem('teacher_assessments');
        if (saved) {
            assessments = JSON.parse(saved);
        }
    }
}

// ============================================
// TEACHER ASSESSMENT TRACKER - PROFESSIONAL VERSION
// ============================================

// ===== GLOBAL VARIABLES =====
let assessments = JSON.parse(localStorage.getItem('teacher_assessments')) || [];
let currentEditingId = null;

// ===== GHANA GRADE SCALE =====
const GRADE_SCALE = [
    // ===== GHANA GRADE SCALE (Updated) =====
 
    { min: 90, max: 100, grade: '1', label: 'Excellent', color: '#2E7D32', bg: '#4CAF50' },
    { min: 80, max: 89, grade: '2', label: 'Very Good', color: '#388E3C', bg: '#66BB6A' },
    { min: 70, max: 79, grade: '3', label: 'Good', color: '#43A047', bg: '#81C784' },
    { min: 60, max: 69, grade: '4', label: 'Credit', color: '#7CB342', bg: '#9CCC65' },
    { min: 55, max: 59, grade: '5', label: 'Credit', color: '#C0CA33', bg: '#D4E157' },
    { min: 50, max: 54, grade: '6', label: 'Credit', color: '#FBC02D', bg: '#FFEE58' },
    { min: 40, max: 49, grade: '7', label: 'Pass', color: '#FFA726', bg: '#FFB74D' },
    { min: 35, max: 39, grade: '8', label: 'Pass', color: '#FF7043', bg: '#FF8A65' },
    { min: 0, max: 34, grade: '9', label: 'Fail', color: '#D32F2F', bg: '#EF5350' }
];

// ===== DOM ELEMENTS =====
const form = document.getElementById('assessment-form');
const tableBody = document.getElementById('table-body');
const emptyState = document.getElementById('empty-state');
const totalAssessmentsCount = document.getElementById('total-assessments-count');
const averageGrade = document.getElementById('average-grade');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    loadAssessments();
    updateTable();
    updateDashboardStats();
    setupEventListeners();
    setupRealTimePreview();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Clear form
    document.getElementById('clear-form').addEventListener('click', clearForm);
    
    // Quick fill demo
    document.getElementById('quick-fill').addEventListener('click', quickFillDemo);
    
    // Refresh table
    document.getElementById('refresh-table').addEventListener('click', () => {
        updateTable();
        showNotification('Table refreshed', 'success');
    });
    
    // Generate report
    document.getElementById('generate-report').addEventListener('click', generateReport);
    
    // Print report
    document.getElementById('print-report').addEventListener('click', printReport);
}

// ===== REAL-TIME PREVIEW =====
function updatePreview() {
    const score = parseFloat(document.getElementById('score').value);
    const maxScore = parseFloat(document.getElementById('max-score').value);
    
    if (!isNaN(score) && !isNaN(maxScore) && maxScore > 0) {
        const percentage = Math.round((score / maxScore) * 100);
        const grade = calculateGrade(percentage);
        const gradeInfo = getGradeInfo(grade);
        
        document.getElementById('preview-percentage').textContent = `${percentage}%`;
        document.getElementById('preview-grade').textContent = `Grade ${grade}`;
        document.getElementById('preview-grade').style.background = gradeInfo.bg;
        document.getElementById('preview-grade').style.color = percentage >= 50 ? 'white' : '#212529';
        document.getElementById('preview-grade').title = `${gradeInfo.label} (${gradeInfo.range})`;
    }
}

function updatePreview() {
    const score = parseFloat(document.getElementById('score').value);
    const maxScore = parseFloat(document.getElementById('max-score').value);
    
    if (!isNaN(score) && !isNaN(maxScore) && maxScore > 0) {
        const percentage = Math.round((score / maxScore) * 100);
        const grade = calculateGrade(percentage);
        const gradeColor = getGradeColor(grade);
        
        document.getElementById('preview-percentage').textContent = `${percentage}%`;
        document.getElementById('preview-grade').textContent = grade;
        document.getElementById('preview-grade').style.background = gradeColor;
    }
}

// ===== FORM HANDLING =====
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const studentName = document.getElementById('student-name').value.trim();
    const subject = document.getElementById('subject').value;
    const score = parseFloat(document.getElementById('score').value);
    const maxScore = parseFloat(document.getElementById('max-score').value);
    const assessmentType = document.getElementById('assessment-type').value;
    const comments = document.getElementById('comments').value.trim();
    
    // Validation
    if (!validateForm(studentName, subject, score, maxScore)) {
        return;
    }
    
    // Calculate grade
    const percentage = Math.round((score / maxScore) * 100);
    const grade = calculateGrade(percentage);
    
    // Create assessment object
    const assessment = {
        id: currentEditingId || Date.now(),
        studentName,
        subject,
        score,
        maxScore,
        percentage,
        grade,
        assessmentType,
        comments: comments || 'No comments',
        date: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    // Update or add
    if (currentEditingId) {
        updateAssessment(assessment);
    } else {
        addAssessment(assessment);
    }
    
    // Reset form
    clearForm();
    updatePreview();
    
    // Show notification
    const message = currentEditingId ? 
        'Assessment updated successfully!' : 
        'Assessment saved successfully!';
    showNotification(message, 'success');
    
    // Update UI
    updateTable();
    updateDashboardStats();
    saveToLocalStorage();
}

function validateForm(studentName, subject, score, maxScore) {
    if (!studentName) {
        showNotification('Please enter student name', 'warning');
        document.getElementById('student-name').focus();
        return false;
    }
    
    if (!subject) {
        showNotification('Please select a subject', 'warning');
        document.getElementById('subject').focus();
        return false;
    }
    
    if (isNaN(score) || score < 0) {
        showNotification('Please enter a valid score', 'warning');
        document.getElementById('score').focus();
        return false;
    }
    
    if (isNaN(maxScore) || maxScore <= 0) {
        showNotification('Please enter a valid maximum score', 'warning');
        document.getElementById('max-score').focus();
        return false;
    }
    
    if (score > maxScore) {
        showNotification('Score cannot be greater than maximum score', 'warning');
        document.getElementById('score').focus();
        return false;
    }
    
    return true;
}

// ===== ASSESSMENT CRUD OPERATIONS =====
function addAssessment(assessment) {
    assessments.push(assessment);
}

function updateAssessment(updatedAssessment) {
    const index = assessments.findIndex(a => a.id === updatedAssessment.id);
    if (index !== -1) {
        assessments[index] = updatedAssessment;
    }
    currentEditingId = null;
}

function deleteAssessment(id) {
    if (confirm('Are you sure you want to delete this assessment?')) {
        assessments = assessments.filter(a => a.id !== id);
        updateTable();
        updateDashboardStats();
        saveToLocalStorage();
        showNotification('Assessment deleted', 'success');
    }
}

function editAssessment(id) {
    const assessment = assessments.find(a => a.id === id);
    if (!assessment) return;
    
    // Fill form
    document.getElementById('student-name').value = assessment.studentName;
    document.getElementById('subject').value = assessment.subject;
    document.getElementById('score').value = assessment.score;
    document.getElementById('max-score').value = assessment.maxScore;
    document.getElementById('assessment-type').value = assessment.assessmentType;
    document.getElementById('comments').value = assessment.comments;
    
    // Update button text
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Update Assessment';
    submitBtn.style.background = '#ffc107';
    
    // Set editing ID
    currentEditingId = id;
    
    // Scroll to form
    document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Editing assessment. Update values and save.', 'info');
}

// ===== GRADE CALCULATION =====
function calculateGrade(percentage) {
    for (const scale of GRADE_SCALE) {
        if (percentage >= scale.min) {
            return scale.grade;
        }
    }
    return 'F';
}

function getGradeColor(grade) {
    for (const scale of GRADE_SCALE) {
        if (scale.grade === grade) {
            return scale.bg;
        }
    }
    return '#f8f9fa';
}

// ===== TABLE MANAGEMENT =====
function updateTable() {
    const recentAssessments = assessments.slice(-10).reverse(); // Last 10, newest first
    
    if (recentAssessments.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    tableBody.innerHTML = '';
    
    recentAssessments.forEach(assessment => {
        const row = createTableRow(assessment);
        tableBody.appendChild(row);
    });
}

function createTableRow(assessment) {
    const row = document.createElement('tr');
    const date = new Date(assessment.date).toLocaleDateString('en-GH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
    
    // Grade styling
    const gradeClass = `grade-${assessment.grade}`;
    const gradeColor = getGradeColor(assessment.grade);
    
    row.innerHTML = `
        <td>
            <div class="student-info">
                <strong>${assessment.studentName}</strong>
                ${assessment.comments !== 'No comments' ? 
                    `<div class="comment-preview" title="${assessment.comments}">
                        <i class="fas fa-comment"></i>
                    </div>` : ''
                }
            </div>
        </td>
        <td>
            <div class="subject-badge">
                <i class="fas fa-book"></i>
                ${assessment.subject}
            </div>
        </td>
        <td>
            <div class="score-display">
                <div class="score-value">${assessment.score}/${assessment.maxScore}</div>
                <div class="score-percentage">${assessment.percentage}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${assessment.percentage}%"></div>
                </div>
            </div>
        </td>
        <td>
            <div class="grade-badge ${gradeClass}" style="background: ${gradeColor}">
                ${assessment.grade}
            </div>
        </td>
        <td>
            <div class="date-display">
                ${date}
                <div class="time">${new Date(assessment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
        </td>
        <td>
            <div class="action-buttons">
                <button class="btn-action btn-edit" onclick="editAssessment(${assessment.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-action btn-delete" onclick="deleteAssessment(${assessment.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn-action btn-view" onclick="viewAssessment(${assessment.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

function viewAssessment(id) {
    const assessment = assessments.find(a => a.id === id);
    if (!assessment) return;
    
    const date = new Date(assessment.date).toLocaleString('en-GH');
    
    const details = `
        <div class="assessment-details">
            <h3>Assessment Details</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <strong>Student:</strong> ${assessment.studentName}
                </div>
                <div class="detail-item">
                    <strong>Subject:</strong> ${assessment.subject}
                </div>
                <div class="detail-item">
                    <strong>Type:</strong> ${assessment.assessmentType}
                </div>
                <div class="detail-item">
                    <strong>Score:</strong> ${assessment.score}/${assessment.maxScore} (${assessment.percentage}%)
                </div>
                <div class="detail-item">
                    <strong>Grade:</strong> <span class="grade-${assessment.grade}">${assessment.grade}</span>
                </div>
                <div class="detail-item">
                    <strong>Date:</strong> ${date}
                </div>
                <div class="detail-item full-width">
                    <strong>Comments:</strong> ${assessment.comments}
                </div>
            </div>
        </div>
    `;
    
    alertModal('Assessment Details', details);
}

// ===== DASHBOARD STATISTICS =====
function updateDashboardStats() {
    // Update nav stats
    totalAssessmentsCount.textContent = assessments.length;
    
    // Update quick stats
    document.getElementById('stat-total').textContent = assessments.length;
    
    if (assessments.length > 0) {
        const totalPercentage = assessments.reduce((sum, a) => sum + a.percentage, 0);
        const average = Math.round(totalPercentage / assessments.length);
        
        document.getElementById('stat-average').textContent = `${average}%`;
        averageGrade.textContent = calculateGrade(average);
        
        // Find top grade
        const gradeCount = {};
        assessments.forEach(a => {
            gradeCount[a.grade] = (gradeCount[a.grade] || 0) + 1;
        });
        
        let topGrade = 'A';
        let maxCount = 0;
        Object.keys(gradeCount).forEach(grade => {
            if (gradeCount[grade] > maxCount) {
                maxCount = gradeCount[grade];
                topGrade = grade;
            }
        });
        
        document.getElementById('stat-top-grade').textContent = topGrade;
        document.getElementById('stat-top-grade').className = `stat-value grade-${topGrade}`;
    } else {
        document.getElementById('stat-average').textContent = '0%';
        document.getElementById('stat-top-grade').textContent = 'N/A';
        averageGrade.textContent = 'N/A';
    }
}

// ===== REPORT GENERATION =====
function generateReport() {
    if (assessments.length === 0) {
        showNotification('No assessments to generate report', 'warning');
        return;
    }
    
    // Sort by newest first
    const sorted = [...assessments].sort((a, b) => b.timestamp - a.timestamp);
    
    let reportHTML = `
        <div class="report-header">
            <h3><i class="fas fa-file-alt"></i> Detailed Assessment Report</h3>
            <p>Generated on ${new Date().toLocaleString('en-GH')}</p>
            <p>Total Assessments: ${assessments.length}</p>
        </div>
        <div class="report-list">
    `;
    
    sorted.forEach((assessment, index) => {
        const date = new Date(assessment.date).toLocaleDateString('en-GH', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        reportHTML += `
            <div class="report-item">
                <div class="report-item-header">
                    <span class="report-number">${index + 1}.</span>
                    <span class="report-student">${assessment.studentName}</span>
                    <span class="report-grade grade-${assessment.grade}">${assessment.grade}</span>
                </div>
                <div class="report-details">
                    <div><strong>Subject:</strong> ${assessment.subject}</div>
                    <div><strong>Type:</strong> ${assessment.assessmentType}</div>
                    <div><strong>Score:</strong> ${assessment.score}/${assessment.maxScore} (${assessment.percentage}%)</div>
                    <div><strong>Date:</strong> ${date}</div>
                    ${assessment.comments !== 'No comments' ? 
                        `<div><strong>Comments:</strong> ${assessment.comments}</div>` : ''
                    }
                </div>
            </div>
        `;
    });
    
    reportHTML += '</div>';
    
    const reportOutput = document.getElementById('report-output');
    reportOutput.innerHTML = reportHTML;
    reportOutput.style.display = 'block';
    
    // Scroll to report
    reportOutput.scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Report generated successfully', 'success');
}

function printReport() {
    const reportOutput = document.getElementById('report-output');
    
    if (reportOutput.style.display === 'none' || reportOutput.innerHTML === '') {
        showNotification('Please generate a report first', 'warning');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Teacher Assessment Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #2c5aa0; }
                    .report-item { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; }
                    .grade-A { color: #28a745; font-weight: bold; }
                    .grade-B { color: #17a2b8; font-weight: bold; }
                    .grade-C { color: #ffc107; font-weight: bold; }
                    .grade-D { color: #fd7e14; font-weight: bold; }
                    .grade-F { color: #dc3545; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>Teacher Assessment Report</h1>
                <p>Generated on ${new Date().toLocaleString('en-GH')}</p>
                ${reportOutput.innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// ===== EXPORT FUNCTIONALITY =====
function exportToCSV() {
    if (assessments.length === 0) {
        showNotification('No assessments to export', 'warning');
        return;
    }

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Headers
    csvContent += "Student Name,Subject,Score,Max Score,Percentage,Grade,Assessment Type,Date,Comments\n";
    
    // Add each assessment
    assessments.forEach(assessment => {
        const date = new Date(assessment.date).toLocaleDateString('en-GH');
        const row = [
            `"${assessment.studentName}"`,
            `"${assessment.subject}"`,
            assessment.score,
            assessment.maxScore,
            assessment.percentage + '%',
            assessment.grade,
            `"${assessment.assessmentType}"`,
            `"${date}"`,
            `"${assessment.comments.replace(/"/g, '""')}"`
        ].join(',');
        
        csvContent += row + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `teacher_assessments_${new Date().toISOString().split('T')[0]}.csv`);
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Data exported successfully as CSV!', 'success');
}

// ===== UTILITY FUNCTIONS =====
function clearForm() {
    form.reset();
    document.getElementById('max-score').value = 100;
    document.getElementById('assessment-type').value = 'Class Exercise';
    
    // Reset submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Assessment';
    submitBtn.style.background = '';
    
    currentEditingId = null;
    updatePreview();
}

function quickFillDemo() {
    const names = ['Kwame Asare', 'Ama Boateng', 'Kofi Mensah', 'Esi Abebrese'];
    const subjects = ['Mathematics', 'English Language', 'Integrated Science', 'Social Studies'];
    
    document.getElementById('student-name').value = names[Math.floor(Math.random() * names.length)];
    document.getElementById('subject').value = subjects[Math.floor(Math.random() * subjects.length)];
    document.getElementById('score').value = Math.floor(Math.random() * 40) + 60;
    document.getElementById('max-score').value = 100;
    document.getElementById('assessment-type').value = ['Class Exercise', 'Class Test', 'Homework'][Math.floor(Math.random() * 3)];
    document.getElementById('comments').value = 'Good effort shown.';
    
    updatePreview();
    showNotification('Demo data filled. Click Save to add assessment.', 'info');
}

function loadAssessments() {
    const saved = localStorage.getItem('teacher_assessments');
    if (saved) {
        assessments = JSON.parse(saved);
    }
}

function saveToLocalStorage() {
    localStorage.setItem('teacher_assessments', JSON.stringify(assessments));
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const icons = {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle',
        error: 'times-circle'
    };
    
    notification.innerHTML = `
        <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function alertModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">
                    Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ===== PWA SUPPORT =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

// Offline support
window.addEventListener('online', () => {
    showNotification('You are back online!', 'success');
});

window.addEventListener('offline', () => {
    showNotification('You are offline. Data saved locally.', 'warning');
});// ============================================
// ABOUT SECTION FUNCTIONALITY
// ============================================

// Update stats in About section
function updateAboutStats() {
    const totalTeachers = Object.keys(localStorage)
        .filter(key => key.startsWith('teacher_data_'))
        .length;
    
    document.getElementById('total-teachers').textContent = totalTeachers;
    document.getElementById('total-assessments-display').textContent = assessments.length;
}

// Feature Request Modal
function showFeatureRequest() {
    const modal = document.getElementById('featureRequestModal');
    modal.style.display = 'flex';
}

function closeFeatureRequest() {
    const modal = document.getElementById('featureRequestModal');
    modal.style.display = 'none';
    document.getElementById('featureRequestForm').reset();
}

// Handle Feature Request Form
document.addEventListener('DOMContentLoaded', function() {
    const featureForm = document.getElementById('featureRequestForm');
    if (featureForm) {
        featureForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const featureName = document.getElementById('featureName').value;
            const featureDescription = document.getElementById('featureDescription').value;
            const userEmail = document.getElementById('userEmail').value;
            
            // For now, just show success message
            // In future, you could send this to your email or save it
            showNotification('Thank you for your feature request! We\'ll consider it for future updates.', 'success');
            
            closeFeatureRequest();
            
            // Reset form
            this.reset();
        });
    }
    
    // Update stats when page loads
    updateAboutStats();
    
    // Also update stats when assessments change
    // Add this to your existing save functions:
    // updateAboutStats();
});

// Add to your existing form submission handler
// After saving assessment, call:
// updateAboutStats();

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('featureRequestModal');
    if (event.target === modal) {
        closeFeatureRequest();
    }
});

// Add keyboard support for modal
document.addEventListener('keydown', function(event) {
    const modal = document.getElementById('featureRequestModal');
    if (event.key === 'Escape' && modal.style.display === 'flex') {
        closeFeatureRequest();
    }
});// ============================================
// LOGOUT FUNCTIONALITY
// ============================================

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout? Your data is saved locally.')) {
        // Save current data before logout
        saveTeacherData();
        
        // Clear current teacher session
        currentTeacher = null;
        localStorage.removeItem('current_teacher');
        
        // Clear assessments array (or keep for demo)
        // assessments = [];
        
        // Reset form
        clearForm();
        
        // Show login screen
        showLoginScreen();
        
        // Show notification
        showNotification('Logged out successfully!', 'success');
        
        console.log('User logged out');
    }
}

// Show login screen function
function showLoginScreen() {
    // Hide main app
    const mainApp = document.getElementById('main-app');
    const loginOverlay = document.getElementById('login-overlay');
    
    if (mainApp) mainApp.style.display = 'none';
    if (loginOverlay) loginOverlay.style.display = 'flex';
    
    // Clear login form
    if (document.getElementById('login-form')) {
        document.getElementById('login-form').reset();
    }
}

// Check login status and show/hide logout button
 
    function updateLoginStatus() {
    const logoutBtn = document.getElementById('logout-btn');
    const teacherInfo = document.getElementById('teacher-info');
    const teacherName = document.getElementById('teacher-name');
    const teacherSchool = document.getElementById('teacher-school');
    
    if (currentTeacher) {
        // Show logout button and teacher info
        if (logoutBtn) logoutBtn.style.display = 'flex';
        if (teacherInfo) teacherInfo.style.display = 'flex';
        
        // Update teacher info
        if (teacherName) teacherName.textContent = currentTeacher.name;
        if (teacherSchool) teacherSchool.textContent = currentTeacher.school;
    } else {
        // Hide logout and teacher info
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (teacherInfo) teacherInfo.style.display = 'none';
    }
}
// Add event listener for logout button
document.addEventListener('DOMContentLoaded', function() {
    // Add logout button event listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Update login status on page load
    updateLoginStatus();
});

// Also update the login success function
function handleLoginSuccess(teacherData) {
    currentTeacher = teacherData;
    
    // Hide login, show app
    const mainApp = document.getElementById('main-app');
    const loginOverlay = document.getElementById('login-overlay');
    
    if (mainApp) mainApp.style.display = 'block';
    if (loginOverlay) loginOverlay.style.display = 'none';
    
    // Load teacher's data
    loadTeacherData();
    
    // Update UI
    updateTable();
    updateDashboardStats();
    updateAboutStats();
    updateLoginStatus();
    
    // Show welcome message
    showNotification(`Welcome back, ${teacherData.name}!`, 'success');
}// Session timeout (30 minutes)
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logout, 30 * 60 * 1000); // 30 minutes
}

// Reset timer on user activity
['click', 'mousemove', 'keypress', 'scroll'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer);
});

// Start timer when user logs in
function handleLoginSuccess(teacherData) {
    // ... existing code ...
    
    // Start inactivity timer
    resetInactivityTimer();
}

// Clear timer on logout
function logout() {
    clearTimeout(inactivityTimer);
    // ... rest of logout code ...
}