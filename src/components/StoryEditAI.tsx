
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { EditOption, useStoryEdit } from '@/hooks/useStoryEdit';
import { Loader2 } from "lucide-react";

interface StoryEditAIProps {
  content: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
}

const TONE_OPTIONS = [
  'formal', 'casual', 'humorous', 'serious', 
  'optimistic', 'dramatic', 'suspenseful'
];

const StoryEditAI = ({ content, onSave, onCancel }: StoryEditAIProps) => {
  const [selectedOptions, setSelectedOptions] = useState<EditOption[]>([]);
  const [toneStyle, setToneStyle] = useState<string>('');
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { editStory, isLoading, error } = useStoryEdit();
  const { toast } = useToast();

  const handleOptionToggle = (option: EditOption) => {
    setSelectedOptions(prev => 
      prev.includes(option)
        ? prev.filter(o => o !== option)
        : [...prev, option]
    );
  };

  const handlePreview = async () => {
    if (selectedOptions.length === 0) {
      toast({
        title: "No options selected",
        description: "Please select at least one editing option.",
        variant: "destructive",
      });
      return;
    }

    const editedText = await editStory({
      text: content,
      options: selectedOptions,
      toneStyle: selectedOptions.includes('tone') ? toneStyle : undefined,
    });

    if (editedText) {
      setPreviewContent(editedText);
      setIsEditing(false);
    } else {
      toast({
        title: "Error",
        description: error || "Failed to generate preview",
        variant: "destructive",
      });
    }
  };

  const handleApply = () => {
    if (previewContent) {
      onSave(previewContent);
    }
  };

  const handleEditPreview = () => {
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="shorten"
              checked={selectedOptions.includes('shorten')}
              onCheckedChange={() => handleOptionToggle('shorten')}
            />
            <Label htmlFor="shorten">Shorten</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="expand"
              checked={selectedOptions.includes('expand')}
              onCheckedChange={() => handleOptionToggle('expand')}
            />
            <Label htmlFor="expand">Expand</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="clarity"
              checked={selectedOptions.includes('clarity')}
              onCheckedChange={() => handleOptionToggle('clarity')}
            />
            <Label htmlFor="clarity">Improve Clarity</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="grammar"
              checked={selectedOptions.includes('grammar')}
              onCheckedChange={() => handleOptionToggle('grammar')}
            />
            <Label htmlFor="grammar">Fix Grammar</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="tone"
              checked={selectedOptions.includes('tone')}
              onCheckedChange={() => handleOptionToggle('tone')}
            />
            <Label htmlFor="tone">Change Tone</Label>
          </div>
        </div>

        {selectedOptions.includes('tone') && (
          <Select value={toneStyle} onValueChange={setToneStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Select tone style" />
            </SelectTrigger>
            <SelectContent>
              {TONE_OPTIONS.map(tone => (
                <SelectItem key={tone} value={tone}>
                  {tone.charAt(0).toUpperCase() + tone.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="border p-4 rounded-md space-y-2">
            <Label>Original:</Label>
            <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md h-[300px] overflow-y-auto">
              {content}
            </div>
          </div>
          
          <div className="border p-4 rounded-md space-y-2">
            <div className="flex justify-between items-center mb-2">
              <Label>Preview:</Label>
              {previewContent && !isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditPreview}
                >
                  Edit
                </Button>
              )}
            </div>
            {isEditing && previewContent ? (
              <Textarea
                value={previewContent}
                onChange={(e) => setPreviewContent(e.target.value)}
                className="h-[300px] resize-none"
              />
            ) : (
              <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-md h-[300px] overflow-y-auto">
                {previewContent || "No preview generated yet"}
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handlePreview}
            disabled={isLoading || selectedOptions.length === 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Preview Changes
          </Button>
          <Button
            onClick={handleApply}
            disabled={!previewContent || isLoading}
            variant="secondary"
          >
            Apply Changes
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoryEditAI;
