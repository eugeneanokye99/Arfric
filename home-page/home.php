<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://kit.fontawesome.com/5cec4b7ace.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="home.css" />
    <title>Arfric</title>
</head>

<body>
    <div class="loader">
        <span class="spinner"></span>
    </div>
    <div class="body">
        <div id="video-screen">

            <video id="localVideo" autoplay></video>

            <video id="remoteVideo" style="display: none;" autoplay></video>
        </div>

        <div class="contact-screen">
            <div>
                <span style="
            display: flex;
            justify-content: center;
            font-size: 30px;
            font-weight: 600;
            border-bottom: 1px solid gainsboro;
            padding-bottom: 20px;
          ">Users</span>
                <div id="contacts">
                    <?php
                    session_start();

                    // Check if user_name is set and add it to the array
                    if (isset($_SESSION['user_name'])) {
                        $_SESSION['logged_in_users'][] = $_SESSION['user_name'];
                    }

                    // Display all logged-in users
                    if (isset($_SESSION['logged_in_users'])) {
                        foreach ($_SESSION['logged_in_users'] as $userName) {
                            echo "<p class='preview'> $userName  <button id=\"toggleMic\">Toggle Mic</button><button id=\"toggleCamera\">Toggle Camera</button><span style=\"background-color: green; padding: 4px;\"></span><i>you</i></p>";
                            $_SESSION['logged_in_users'] = array();
                        }
                    } else {
                        echo "<p>No users are currently logged in.</p>";
                    }

                    // Fetch and display users from the database
                    try {
                        $db = new PDO("pgsql:host=localhost;dbname=postgres", "postgres", "123456789");
                        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                        $query = "SELECT name FROM users";
                        $stmt = $db->query($query);
                        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

                        foreach ($users as $user) {
                            $userId = $user['id'];
                            echo "<p class=\"preview\">" 
                            . $user['name'] . 
                            "<span id=\"spanIcon_$userId\" class=\"fa-solid fa-phone\"></span> 
                            <span id=\"spanText_$userId\" style=\"display: none; font-size:12px; color: white; \">Active call</span>
                            </p>";
                            }
                    } catch (PDOException $e) {
                        echo "Database connection error: " . $e->getMessage();
                    }
                    ?>
                </div>
            </div>
            <p>Click to <a href="./logout.php" class="logout-button">Logout</a></p>
        </div>

        <script src="home.js"></script>
    </div>
</body>

</html>