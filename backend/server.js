const express = require("express");

const cors = require("cors");

const db = require("./db");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const crypto = require("crypto");


require("dotenv").config();

const authenticateToken = require("./middleware/authMiddleware");


const app = express();

const PORT = process.env.PORT || 5000;


// Middleware

app.use(cors());

app.use(express.json());

console.log("MAILTRAP HOST:", process.env.MAILTRAP_HOST);
console.log("MAILTRAP PORT:", process.env.MAILTRAP_PORT);
console.log("MAILTRAP USER:", process.env.MAILTRAP_USER);
console.log(
    "MAILTRAP PASSWORD EXISTS:",
    !!process.env.MAILTRAP_PASSWORD
);

const emailTransporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD
    }
});

if (!process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASSWORD) {
    console.warn(
        "Mailtrap credentials are not configured."
    );
}

emailTransporter.verify((error) => {
    if (error) {
        console.error("❌ Mailtrap connection failed:");
        console.error(error);
    } else {
        console.log("✅ Mailtrap connection successful!");
    }
});


// Test route

app.get("/", (req, res) => {

    res.json({
        message:
            "Student Performance API is running"
    });

});


// Test database

app.get("/api/test-db", (req, res) => {

    const sql =
        "SELECT COUNT(*) AS total_students FROM students";


    db.query(sql, (err, results) => {

        if (err) {

            console.error(err);

            return res.status(500).json({
                error: "Database query failed"
            });

        }


        res.json(results[0]);

    });

});


// Get total students

app.get("/api/students/count", (req, res) => {

    const sql = `
        SELECT COUNT(*) AS total_students
        FROM students
    `;


    db.query(sql, (err, results) => {

        if (err) {

            return res.status(500).json({
                error: err.message
            });

        }


        res.json(results[0]);

    });

});

