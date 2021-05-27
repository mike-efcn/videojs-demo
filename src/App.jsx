import React, { useCallback, useEffect, useRef, useState } from 'react';
import vjs from 'video.js';
import styles from './App.module.less';

const mp4 = 'https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4';

const download = (url) => new Promise((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.onload = () => {
      if (xhr.status === 200) {
          console.debug('downloaded')
          resolve(xhr.response);
      } else {
          reject(Error(xhr.statusText));
      }
  };
  xhr.onerror = reject;
  xhr.onabort = reject;
  xhr.open('GET', url, true);
  xhr.responseType = 'blob';
  xhr.send();
});

const MediaType = {
  mp4: 'mp4',
  m3u8: 'm3u8'
};

const MimetypesKind = {
  [MediaType.mp4]: 'video/mp4',
  [MediaType.m3u8]: 'application/x-mpegURL'
};

const App = () => {
  const [url, setUrl] = useState(mp4);
  const [mediaType, setMediaType] = useState(MediaType.mp4);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  /**
   * @type {React.MutableRefObject<HTMLDivElement>}
   */
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  /**
   * @type {React.MutableRefObject<vjs.Player>}
   */
  const vjsRef = useRef(null);

  const selectChange = useCallback((e) => {
    setMediaType(e.target.value);
  }, [setMediaType]);
  const inputChange = useCallback((e) => {
    setUrl(e.target.value);
  }, [setUrl]);

  const progressClick = useCallback((e) => {
    const player = vjsRef.current;
    if (!player) {
      return;
    }

    const rect = e.target.getBoundingClientRect();
    const newProgress = (e.clientX - rect.x) / rect.width;
    player.currentTime(player.duration() * newProgress);
    if (player.paused()) {
      player.play();
    }
  }, []);

  const play = useCallback(async () => {
    if (!vjsRef.current) {
      return;
    }

    return download(url)
      .then((blob) => new Promise((resolve, reject) => {
        const player = vjsRef.current;
        if (!player) {
          reject(Error('no player'));
          return;
        }

        player.one('loadeddata', () => {
          console.debug('loaded')
          resolve();
        });

        player.src({
          src: URL.createObjectURL(blob),
          type: MimetypesKind[mediaType]
        })
      }))
      .then(() => {
        setDuration(Math.round(vjsRef.current.duration()));
        setProgress(0);
        console.debug('play')
        vjsRef.current.play();
      });
  }, [url, setDuration, setProgress]);

  const pause = useCallback(() => {
    const player = vjsRef.current;
    if (!player) {
      return;
    }

    if (player.paused()) {
      player.play();
    } else {
      player.pause();
    }
  }, []);

  useEffect(() => {
    const el = document.createElement('video');
    el.width = '320';
    el.height = '240';
    videoRef.current = el;

    const player = vjs(videoRef.current, { controls: false, children: [] });
    containerRef.current.appendChild(videoRef.current);
    player.on('error', console.error);
    player.width(320);
    player.height(240);
    vjsRef.current = player;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const player = vjsRef.current;
      if (!player) {
        return;
      }

      setProgress(player.currentTime() / player.duration());
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const player = vjsRef.current;
    if (!player) {
      return;
    }

    const actual = player.currentTime();
    const expect = progress * duration;
    console.debug(actual, expect);

  }, [progress, duration]);

  return (
    <div className={styles.App}>
      <div ref={containerRef} className={styles.player}></div>
      <div className={styles.seek} onClick={progressClick}>
        <div className={styles.progress} style={{ width: `${progress * 100}%`}}></div>
      </div>
      <div className={styles.url}>
        <input value={url} onChange={inputChange}></input>
      </div>
      <select value={mediaType} onChange={selectChange}>
        <option value={MediaType.mp4}>{MediaType.mp4}</option>
        <option value={MediaType.m3u8} disabled>{MediaType.m3u8}</option>
      </select>
      <button className={styles.play} onClick={play}>Play</button>
      <button className={styles.pause} onClick={pause}>Toggle Pause</button>
    </div>
  );
};

export default App;
