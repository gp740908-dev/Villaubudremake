import { useEffect, useState } from 'react';
import { useFaqStore, FAQ } from '@/store/faqStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash } from 'lucide-react';

const AdminFAQs = () => {
  const { faqs, isLoading, fetchFaqs, addFaq, updateFaq, deleteFaq } = useFaqStore();
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [currentFaq, setCurrentFaq] = useState<FAQ>({ question: '', answer: '', category: '' });

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleEdit = (faq: FAQ) => {
    setIsEditing(faq.id!);
    setCurrentFaq(faq);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      deleteFaq(id);
    }
  };

  const handleSave = () => {
    if (isEditing) {
      updateFaq(currentFaq);
    } else {
      addFaq(currentFaq);
    }
    resetForm();
  };

  const resetForm = () => {
    setIsEditing(null);
    setCurrentFaq({ question: '', answer: '', category: '' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage FAQs</h1>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit FAQ' : 'Add a New FAQ'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Question"
            value={currentFaq.question}
            onChange={(e) => setCurrentFaq({ ...currentFaq, question: e.target.value })}
          />
          <Textarea
            placeholder="Answer"
            value={currentFaq.answer}
            onChange={(e) => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
          />
          <Input
            placeholder="Category"
            value={currentFaq.category}
            onChange={(e) => setCurrentFaq({ ...currentFaq, category: e.target.value })}
          />
          <div className="flex space-x-2">
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Saving...' : (isEditing ? 'Update FAQ' : 'Add FAQ')}
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {faqs.map((faq) => (
          <Card key={faq.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{faq.question}</h3>
                  <p className="text-sm text-gray-600 mt-2">{faq.answer}</p>
                  <p className="text-xs text-gray-400 mt-2">Category: {faq.category}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(faq)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(faq.id!)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminFAQs;