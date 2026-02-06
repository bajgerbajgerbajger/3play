import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Save, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { RichTextEditor } from '../components/RichTextEditor';

export function VideoEditor() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const onDropVideo = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setVideoFile(acceptedFiles[0]);
  }, []);

  const onDropThumbnail = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) setThumbnail(acceptedFiles[0]);
  }, []);

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } = useDropzone({
    onDrop: onDropVideo,
    accept: { 'video/*': [] },
    maxFiles: 1
  });

  const { getRootProps: getThumbnailRootProps, getInputProps: getThumbnailInputProps } = useDropzone({
    onDrop: onDropThumbnail,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nahrát video</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Náhled
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4" />
            Publikovat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Název videa</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Zadejte název videa..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Popis</label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Popište své video..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Miniatura</label>
            <div 
              {...getThumbnailRootProps()} 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <input {...getThumbnailInputProps()} />
              {thumbnail ? (
                <div className="relative aspect-video max-h-40 mx-auto">
                  <img 
                    src={URL.createObjectURL(thumbnail)} 
                    alt="Thumbnail preview" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setThumbnail(null); }}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Upload className="h-8 w-8" />
                  <p>Přetáhněte obrázek sem nebo klikněte pro výběr</p>
                  <p className="text-xs">Doporučeno: 1280x720 (16:9)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Video Upload & Settings */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <h3 className="font-semibold mb-3">Soubor videa</h3>
            <div 
              {...getVideoRootProps()} 
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <input {...getVideoInputProps()} />
              {videoFile ? (
                <div className="space-y-2">
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">Video načteno</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate max-w-[150px]">{videoFile.name}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500 py-4">
                  <Upload className="h-6 w-6" />
                  <p className="text-sm">Vybrat video soubor</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
            <h3 className="font-semibold">Nastavení</h3>
            
            <div className="space-y-2">
              <label className="text-sm text-gray-600">Viditelnost</label>
              <select className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="public">Veřejné</option>
                <option value="unlisted">Neveřejné</option>
                <option value="private">Soukromé</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-gray-600">Kategorie</label>
              <select className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">Vyberte kategorii...</option>
                <option value="gaming">Hry</option>
                <option value="music">Hudba</option>
                <option value="education">Vzdělávání</option>
                <option value="tech">Technologie</option>
                <option value="entertainment">Zábava</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
