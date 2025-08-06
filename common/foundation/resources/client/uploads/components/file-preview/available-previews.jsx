import { ImageFilePreview } from './file-preview/image-file-preview';
import { DefaultFilePreview } from './file-preview/default-file-preview';
import { TextFilePreview } from './file-preview/text-file-preview';
import { VideoFilePreview } from './file-preview/video-file-preview';
import { AudioFilePreview } from './file-preview/audio-file-preview';
import { PdfFilePreview } from './file-preview/pdf-file-preview';
import { WordDocumentFilePreview } from './file-preview/word-document-file-preview';
export const AvailablePreviews = {
  text: TextFilePreview,
  video: VideoFilePreview,
  audio: AudioFilePreview,
  image: ImageFilePreview,
  pdf: PdfFilePreview,
  spreadsheet: WordDocumentFilePreview,
  powerPoint: WordDocumentFilePreview,
  word: WordDocumentFilePreview,
  'text/rtf': DefaultFilePreview
};
export function getPreviewForEntry(entry) {
  const mime = entry?.mime;
  const type = entry?.type;
  return AvailablePreviews[mime] || AvailablePreviews[type] || DefaultFilePreview;
}