import { useState, useEffect } from "react";

interface CopingActionsProps {
  stressLevel: number;
  crisis?: boolean;
}

export function CopingActions({ stressLevel, crisis }: CopingActionsProps) {
  const [showMusic, setShowMusic] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);

  const musicTracks = [
    "/m1.mpeg",
    "/m2.mpeg",
    "/m3.mpeg"
  ];

  const randomTrack = musicTracks[Math.floor(Math.random() * musicTracks.length)];

  // FIX: Raised to 8 so it triggers on maximum stress, allowing breathing exercises to show on 5-7.
  const isCrisis = stressLevel >= 8 || crisis;

  // 🚨 CRISIS MODE
  if (isCrisis) {
    return (
      <div className="helpline-box">
        <h3>You are not alone ❤️</h3>
        <p>
          It sounds like you're going through a very difficult moment.
          Please consider reaching out to a trained listener right now.
        </p>
        <img src="/helpline.jpeg" alt="iCALL Mental Health Helpline" />
        <div className="helpline-list">
          <p><strong>iCALL Mental Health Helpline (India)</strong></p>
          <p className="mt">🌐 Official Website:</p>
          <a href="https://icallhelpline.org/" target="_blank" rel="noopener noreferrer">
            https://icallhelpline.org/
          </a>
          <p className="mt">You deserve support. Talking to a real person can help.</p>
        </div>
        <style>{css}</style>
      </div>
    );
  }

  return (
    <div className="container">
      
      {/* FIX: Broadened range so scaled numbers (2.5, 5, 7.5) can trigger it */}
      {stressLevel >= 2.5 && stressLevel < 8 && (
        <button onClick={() => setShowMusic(true)}>
          Play Calming Music
        </button>
      )}

      {/* FIX: Triggers on 5.0 and 7.5 */}
      {stressLevel >= 4 && stressLevel < 8 && (
        <button onClick={() => setShowBreathing(true)}>
          Start Breathing Exercise
        </button>
      )}

      {showMusic && (
        <div className="music-player">
          <p>🎧 Calming music for you</p>
          <audio controls autoPlay>
            <source src={randomTrack} type="audio/mpeg" />
          </audio>
        </div>
      )}

      {showBreathing && (
        <BreathingExercise onClose={() => setShowBreathing(false)} />
      )}

      <style>{css}</style>
    </div>
  );
}

function BreathingExercise({ onClose }: { onClose: () => void }) {
  const phases = ["Inhale", "Hold", "Exhale"];
  const totalCycles = 3;

  const [started, setStarted] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [counter, setCounter] = useState(5);
  const [cycle, setCycle] = useState(1);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!started || finished) return;

    if (counter === 0) {
      if (phaseIndex < 2) {
        setPhaseIndex(phaseIndex + 1);
        setCounter(5);
      } else {
        if (cycle < totalCycles) {
          setCycle(cycle + 1);
          setPhaseIndex(0);
          setCounter(5);
        } else {
          setFinished(true);
        }
      }
      return;
    }

    const timer = setTimeout(() => {
      setCounter(counter - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [counter, phaseIndex, cycle, started, finished]);

  const phase = phases[phaseIndex];

  return (
    <div className="popup">
      <div className="popup-card">
        {!started && !finished && (
          <>
            <h3>Ready for a calming breathing exercise?</h3>
            <p>We'll guide you through 3 deep breaths.</p>
            <button onClick={() => setStarted(true)}>Yes, Start</button>
            <button onClick={onClose}>Close</button>
          </>
        )}

        {started && !finished && (
          <>
            <h3>{phase}</h3>
            <div className={`breathing-circle ${phase.toLowerCase()}`}>
              {counter}
            </div>
            <p>Cycle {cycle} / 3</p>
          </>
        )}

        {finished && (
          <>
            <h3>Great job 🌿</h3>
            <p>You completed 3 deep breaths.</p>
            <button onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </div>
  );
}

const css = `
.container{ background:#eef6ff; padding:20px; border-radius:10px; text-align:center; margin-top: 10px; }
button{ margin:8px; padding:10px 16px; border:none; border-radius:6px; background:#3b82f6; color:white; cursor:pointer; }
button:hover{ opacity:0.9; }
.music-player{ margin-top:15px; }
.music-player audio{ display:block; margin:10px auto; }
.popup{ position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index: 50; }
.popup-card{ background:white; padding:25px; border-radius:12px; width:320px; text-align:center; }
.breathing-circle{ width:90px; height:90px; background:#601EF9; border-radius:50%; margin:20px auto; display:flex; align-items:center; justify-content:center; font-size:28px; color:white; transform:scale(0.8); transition:transform 5s ease-in-out; }
.inhale{ transform:scale(1.6); }
.hold{ transform:scale(1.6); }
.exhale{ transform:scale(0.8); }
.helpline-box{ background:#ffe4e6; padding:20px; border-radius:12px; text-align:center; margin-top: 10px; border: 1px solid #fecdd3; }
.helpline-box img{ width:240px; margin-top:10px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
.helpline-list{ margin-top:10px; }
.helpline-list a{ display:block; color:#2563eb; margin-top:6px; text-decoration: underline; }
.mt{ margin-top:10px; }
`;