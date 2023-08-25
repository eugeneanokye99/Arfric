<?php 
// Connect to the PostgreSQL database
$db = pg_connect("host=localhost port=5432 dbname=postgres user=postgres password=123456789");

if (!$db) {
    die("Connection failed: " . pg_last_error());
}


// Process user registration form
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name = $_POST["name"];
    $email = $_POST["email"];
    $password = password_hash($_POST["password"], PASSWORD_DEFAULT);

    // Insert user data into the database
    $query = "INSERT INTO users (name, email, password) VALUES ('$name', '$email', '$password')";
    $result = pg_query($db, $query);

    if (!$result) {
        die("Query failed: " . pg_last_error());
    }

    echo "Registration successful! Please <a href=\"../login-page/login.html\">login here</a>";
}
//http://localhost/Arfric/login-page/login.html


// Close the database connection
pg_close($db);
?>
