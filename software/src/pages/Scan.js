import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";

export default function Scan() {
  const [status, setStatus] = useState("");
  const [token, setToken] = useState("");
  const [scanner, setScanner] = useState(null);

  const videoRef = useRef(null);
  const stopStreamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scanner && scanner.clear) {
        try {
          scanner.clear();
        } catch {}
      }
      if (stopStreamRef.current) {
        try {
          stopStreamRef.current();
        } catch {}
      }
    };
  }, [scanner]);

  const markToken = async (decodedText) => {
    try {
      await api.mark(decodedText);
      setStatus("✅ Marked present!");
    } catch (e) {
      setStatus("❌ " + (e?.message || "Failed to mark"));
    }
  };

  const startWithBarcodeDetector = async () => {
    if (!("BarcodeDetector" in window)) return false;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        return true;
      }
      video.srcObject = stream;
      await video.play();
      stopStreamRef.current = () => stream.getTracks().forEach((t) => t.stop());

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      let live = true;

      const tick = async () => {
        if (!live) return;
        try {
          const codes = await detector.detect(video);
          if (codes && codes[0]?.rawValue) {
            live = false;
            stopStreamRef.current?.();
            await markToken(codes[0].rawValue);
            return;
          }
        } catch {}
        requestAnimationFrame(tick);
      };
      tick();
      setStatus("Scanning…");
      return true;
    } catch (e) {
      setStatus("Could not start camera: " + (e?.message || e));
      return true;
    }
  };

  const startCamera = async () => {
    try {
      if (window.Html5QrcodeScanner) {
        const s = new window.Html5QrcodeScanner("reader", {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        });
        s.render(async (decodedText) => {
          try {
            await markToken(decodedText);
            if (s.clear) s.clear();
          } catch (e) {
            setStatus("❌ " + (e?.message || "Failed to mark"));
          }
        });
        setScanner(s);
        setStatus("Scanning…");
      } else if (window.Html5Qrcode) {
        const s = new window.Html5Qrcode("reader");
        await s.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            try {
              await markToken(decodedText);
              await s.stop();
            } catch (e) {
              setStatus("❌ " + (e?.message || "Failed to mark"));
            }
          }
        );
        setScanner(s);
        setStatus("Scanning…");
      } else {
        const handled = await startWithBarcodeDetector();
        if (!handled) {
          setStatus(
            "Camera lib not found. Make sure html5-qrcode script is loaded (or browser supports BarcodeDetector)."
          );
        }
      }
    } catch (e) {
      setStatus("Could not start camera: " + (e?.message || e));
    }
  };

  const submitFallback = async () => {
    try {
      await api.mark(token.trim());
      setStatus("✅ Marked present (manual token)!");
    } catch (e) {
      setStatus("❌ " + (e?.message || "Failed to mark"));
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          <button className="btn primary" onClick={startCamera}>
            Open Camera
          </button>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="Paste token (fallback)"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <button className="btn" onClick={submitFallback}>
            Mark Present
          </button>
        </div>

        <div id="reader" style={{ width: "100%", marginTop: 12 }} />
        <video ref={videoRef} playsInline muted style={{ width: "100%", marginTop: 12 }} />
        <div className="muted" style={{ marginTop: 8 }}>
          {status || " "}
        </div>
      </div>
    </div>
  );
}
