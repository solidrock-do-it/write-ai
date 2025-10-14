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
} from "@heroui/react";
import { useArticleStore } from "../store/articleStore";
import { AIProvider } from "../types";
import { Key } from "lucide-react";

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
