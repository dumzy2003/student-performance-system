document.addEventListener("DOMContentLoaded", function () {

    // Initialize Lucide icons
    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }

    // Mobile sidebar
    const menuButton = document.getElementById("menuButton");
    const sidebar = document.getElementById("sidebar");

    if (menuButton && sidebar) {
        menuButton.addEventListener("click", function (event) {
            event.stopPropagation();
            sidebar.classList.toggle("open");
        });

        document.addEventListener("click", function (event) {
            const clickedInsideSidebar =
                sidebar.contains(event.target);
            const clickedMenuButton =
                menuButton.contains(event.target);

            if (!clickedInsideSidebar && !clickedMenuButton) {
                sidebar.classList.remove("open");
            }
        });
    }

    const toggleButtons = document.querySelectorAll(".toggle-password");

    toggleButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const targetId = button.getAttribute("data-target");
            const input = document.getElementById(targetId);

            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                button.innerHTML = '<i data-lucide="eye-off"></i>';
            } else {
                input.type = "password";
                button.innerHTML = '<i data-lucide="eye"></i>';
            }

            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }
        });
    });

    const updatePasswordBtn = document.getElementById("updatePasswordBtn");

    if (updatePasswordBtn) {
        updatePasswordBtn.addEventListener("click", async function () {
            const currentPasswordInput =
                document.getElementById("currentPassword");
            const newPasswordInput =
                document.getElementById("newPassword");
            const confirmPasswordInput =
                document.getElementById("confirmPassword");
            const passwordMessage =
                document.getElementById("passwordMessage");

            if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput || !passwordMessage) {
                return;
            }

            const currentPassword =
                currentPasswordInput.value.trim();
            const newPassword =
                newPasswordInput.value.trim();
            const confirmPassword =
                confirmPasswordInput.value.trim();

            passwordMessage.textContent = "";
            passwordMessage.className = "form-message";

            if (!currentPassword || !newPassword || !confirmPassword) {
                passwordMessage.textContent =
                    "Please fill in all password fields.";
                passwordMessage.className = "form-message error";
                return;
            }

            if (newPassword !== confirmPassword) {
                passwordMessage.textContent =
                    "New passwords do not match.";
                passwordMessage.className = "form-message error";
                return;
            }

            if (newPassword.length < 8) {
                passwordMessage.textContent =
                    "New password must be at least 8 characters long.";
                passwordMessage.className = "form-message error";
                return;
            }

            if (currentPassword === newPassword) {
                passwordMessage.textContent =
                    "New password must be different from the current one.";
                passwordMessage.className = "form-message error";
                return;
            }

            const token =
                localStorage.getItem("authToken");

            if (!token) {
                window.location.href = "index.html";
                return;
            }

            updatePasswordBtn.disabled = true;
            updatePasswordBtn.textContent = "Updating...";

            try {
                const response = await fetch(
                    "http://localhost:5000/api/auth/change-password",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            currentPassword,
                            newPassword
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error || "Password update failed"
                    );
                }

                passwordMessage.textContent =
                    data.message || "Password updated successfully.";
                passwordMessage.className = "form-message success";
                showSettingsToast(data.message || "Password updated successfully.", "success");
                currentPasswordInput.value = "";
                newPasswordInput.value = "";
                confirmPasswordInput.value = "";

                setTimeout(function () {
                    window.location.href = "dashboard.html";
                }, 1500);

            } catch (error) {
                passwordMessage.textContent =
                    error.message || "Unable to update password.";
                passwordMessage.className = "form-message error";
                showSettingsToast(error.message || "Unable to update password.", "error");
            } finally {
                updatePasswordBtn.disabled = false;
                updatePasswordBtn.textContent = "Update password";
            }
        });
    }

    const saveSettingsBtn = document.getElementById("saveSettingsBtn");

    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener("click", async function () {
            const emailInput = document.getElementById("emailInput");
            const settingsMessage = document.getElementById("settingsMessage");

            if (!emailInput || !settingsMessage) {
                return;
            }

            const email = emailInput.value.trim();
            const token = localStorage.getItem("authToken");

            if (!token) {
                window.location.href = "index.html";
                return;
            }

            if (!email) {
                showSettingsToast("Please enter an email address.", "error");
                settingsMessage.textContent = "Please enter an email address.";
                settingsMessage.className = "form-message error";
                return;
            }

            try {
                const response = await fetch(
                    "http://localhost:5000/api/student/update-email",
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ email })
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || "Unable to update email");
                }

                settingsMessage.textContent = data.message || "Email updated successfully.";
                settingsMessage.className = "form-message success";
                showSettingsToast(data.message || "Email updated successfully.", "success");

            } catch (error) {
                settingsMessage.textContent = error.message || "Unable to update email.";
                settingsMessage.className = "form-message error";
                showSettingsToast(error.message || "Unable to update email.", "error");
            }
        });
    }

    // Load dashboard data
    loadDashboardData();
    loadStudentProfile();
    loadStudentCourses();
    loadStudentResults();
    loadStudentAttendanceRecords();

});


