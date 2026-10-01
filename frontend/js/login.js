const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const matricNumber =
            document
                .getElementById("matricNumber")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;


        // Clear previous message
        loginMessage.textContent = "";
        loginMessage.className = "";


        if (!matricNumber || !password) {

            loginMessage.textContent =
                "Please enter your matric number and password.";

            return;
        }


        try {

            const response = await fetch(
                "https://student-performance-system-production-b81a.up.railway.app/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        matricNumber: matricNumber,
                        password: password
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                loginMessage.textContent =
                    data.error ||
                    "Login failed.";

                return;
            }


            // Save authentication token
            localStorage.setItem(
            "authToken",
            data.token
        );

// Save student information
            localStorage.setItem(
            "studentMatricNumber",
            data.student.matric_number
        );

            localStorage.setItem(
            "studentId",
            data.student.student_id
        );

            localStorage.setItem(
            "studentLoggedIn",
            "true"
            );

            localStorage.setItem(
    "passwordChanged",
    data.student.password_changed
);

            // Go to dashboard
            window.location.href = "dashboard.html";


        } catch (error) {

            console.error(error);

            loginMessage.textContent =
                "Unable to connect to the server. Please try again.";

        }

    }
);

const forgotPasswordLink =
    document.getElementById("forgotPasswordLink");

if (forgotPasswordLink) {

    forgotPasswordLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            const passwordChanged =
                localStorage.getItem("passwordChanged");

            if (passwordChanged === "1") {

                window.location.href =
                    "forgot-password.html";

            } else {

                alert(
                    "Please change your default password before using the Forgot Password option."
                );

                window.location.href =
                    "change-password.html";
            }

        }
    );
}