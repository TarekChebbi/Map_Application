<?php

$server = 'localhost';
$username = 'postgres';
$password = 'admin';
$db_name = 'map_application';

$dbconn = pg_connect("host=$server port=5432 dbname=$db_name user=$username password=$password");


?>