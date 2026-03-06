"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import styles from "./BackgroundMusicPlayer.module.css";

type Track = {
  id: string;
  label: string;
  src: string;
};

const tracks: Track[] = [
  { id: "song-1", label: "Cepillín - Las mañanitas", src: "/music/cepillin.mp3" },
  { id: "song-2", label: "Bring me the Horizon - I don't know what to say", src: "/music/bmth.mp3" },
  { id: "song-3", label: "Babymetal - Song 3", src: "/music/song3.mp3" },
];

export default function BackgroundMusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState(tracks[0].id);
  const [volume, setVolume] = useState(0.35);
  const [statusNote, setStatusNote] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack = tracks.find((track) => track.id === currentTrackId) ?? tracks[0];
  const displayedStatus =
    statusNote || (isPlaying ? `Reproduciendo: ${currentTrack.label}` : `Seleccionada: ${currentTrack.label}`);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    const wholeSeconds = Math.floor(seconds);
    const minutes = Math.floor(wholeSeconds / 60);
    const remainingSeconds = wholeSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

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
  }, [currentTrack]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setStatusNote("Pausado");
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
      setStatusNote("");
    } catch {
      setIsPlaying(false);
      setStatusNote("No se pudo reproducir. Agrega el archivo de audio.");
    }
  };

  const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(event.target.value);
    const audio = audioRef.current;

    setCurrentTime(nextTime);

    if (!audio) {
      return;
    }

    audio.currentTime = nextTime;
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    setCurrentTime(audio.currentTime);
  };

  const handleTrackSelect = async (track: Track) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    setStatusNote("");

    if (track.id !== currentTrackId) {
      setCurrentTrackId(track.id);
      setCurrentTime(0);
      setDuration(0);
      audio.src = track.src;
      audio.load();
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      setStatusNote("No se pudo reproducir. Agrega el archivo de audio.");
    }
  };

  return (
    <div className={styles.musicPlayerShell}>
      <audio
        ref={audioRef}
        preload="auto"
        loop
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onError={() => setStatusNote("Archivo no encontrado. Agrega la canción en public/music.")}
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
              onClick={() => void handleTrackSelect(track)}
            >
              {track.label}
            </button>
          ))}
        </div>

        <label className={styles.musicVolumeLabel}>
          Progreso
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={handleSeek}
            disabled={!duration}
          />
          <span className={styles.musicTimeStamp}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </label>

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

        <p className={styles.musicStatus}>{displayedStatus}</p>
      </div>
    </div>
  );
}
