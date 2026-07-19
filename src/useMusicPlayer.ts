import { useEffect, useRef, useState } from 'react';
import type { MusicTrack } from './types';

/* A tiny shared audio controller using a singleton <audio> element.
   Used by the desktop music widget and (later) the Music app. */
let audioEl: HTMLAudioElement | null = null;
function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.loop = false;
  }
  return audioEl;
}

const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }

export function useMusicPlayer(music: MusicTrack[]) {
  const [, force] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const audioRef = useRef(getAudio());

  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => { listeners.delete(l); };
  }, []);

  const current = music[currentIdx];
  const playing = !audioRef.current.paused && !audioRef.current.ended;

  const play = (idx: number) => {
    const t = music[idx];
    if (!t) return;
    setCurrentIdx(idx);
    const a = audioRef.current;
    a.src = t.url;
    a.play().catch(() => {});
    emit();
  };
  const toggle = () => {
    const a = audioRef.current;
    if (!current) return;
    if (a.paused) {
      if (!a.src) a.src = current.url;
      a.play().catch(() => {});
    } else {
      a.pause();
    }
    emit();
  };
  const stop = () => { audioRef.current.pause(); audioRef.current.currentTime = 0; emit(); };

  useEffect(() => {
    const a = audioRef.current;
    const onEnded = () => {
      if (currentIdx < music.length - 1) play(currentIdx + 1);
      else emit();
    };
    a.addEventListener('ended', onEnded);
    return () => a.removeEventListener('ended', onEnded);
  }, [currentIdx, music.length]);

  return { current, currentIdx, playing, play, toggle, stop };
}
