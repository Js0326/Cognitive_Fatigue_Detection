import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure system preferences and monitoring settings</p>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-6">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="monitoring">Monitoring Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Configuration</CardTitle>
              <CardDescription>Configure which activities are monitored by the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="keyboard-monitoring">Keyboard Monitoring</Label>
                    <p className="text-sm text-muted-foreground">Track typing speed, errors, and patterns</p>
                  </div>
                  <Switch id="keyboard-monitoring" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="mouse-monitoring">Mouse Monitoring</Label>
                    <p className="text-sm text-muted-foreground">Track mouse movement, clicks, and patterns</p>
                  </div>
                  <Switch id="mouse-monitoring" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="app-monitoring">Application Usage</Label>
                    <p className="text-sm text-muted-foreground">Track which applications you use and for how long</p>
                  </div>
                  <Switch id="app-monitoring" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="eye-tracking">Eye Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Monitor eye movements, blink rate, and fixation time
                    </p>
                  </div>
                  <Switch id="eye-tracking" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Preferences</CardTitle>
              <CardDescription>Configure how and when fatigue tests are administered</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="test-frequency">Test Frequency</Label>
                <Select>
                  <SelectTrigger id="test-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">Every 2 hours</SelectItem>
                    <SelectItem value="4">Every 4 hours</SelectItem>
                    <SelectItem value="6">Every 6 hours</SelectItem>
                    <SelectItem value="8">Every 8 hours</SelectItem>
                    <SelectItem value="manual">Manual only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="test-duration">Test Duration</Label>
                <Select>
                  <SelectTrigger id="test-duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (2-3 minutes)</SelectItem>
                    <SelectItem value="medium">Medium (4-5 minutes)</SelectItem>
                    <SelectItem value="long">Long (6-8 minutes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="auto-test" />
                <Label htmlFor="auto-test">Automatically suggest tests when fatigue is detected</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when you receive fatigue alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts on your desktop when fatigue is detected
                    </p>
                  </div>
                  <Switch id="desktop-notifications" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive daily or weekly fatigue reports via email</p>
                  </div>
                  <Switch id="email-notifications" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="break-reminders">Break Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded to take breaks when fatigue is detected
                    </p>
                  </div>
                  <Switch id="break-reminders" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alert-threshold">Alert Threshold</Label>
                <Select>
                  <SelectTrigger id="alert-threshold">
                    <SelectValue placeholder="Select threshold" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Alert early)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="high">High (Alert only when severe)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control how your data is collected, stored, and used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-collection">Data Collection</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow the system to collect and analyze your activity data
                    </p>
                  </div>
                  <Switch id="data-collection" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-retention">Data Retention</Label>
                    <p className="text-sm text-muted-foreground">
                      How long your data is stored before being automatically deleted
                    </p>
                  </div>
                  <Select>
                    <SelectTrigger id="data-retention" className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="anonymized-data">Anonymized Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">Share anonymized data to improve the system</p>
                  </div>
                  <Switch id="anonymized-data" />
                </div>
              </div>
              <Button variant="destructive">Delete All My Data</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="justify-start">
                      <span className="h-4 w-4 rounded-full bg-background mr-2 border"></span>
                      Light
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <span className="h-4 w-4 rounded-full bg-slate-950 mr-2 border"></span>
                      Dark
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <span className="h-4 w-4 rounded-full bg-background mr-2 border border-slate-950/50"></span>
                      System
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="animations">Animations</Label>
                    <p className="text-sm text-muted-foreground">Enable or disable UI animations</p>
                  </div>
                  <Switch id="animations" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compact-mode">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Use a more compact UI layout</p>
                  </div>
                  <Switch id="compact-mode" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/profile">Go to Profile</Link>
        </Button>
        <Button>Save All Settings</Button>
      </div>
    </div>
  )
}

