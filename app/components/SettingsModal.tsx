"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Switch,
  Divider,
} from "@heroui/react";
import { useArticleStore } from "../store/articleStore";
import { AIProvider } from "../types";
import { Key, Globe } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { apiConfig, setAPIConfig } = useArticleStore();

  const [localConfig, setLocalConfig] = useState(apiConfig);

  const handleSave = () => {
    setAPIConfig(localConfig);
    onClose();
  };

  const providers = [
    { key: "qwen", label: "通义千问 (Qwen)" },
    { key: "gemini", label: "Google Gemini" },
    { key: "chatgpt", label: "ChatGPT (OpenAI)" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            <span>AI API 设置</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Select
              label="选择 AI 提供商"
              placeholder="选择一个 AI 提供商"
              selectedKeys={[localConfig.selectedProvider]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as AIProvider;
                setLocalConfig({
                  ...localConfig,
                  selectedProvider: selected,
                });
              }}
            >
              {providers.map((provider) => (
                <SelectItem key={provider.key}>{provider.label}</SelectItem>
              ))}
            </Select>

            <Input
              label="通义千问 API Key"
              placeholder="sk-..."
              value={localConfig.qwenApiKey}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  qwenApiKey: e.target.value,
                })
              }
              type="password"
              description="从阿里云获取 API Key"
            />

            <Input
              label="Gemini API Key"
              placeholder="AI..."
              value={localConfig.geminiApiKey}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  geminiApiKey: e.target.value,
                })
              }
              type="password"
              description="从 Google AI Studio 获取"
            />

            <Input
              label="ChatGPT API Key"
              placeholder="sk-..."
              value={localConfig.chatgptApiKey}
              onChange={(e) =>
                setLocalConfig({
                  ...localConfig,
                  chatgptApiKey: e.target.value,
                })
              }
              type="password"
              description="从 OpenAI 获取 API Key"
            />

            <Divider className="my-4" />

            {/* 代理设置 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                代理服务器设置
              </h3>

              <div className="space-y-3">
                <Switch
                  isSelected={localConfig.proxyEnabled}
                  onValueChange={(checked) =>
                    setLocalConfig({
                      ...localConfig,
                      proxyEnabled: checked,
                    })
                  }
                >
                  <div className="flex flex-col">
                    <span className="text-sm">启用代理服务器</span>
                    <span className="text-xs text-gray-500">
                      通过代理服务器访问 AI API
                    </span>
                  </div>
                </Switch>

                {localConfig.proxyEnabled && (
                  <Input
                    label="代理服务器地址"
                    placeholder="http://localhost:7890 或 https://your-proxy.com"
                    value={localConfig.proxyUrl}
                    onChange={(e) =>
                      setLocalConfig({
                        ...localConfig,
                        proxyUrl: e.target.value,
                      })
                    }
                    description="输入完整的代理服务器 URL（包含 http:// 或 https://）"
                  />
                )}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={handleSave}>
            保存
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
