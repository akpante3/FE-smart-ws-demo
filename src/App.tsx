import React, { useEffect, useRef, useState } from "react";
import SmartSocket from "smart-ws"; // or { SmartSocket } depending on your export

type InboundMessage = {
  type: "chat";
  user: string;
  text: string;
  timestamp: number;
};

type OutboundMessage = {
  type: "chat";
  user: string;
  text: string;
};

type ChatEntry = InboundMessage;

function randomName() {
  const animals = ["Lion", "Tiger", "Falcon", "Eagle", "Panther", "Wolf"];
  const id = Math.floor(Math.random() * 1000);
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `${animal}#${id}`;
}

function App() {
  const [username, setUsername] = useState<string>(randomName());
  const [tempUsername, setTempUsername] = useState<string>(username);
  const [status, setStatus] = useState<string>("idle");
  const [retries, setRetries] = useState(0);
  const [latency, setLatency] = useState<number | undefined>();
  const [lastPing, setLastPing] = useState<number | undefined>();
  const [lastPong, setLastPong] = useState<number | undefined>();

  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState<ChatEntry[]>([]);
  const [log, setLog] = useState<string[]>([]);

  const socketRef = useRef<SmartSocket<InboundMessage, OutboundMessage> | null>(
    null
  );

  useEffect(() => {
    const socket = new SmartSocket<InboundMessage, OutboundMessage>(
      "ws://localhost:8080",
      {
        reconnect: {
          minDelay: 500,
          maxDelay: 5000,
          jitter: 0.2,
          retries: Infinity,
        },
        heartbeat: {
          interval: 10_000,
          timeout: 5_000,
          message: "ping" as any, // our server treats plain "ping" specially
          enabled: true,
        },
        buffer: {
          enabled: true,
          max: 200,
          dropStrategy: "oldest",
        },
        json: true, // 🔴 IMPORTANT: we are sending/receiving JSON
      }
    );

    socketRef.current = socket;

    const addLog = (line: string) => {
      setLog((prev) => [`${new Date().toLocaleTimeString()} - ${line}`, ...prev]);
    };

    // Connection events
    const offOpen = socket.on("open", () => {
      setStatus(socket.getStatus());
      setRetries(socket.getRetries());
      addLog("Connected");
    });

    const offClose = socket.on("close", (event) => {
      setStatus(socket.getStatus());
      addLog(
        `Closed: code=${event.code ?? ""}, reason=${event.reason ?? ""}`
      );
    });

    const offError = socket.on("error", (err) => {
      addLog(`Error: ${String((err as any).message || err)}`);
    });

    const offReconnect = socket.on("reconnect", (attempt) => {
      setStatus(socket.getStatus());
      setRetries(attempt);
      addLog(`Reconnecting... attempt ${attempt}`);
    });

    const offOnline = socket.on("online", () => {
      addLog("Browser ONLINE");
    });

    const offOffline = socket.on("offline", () => {
      addLog("Browser OFFLINE");
    });

    // Heartbeat
    const offPing = socket.on("ping", () => {
      const t = Date.now();
      setLastPing(t);
      addLog("Ping sent");
    });

    const offPong = socket.on("pong", () => {
      const t = Date.now();
      setLastPong(t);
      setLatency(socket.getLatency());
      addLog(`Pong received. Latency ~${socket.getLatency()} ms`);
    });

    // Buffer
    const offBufferAdd = socket.on("bufferAdd", (msg) => {
      addLog(
        `Buffered message: ${JSON.stringify(msg)}`
      );
    });

    const offBufferFlush = socket.on("bufferFlush", (msgs) => {
      addLog(`Flushed ${msgs.length} buffered messages`);
    });

    // Chat messages
    const offMessage = socket.on("message", (msg) => {
      if (msg.type === "chat") {
        setChat((prev) => [msg, ...prev]);
      }
    });

    return () => {
      offOpen();
      offClose();
      offError();
      offReconnect();
      offOnline();
      offOffline();
      offPing();
      offPong();
      offBufferAdd();
      offBufferFlush();
      offMessage();
      socket.disconnect(1000, "Component unmounted");
    };
  }, []);

  const handleSend = () => {
    if (!socketRef.current) return;
    if (!chatInput.trim()) return;

    const payload: OutboundMessage = {
      type: "chat",
      user: username,
      text: chatInput.trim(),
    };

    socketRef.current.send(payload);
    setChatInput("");
  };

  const handleDisconnect = () => {
    socketRef.current?.disconnect(4000, "Manual disconnect");
  };

  const handleReconnect = () => {
    socketRef.current?.connect();
  };

  const handleUpdateUsername = () => {
    setUsername(tempUsername || randomName());
  };

  return (
    <div
      style={{
        padding: 16,
        fontFamily: "system-ui",
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: 16,
        height: "100vh",
        boxSizing: "border-box",
      }}
    >
      {/* Left: Chat */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h1>SmartSocket Group Chat</h1>

        <section style={{ marginBottom: 12 }}>
          <label>
            <strong>Username: </strong>
            <input
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              style={{ marginRight: 8 }}
            />
          </label>
          <button onClick={handleUpdateUsername}>Set username</button>
          <p style={{ marginTop: 4 }}>
            Current: <strong>{username}</strong>
          </p>
        </section>

        <section style={{ marginBottom: 12 }}>
          <p>
            <strong>Status:</strong> {status}
          </p>
          <p>
            <strong>Retries:</strong> {retries}
          </p>
          <p>
            <strong>Latency:</strong> {latency ?? "N/A"} ms
          </p>
          <p>
            <strong>Last ping:</strong>{" "}
            {lastPing ? new Date(lastPing).toLocaleTimeString() : "N/A"}
          </p>
          <p>
            <strong>Last pong:</strong>{" "}
            {lastPong ? new Date(lastPong).toLocaleTimeString() : "N/A"}
          </p>

          <button onClick={handleDisconnect} style={{ marginRight: 8 }}>
            Disconnect
          </button>
          <button onClick={handleReconnect}>Reconnect</button>
        </section>

        <section
          style={{
            flex: 1,
            border: "1px solid #ddd",
            borderRadius: 4,
            display: "flex",
            flexDirection: "column-reverse",
            padding: 8,
            overflowY: "auto",
          }}
        >
          {chat.map((msg) => (
            <div key={msg.timestamp + msg.user + msg.text} style={{ marginBottom: 4 }}>
              <span style={{ fontWeight: "bold" }}>{msg.user}: </span>
              <span>{msg.text}</span>
              <span style={{ fontSize: 10, marginLeft: 8, color: "#666" }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {chat.length === 0 && (
            <p style={{ color: "#777" }}>No messages yet. Say hi!</p>
          )}
        </section>

        <section style={{ marginTop: 8 }}>
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Type a message"
            style={{ width: "70%", marginRight: 8 }}
          />
          <button onClick={handleSend}>Send</button>
        </section>
      </div>

      {/* Right: Log */}
      <div
        style={{
          borderLeft: "1px solid #eee",
          paddingLeft: 16,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2>Event log</h2>
        <ul style={{ listStyle: "none", padding: 0, overflowY: "auto", flex: 1 }}>
          {log.map((line, idx) => (
            <li key={idx} style={{ fontSize: 12, marginBottom: 4 }}>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
