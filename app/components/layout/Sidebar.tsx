import React from "react";
import {
  Sparkles,
  Settings,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
} from "lucide-react";
import { Button, Tooltip } from "@heroui/react";
import { HistoryItem as HistoryItemType } from "@/app/types";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
  onNew: () => void;
  historyItems: HistoryItemType[];
  onHistoryItemClick: (id: string) => void;
  onHistoryItemDelete: (id: string) => void;
}

export function Sidebar({
  isOpen,
  onToggle,
  onOpenSettings,
  onNew,
  historyItems,
  onHistoryItemClick,
  onHistoryItemDelete,
}: SidebarProps) {
  return (
    <div
      className={`${
        isOpen ? "w-56" : "w-15"
      } bg-white border-r border-t border-gray-200 shadow-lg transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-10`}
    >
      {/* Logo 区域 */}
      <div className="p-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div className="min-w-[132px]">
              <h1 className="text-sm font-bold text-gray-900">WriteAI</h1>
              <p className="text-xs text-purple-600">智能创作，提升写作效率</p>
            </div>
          )}
        </div>
      </div>

      {/* 新建按钮 */}
      <div className="border-b border-gray-200 flex-shrink-0">
        <Button
          onPress={onNew}
          variant="light"
          size="md"
          isIconOnly={!isOpen}
          className="text-default/75 w-full"
          radius="none"
          color="secondary"
        >
          <Plus size="16" />
          {isOpen && <span>新建</span>}
        </Button>
      </div>

      {/* 历史记录 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div>
          {isOpen && historyItems.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-4">
              暂无记录
            </div>
          ) : (
            <div className="space-y-0">
              {historyItems.map((item) => (
                <Tooltip
                  key={item.id}
                  placement="right"
                  showArrow
                  offset={10}
                  content={
                    <div className="p-2 max-w-xs">
                      <div className="text-xs font-semibold mb-1 text-gray-900">
                        {item.generatedData.titles[0]?.title || item.keywords}
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-4 mb-2">
                        {item.generatedData.content
                          .substring(0, 200)
                          .replace(/[#*]/g, "")
                          .trim()}
                        ...
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {item.generatedData.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  }
                >
                  {isOpen ? (
                    <div
                      className="group relative px-2 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => onHistoryItemClick(item.id)}
                    >
                      <div className="flex items-center justify-center gap-2 relative">
                        <Clock size={16} />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-900 truncate">
                            {item.generatedData.titles[0]?.title ||
                              item.keywords}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onHistoryItemDelete(item.id);
                          }}
                          className="absolute right-0 my-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                        >
                          <X className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => onHistoryItemClick(item.id)}
                      className="p-1 h-12 hover:bg-gray-100 text-xs cursor-pointer flex justify-center items-center"
                    >
                      <span className="line-clamp-2">
                        {item.generatedData.tags
                          .slice(0, 2)
                          .map((tag) => `${tag}`)}
                      </span>
                    </div>
                  )}
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 设置按钮 */}
      <div className="border-t border-gray-200 flex-shrink-0">
        <Button
          onPress={onOpenSettings}
          variant="light"
          size="md"
          isIconOnly={!isOpen}
          className="text-default/75 w-full"
          radius="none"
          color="secondary"
        >
          <Settings size="16" />
          {isOpen && <span>设置</span>}
        </Button>
      </div>

      {/* 收起/展开按钮 */}
      <div className="border-t border-gray-200 flex-shrink-0">
        <Button
          onPress={onToggle}
          variant="light"
          size="md"
          isIconOnly={!isOpen}
          radius="none"
          color="secondary"
          className="text-default/75 w-full"
        >
          {isOpen ? (
            <>
              <ChevronLeft size="16" />
              <span>收起</span>
            </>
          ) : (
            <ChevronRight size="16" />
          )}
        </Button>
      </div>
    </div>
  );
}
