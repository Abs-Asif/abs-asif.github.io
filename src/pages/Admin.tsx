import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ShieldAlert,
  Users,
  BarChart3,
  Layers,
  Search,
  Ban,
  CheckCircle,
  ExternalLink,
  Plus,
  Trash2,
  X,
  Settings,
  ChevronRight,
  Zap,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Admin = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "System Template",
    backgroundImage: "/PhotocardTemplate.png",
    title: { color: "#ffffff", font: "Kalpurush", size: 70, align: "center", x: 540, y: 860 },
    date: { color: "#ffffff", font: "Cambria", size: 20, align: "left", x: 48, y: 645 },
    image: { x: 30, y: 32, w: 1020, h: 574, border: { enabled: true, color: "#22C55E", width: 2 } }
  });

  const fetchProfiles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      const parsedProfiles = data.map(p => {
        let meta = {};
        try {
          meta = JSON.parse(p.display_name || '{}');
        } catch (e) {
          meta = { name: p.display_name };
        }
        return { ...p, meta };
      });

      setProfiles(parsedProfiles);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleBanToggle = async (profile: any) => {
    const updatedMeta = { ...profile.meta, isBanned: !profile.meta.isBanned };
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: JSON.stringify(updatedMeta) })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success(`User ${updatedMeta.isBanned ? 'banned' : 'unbanned'}`);
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAssignTemplate = async () => {
    if (!selectedUser) return;
    const templateId = Math.random().toString(36).substring(2, 11);
    const templateWithId = { ...newTemplate, id: templateId };

    const currentTemplates = selectedUser.meta.assignedTemplates || [];
    const updatedMeta = {
      ...selectedUser.meta,
      assignedTemplates: [...currentTemplates, templateWithId]
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: JSON.stringify(updatedMeta) })
        .eq('id', selectedUser.id);

      if (error) throw error;
      toast.success("Template assigned to user!");
      setIsTemplateModalOpen(false);
      fetchProfiles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredProfiles = profiles.filter(p =>
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.meta?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.meta?.portalUrl?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background font-bangla">
      <nav className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-primary w-6 h-6" />
            <span className="font-bold text-xl tracking-tight uppercase">Admin Panel</span>
          </div>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm font-medium">Total Users</p>
              <Users className="text-primary w-5 h-5" />
            </div>
            <h2 className="text-3xl font-bold">{profiles.length}</h2>
          </div>
          <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm font-medium">Total Generation</p>
              <BarChart3 className="text-primary w-5 h-5" />
            </div>
            <h2 className="text-3xl font-bold">
              {profiles.reduce((acc, p) => acc + (p.meta?.usageCount || 0), 0)}
            </h2>
          </div>
          <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm font-medium">Active Bans</p>
              <Ban className="text-destructive w-5 h-5" />
            </div>
            <h2 className="text-3xl font-bold">
              {profiles.filter(p => p.meta?.isBanned).length}
            </h2>
          </div>
        </div>

        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Manage Users
            </h3>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30">
                  <th className="p-4 text-xs font-bold uppercase text-muted-foreground">User</th>
                  <th className="p-4 text-xs font-bold uppercase text-muted-foreground">Portal</th>
                  <th className="p-4 text-xs font-bold uppercase text-muted-foreground text-center">Usage</th>
                  <th className="p-4 text-xs font-bold uppercase text-muted-foreground">Status</th>
                  <th className="p-4 text-xs font-bold uppercase text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">Loading users...</td></tr>
                ) : filteredProfiles.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-muted-foreground">No users found.</td></tr>
                ) : filteredProfiles.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-muted/10 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {p.meta?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{p.meta?.name || "No Name"}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <a href={p.meta?.portalUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary underline">
                        {p.meta?.portalUrl ? new URL(p.meta.portalUrl).hostname : "N/A"}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold">
                        {p.meta?.usageCount || 0}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {p.meta?.isBanned ? (
                        <span className="flex items-center gap-1 text-destructive font-bold">
                          <Ban className="w-3 h-3" /> Banned
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-600 font-bold">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedUser(p); setIsTemplateModalOpen(true); }}
                          title="Assign Template"
                        >
                          <Layers className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={p.meta?.isBanned ? "default" : "destructive"}
                          size="sm"
                          onClick={() => handleBanToggle(p)}
                        >
                          {p.meta?.isBanned ? "Unban" : "Ban"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Template Assignment Modal */}
      {isTemplateModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex items-center justify-between bg-muted/30">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Assign Template
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setIsTemplateModalOpen(false)} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-1">
                <p className="text-xs text-muted-foreground font-bold uppercase">Assigning to:</p>
                <p className="font-bold">{selectedUser.meta.name}</p>
                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Background Image URL</Label>
                  <Input
                    value={newTemplate.backgroundImage}
                    onChange={(e) => setNewTemplate({...newTemplate, backgroundImage: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Title Size</Label>
                    <Input type="number" value={newTemplate.title.size} onChange={(e) => setNewTemplate({...newTemplate, title: {...newTemplate.title, size: parseInt(e.target.value)}})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Title Color</Label>
                    <Input type="color" value={newTemplate.title.color} onChange={(e) => setNewTemplate({...newTemplate, title: {...newTemplate.title, color: e.target.value}})} className="h-10 p-1" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="ghost" className="flex-1" onClick={() => setIsTemplateModalOpen(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleAssignTemplate}>Assign Now</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
