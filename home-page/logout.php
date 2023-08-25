<?php 
session_start();
$_SESSION["user_id"] = "";
session_destroy();
header("Location: ../login-page/login.html");
?>