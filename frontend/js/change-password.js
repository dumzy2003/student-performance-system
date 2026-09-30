document.addEventListener("DOMContentLoaded", function () {

    const form =
        document.getElementById("changePasswordForm");

    const message =
        document.getElementById("passwordMessage");

    const button =
        document.getElementById("changePasswordButton");

    const toggleButtons =
        document.querySelectorAll(".toggle-password");


    // -----------------------------------
    // Check if the student is logged in
    // -----------------------------------

    const token =
        localStorage.getItem("authToken");

    if (!token) {
        window.location.href = "index.html";
        return;
    }


    // -----------------------------------
    // Show / hide passwords
    // -----------------------------------

    toggleButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const targetId =
                button.getAttribute("data-target");

            const input =
                document.getElementById(targetId);

            if (input.type === "password") {

                input.type = "text";

                button.innerHTML =
                    '<i data-lucide="eye-off"></i>';

            } else {

                input.type = "password";

                button.innerHTML =
                    '<i data-lucide="eye"></i>';

            }

            if (typeof lucide !== "undefined") {
                lucide.createIcons();
            }

        });

    });


    // -----------------------------------
    // Submit change password form
    // -----------------------------------

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const currentPassword =
                document.getElementById(
                    "currentPassword"
                ).value;

            const newPassword =
                document.getElementById(
                    "newPassword"
                ).value;

            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            // Clear previous message
            message.textContent = "";
            message.className =
                "form-message";


            // -----------------------------------
            // Check password confirmation
            // -----------------------------------

            if (newPassword !== confirmPassword) {

                message.textContent =
                    "New passwords do not match.";

                message.classList.add("error");

                return;
            }


            // -----------------------------------
            // Check password length
            // -----------------------------------

            if (newPassword.length < 8) {

                message.textContent =
                    "New password must be at least 8 characters.";

                message.classList.add("error");

                return;
            }


            // -----------------------------------
            // Prevent current and new passwords
            // from being the same
            // -----------------------------------

            if (currentPassword === newPassword) {

                message.textContent =
                    "New password must be different from your current password.";

                message.classList.add("error");

                return;
            }


            // -----------------------------------
            // Disable button
            // -----------------------------------

            button.disabled = true;

            button.textContent =
                "Changing Password...";


            try {

                const response = await fetch(
                    "http://localhost:5000/api/auth/change-password",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            currentPassword:
                                currentPassword,

                            newPassword:
                                newPassword
                        })
                    }
                );


                const data =
                    await response.json();


                // -----------------------------------
                // Handle backend error
                // -----------------------------------

                if (!response.ok) {

                    message.textContent =
                        data.error ||
                        "Unable to change password.";

                    message.classList.add("error");

                    button.disabled = false;

                    button.textContent =
                        "Change Password";

                    return;
                }


                // -----------------------------------
                // Success
                // -----------------------------------

                message.textContent =
                    "Password changed successfully.";

                message.classList.add("success");


                // Wait briefly before dashboard
                setTimeout(function () {

                    window.location.href =
                        "dashboard.html";

                }, 1500);


            } catch (error) {

                console.error(
                    "Change password error:",
                    error
                );

                message.textContent =
                    "Unable to connect to the server.";

                message.classList.add("error");

                button.disabled = false;

                button.textContent =
                    "Change Password";
            }

        }
    );

});