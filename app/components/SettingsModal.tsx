"use client";

import React, { useState, useEffect } from "react";
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
  Tabs,
  Tab,
  Card,
  CardBody,
} from "@heroui/react";
import { useArticleStore } from "../store/articleStore";
import { AIProvider } from "../types";
import { Key, Globe, Settings } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { apiConfig, setAPIConfig } = useArticleStore();

  const [localConfig, setLocalConfig] = useState(apiConfig);

  // 当模态框打开或 apiConfig 变化时,更新本地配置
  useEffect(() => {
    if (isOpen) {
      console.log("[SettingsModal] Loading config from store:", apiConfig);
      setLocalConfig(apiConfig);
    }
  }, [isOpen, apiConfig]);

  const handleSave = () => {
    console.log("[SettingsModal] Saving config:", localConfig);
    setAPIConfig(localConfig);
    console.log("[SettingsModal] Config saved to store");
    onClose();
  };

  const providers = [
    { key: "qwen", label: "通义千问 (Qwen)" },
    { key: "gemini", label: "Google Gemini" },
    { key: "chatgpt", label: "ChatGPT (OpenAI)" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <span>AI API 设置</span>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* 选择当前使用的 AI 提供商 */}
            <Select
              label="当前使用的 AI 提供商"
              placeholder="选择一个 AI 提供商"
              selectedKeys={[localConfig.selectedProvider]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as AIProvider;
                setLocalConfig({
                  ...localConfig,
                  selectedProvider: selected,
                });
              }}
              description="选择用于生成文章的 AI 服务"
            >
              {providers.map((provider) => (
                <SelectItem key={provider.key}>{provider.label}</SelectItem>
              ))}
            </Select>
            {/* 使用 Tabs 组件分隔不同 AI 提供商的配置 */}
            <Tabs
              aria-label="AI Provider Configuration"
              color="primary"
              variant="underlined"
            >
              {/* 通义千问配置 */}
              <Tab
                key="qwen"
                title={
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    <span>通义千问</span>
                  </div>
                }
              >
                <Card>
                  <CardBody className="space-y-4">
                    <Input
                      label="API Key"
                      placeholder="sk-..."
                      value={localConfig.qwenApiKey}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          qwenApiKey: e.target.value,
                        })
                      }
                      type="password"
                      description="从阿里云 DashScope 获取 API Key"
                      startContent={<Key className="w-4 h-4 text-gray-400" />}
                    />

                    <Input
                      label="模型名称"
                      placeholder="qwen-plus"
                      value={localConfig.qwenModel}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          qwenModel: e.target.value,
                        })
                      }
                      description="支持: qwen-plus, qwen-max, qwen-turbo 等"
                    />
                  </CardBody>
                </Card>
              </Tab>

              {/* Gemini 配置 */}
              <Tab
                key="gemini"
                title={
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    <span>Google Gemini</span>
                  </div>
                }
              >
                <Card>
                  <CardBody className="space-y-4">
                    <Input
                      label="API Key"
                      placeholder="AI..."
                      value={localConfig.geminiApiKey}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          geminiApiKey: e.target.value,
                        })
                      }
                      type="password"
                      description="从 Google AI Studio 获取 API Key"
                      startContent={<Key className="w-4 h-4 text-gray-400" />}
                    />

                    <Input
                      label="模型名称"
                      placeholder="gemini-2.5-flash"
                      value={localConfig.geminiModel}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          geminiModel: e.target.value,
                        })
                      }
                      description="支持: gemini-2.5-flash, gemini-2.5-pro, gemini-2.0-flash, gemini-2.0-pro 等"
                    />
                  </CardBody>
                </Card>
              </Tab>

              {/* ChatGPT 配置 */}
              <Tab
                key="chatgpt"
                title={
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    <span>ChatGPT</span>
                  </div>
                }
              >
                <Card>
                  <CardBody className="space-y-4">
                    <Input
                      label="API Key"
                      placeholder="sk-..."
                      value={localConfig.chatgptApiKey}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          chatgptApiKey: e.target.value,
                        })
                      }
                      type="password"
                      description="从 OpenAI 平台获取 API Key"
                      startContent={<Key className="w-4 h-4 text-gray-400" />}
                    />

                    <Input
                      label="模型名称"
                      placeholder="gpt-3.5-turbo"
                      value={localConfig.chatgptModel}
                      onChange={(e) =>
                        setLocalConfig({
                          ...localConfig,
                          chatgptModel: e.target.value,
                        })
                      }
                      description="支持: gpt-3.5-turbo, gpt-4, gpt-4-turbo 等"
                    />
                  </CardBody>
                </Card>
              </Tab>

              {/* 代理设置 */}
              <Tab
                key="proxy"
                title={
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>代理设置</span>
                  </div>
                }
              >
                <Card>
                  <CardBody className="space-y-4">
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
                        <span className="text-sm font-medium">
                          启用代理服务器
                        </span>
                        <span className="text-xs text-gray-500">
                          通过代理服务器访问 AI API（适用于网络受限环境）
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
                        startContent={
                          <Globe className="w-4 h-4 text-gray-400" />
                        }
                      />
                    )}
                  </CardBody>
                </Card>
              </Tab>
            </Tabs>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            取消
          </Button>
          <Button color="primary" onPress={handleSave}>
            保存配置
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