app.get("/api/scores/average", (req, res) => {
    const sql = `
        SELECT ROUND(AVG(score), 2) AS average_score
        FROM scores
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Average score error:", err);
            return res.status(500).json({
                error: "Database error"
            });
        }

        res.json({
            average_score: results[0].average_score
        });
    });
});


app.get(
    "/api/student/cgpa",
    authenticateToken,
    (req, res) => {

        const studentId =
            req.user.student_id;

        const sql = `
            SELECT cgpa
            FROM students
            WHERE student_id = ?
        `;

        db.query(
            sql,
            [studentId],
            (err, results) => {

                if (err) {

                    return res.status(500).json({
                        error: "Database query failed"
                    });

                }

                if (results.length === 0) {

                    return res.status(404).json({
                        error: "Student not found"
                    });

                }

                res.json(results[0]);

            }
        );

    }
);

// Get average score

app.get(
    "/api/student/average-score",
    authenticateToken,
    (req, res) => {

        const studentId =
            req.user.student_id;

        const sql = `
            SELECT
                ROUND(AVG(score), 2)
                AS average_score
            FROM scores
            WHERE student_id = ?
        `;

        db.query(
            sql,
            [studentId],
            (err, results) => {

                if (err) {

                    return res.status(500).json({
                        error: "Database query failed"
                    });

                }

                res.json(results[0]);

            }
        );

    }
);


// Get average attendance

app.get(
    "/api/student/attendance",
    authenticateToken,
    (req, res) => {

        const studentId =
            req.user.student_id;

        const sql = `
            SELECT
                ROUND(
                    AVG(attendance_percentage),
                    2
                ) AS average_attendance

            FROM attendance

            WHERE student_id = ?
        `;

        db.query(
            sql,
            [studentId],
            (err, results) => {

                if (err) {

                    return res.status(500).json({
                        error: "Database query failed"
                    });

                }

                res.json(results[0]);

            }
        );

    }
);


// Get pass rate

app.get("/api/scores/pass-rate", (req, res) => {

    const sql = `
        SELECT
            ROUND(
                SUM(
                    CASE
                        WHEN score >= 40
                        THEN 1
                        ELSE 0
                    END
                ) * 100.0 / COUNT(*),
                2
            ) AS pass_rate
        FROM scores
    `;


    db.query(sql, (err, results) => {

        if (err) {

            return res.status(500).json({
                error: err.message
            });

        }


        res.json(results[0]);

    });

});

// Get student's CGPA
app.get(
    "/api/student/cgpa",
    authenticateToken,
    (req, res) => {

        const studentId =
            req.user.student_id;

        const sql = `
            SELECT cgpa
            FROM students
            WHERE student_id = ?
        `;

        db.query(
            sql,
            [studentId],
            (err, results) => {

                if (err) {
                    return res.status(500).json({
                        error: "Database query failed"
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        error: "Student not found"
                    });
                }

                res.json(results[0]);

            }
        );

    }
);


// Get student's average score
app.get(
    "/api/student/average-score",
    authenticateToken,
    (req, res) => {

        const studentId =
            req.user.student_id;

        const sql = `
            SELECT
                ROUND(AVG(score), 2)
                AS average_score
            FROM scores
            WHERE student_id = ?
        `;

        db.query(
            sql,
            [studentId],
            (err, results) => {

                if (err) {
                    return res.status(500).json({
                        error: "Database query failed"
                    });
                }

                res.json(results[0]);

            }
        );

    }
);


// Get student's average attendance
app.get(
    "/api/student/attendance",
    authenticateToken,
    (req, res) => {

        const studentId =
            req.user.student_id;

        const sql = `
            SELECT
                ROUND(
                    AVG(attendance_percentage),
                    2
                ) AS average_attendance
            FROM attendance
            WHERE student_id = ?
        `;

        db.query(
            sql,
            [studentId],
            (err, results) => {

                if (err) {
                    return res.status(500).json({
                        error: "Database query failed"
                    });
                }

                res.json(results[0]);

            }
        );

    }
);

app.post(
    "/api/student/change-password",
    authenticateToken,
    async (req, res) => {

        const { currentPassword, newPassword } = req.body;
        const studentId = req.user.student_id;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: "Current password and a new password are required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: "New password must be at least 6 characters long"
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                error: "New password must be different from the current password"
            });
        }

        const userSql = `
            SELECT user_id, password_hash
            FROM users
            WHERE student_id = ?
        `;

        db.query(userSql, [studentId], async (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: "Database query failed"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    error: "Student account not found"
                });
            }

            const user = results[0];
            const passwordMatch = await bcrypt.compare(
                currentPassword,
                user.password_hash
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    error: "Current password is incorrect"
                });
            }

            const passwordHash = await bcrypt.hash(newPassword, 10);

            const updateSql = `
                UPDATE users
                SET password_hash = ?
                WHERE student_id = ?
            `;

            db.query(
    updateSql,
    [hashedPassword, userId],
    (updateErr, updateResult) => {
                if (updateErr) {
                    console.error(updateErr);
                    return res.status(500).json({
                        error: "Failed to update password"
                    });
                }

                console.log(
            "Password update result:",
            updateResult
        );

        console.log(
            "User ID updated:",
            userId
        );

        console.log(
            "Rows changed:",
            updateResult.affectedRows
        );

                res.json({
                    message: "Password updated successfully"
                });
            });
        });
    }
);

app.put(
    "/api/student/update-email",
    authenticateToken,
    (req, res) => {

        const { email } = req.body;
        const studentId = req.user.student_id;

        if (!email || !email.trim()) {
            return res.status(400).json({
                error: "Email address is required"
            });
        }

        const trimmedEmail = email.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                error: "Please enter a valid email address"
            });
        }

        const sql = `
            UPDATE students
            SET email = ?
            WHERE student_id = ?
        `;

        db.query(sql, [trimmedEmail, studentId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    error: "Database update failed"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: "Student not found"
                });
            }

            res.json({
                message: "Email updated successfully",
                email: trimmedEmail
            });
        });
    }
);

// ==========================================
// GET STUDENT PROFILE
// ==========================================

// app.get("/api/students/:matricNumber/profile", (req, res) => {

//     const matricNumber = req.params.matricNumber;

//     const sql = `
//         SELECT
//             s.student_id,
//             s.matric_number,
//             s.first_name,
//             s.last_name,
//             CONCAT(s.first_name, ' ', s.last_name) AS full_name,
//             s.gender,
//             s.date_of_birth,
//             s.level,
//             s.cgpa,
//             d.department_name
//         FROM students s
//         JOIN departments d
//             ON s.department_id = d.department_id
//         WHERE s.matric_number = ?
//     `;

//     db.query(sql, [matricNumber], (err, results) => {

//         if (err) {

//             console.error(err);

//             return res.status(500).json({
//                 error: "Database query failed"
//             });
//         }

//         if (results.length === 0) {

//             return res.status(404).json({
//                 error: "Student not found"
//             });
//         }

//         res.json(results[0]);
//     });

// });

// ==========================================
// STUDENT LOGIN
// ==========================================

app.post("/api/auth/login", (req, res) => {

    const { matricNumber, password } = req.body;

    if (!matricNumber || !password) {

        return res.status(400).json({
            error: "Matric number and password are required"
        });

    }

    const sql = `
        SELECT
            u.user_id,
            u.username,
            u.password_changed,
            u.password_hash,
            u.role,

            s.student_id,
            s.matric_number,
            s.first_name,
            s.last_name,
            s.level,
            s.cgpa,

            d.department_name

        FROM users u

        JOIN students s
            ON u.student_id = s.student_id

        JOIN departments d
            ON s.department_id = d.department_id

        WHERE u.username = ?
    `;

    db.query(
        sql,
        [matricNumber],
        async (err, results) => {

            if (err) {

                console.error(err);

                return res.status(500).json({
                    error: "Database error"
                });

            }

            if (results.length === 0) {

                return res.status(401).json({
                    error: "Invalid matric number or password"
                });

            }

            const user = results[0];

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password_hash
                );

            if (!passwordMatch) {

                return res.status(401).json({
                    error: "Invalid matric number or password"
                });

            }


            // ==================================
            // CREATE JWT
            // ==================================

            const token = jwt.sign(

                {
                    user_id: user.user_id,
                    student_id: user.student_id,
                    role: user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "2h"
                }

            );


            // ==================================
            // SEND TOKEN TO FRONTEND
            // ==================================

            res.json({

                message: "Login successful",

                token: token,

                student: {

                    student_id:
                        user.student_id,

                    matric_number:
                        user.matric_number,

                    first_name:
                        user.first_name,

                    last_name:
                        user.last_name,

                    level:
                        user.level,

                    cgpa:
                        user.cgpa,
                    

                    department_name:
                        user.department_name,
                    
                    password_changed: user.password_changed
                }

            });

        }
    );

});

// ==========================================
// GET CURRENT LOGGED-IN STUDENT
// ==========================================

app.get(
    "/api/auth/me",
    authenticateToken,
    (req, res) => {

        const studentId =
            req.user.student_id;

        const sql = `
            SELECT
                s.student_id,
                s.matric_number,
                s.first_name,
                s.last_name,

                CONCAT(
                    s.first_name,
                    ' ',
                    s.last_name
                ) AS full_name,

                s.gender,
                s.date_of_birth,
                s.email,
                s.level,
                s.cgpa,

                d.department_name

            FROM students s

            JOIN departments d
                ON s.department_id =
                   d.department_id

            WHERE s.student_id = ?
        `;

        db.query(
            sql,
            [studentId],
            (err, results) => {

                if (err) {

                    return res.status(500).json({
                        error: "Database query failed"
                    });

                }

                if (results.length === 0) {

                    return res.status(404).json({
                        error: "Student not found"
                    });

                }

                res.json(results[0]);

            }
        );

    }
);

app.post(
    "/api/auth/change-password",
    authenticateToken,
    async (req, res) => {

        const {
            currentPassword,
            newPassword
        } = req.body;

        // Check that both passwords were provided
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error:
                    "Current password and new password are required"
            });
        }

        // Basic password length requirement
        if (newPassword.length < 8) {
            return res.status(400).json({
                error:
                    "New password must be at least 8 characters"
            });
        }

        // Get the logged-in user's ID from the JWT
        const userId = req.user.user_id;

        // Find the user's current password hash
        const sql = `
            SELECT password_hash
            FROM users
            WHERE user_id = ?
        `;

        db.query(sql, [userId], async (err, results) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    error: "Database error"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    error: "User not found"
                });
            }

            const user = results[0];

            // Verify the current password
            const passwordMatch =
                await bcrypt.compare(
                    currentPassword,
                    user.password_hash
                );

            if (!passwordMatch) {
                return res.status(401).json({
                    error:
                        "Current password is incorrect"
                });
            }

            // Hash the new password
            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );

            // Update password and mark it as changed
            const updateSql = `
                UPDATE users
                SET
                    password_hash = ?,
                    password_changed = TRUE
                WHERE user_id = ?
            `;

            db.query(
                updateSql,
                [hashedPassword, userId],
                (updateErr) => {

                    if (updateErr) {
                        console.error(updateErr);

                        return res.status(500).json({
                            error:
                                "Failed to update password"
                        });
                    }

                    res.json({
                        message:
                            "Password changed successfully"
                    });
                }
            );
        });
    }
);

