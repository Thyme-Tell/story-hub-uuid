
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TextTabProps } from "../CoverTypes";
import { Check } from "lucide-react";

const TEXT_COLORS = [
  "#000000", "#333333", "#555555", "#777777", "#999999", 
  "#0F172A", "#1E293B", "#334155", "#475569", "#64748B",
  "#7F1D1D", "#991B1B", "#9A3412", "#A16207", "#15803D"
];

const TextTab = ({ 
  coverData, 
  onTextChange, 
  onTextColorChange, 
  onFontSizeChange 
}: TextTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label className="block mb-2">Title</Label>
        <Input
          value={coverData.titleText || ""}
          onChange={(e) => onTextChange(e, 'title')}
          placeholder="Book title"
          className="mb-4"
        />
        
        <div className="mb-4">
          <Label className="block mb-2">Title Color</Label>
          <div className="grid grid-cols-5 gap-2">
            {TEXT_COLORS.map((color) => (
              <button
                key={`title-${color}`}
                className={`w-full aspect-square rounded-md flex items-center justify-center border ${
                  coverData.titleColor === color 
                    ? 'border-primary' 
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onTextColorChange(color, 'title')}
              >
                {coverData.titleColor === color && (
                  <Check className="h-4 w-4 text-white" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <Label className="block mb-2">Title Size: {coverData.titleSize}px</Label>
          <Slider
            value={[coverData.titleSize || 36]}
            min={20}
            max={60}
            step={1}
            onValueChange={(value) => onFontSizeChange(value, 'title')}
          />
        </div>
      </div>
      
      <div>
        <Label className="block mb-2">Author</Label>
        <Input
          value={coverData.authorText || ""}
          onChange={(e) => onTextChange(e, 'author')}
          placeholder="Author name"
          className="mb-4"
        />
        
        <div className="mb-4">
          <Label className="block mb-2">Author Color</Label>
          <div className="grid grid-cols-5 gap-2">
            {TEXT_COLORS.map((color) => (
              <button
                key={`author-${color}`}
                className={`w-full aspect-square rounded-md flex items-center justify-center border ${
                  coverData.authorColor === color 
                    ? 'border-primary' 
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => onTextColorChange(color, 'author')}
              >
                {coverData.authorColor === color && (
                  <Check className="h-4 w-4 text-white" />
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <Label className="block mb-2">Author Size: {coverData.authorSize}px</Label>
          <Slider
            value={[coverData.authorSize || 24]}
            min={12}
            max={40}
            step={1}
            onValueChange={(value) => onFontSizeChange(value, 'author')}
          />
        </div>
      </div>
    </div>
  );
};

export default TextTab;
