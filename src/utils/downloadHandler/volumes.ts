import { DownloadSetHandler } from "./DownloadSet";
import { OngoingDownload } from "./types";

const handleVolumesDownload = async (
  downloadSet: DownloadSetHandler,
  manga: string,
  start: number,
  end: number,
  compression: boolean,
  deleteAfterCompression: boolean
): Promise<void> => {
  const { downloader } = downloadSet;
  const download: OngoingDownload = {
    fullname: `${manga} volume ${start} à ${end}`,
    chapter: "chargement...",
    volume: "chargement...",
    current: 0,
    total: 0,
    percent: 0,
  };

  let nbChapters = 0;
  let currentChapter = 0;
  downloadSet.setCurrentDownload(download);
  await downloader.downloadVolumes(manga, start, end, {
    compression,
    deleteAfterCompression,
    callback: (events) => {
      events.on("start", (manga, start, end, total) => {
        download.total = total;
        downloadSet.setCurrentDownload(download);
      });
      events.on("startvolume", (manga, volume, volumeindex, total) => {
        download.volume = `volume ${volume}`;
        download.current = volumeindex;
        download.total = total;
        downloadSet.setCurrentDownload(download);
      });
      events.on("chapters", (volNumber, volIndex, chapters) => {
        nbChapters = chapters.length;
      });

      events.on("startchapter", (attributes, pages, current, total) => {
        download.chapter = attributes.chapter;
        currentChapter = current;
        nbChapters = total;
        downloadSet.setCurrentDownload(download);
      });
      /* events.on("noimage", (attributes, link) => {
        });
      }); */
      events.on("page", (attributes, total) => {

        const volumePortion = 100 / download.total;
        const chapterPortion = volumePortion / nbChapters;
        const pagePortion = chapterPortion / total;

        download.percent =
          (download.current - 1) * volumePortion +
          chapterPortion * (currentChapter - 1) +
          pagePortion * +attributes.page;

        console.log(attributes, total);
        downloadSet.setCurrentDownload(download);
      });
      /* if (compression) {
        events.on("compressing", () => {
        });
        events.on("compressed", (attributes, path, stats) => {
        });
      } */
      events.on("done", () => {
        downloadSet.clearCurrentDownload();
      });
    },
  });
};

export default handleVolumesDownload;
