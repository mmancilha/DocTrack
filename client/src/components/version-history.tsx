import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { Clock, User, GitBranch, ChevronRight, Eye, GitCompare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Version } from "@shared/schema";

interface VersionHistoryProps {
  versions: Version[];
  currentVersionId?: string;
  onSelectVersion: (version: Version) => void;
  onCompareVersions: (v1: Version, v2: Version) => void;
  isComparing?: boolean;
}

export function VersionHistory({
  versions,
  currentVersionId,
  onSelectVersion,
  onCompareVersions,
  isComparing = false,
}: VersionHistoryProps) {
  const [selectedForCompare, setSelectedForCompare] = useState<Version | null>(null);

  const handleVersionClick = (version: Version) => {
    if (isComparing) {
      if (selectedForCompare) {
        if (selectedForCompare.id !== version.id) {
          onCompareVersions(selectedForCompare, version);
          setSelectedForCompare(null);
        }
      } else {
        setSelectedForCompare(version);
      }
    } else {
      onSelectVersion(version);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Version History</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {versions.length} versions
        </Badge>
      </div>

      {isComparing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 py-2 bg-primary/5 border-b text-xs text-muted-foreground"
        >
          {selectedForCompare ? (
            <span>
              Selected v{selectedForCompare.versionNumber}. Click another version to compare.
            </span>
          ) : (
            <span>Click a version to select for comparison</span>
          )}
        </motion.div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-2">
          <AnimatePresence mode="popLayout">
            {versions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <Clock className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No versions yet</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Versions are created when you save changes
                </p>
              </motion.div>
            ) : (
              <div className="space-y-1">
                {versions.map((version, index) => (
                  <VersionItem
                    key={version.id}
                    version={version}
                    isActive={version.id === currentVersionId}
                    isSelectedForCompare={selectedForCompare?.id === version.id}
                    isLatest={index === 0}
                    onClick={() => handleVersionClick(version)}
                    index={index}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}

interface VersionItemProps {
  version: Version;
  isActive: boolean;
  isSelectedForCompare: boolean;
  isLatest: boolean;
  onClick: () => void;
  index: number;
}

function VersionItem({
  version,
  isActive,
  isSelectedForCompare,
  isLatest,
  onClick,
  index,
}: VersionItemProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className={`w-full text-left p-3 rounded-md transition-colors hover-elevate ${
        isActive
          ? "bg-primary/10 border border-primary/20"
          : isSelectedForCompare
          ? "bg-accent border border-primary/30"
          : "hover:bg-accent"
      }`}
      data-testid={`version-item-${version.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-medium">v{version.versionNumber}</span>
            {isLatest && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Latest
              </Badge>
            )}
            {isSelectedForCompare && (
              <Badge className="text-[10px] px-1.5 py-0 bg-primary">
                Selected
              </Badge>
            )}
          </div>
          {version.changeDescription && (
            <p className="text-xs text-muted-foreground truncate mb-1">
              {version.changeDescription}
            </p>
          )}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {version.authorName}
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="flex items-center gap-1 cursor-default">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true })}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {format(new Date(version.createdAt), "PPpp")}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
      </div>
    </motion.button>
  );
}
