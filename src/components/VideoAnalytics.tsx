import { BarChart, Eye, ThumbsUp, Share2, Users } from 'lucide-react';

interface VideoAnalyticsProps {
  videoId: string;
  views: number;
  likes: number;
  shares: number;
}

export function VideoAnalytics({ views, likes, shares }: VideoAnalyticsProps) {
  const engagementRate = ((likes + shares) / views * 100).toFixed(1);
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">Analytika videa</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Eye className="h-4 w-4" />
            Zhlédnutí
          </div>
          <p className="text-lg font-bold text-gray-900">
            {new Intl.NumberFormat('cs-CZ').format(views)}
          </p>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <ThumbsUp className="h-4 w-4" />
            Líbí se
          </div>
          <p className="text-lg font-bold text-gray-900">
            {new Intl.NumberFormat('cs-CZ').format(likes)}
          </p>
        </div>

        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Share2 className="h-4 w-4" />
            Sdílení
          </div>
          <p className="text-lg font-bold text-gray-900">
            {new Intl.NumberFormat('cs-CZ').format(shares)}
          </p>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
            <Users className="h-4 w-4" />
            Míra zapojení
          </div>
          <p className="text-lg font-bold text-blue-700">
            {engagementRate}%
          </p>
        </div>
      </div>
    </div>
  );
}
