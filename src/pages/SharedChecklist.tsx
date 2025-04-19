
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Checklist, ChecklistItem } from '@/types/checklist';
import { CheckCircle, Circle, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SharedChecklist() {
  const { publicId } = useParams<{ publicId: string }>();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChecklist() {
      try {
        const { data: checklistData, error: checklistError } = await supabase
          .from('checklists')
          .select('*')
          .eq('public_access_id', publicId)
          .eq('is_public', true)
          .single();

        if (checklistError) {
          throw new Error('Checklist não encontrada ou não é pública');
        }

        setChecklist(checklistData);

        const { data: itemsData, error: itemsError } = await supabase
          .from('checklist_items')
          .select('*')
          .eq('checklist_id', checklistData.id)
          .order('priority', { ascending: false });

        if (itemsError) throw itemsError;

        setItems(itemsData);
      } catch (err) {
        console.error('Error fetching checklist:', err);
        setError('Erro ao carregar a checklist compartilhada');
      } finally {
        setLoading(false);
      }
    }

    if (publicId) {
      fetchChecklist();
    }
  }, [publicId]);

  const totalItems = items.length;
  const completedItems = items.filter(item => item.completed).length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-orange-500';
      case 'low':
        return 'text-green-500';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Carregando checklist...</h2>
          <div className="animate-pulse h-2 w-40 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Checklist não encontrada</h2>
          <p className="text-muted-foreground">Esta checklist não existe ou não está disponível publicamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">{checklist.title}</CardTitle>
            <CardDescription>{checklist.description}</CardDescription>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{completedItems} de {totalItems} itens</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhum item na checklist</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg bg-background flex items-start gap-3"
                  >
                    <div className="pt-0.5">
                      {item.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </h3>
                        <span className={`text-xs font-medium uppercase ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                      
                      {item.due_date && (
                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          <span>
                            {format(new Date(item.due_date), 'dd MMM yyyy', { locale: ptBR })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Visualizando checklist compartilhada</p>
        </div>
      </div>
    </div>
  );
}
