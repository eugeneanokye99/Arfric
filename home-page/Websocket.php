<?php

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use Ratchet\ConnectionInterface;

require '../vendor/autoload.php';

class VideoCallServer implements \Ratchet\MessageComponentInterface {
    protected $clients;
    protected $userIds; 

    public function __construct() {
        $this->clients = new \SplObjectStorage();
        $this->userIds = [];
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "New connection ({$conn->resourceId})\n";
    }

    // Function to associate a user ID with a connection
    private function associateUserIdWithConnection($conn, $userId) {
        $this->userIds[$conn->resourceId] = $userId;
    }

    // Function to get the user ID associated with a connection
    private function getUserIdForConnection($conn) {
        return $this->userIds[$conn->resourceId] ?? null;
    }

    private function findCalleeSocketById($calleeId) {
        foreach ($this->clients as $client) {
            $userId = $this->getUserIdForConnection($client);
            if ($userId === $calleeId) {
                return $client;
            }
        }
        return null; // Callee not found
    }

    
public function onMessage(ConnectionInterface $from, $msg) {
    $data = json_decode($msg, true);

    // Handle different message types
    if ($data['type'] === 'offer' || $data['type'] === 'answer' || $data['type'] === 'iceCandidate') {
        foreach ($this->clients as $client) {
            if ($client !== $from) {
                $client->send($msg);
            }
        }
    } elseif ($data['type'] === 'call') {
        $calleeSocket = $this->findCalleeSocketById($data['calleeId']); // Implement this function
        if ($calleeSocket) {
            $calleeSocket->send(json_encode(['type' => 'callAlert']));
        }
    }
}


    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
         // Remove user ID mapping when the connection is closed
         unset($this->userIds[$conn->resourceId]);
        echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }
}

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new VideoCallServer()
        )
    ),
    8080
);

$server->run();