async function loadDashboardData() {
    const token = localStorage.getItem("authToken");

    try {

        const token =
            localStorage.getItem("authToken");


        if (!token) {

            window.location.href =
                "index.html";

            return;
        
        
        }

        


        // =========================
        // CGPA
        // =========================

        const cgpaResponse = await fetch(
            "http://localhost:5000/api/student/cgpa",
            {
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        if (cgpaResponse.status === 401 ||
            cgpaResponse.status === 403) {

            logoutStudent();
            return;
        }

        const cgpaData =
            await cgpaResponse.json();

        const cgpaElement =
            document.getElementById(
                "studentCgpa"
            );

        if (cgpaElement) {

            cgpaElement.textContent =
                cgpaData.cgpa ?? "--";

        }


        // =========================
        // AVERAGE SCORE
        // =========================

        const scoreResponse = await fetch(
            "http://localhost:5000/api/student/average-score",
            {
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const scoreData =
            await scoreResponse.json();

        const scoreElement =
            document.getElementById(
                "averageScore"
            );

        if (scoreElement) {

            scoreElement.textContent =
                scoreData.average_score ?? "--";

        }


        // =========================
        // ATTENDANCE
        // =========================

        const attendanceResponse =
            await fetch(
                "http://localhost:5000/api/student/attendance",
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );

        const attendanceData =
            await attendanceResponse.json();

        const attendanceElement =
            document.getElementById(
                "averageAttendance"
            );

        if (attendanceElement) {

            attendanceElement.textContent =
                attendanceData.average_attendance !== null
                    ? attendanceData.average_attendance + "%"
                    : "--";

        }

        const attendancePercent =
            Number(attendanceData.average_attendance);

        const dashboardAttendancePercent =
            document.getElementById("dashboardAttendancePercent");
        const dashboardAttendanceBar =
            document.getElementById("dashboardAttendanceBar");
        const dashboardAttendancePresent =
            document.getElementById("dashboardAttendancePresent");
        const dashboardAttendanceNote =
            document.getElementById("dashboardAttendanceNote");
        const attendancePanel =
            document.getElementById("attendancePanel");

        if (dashboardAttendancePercent) {
            dashboardAttendancePercent.textContent =
                Number.isFinite(attendancePercent)
                    ? `${attendancePercent.toFixed(2)}%`
                    : "--";
        }

        if (dashboardAttendanceBar) {
            const width = Number.isFinite(attendancePercent)
                ? Math.min(attendancePercent, 100)
                : 0;

            dashboardAttendanceBar.style.width = `${width}%`;
        }

        if (dashboardAttendancePresent) {
            dashboardAttendancePresent.textContent =
                Number.isFinite(attendancePercent)
                    ? `Present: ${attendancePercent.toFixed(0)}%`
                    : "Present: --";
        }

        if (attendancePanel) {
            attendancePanel.classList.remove("warning", "danger");

            if (Number.isFinite(attendancePercent)) {
                if (attendancePercent < 75) {
                    attendancePanel.classList.add("danger");
                } else {
                    attendancePanel.classList.add("warning");
                }
            }
        }

        if (dashboardAttendanceNote) {
            if (Number.isFinite(attendancePercent)) {
                dashboardAttendanceNote.textContent =
                    attendancePercent >= 75
                        ? "Your attendance is currently above the minimum academic requirement."
                        : "Your attendance is below the minimum academic requirement and needs attention.";
            } else {
                dashboardAttendanceNote.textContent =
                    "Your attendance is currently being calculated.";
            }
        }

    } catch (error) {

        console.error(
            "Unable to load dashboard:",
            error
        );

    }

        // =========================
        // COURSE COUNT
        // =========================

        const courseCountResponse =
        await fetch(
            "http://localhost:5000/api/student/course-count",
            {
                headers: {
                    "Authorization":
                    `Bearer ${token}`
                }
            }
        );
        const courseCountData =
        await courseCountResponse.json();
        const courseCountElement =
        document.getElementById("courseCount");
        if (courseCountElement) {
            courseCountElement.textContent =
            courseCountData.course_count ?? "--";
        }

    


}

// ==========================================
// LOAD STUDENT COURSES
// ==========================================

async function loadStudentCourses() {
    

    try {

        const token =
            localStorage.getItem("authToken");

        if (!token) {

            window.location.href =
                "index.html";

            return;
        }

        const response = await fetch(
            "http://localhost:5000/api/student/courses",
            {
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        if (response.status === 401 ||
            response.status === 403) {

            logoutStudent();
            return;
        }

        const courses =
            await response.json();

        const tableBody =
            document.getElementById(
                "coursesTableBody"
            );

        if (!tableBody) return;

        tableBody.innerHTML = "";

        if (courses.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No courses found.
                    </td>
                </tr>
            `;

            return;
        }

        courses.forEach(course => {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${course.course_code}</td>

                <td>${course.course_name}</td>

                <td>${course.credit_unit}</td>

                <td>${course.course_level}</td>

                <td>${course.semester}</td>
            `;

            tableBody.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Unable to load courses:",
            error
        );

    }

}

function setAllAvatarState(imageDataUrl, initials) {
    const finalInitials = initials || "ST";
    const sidebarAvatars =
        document.querySelectorAll(".topbar-avatar, .avatar");

    sidebarAvatars.forEach((avatar) => {
        avatar.textContent = "";
        avatar.innerHTML = "";

        if (imageDataUrl) {
            avatar.innerHTML =
                `<img src="${imageDataUrl}" alt="Profile photo" />`;
        } else {
            avatar.textContent = finalInitials;
        }
    });

    const profileAvatar =
        document.getElementById("profileAvatar");

    if (profileAvatar) {
        profileAvatar.textContent = "";
        profileAvatar.innerHTML = "";

        if (imageDataUrl) {
            profileAvatar.innerHTML =
                `<img src="${imageDataUrl}" alt="Profile photo" />`;
        } else {
            profileAvatar.textContent = finalInitials;
        }
    }
}

// ==========================================
// LOAD STUDENT RESULTS
// ==========================================

async function loadStudentResults() {
    

    try {

        const token =
            localStorage.getItem("authToken");

        if (!token) {

            window.location.href =
                "index.html";

            return;
        }

        const response = await fetch(
            "http://localhost:5000/api/student/results",
            {
                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        if (response.status === 401 ||
            response.status === 403) {

            logoutStudent();
            return;
        }

        const results =
            await response.json();

        const passedCourses =
            results.filter(result => {
                const score = Number(result.score);
                return Number.isFinite(score) && score >= 40;
            }).length;

        const failedCourses =
            results.filter(result => {
                const score = Number(result.score);
                return Number.isFinite(score) && score < 40;
            }).length;

        const courseCountElement =
            document.getElementById("courseCount");

        if (courseCountElement) {
            courseCountElement.textContent =
                passedCourses;
        }

        const courseMetricNote =
            courseCountElement &&
            courseCountElement.closest(".metric-card")
                ? courseCountElement.closest(".metric-card").querySelector("small")
                : null;

        if (courseMetricNote) {
            if (results.length === 0) {
                courseMetricNote.textContent =
                    "No results available yet";
            } else if (failedCourses > 0) {
                courseMetricNote.textContent =
                    `${failedCourses} failed out of ${results.length} courses`;
            } else {
                courseMetricNote.textContent =
                    `All ${results.length} courses passed`;
            }
        }

        const tableBody =
            document.getElementById(
                "resultsTableBody"
            );

        if (!tableBody) {
            updateAcademicStatus(results);
            return;
        }

        tableBody.innerHTML = "";

        if (results.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No results found.
                    </td>
                </tr>
            `;

            updateAcademicStatus(results);
            return;
        }

        results.forEach(result => {

            const row =
                document.createElement("tr");

            row.innerHTML = `
                <td>${result.course_code}</td>

                <td>${result.course_name}</td>

                <td>${result.credit_unit}</td>

                <td>${Number(result.score).toFixed(2)}</td>

                <td>
                    <span class="grade-badge grade-${result.grade}">
                        ${result.grade}
                    </span>
                </td>
            `;

            tableBody.appendChild(row);

        });

        updateAcademicStatus(results);

    } catch (error) {

        console.error(
            "Unable to load results:",
            error
        );

    }

}

function updateAcademicStatus(results) {
    const statusTitle =
        document.getElementById("statusTitle");
    const statusText =
        document.getElementById("statusText");
    const academicStatusBox =
        document.getElementById("academicStatusBox");
    const statusIcon =
        document.getElementById("statusIcon");

    if (!statusTitle || !statusText || !academicStatusBox || !statusIcon) {
        return;
    }

    if (!Array.isArray(results) || results.length === 0) {
        statusTitle.textContent = "No results yet";
        statusText.textContent = "Your results are not available yet. Check back after grading.";
        academicStatusBox.className = "status-box warning";
        statusIcon.innerHTML = '<i data-lucide="info"></i>';
        if (typeof lucide !== "undefined") {
            lucide.createIcons();
        }
        return;
    }

    const failedCourses = results.filter(result => {
        const score = Number(result.score);
        return Number.isFinite(score) && score < 40;
    }).length;

    const borderlineCourses = results.filter(result => {
        const score = Number(result.score);
        return Number.isFinite(score) && score >= 40 && score <= 50;
    }).length;

    if (failedCourses === results.length) {
        statusTitle.textContent = "Academic warning";
        statusText.textContent = "All your current courses are below the passing mark. You need to improve urgently.";
        academicStatusBox.className = "status-box danger";
        statusIcon.innerHTML = '<i data-lucide="alert-triangle"></i>';
    } else if (borderlineCourses === results.length) {
        statusTitle.textContent = "Needs attention";
        statusText.textContent = "All your current courses are within the borderline pass range. A stronger performance is recommended.";
        academicStatusBox.className = "status-box warning";
        statusIcon.innerHTML = '<i data-lucide="triangle-alert"></i>';
    } else if (failedCourses > 0 || borderlineCourses > 0) {
        statusTitle.textContent = "Needs attention";
        statusText.textContent = `${failedCourses + borderlineCourses} of ${results.length} course(s) are at or below the borderline pass range.`;
        academicStatusBox.className = "status-box warning";
        statusIcon.innerHTML = '<i data-lucide="triangle-alert"></i>';
    } else {
        statusTitle.textContent = "Good standing";
        statusText.textContent = "Your current academic performance is within the expected range.";
        academicStatusBox.className = "status-box";
        statusIcon.innerHTML = '<i data-lucide="check"></i>';
    }

    if (typeof lucide !== "undefined") {
        lucide.createIcons();
    }
}

async function loadStudentAttendanceRecords() {

    const attendanceList =
        document.getElementById("attendanceList");

    // Only run this function on attendance.html
    if (!attendanceList) return;

    const token =
        localStorage.getItem("authToken");

    // If the student is not logged in
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/api/student/attendance-records",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load attendance records");
        }

        const attendance =
            await response.json();

        // Clear the existing content
        attendanceList.innerHTML = "";

        // If no attendance records exist
        if (attendance.length === 0) {

            attendanceList.innerHTML = `
                <p>
                    No attendance records found.
                </p>
            `;

            return;
        }

        // Create an attendance row for each course
        attendance.forEach(record => {

            const percentage =
                Number(record.attendance_percentage);

            const row =
                document.createElement("div");

            row.className = "attendance-row";

            row.innerHTML = `
                <div class="attendance-course">

                    <strong>
                        ${record.course_code}
                    </strong>

                    <span>
                        ${record.course_name}
                    </span>

                </div>

                <div class="attendance-progress">

                    <div class="progress">

                        <div
                            class="progress-bar"
                            style="width:${percentage}%"
                        ></div>

                    </div>

                    <strong>
                        ${percentage.toFixed(2)}%
                    </strong>

                </div>
            `;

            attendanceList.appendChild(row);

        });

    } catch (error) {

        console.error(
            "Attendance loading error:",
            error
        );

        attendanceList.innerHTML = `
            <p>
                Unable to load attendance records.
            </p>
        `;
    }
}

async function loadStudentProfile() {

    const token = localStorage.getItem("authToken");

    // If student is not logged in
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    const profileNameElements =
        document.querySelectorAll(
            "#profileName, #profileDetailName, #sidebarProfileName"
        );

    const profileAvatar =
        document.getElementById("profileAvatar");

    const sidebarAvatars =
        document.querySelectorAll(".topbar-avatar, .avatar");

    if (!profileNameElements.length) return;

    try {

        const response = await fetch(
            "http://localhost:5000/api/auth/me",
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        // Token is invalid or expired
        if (response.status === 401 || response.status === 403) {

            localStorage.removeItem("authToken");
            localStorage.removeItem("studentLoggedIn");
            localStorage.removeItem("studentMatricNumber");
            localStorage.removeItem("studentId");

            window.location.href = "index.html";
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to load student profile");
        }

        const student = await response.json();

        const dashboardWelcomeName =
            document.getElementById("welcomeUserName");

        if (dashboardWelcomeName) {
            const firstName =
                student.full_name?.split(" ")[0] ||
                "Student";

            dashboardWelcomeName.textContent =
                firstName;
        }

        if (student.full_name) {
            const initials = student.full_name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map(name => name[0].toUpperCase())
                .join("");

            const finalInitials = initials || "ST";
            const storedProfileImage =
                localStorage.getItem("profileImageDataUrl");

            setAllAvatarState(storedProfileImage, finalInitials);
        }

        // Full name
        profileNameElements.forEach((element) => {
            element.textContent = student.full_name;
        });

        // Matric number
        const profileMatric =
            document.getElementById("profileMatric");

        if (profileMatric) {
            profileMatric.textContent =
                student.matric_number;
        }

        // Department
        const profileDepartmentElements =
            document.querySelectorAll(
                "#profileDepartment, #profileDetailDepartment, #sidebarProfileDepartment"
            );

        if (profileDepartmentElements.length) {
            profileDepartmentElements.forEach((element) => {
                element.textContent = student.department_name;
            });
        }

        const fullNameInput =
            document.getElementById("fullNameInput");

        if (fullNameInput) {
            fullNameInput.value = student.full_name || "";
        }

        const emailInput =
            document.getElementById("emailInput");

        if (emailInput) {
            emailInput.value = student.email || "";
        }

        if (document.getElementById("settingsMessage")) {
            document.getElementById("settingsMessage").textContent = "";
            document.getElementById("settingsMessage").className = "form-message";
        }

        // Level
        const profileLevel =
            document.getElementById("profileLevel");

        if (profileLevel) {
            profileLevel.textContent =
                `${student.level} Level`;
        }

        // Gender
        const profileGender =
            document.getElementById("profileGender");

        if (profileGender) {
            profileGender.textContent =
                student.gender;
        }

        // Date of birth
        const profileDob =
            document.getElementById("profileDob");

        if (profileDob) {
            const rawDate = student.date_of_birth;

            if (!rawDate) {
                profileDob.textContent = "--";
            } else {
                const date = new Date(rawDate);

                profileDob.textContent =
                    Number.isNaN(date.getTime())
                        ? rawDate
                        : date.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        });
            }
        }

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

    }
}
// =========================
// COURSE COUNT
// =========================

// const courseCountResponse =
//     await fetch(
//         "http://localhost:5000/api/student/course-count",
//         {
//             headers: {
//                 "Authorization":
//                     `Bearer ${token}`
//             }
//         }
//     );

// const courseCountData =
//     await courseCountResponse.json();

// const courseCountElement =
//     document.getElementById("courseCount");

// if (courseCountElement) {

//     courseCountElement.textContent =
//         courseCountData.course_count ?? "--";

// }

function showSettingsToast(message, type = "success") {
    const toast = document.getElementById("settingsToast");

    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast show ${type}`;

    clearTimeout(showSettingsToast.timeoutId);
    showSettingsToast.timeoutId = setTimeout(() => {
        toast.className = "toast";
    }, 2800);
}

function logoutStudent() {

    localStorage.removeItem("authToken");
    localStorage.removeItem("studentLoggedIn");
    localStorage.removeItem("studentMatricNumber");
    localStorage.removeItem("studentId");

    window.location.href =
        "index.html";
}