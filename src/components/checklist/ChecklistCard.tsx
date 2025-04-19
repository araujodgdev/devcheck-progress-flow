
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Share2, Copy, CheckCircle, Globe, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChecklistWithItems } from '@/types/checklist';
import { useDelete } from '@/hooks/useDelete';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ChecklistCardProps {
  checklist: ChecklistWithItems;
  projectId: string;
  onDelete: () => void;
}

export function ChecklistCard({ checklist, projectId, onDelete }: ChecklistCardProps) {
  const { deleteRow, isDeleting } = useDelete({
    onSuccess: onDelete,
    successMessage: 'Checklist excluída com sucesso'
  });
  
  const [isPublic, setIsPublic] = useState(checklist.is_public);
  const [isCopied, setIsCopied] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  
  const totalItems = checklist.items.length;
  const completedItems = checklist.items.filter(item => item.completed).length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const handleDelete = () => {
    deleteRow('checklists', checklist.id);
  };
  
  const togglePublicAccess = async () => {
    setIsTogglingPublic(true);
    try {
      const { error } = await supabase
        .from('checklists')
        .update({ is_public: !isPublic })
        .eq('id', checklist.id);
        
      if (error) throw error;
      
      setIsPublic(!isPublic);
      toast.success(isPublic ? 'Checklist agora é privada' : 'Checklist agora é pública');
    } catch (error) {
      console.error('Error toggling public access:', error);
      toast.error('Erro ao alterar visibilidade da checklist');
    } finally {
      setIsTogglingPublic(false);
    }
  };
  
  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/shared/checklist/${checklist.public_access_id}`;
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    toast.success('Link copiado para a área de transferência');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{checklist.title}</CardTitle>
            <CardDescription>
              {checklist.description || 'Sem descrição'}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2"
              onClick={togglePublicAccess}
              disabled={isTogglingPublic}
            >
              {isPublic ? (
                <Globe className="h-4 w-4 text-green-500" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
            </Button>
            
            {isPublic && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2"
                onClick={copyShareLink}
              >
                {isCopied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2"
              asChild
            >
              <Link to={`/projects/${projectId}/checklists/${checklist.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isto irá excluir permanentemente a checklist e todos os seus itens.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? 'Excluindo...' : 'Excluir'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{completedItems} de {totalItems} itens</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/projects/${projectId}/checklists/${checklist.id}`}>
            Ver checklist
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
