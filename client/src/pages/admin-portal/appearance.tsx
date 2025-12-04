import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Palette,
  Sun,
  Moon,
  Monitor,
  Type,
  Layout,
  Columns,
  RefreshCw,
  Save,
  Eye,
  Languages,
  Maximize2,
  Grid,
  List,
} from "lucide-react";

export default function Appearance() {
  const [theme, setTheme] = useState("system");
  const [accentColor, setAccentColor] = useState("orange");
  const [fontSize, setFontSize] = useState([14]);
  const [saving, setSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [language, setLanguage] = useState("en");

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  const accentColors = [
    { name: "Orange", value: "orange", color: "#f97316" },
    { name: "Blue", value: "blue", color: "#3b82f6" },
    { name: "Green", value: "green", color: "#22c55e" },
    { name: "Purple", value: "purple", color: "#a855f7" },
    { name: "Red", value: "red", color: "#ef4444" },
    { name: "Cyan", value: "cyan", color: "#06b6d4" },
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="container max-w-[1800px] mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Palette className="h-8 w-8" />
              Appearance Settings
            </h1>
            <p className="text-muted-foreground">외관 설정 | Customize the look and feel of the admin portal</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-preview">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={saving} data-testid="button-save">
              {saving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Theme
              </CardTitle>
              <CardDescription>Choose your preferred color theme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={theme} onValueChange={setTheme} className="grid grid-cols-3 gap-4">
                <div>
                  <RadioGroupItem value="light" id="light" className="peer sr-only" />
                  <Label
                    htmlFor="light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Sun className="mb-3 h-6 w-6" />
                    <span className="text-sm font-medium">Light</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                  <Label
                    htmlFor="dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Moon className="mb-3 h-6 w-6" />
                    <span className="text-sm font-medium">Dark</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="system" id="system" className="peer sr-only" />
                  <Label
                    htmlFor="system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Monitor className="mb-3 h-6 w-6" />
                    <span className="text-sm font-medium">System</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Accent Color */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Accent Color
              </CardTitle>
              <CardDescription>Choose your primary accent color</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 gap-3">
                {accentColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setAccentColor(color.value)}
                    className={`w-full aspect-square rounded-lg border-2 transition-all ${
                      accentColor === color.value
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.color }}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Selected: <span className="font-medium capitalize">{accentColor}</span>
              </p>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typography
              </CardTitle>
              <CardDescription>Adjust font settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Base Font Size</Label>
                    <span className="text-sm text-muted-foreground">{fontSize[0]}px</span>
                  </div>
                  <Slider
                    value={fontSize}
                    onValueChange={setFontSize}
                    min={12}
                    max={18}
                    step={1}
                  />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select defaultValue="space-grotesk">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="space-grotesk">Space Grotesk (Default)</SelectItem>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="system">System Default</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Code Font</Label>
                  <Select defaultValue="jetbrains-mono">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jetbrains-mono">JetBrains Mono (Default)</SelectItem>
                      <SelectItem value="fira-code">Fira Code</SelectItem>
                      <SelectItem value="source-code">Source Code Pro</SelectItem>
                      <SelectItem value="monospace">System Monospace</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Layout */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Layout
              </CardTitle>
              <CardDescription>Customize the portal layout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Collapsed Sidebar</p>
                  <p className="text-sm text-muted-foreground">Show icons only in sidebar</p>
                </div>
                <Switch checked={sidebarCollapsed} onCheckedChange={setSidebarCollapsed} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Compact Mode</p>
                  <p className="text-sm text-muted-foreground">Reduce spacing between elements</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Content Width</Label>
                <Select defaultValue="full">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="narrow">Narrow (1200px)</SelectItem>
                    <SelectItem value="default">Default (1400px)</SelectItem>
                    <SelectItem value="wide">Wide (1600px)</SelectItem>
                    <SelectItem value="full">Full Width (1800px)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default View Mode</Label>
                <RadioGroup defaultValue="grid" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="grid" id="grid" />
                    <Label htmlFor="grid" className="flex items-center gap-1 cursor-pointer">
                      <Grid className="h-4 w-4" />
                      Grid
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="list" id="list" />
                    <Label htmlFor="list" className="flex items-center gap-1 cursor-pointer">
                      <List className="h-4 w-4" />
                      List
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Language
              </CardTitle>
              <CardDescription>Choose your preferred language</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={language} onValueChange={setLanguage} className="space-y-2">
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="en" id="en" />
                  <Label htmlFor="en" className="flex-1 cursor-pointer">
                    <span className="font-medium">English</span>
                    <p className="text-sm text-muted-foreground">Default language</p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value="ko" id="ko" />
                  <Label htmlFor="ko" className="flex-1 cursor-pointer">
                    <span className="font-medium">한국어 (Korean)</span>
                    <p className="text-sm text-muted-foreground">Fully supported</p>
                  </Label>
                </div>
              </RadioGroup>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Show Both Languages</p>
                  <p className="text-sm text-muted-foreground">Display Korean and English together</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize2 className="h-5 w-5" />
                Display
              </CardTitle>
              <CardDescription>Display and accessibility settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Animations</p>
                  <p className="text-sm text-muted-foreground">Enable UI animations and transitions</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reduced Motion</p>
                  <p className="text-sm text-muted-foreground">Minimize motion for accessibility</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">High Contrast</p>
                  <p className="text-sm text-muted-foreground">Increase contrast for better visibility</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Chart Animation Speed</Label>
                <Select defaultValue="normal">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="slow">Slow</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="fast">Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See how your settings look</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 border rounded-lg bg-muted/30 space-y-4">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: accentColors.find(c => c.value === accentColor)?.color }}
                >
                  <Palette className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold" style={{ fontSize: `${fontSize[0] + 4}px` }}>
                    TBURN Admin Portal
                  </h3>
                  <p className="text-muted-foreground" style={{ fontSize: `${fontSize[0]}px` }}>
                    Enterprise blockchain management system
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" style={{ backgroundColor: accentColors.find(c => c.value === accentColor)?.color }}>
                  Primary Button
                </Button>
                <Button size="sm" variant="outline">
                  Secondary Button
                </Button>
                <Button size="sm" variant="ghost">
                  Ghost Button
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