// ==========================================
// GET CURRENT STUDENT'S COURSES
// ==========================================

app.get(
    "/api/student/courses",
    authenticateToken,
    (req, res) => {

        const studentId = req.user.student_id;

        const sql = `
            SELECT
                c.course_id,
                c.course_code,
                c.course_name,
                c.credit_unit,
                c.course_level,
                e.academic_session,
                e.semester

            FROM enrollments e

            JOIN courses c
                ON e.course_id = c.course_id

            WHERE e.student_id = ?

            ORDER BY
                e.semester,
                c.course_code
        `;

        db.query(
            sql,
            [studentId],
            (err, results) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({
                        error: "Database query failed"
                    });

                }

                res.json(results);

            }
        );

    }
);

// ==========================================
// GET CURRENT STUDENT'S RESULTS
// ==========================================

app.get(
    "/api/student/results",
    authenticateToken,
    (req, res) => {

        const studentId = req.user.student_id;

        const sql = `
            SELECT
                c.course_code,
                c.course_name,
                c.credit_unit,
                sc.score,

                CASE
                    WHEN sc.score >= 70 THEN 'A'
                    WHEN sc.score >= 60 THEN 'B'
                    WHEN sc.score >= 50 THEN 'C'
                    WHEN sc.score >= 45 THEN 'D'
                    WHEN sc.score >= 40 THEN 'E'
                    ELSE 'F'
                END AS grade,

                sc.academic_session,
                sc.semester

            FROM scores sc

            JOIN courses c
                ON sc.course_id = c.course_id

            WHERE sc.student_id = ?

            ORDER BY
                sc.academic_session DESC,
                sc.semester,
                c.course_code
        `;

        db.query(
            sql,
            [studentId],
            (err, results) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({
                        error: "Database query failed"
                    });

                }

                res.json(results);

            }
        );

    }
);

