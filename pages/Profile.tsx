import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Icons } from '../components/Icons';

export const Profile = () => {
    const { user, signOut } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [notificationEmail, setNotificationEmail] = useState(true);
    const [publicProfile, setPublicProfile] = useState(false);

    // Mock form state
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState('Music Producer & Sound Engineer based in Istanbul.');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
        }, 1000);
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pb-8 border-b border-border">
                <div className="relative group">
                    <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-secondary object-cover border-4 border-card shadow-xl"
                    />
                    <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                        <Icons.Edit className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-center md:text-left space-y-2 flex-1">
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                        <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-semibold border border-primary/20">
                            PRO PLAN
                        </span>
                        <span className="px-2 py-1 rounded-md bg-secondary text-muted-foreground text-xs border border-border">
                            Member since 2024
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={signOut}>
                        <Icons.LogOut className="mr-2 w-4 h-4" /> Sign Out
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">

                {/* Left Column: Form & Settings */}
                <div className="md:col-span-2 space-y-8">

                    {/* Personal Info */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <Icons.User className="w-5 h-5 text-primary" /> Personal Information
                            </h2>
                        </div>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium opacity-70">Email (Read Only)</label>
                                    <input
                                        className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                                        value={user.email}
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Bio</label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </div>
                            <div className="pt-2 flex justify-end">
                                <Button type="submit" loading={isSaving}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Preferences */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold mb-6">Preferences</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-base font-medium">Email Notifications</label>
                                    <p className="text-sm text-muted-foreground">Receive weekly insights and platform updates.</p>
                                </div>
                                <button
                                    onClick={() => setNotificationEmail(!notificationEmail)}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${notificationEmail ? 'bg-primary' : 'bg-input'}`}
                                >
                                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationEmail ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            <div className="h-px bg-border" />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-base font-medium">Public Profile</label>
                                    <p className="text-sm text-muted-foreground">Allow others to see your public playlists.</p>
                                </div>
                                <button
                                    onClick={() => setPublicProfile(!publicProfile)}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${publicProfile ? 'bg-primary' : 'bg-input'}`}
                                >
                                    <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${publicProfile ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Plan */}
                <div className="space-y-6">

                    {/* Plan Usage */}
                    <div className="bg-gradient-to-br from-card to-secondary/30 border border-border rounded-xl p-6">
                        <h3 className="font-semibold mb-4 text-foreground">Storage & Usage</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tracks Uploaded</span>
                                    <span className="font-medium">12 / 50</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[24%]" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Storage Used</span>
                                    <span className="font-medium">1.2GB / 5GB</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[24%]" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Insights Generated</span>
                                    <span className="font-medium">85 / 100</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 w-[85%]" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-border">
                            <Button variant="secondary" className="w-full text-xs h-8">
                                Upgrade Plan
                            </Button>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-card border border-border p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-primary">12</div>
                            <div className="text-xs text-muted-foreground mt-1">Tracks</div>
                        </div>
                        <div className="bg-card border border-border p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-primary">3</div>
                            <div className="text-xs text-muted-foreground mt-1">Playlists</div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};