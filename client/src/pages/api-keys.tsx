import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        throw new Error(t('apiKeys.keyLabel'));
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
        title: t('apiKeys.keyCreated'),
        description: t('apiKeys.keyCreatedToast'),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('apiKeys.createFailed'),
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
        title: t('apiKeys.keyRevoked'),
        description: t('apiKeys.keyRevokedDesc'),
      });
      setDeleteKeyId(null);
    },
    onError: (error: Error) => {
      toast({
        title: t('common.error'),
        description: error.message || t('apiKeys.revokeFailed'),
        variant: "destructive",
      });
      setDeleteKeyId(null);
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('common.copied'),
      description: t('apiKeys.apiKeyCopied'),
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
            {t('apiKeys.title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('apiKeys.subtitle')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('apiKeys.createNewKey')}
          </CardTitle>
          <CardDescription>
            {t('apiKeys.createDescription')}
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
              <Label htmlFor="key-label">{t('apiKeys.keyLabel')}</Label>
              <Input
                id="key-label"
                data-testid="input-api-key-label"
                placeholder={t('apiKeys.labelPlaceholder')}
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
              {createMutation.isPending ? t('apiKeys.creating') : t('apiKeys.createButton')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('apiKeys.activeKeys')}</CardTitle>
          <CardDescription>
            {keys.length === 0
              ? t('apiKeys.noKeysYet')
              : t('apiKeys.keysCount', { count: keys.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">{t('apiKeys.loadingKeys')}</div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('apiKeys.noKeysMessage')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('apiKeys.label')}</TableHead>
                  <TableHead>{t('common.status')}</TableHead>
                  <TableHead>{t('apiKeys.created')}</TableHead>
                  <TableHead>{t('apiKeys.lastUsed')}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id} data-testid={`row-api-key-${key.id}`}>
                    <TableCell className="font-medium">{key.label}</TableCell>
                    <TableCell>
                      <Badge variant="default" data-testid={`badge-status-${key.id}`}>
                        {t('common.active')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(key.createdAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {key.lastUsedAt ? formatDate(key.lastUsedAt) : t('apiKeys.never')}
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
              {t('apiKeys.keyCreatedTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('apiKeys.keyCreatedDescription')}
            </DialogDescription>
          </DialogHeader>
          {newKey && (
            <div className="space-y-4">
              <div>
                <Label>{t('apiKeys.label')}</Label>
                <div className="text-sm font-medium mt-1">{newKey.label}</div>
              </div>
              <div>
                <Label>{t('apiKeys.apiKey')}</Label>
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
                    {t('common.copy')}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('apiKeys.storeSecurely')}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteKeyId} onOpenChange={() => setDeleteKeyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('apiKeys.revokeTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('apiKeys.revokeDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-revoke">{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteKeyId && deleteMutation.mutate(deleteKeyId)}
              className="bg-destructive hover:bg-destructive/90"
              data-testid="button-confirm-revoke"
            >
              {t('apiKeys.revokeKey')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
