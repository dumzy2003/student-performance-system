document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "forgotPasswordForm"
            );

        const message =
            document.getElementById(
                "forgotPasswordMessage"
            );

        const button =
            document.getElementById(
                "forgotPasswordButton"
            );


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const matricNumber =
                    document.getElementById(
                        "matricNumber"
                    ).value.trim();

                const email =
                    document.getElementById(
                        "email"
                    ).value.trim();


                // Clear previous message

                message.textContent = "";

                message.className =
                    "form-message";


                // Basic validation

                if (!matricNumber || !email) {

                    message.textContent =
                        "Please enter your matric number and registered email.";

                    message.classList.add(
                        "error"
                    );

                    return;
                }


                // Disable button

                button.disabled = true;

                button.textContent =
                    "Sending...";


                try {

                    const response =
                        await fetch(
                            "https://student-performance-system-production-b81a.up.railway.app/api/auth/forgot-password",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    matricNumber:
                                        matricNumber,

                                    email:
                                        email
                                })
                            }
                        );

                    let data = {};

                    try {
                        data =
                            await response.json();
                    } catch {
                        data = {};
                    }

                    if (!response.ok) {

                        message.textContent =
                            data.error ||
                            "Unable to process your request.";

                        message.classList.add(
                            "error"
                        );

                        button.disabled = false;

                        button.textContent =
                            "Send Reset Link";

                        return;
                    }


                    // Success

                    message.textContent =
                        "If the account details are valid, a password reset link has been sent to your registered email.";

                    message.classList.add(
                        "success"
                    );


                    form.reset();

                    button.disabled = false;

                    button.textContent =
                        "Send Reset Link";


                } catch (error) {

                    console.error(
                        "Forgot password error:",
                        error
                    );


                    message.textContent =
                        "Unable to connect to the server. Please try again.";

                    message.classList.add(
                        "error"
                    );


                    button.disabled = false;

                    button.textContent =
                        "Send Reset Link";

                }

            }
        );

    }
);