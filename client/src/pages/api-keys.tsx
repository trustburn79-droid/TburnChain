import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Key, Trash2, Copy, Plus, Shield } from "lucide-react";

interface ApiKey {
  id: string;
  label: string;
  userId: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
}

interface NewApiKeyResponse {
  id: string;
  label: string;
  key: string;
  createdAt: string;
}

export default function ApiKeys() {
  const { toast } = useToast();
  const [label, setLabel] = useState("");
  const [newKey, setNewKey] = useState<NewApiKeyResponse | null>(null);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);

  const { data: keys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ["/api/keys"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!label.trim()) {
        throw new Error("Label is required");
      }
      const res = await apiRequest("POST", "/api/keys", { label: label.trim() });
      return await res.json() as NewApiKeyResponse;
    },
    onSuccess: (data) => {
      setNewKey(data);
      setShowNewKeyDialog(true);
      setLabel("");
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "API Key Created",
        description: "Your new API key has been generated. Make sure to copy it now!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create API key",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/keys/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      toast({
        title: "API Key Revoked",
        description: "The API key has been successfully revoked.",
      });
      setDeleteKeyId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke API key",
        variant: "destructive",
      });
      setDeleteKeyId(null);
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "API key copied to clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            API Keys
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage API keys for secure access to TBURN blockchain data
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New API Key
          </CardTitle>
          <CardDescription>
            Generate a new API key for programmatic access. The key will only be shown once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="flex gap-4 items-end"
          >
            <div className="flex-1 max-w-md">
              <Label htmlFor="key-label">API Key Label</Label>
              <Input
                id="key-label"
                data-testid="input-api-key-label"
                placeholder="e.g., Production Server, Development, Mobile App"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button
              type="submit"
              disabled={createMutation.isPending || !label.trim()}
              data-testid="button-create-api-key"
            >
              <Key className="mr-2 h-4 w-4" />
              {createMutation.isPending ? "Creating..." : "Create API Key"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active API Keys</CardTitle>
          <CardDescription>
            {keys.length === 0
              ? "No API keys created yet"
              : `You have ${keys.length} active API key${keys.length === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading API keys...</div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No API keys yet. Create your first one above.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id} data-testid={`row-api-key-${key.id}`}>
                    <TableCell className="font-medium">{key.label}</TableCell>
                    <TableCell>
                      <Badge variant="default" data-testid={`badge-status-${key.id}`}>
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(key.createdAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {key.lastUsedAt ? formatDate(key.lastUsedAt) : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteKeyId(key.id)}
                        data-testid={`button-revoke-${key.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              API Key Created Successfully
            </DialogTitle>
            <DialogDescription>
              This is the only time you'll see this API key. Copy it now and store it securely.
            </DialogDescription>
          </DialogHeader>
          {newKey && (
            <div className="space-y-4">
              <div>
                <Label>Label</Label>
                <div className="text-sm font-medium mt-1">{newKey.label}</div>
              </div>
              <div>
                <Label>API Key</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    readOnly
                    value={newKey.key}
                    className="font-mono text-xs"
                    data-testid="input-new-api-key"
                  />
                  <Button
                    onClick={() => copyToClipboard(newKey.key)}
                    data-testid="button-copy-api-key"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Store this key securely. You won't be able to see it again.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteKeyId} onOpenChange={() => setDeleteKeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Any applications using this key will no longer be able
              to authenticate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-revoke">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteKeyId && deleteMutation.mutate(deleteKeyId)}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-revoke"
            >
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
