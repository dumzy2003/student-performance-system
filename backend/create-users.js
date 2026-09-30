const bcrypt = require("bcryptjs");
const db = require("./db");

async function createUsers() {

    try {

        // Temporary password for all student accounts
        const password = "Student@123";

        // Hash password
        const passwordHash =
            await bcrypt.hash(password, 10);

        // Get all students
        db.query(
            "SELECT student_id, matric_number FROM students",
            (err, students) => {

                if (err) {
                    console.error(err);
                    return;
                }

                if (students.length === 0) {
                    console.log("No students found.");
                    return;
                }

                let completed = 0;

                students.forEach((student) => {

                    const sql = `
                        INSERT INTO users
                        (
                            student_id,
                            username,
                            password_hash,
                            role
                        )
                        VALUES (?, ?, ?, 'student')
                    `;

                    db.query(
                        sql,
                        [
                            student.student_id,
                            student.matric_number,
                            passwordHash
                        ],
                        (err) => {

                            if (err) {
                                console.error(
                                    `Failed for ${student.matric_number}:`,
                                    err.message
                                );
                            }

                            completed++;

                            if (
                                completed ===
                                students.length
                            ) {

                                console.log(
                                    `${students.length} student accounts created.`
                                );

                                db.end();
                            }

                        }
                    );

                });

            }
        );

    } catch (error) {

        console.error(
            "Error creating users:",
            error
        );

    }

}

createUsers();