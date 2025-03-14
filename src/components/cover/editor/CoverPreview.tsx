
import CoverCanvas from "../CoverCanvas";
import { CoverData } from "../CoverTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

interface CoverPreviewProps {
  coverData: CoverData;
  isLoading?: boolean;
}

const CoverPreview = ({ coverData, isLoading = false }: CoverPreviewProps) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
        <Skeleton className="w-full max-w-xs mx-auto aspect-[5/8]" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
      <div className="book-preview-container flex items-center justify-center h-full">
        <div 
          className="max-h-full relative" 
          style={{ 
            maxWidth: isMobile ? "240px" : "200px",
            height: "auto",
            aspectRatio: "5/8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <CoverCanvas 
            coverData={coverData} 
            width={isMobile ? 240 : 200}
            height={isMobile ? 384 : 320}
            scale={2}
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default CoverPreview;