// ==========================================
// GET CURRENT STUDENT'S ATTENDANCE
// ==========================================

app.get(
    "/api/student/attendance-records",
    authenticateToken,
    (req, res) => {

        const studentId = req.user.student_id;

        const sql = `
            SELECT
                c.course_code,
                c.course_name,
                c.credit_unit,
                a.attendance_percentage,
                a.academic_session,
                a.semester

            FROM attendance a

            JOIN courses c
                ON a.course_id = c.course_id

            WHERE a.student_id = ?

            ORDER BY
                a.academic_session DESC,
                a.semester,
                c.course_code
        `;

        db.query(
            sql,
            [studentId],
            (err, results) => {

                if (err) {

                    console.error(err);

                    return res.status(500).json({
                        error: "Database query failed"
                    });

                }

                res.json(results);

            }
        );

    }
);

// ==========================================
// CURRENT STUDENT COURSE COUNT
// ==========================================

app.get(
    "/api/student/course-count",
    authenticateToken,
    (req, res) => {

        const studentId =
            req.user.student_id;

        const sql = `
            SELECT
                COUNT(*) AS course_count
            FROM enrollments
            WHERE student_id = ?
        `;

        db.query(
            sql,
            [studentId],
            (err, results) => {

                if (err) {

                    return res.status(500).json({
                        error: "Database query failed"
                    });

                }

                res.json(results[0]);

            }
        );

    }
);

