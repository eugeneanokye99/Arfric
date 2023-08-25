<?php
// Connect to the database (similar to your registration code)
$db = pg_connect("host=localhost port=5432 dbname=postgres user=postgres password=123456789");

if (!$db) {
    die("Connection failed: " . pg_last_error());
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email = $_POST["email"];
    $password = $_POST["password"];

    // Query to fetch user by email
    $query = "SELECT * FROM users WHERE email = '$email'";
    $result = pg_query($db, $query);

    if ($result) {
        $user = pg_fetch_assoc($result);

        // Check if password matches
        if (password_verify($password, $user['password'])) {
            // Start a session
            session_start();

            // Store user's name in the session
            $_SESSION['user_name'] = $user['name'];

            // Redirect to home page after successful login
            header("Location: ../home-page/home.php");
            exit();
        } else {
            echo "Invalid email or password.";
        }
    } else {
        echo "Error executing query.";
    }
}

// Close the database connection
pg_close($db);
?>
