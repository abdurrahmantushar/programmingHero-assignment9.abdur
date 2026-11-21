
"use client";

import { useEffect, useState } from "react"; import {
    Settings,
    Store,
    Bell,
    ShieldCheck,
    Globe,
    Mail,
    Phone,
    Save,
    RefreshCw,
    ImagePlus,
    Users,
    UtensilsCrossed,
    ShoppingBag,
    CreditCard,
    Lock,
    Eye,
    EyeOff,
    CheckCircle2,
} from "lucide-react";

type ToggleProps = {
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
};

function SettingToggle({
    title,
    description,
    checked,
    onChange,
}: ToggleProps) {
    return (
        <div className="flex items-center justify-between gap-4 py-4">
            <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                    {description}
                </p>
            </div>

            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-green-600" : "bg-gray-300"
                    }`}
                aria-pressed={checked}
            >
                <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-[22px]" : "left-0.5"
                        }`}
                />
            </button>
        </div>
    );
}

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const [platformName, setPlatformName] = useState("PizzaHub");
    const [supportEmail, setSupportEmail] = useState("support@pizzahub.com");
    const [phone, setPhone] = useState("+880 1234-567890");
    const [description, setDescription] = useState(
        "Your favorite place to order delicious pizza."
    );
    const [maintenance, setMaintenance] = useState(false);
    const [registration, setRegistration] = useState(true);
    const [menuApproval, setMenuApproval] = useState(true);
    const [newUserNotification, setNewUserNotification] = useState(true);
    const [orderNotification, setOrderNotification] = useState(true);
    const [subscriptionNotification, setSubscriptionNotification] = useState(true);
    const [emailNotification, setEmailNotification] = useState(true);
    const [twoFactor, setTwoFactor] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [saved, setSaved] = useState(false);
    const [websiteUrl, setWebsiteUrl] = useState("https://pizzahub.com");
    const [language, setLanguage] = useState("English");
    const [timeZone, setTimeZone] = useState("Asia/Dhaka");
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settingsError, setSettingsError] = useState("");
    const tabs = [
        { id: "general", label: "General", icon: Settings },
        { id: "platform", label: "Platform", icon: Globe },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "security", label: "Security", icon: ShieldCheck },
    ];
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setSettingsLoading(true);
                setSettingsError("");

                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`,
                    { cache: "no-store" }
                );

                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || "Failed to load settings");
                }

                const data = result.data;

                setPlatformName(data.platformName || "PizzaHub");
                setSupportEmail(data.supportEmail || "");
                setPhone(data.phone || "");
                setWebsiteUrl(data.websiteUrl || "");
                setDescription(data.description || "");
                setLanguage(data.language || "English");
                setTimeZone(data.timeZone || "Asia/Dhaka");

                setMaintenance(data.maintenanceMode ?? false);
                setRegistration(data.allowRegistration ?? true);
                setMenuApproval(data.requireMenuApproval ?? true);

                setNewUserNotification(data.notifications?.newUser ?? true);
                setOrderNotification(data.notifications?.newOrder ?? true);
                setSubscriptionNotification(data.notifications?.subscription ?? true);
                setEmailNotification(data.notifications?.email ?? true);
            } catch (error) {
                setSettingsError(
                    error instanceof Error ? error.message : "Failed to load settings"
                );
            } finally {
                setSettingsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            setSaving(true);
            setSaved(false);
            setSettingsError("");

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        platformName,
                        supportEmail,
                        phone,
                        websiteUrl,
                        description,
                        language,
                        timeZone,
                        maintenanceMode: maintenance,
                        allowRegistration: registration,
                        requireMenuApproval: menuApproval,
                        notifications: {
                            newUser: newUserNotification,
                            newOrder: orderNotification,
                            subscription: subscriptionNotification,
                            email: emailNotification,
                        },
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to save settings");
            }

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            setSettingsError(
                error instanceof Error ? error.message : "Failed to save settings"
            );
        } finally {
            setSaving(false);
        }
    };

    return (

        <div className="min-h-screen space-y-6 pb-10">
            {settingsError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {settingsError}
                </div>
            )}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Settings size={15} />
                        <span>Admin</span>
                        <span>/</span>
                        <span className="text-green-600">Settings</span>
                    </div>

                    <h1 className="mt-2 text-2xl font-bold text-gray-900">
                        Settings
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage your PizzaHub platform preferences and configurations.
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                >
                    <Save size={17} />
                    Save Changes
                </button>
            </div>

            {saved && (
                <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle2 size={18} />
                    Preview updated. Backend saving is not connected yet.
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr]">
                <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                    <p className="px-3 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                        Settings Menu
                    </p>

                    <div className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active
                                        ? "bg-green-50 text-green-700"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-5 rounded-xl bg-gray-50 p-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-700">
                            <ShieldCheck size={19} />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-gray-800">
                            Admin Control
                        </p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                            Configure your platform settings from one place.
                        </p>
                    </div>
                </aside>

                <div className="min-w-0 space-y-6">
                    {activeTab === "general" && (
                        <>
                            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                                <div className="mb-6">
                                    <h2 className="font-bold text-gray-900">Platform Information</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Basic information about your platform.
                                    </p>
                                </div>

                                <div className="mb-6 flex flex-col gap-4 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                                        <UtensilsCrossed size={30} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">Platform Logo</p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Upload your platform logo.
                                        </p>
                                    </div>
                                    <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        <ImagePlus size={16} />
                                        Upload Logo
                                    </button>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Platform Name
                                        </label>
                                        <input
                                            value={platformName}
                                            onChange={(e) => setPlatformName(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Support Email
                                        </label>
                                        <div className="relative">
                                            <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="email"
                                                value={supportEmail}
                                                onChange={(e) => setSupportEmail(e.target.value)}
                                                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Contact Number
                                        </label>
                                        <div className="relative">
                                            <Phone size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Website URL
                                        </label>
                                        <div className="relative">
                                            <Globe size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                value={websiteUrl}
                                                onChange={(e) => setWebsiteUrl(e.target.value)}
                                                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Platform Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                    />
                                </div>
                            </section>

                            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                                <h2 className="font-bold text-gray-900">Regional Preferences</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Configure your platform's regional preferences.
                                </p>

                                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Language
                                        </label>
                                        <select
                                            value={language}
                                            onChange={(e) => setLanguage(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
                                        >
                                            <option>English</option>
                                            <option>বাংলা</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">
                                            Time Zone
                                        </label>
                                        <select
                                            value={timeZone}
                                            onChange={(e) => setTimeZone(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-green-500"
                                        >
                                            <option value="Asia/Dhaka">Asia/Dhaka (GMT +6)</option>
                                            <option value="UTC">UTC</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                    {activeTab === "platform" && (
                        <>
                            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                                <h2 className="font-bold text-gray-900">Platform Controls</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Control how users interact with PizzaHub.
                                </p>

                                <div className="mt-4 divide-y divide-gray-100">
                                    <SettingToggle
                                        title="Maintenance Mode"
                                        description="Temporarily disable public access to the platform."
                                        checked={maintenance}
                                        onChange={setMaintenance}
                                    />
                                    <SettingToggle
                                        title="Allow New Registrations"
                                        description="Allow new customers and vendors to create accounts."
                                        checked={registration}
                                        onChange={setRegistration}
                                    />
                                    <SettingToggle
                                        title="Require Menu Approval"
                                        description="Require admin approval before menu items are published."
                                        checked={menuApproval}
                                        onChange={setMenuApproval}
                                    />
                                </div>
                            </section>

                            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                                <h2 className="font-bold text-gray-900">Platform Overview</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Manage the main platform modules.
                                </p>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    {[
                                        { icon: Users, title: "User Management", detail: "Manage customers and vendors" },
                                        { icon: UtensilsCrossed, title: "Menu Management", detail: "Review and manage menu items" },
                                        { icon: ShoppingBag, title: "Order Management", detail: "Monitor customer orders" },
                                        { icon: CreditCard, title: "Subscription Management", detail: "Manage premium subscriptions" },
                                    ].map((item) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.title} className="flex items-center gap-3 rounded-xl border border-gray-100 p-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-700">
                                                    <Icon size={19} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                                                    <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        </>
                    )}

                    {activeTab === "notifications" && (
                        <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                            <div className="mb-5">
                                <h2 className="font-bold text-gray-900">Notification Preferences</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Choose which platform activities should trigger notifications.
                                </p>
                            </div>

                            <div className="divide-y divide-gray-100">
                                <SettingToggle
                                    title="New User Registration"
                                    description="Get notified when a new customer or vendor registers."
                                    checked={newUserNotification}
                                    onChange={setNewUserNotification}
                                />
                                <SettingToggle
                                    title="New Customer Orders"
                                    description="Get notified when customers place new orders."
                                    checked={orderNotification}
                                    onChange={setOrderNotification}
                                />
                                <SettingToggle
                                    title="Premium Subscription"
                                    description="Get notified when a vendor purchases a premium subscription."
                                    checked={subscriptionNotification}
                                    onChange={setSubscriptionNotification}
                                />
                                <SettingToggle
                                    title="Email Notifications"
                                    description="Receive platform notifications through email."
                                    checked={emailNotification}
                                    onChange={setEmailNotification}
                                />
                            </div>
                        </section>
                    )}

                    {activeTab === "security" && (
                        <>
                            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                                <div className="mb-5">
                                    <h2 className="font-bold text-gray-900">Security Settings</h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage your account security preferences.
                                    </p>
                                </div>

                                <SettingToggle
                                    title="Two-Factor Authentication"
                                    description="Add an extra layer of protection to your admin account."
                                    checked={twoFactor}
                                    onChange={setTwoFactor}
                                />

                                <div className="mt-4 border-t border-gray-100 pt-5">
                                    <p className="text-sm font-semibold text-gray-800">
                                        Change Password
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Update your admin account password.
                                    </p>

                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter current password"
                                                    className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-11 text-sm outline-none focus:border-green-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                >
                                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    placeholder="Enter new password"
                                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                                    Confirm Password
                                                </label>
                                                <input
                                                    type="password"
                                                    placeholder="Confirm new password"
                                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-green-500"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                        >
                                            Update Password
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:p-6">
                                <h2 className="font-bold text-red-600">Danger Zone</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Sensitive platform actions. These controls are not connected yet.
                                </p>

                                <div className="mt-4 flex flex-col gap-3 rounded-xl bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">
                                            Reset Platform Settings
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Restore default platform preferences.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                                    >
                                        <RefreshCw size={15} />
                                        Reset Settings
                                    </button>
                                </div>
                            </section>
                        </>
                    )}

                    <div className="flex flex-col gap-3 rounded-2xl border border-green-100 bg-green-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-800">
                                Ready to update your settings?
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                Backend integration will be added in the next step.
                            </p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving || settingsLoading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={16} />
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