app.post(
    "/api/auth/forgot-password",
    async (req, res) => {

        const { matricNumber, email } = req.body;

        if (!matricNumber || !email) {
            return res.status(400).json({
                error:
                    "Matric number and email are required"
            });
        }

        const sql = `
            SELECT
                u.user_id,
                u.username,
                u.password_changed,
                s.student_id,
                s.matric_number,
                s.first_name,
                s.email
            FROM users u
            JOIN students s
                ON u.student_id = s.student_id
            WHERE
                u.username = ?
                AND s.email = ?
        `;

        db.query(
            sql,
            [matricNumber, email],
            async (err, results) => {

                if (err) {
                    console.error(err);

                    return res.status(500).json({
                        error:
                            "Database error"
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        error:
                            "The matric number and email could not be verified."
                    });
                }

                const user = results[0];

                if (!user.password_changed) {
                    return res.status(403).json({
                        error:
                            "You must change your default password before using password recovery."
                    });
                }

                const resetToken =
                    crypto.randomBytes(32).toString("hex");

                const resetTokenHash =
                    crypto
                        .createHash("sha256")
                        .update(resetToken)
                        .digest("hex");

                const expiry =
                    new Date(
                        Date.now() + 15 * 60 * 1000
                    );

                const updateSql = `
                    UPDATE users
                    SET
                        reset_token_hash = ?,
                        reset_token_expires_at = ?
                    WHERE user_id = ?
                `;

                db.query(
                    updateSql,
                    [
                        resetTokenHash,
                        expiry,
                        user.user_id
                    ],
                    async (updateErr) => {

                        if (updateErr) {
                            console.error(updateErr);

                            return res.status(500).json({
                                error:
                                    "Failed to create reset request"
                            });
                        }

                        const resetLink = `https://student-performance-system-frontend.vercel.app/reset-password.html?token=${resetToken}`;
    console.log("Reset link:", resetLink);

                        try {

                            await emailTransporter.sendMail({

                                from:
                                    process.env.MAILTRAP_FROM ||
                                    process.env.MAILTRAP_USER,

                                to:
                                    user.email,

                                subject:
                                    "Student Portal Password Reset",

                                html: `
                                    <h2>Password Reset Request</h2>

                                    <p>
                                        Hello ${user.first_name},
                                    </p>

                                    <p>
                                        We received a request to reset
                                        your Student Portal password.
                                    </p>

                                    <p>
                                        This link will expire in
                                        <strong>15 minutes</strong>.
                                    </p>

                                    <p>
                                        <a href="${resetLink}">
                                            Reset Your Password
                                        </a>
                                    </p>

                                    <p>
                                        If you did not request this,
                                        you can safely ignore this email.
                                    </p>
                                `
                            });

                            return res.json({
                                message:
                                    "If the account details are valid, a password reset link has been sent to the registered email address."
                            });

                        } catch (emailError) {

                            console.error(
                                emailError
                            );

                            return res.status(503).json({
                                error:
                                    "Email service is unavailable. Please configure a valid SMTP account or use Mailtrap for development."
                            });
                        }
                    }
                );
            }
        );
    }
);

app.post(
    "/api/auth/reset-password",
    async (req, res) => {

        const { token, password } = req.body;

        // 1. Validate input
        if (!token || !password) {
            return res.status(400).json({
                error: "Reset token and new password are required."
            });
        }

        // 2. Validate password length
        if (password.length < 8) {
            return res.status(400).json({
                error: "Password must be at least 8 characters long."
            });
        }

        try {

            // 3. Hash the token received from the reset URL
            const resetTokenHash =
                crypto
                    .createHash("sha256")
                    .update(token)
                    .digest("hex");

            // 4. Find the user with this token
            const sql = `
                SELECT
                    user_id,
                    username,
                    reset_token_hash,
                    reset_token_expires_at
                FROM users
                WHERE reset_token_hash = ?
            `;

            db.query(
                sql,
                [resetTokenHash],
                async (err, results) => {

                    if (err) {
                        console.error(
                            "Database error while checking reset token:",
                            err
                        );

                        return res.status(500).json({
                            error: "Database error."
                        });
                    }

                    // 5. Token doesn't exist
                    if (results.length === 0) {
                        return res.status(400).json({
                            error:
                                "Invalid or expired password reset link."
                        });
                    }

                    const user = results[0];

                    // 6. Check token expiry
                    const expiry =
                        new Date(user.reset_token_expires_at);

                    if (expiry < new Date()) {

                        return res.status(400).json({
                            error:
                                "This password reset link has expired. Please request a new one."
                        });
                    }

                    // 7. Hash the new password
                    const hashedPassword =
                        await bcrypt.hash(password, 10);

                    // 8. Update password and invalidate token
                    const updateSql = `
                        UPDATE users
                        SET
                            password_hash= ?,
                            reset_token_hash = NULL,
                            reset_token_expires_at = NULL,
                            password_changed = 1
                        WHERE user_id = ?
                    `;

                    db.query(
                        updateSql,
                        [
                            hashedPassword,
                            user.user_id
                        ],
                        (updateErr) => {

                            if (updateErr) {
                                console.error(
                                    "Password update error:",
                                    updateErr
                                );

                                return res.status(500).json({
                                    error:
                                        "Failed to reset password."
                                });
                            }

                            // 9. Success
                            return res.json({
                                message:
                                    "Password reset successfully. You can now log in with your new password."
                            });
                        }
                    );
                }
            );

        } catch (error) {

            console.error(
                "Password reset error:",
                error
            );

            return res.status(500).json({
                error:
                    "An error occurred while resetting your password."
            });
        }
    }
);




// Start server

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});

