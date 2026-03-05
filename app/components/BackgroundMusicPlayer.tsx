"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./BackgroundMusicPlayer.module.css";

type Track = {
  id: string;
  label: string;
  src: string;
};

const tracks: Track[] = [
  { id: "song-1", label: "Canción 1", src: "/music/cancion-1.mp3" },
  { id: "song-2", label: "Canción 2", src: "/music/cancion-2.mp3" },
  { id: "song-3", label: "Canción 3", src: "/music/cancion-3.mp3" },
];

export default function BackgroundMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState(tracks[0].id);
  const [volume, setVolume] = useState(0.35);
  const [status, setStatus] = useState("Listo para reproducir");

  const currentTrack = tracks.find((track) => track.id === currentTrackId) ?? tracks[0];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = currentTrack.src;
    audio.load();

    if (isPlaying) {
      void audio
        .play()
        .then(() => {
          setStatus(`Reproduciendo: ${currentTrack.label}`);
        })
        .catch(() => {
          setIsPlaying(false);
          setStatus("No se pudo reproducir. Agrega el archivo de audio.");
        });
    } else {
      setStatus(`Seleccionada: ${currentTrack.label}`);
    }
  }, [currentTrack, isPlaying]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setStatus("Pausado");
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
      setStatus(`Reproduciendo: ${currentTrack.label}`);
    } catch {
      setIsPlaying(false);
      setStatus("No se pudo reproducir. Agrega el archivo de audio.");
    }
  };

  return (
    <div className={styles.musicPlayerShell}>
      <audio
        ref={audioRef}
        preload="auto"
        loop
        onError={() => setStatus("Archivo no encontrado. Agrega la canción en public/music.")}
      />

      <button
        type="button"
        className={styles.musicPlayerToggle}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        Música {isExpanded ? "▾" : "▸"}
      </button>

      <div className={`${styles.musicPlayerPanel} ${isExpanded ? styles.open : ""}`}>
        <div className={styles.musicPlayerRow}>
          <button type="button" className={styles.musicMainButton} onClick={togglePlayback}>
            {isPlaying ? "Pausar" : "Reproducir"}
          </button>
        </div>

        <div className={styles.musicTrackList}>
          {tracks.map((track) => (
            <button
              key={track.id}
              type="button"
              className={`${styles.musicTrackItem} ${track.id === currentTrackId ? styles.active : ""}`}
              onClick={() => setCurrentTrackId(track.id)}
            >
              {track.label}
            </button>
          ))}
        </div>

        <label className={styles.musicVolumeLabel}>
          Volumen
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </label>

        <p className={styles.musicStatus}>{status}</p>
      </div>
    </div>
  );
}
